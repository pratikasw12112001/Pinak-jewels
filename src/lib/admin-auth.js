import crypto from 'crypto';

// Admin session tokens: `<expiryMs>.<hmac>`.
//
// The old scheme was a bare SHA-256 of email+password+secret — a constant that
// never expired and was identical for every login. This version binds each
// token to an expiry and verifies with a timing-safe comparison.

const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
export const ADMIN_COOKIE = 'admin-session';

/** Credentials must come from the environment — no source-code fallbacks. */
export function getAdminConfig() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!email || !password || !secret) {
    return { configured: false, email: null, password: null, secret: null };
  }
  return { configured: true, email, password, secret };
}

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function createSessionToken(secret) {
  const expiry = String(Date.now() + SESSION_TTL_MS);
  return `${expiry}.${sign(expiry, secret)}`;
}

export function verifySessionToken(token, secret) {
  if (!token || typeof token !== 'string') return false;

  const [expiry, signature] = token.split('.');
  if (!expiry || !signature) return false;

  const expiryMs = Number(expiry);
  if (!Number.isFinite(expiryMs) || Date.now() > expiryMs) return false;

  const expected = sign(expiry, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Guard for admin API routes. Returns null when authorized, else a response body. */
export function requireAdmin(request) {
  const config = getAdminConfig();
  if (!config.configured) {
    console.error('Admin credentials are not configured (ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_SESSION_SECRET)');
    return { error: 'Admin access is not configured.', status: 503 };
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifySessionToken(token, config.secret)) {
    return { error: 'Unauthorized', status: 401 };
  }
  return null;
}

/** Constant-time string comparison for credential checks. */
export function safeEqual(a, b) {
  const bufA = Buffer.from(String(a ?? ''));
  const bufB = Buffer.from(String(b ?? ''));
  if (bufA.length !== bufB.length) {
    // Still burn a comparison so length isn't a timing oracle.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}
