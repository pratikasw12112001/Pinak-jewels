import crypto from 'crypto';

// Server-side Firestore access via the REST API, authenticated with a service
// account. Security rules deny all browser access, so every read and write goes
// through here; service-account credentials bypass rules by design.
//
// Tokens are minted on demand from the service-account private key and cached
// until just before they expire, so nothing has to be rotated by hand.

const PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  'pinak-jewels';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const SCOPE = 'https://www.googleapis.com/auth/datastore';

let cachedToken = null; // { token, expiresAt }

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function getServiceAccount() {
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  let key = process.env.FIREBASE_PRIVATE_KEY;
  if (!email || !key) return null;

  // Env vars store the key with literal "\n" sequences; restore real newlines.
  key = key.replace(/\\n/g, '\n').trim();
  // Some dashboards keep the surrounding quotes — strip them if present.
  if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1).replace(/\\n/g, '\n');

  return { email, key };
}

/** Mint (and cache) an OAuth access token via the JWT-bearer flow. */
async function getAccessToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const account = getServiceAccount();
  if (!account) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(
    JSON.stringify({
      iss: account.email,
      scope: SCOPE,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  );

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(account.key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const assertion = `${header}.${claims}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to obtain Google access token (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    // Refresh a minute early so a request never races the expiry.
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.token;
}

function authQuery() {
  // Only used as a fallback when no service account is configured.
  const key = getServiceAccount() ? '' : process.env.FIREBASE_API_KEY;
  return key ? `?key=${encodeURIComponent(key)}` : '';
}

async function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = await getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Convert a plain JS value into a Firestore typed value. */
function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (typeof value === 'object') {
    return { mapValue: { fields: toFirestoreFields(value) } };
  }
  return { stringValue: String(value) };
}

export function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = toFirestoreValue(value);
  }
  return fields;
}

/** Read a plain JS value back out of a Firestore typed value. */
export function fromFirestoreValue(field) {
  if (!field || typeof field !== 'object') return null;
  if ('stringValue' in field) return field.stringValue;
  if ('integerValue' in field) return Number(field.integerValue);
  if ('doubleValue' in field) return Number(field.doubleValue);
  if ('booleanValue' in field) return field.booleanValue;
  if ('timestampValue' in field) return field.timestampValue;
  if ('nullValue' in field) return null;
  if ('arrayValue' in field) {
    return (field.arrayValue.values || []).map(fromFirestoreValue);
  }
  if ('mapValue' in field) {
    return fromFirestoreFields(field.mapValue.fields || {});
  }
  return null;
}

export function fromFirestoreFields(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields || {})) {
    out[key] = fromFirestoreValue(value);
  }
  return out;
}

/**
 * Create a document with a caller-supplied ID. Idempotent by construction:
 * writing the same docId twice overwrites rather than duplicating.
 */
export async function setDocument(collection, docId, data) {
  const query = authQuery();
  const separator = query ? '&' : '?';
  const url = `${BASE}/${collection}${query}${separator}documentId=${encodeURIComponent(docId)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    // ALREADY_EXISTS means a duplicate webhook/retry — treat as success.
    if (res.status === 409 || text.includes('ALREADY_EXISTS')) {
      return { ok: true, duplicate: true };
    }
    throw new Error(`Firestore write failed (${res.status}): ${text}`);
  }

  return { ok: true, duplicate: false };
}

/** Fetch a single document, or null when it does not exist. */
export async function getDocument(collection, docId) {
  const res = await fetch(`${BASE}/${collection}/${encodeURIComponent(docId)}${authQuery()}`, {
    headers: await authHeaders(),
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Firestore read failed (${res.status}): ${await res.text()}`);
  }
  const doc = await res.json();
  return { docId, ...fromFirestoreFields(doc.fields) };
}

/** List documents in a collection. */
export async function listDocuments(collection, pageSize = 200) {
  const query = authQuery();
  const separator = query ? '&' : '?';
  const res = await fetch(
    `${BASE}/${collection}${query}${separator}pageSize=${pageSize}`,
    { headers: await authHeaders(), cache: 'no-store' }
  );
  if (!res.ok) {
    throw new Error(`Firestore list failed (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return (data.documents || []).map(doc => ({
    docId: doc.name.split('/').pop(),
    ...fromFirestoreFields(doc.fields),
  }));
}

/** Delete a document. Missing documents are treated as already deleted. */
export async function deleteDocument(collection, docId) {
  const query = authQuery();
  const res = await fetch(`${BASE}/${collection}/${encodeURIComponent(docId)}${query}`, {
    method: 'DELETE',
    headers: await authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Firestore delete failed (${res.status}): ${await res.text()}`);
  }
  return { ok: true };
}

/** Patch specific fields on an existing document. */
export async function patchDocument(collection, docId, data) {
  const masks = Object.keys(data)
    .map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join('&');
  const query = authQuery();
  const separator = query ? '&' : '?';
  const res = await fetch(
    `${BASE}/${collection}/${encodeURIComponent(docId)}${query}${separator}${masks}`,
    {
      method: 'PATCH',
      headers: await authHeaders(),
      body: JSON.stringify({ fields: toFirestoreFields(data) }),
      cache: 'no-store',
    }
  );
  if (!res.ok) {
    throw new Error(`Firestore patch failed (${res.status}): ${await res.text()}`);
  }
  return { ok: true };
}
