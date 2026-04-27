import crypto from 'crypto';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function verifySession(request) {
  const session = request.cookies.get('admin-session');
  const secret = process.env.ADMIN_SESSION_SECRET || 'pinak-admin-secure-key-2026';
  const email = process.env.ADMIN_EMAIL || 'pinakjewels04@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'mahakaswani';
  const expected = crypto.createHash('sha256').update(email + password + secret).digest('hex');
  return session?.value === expected;
}

function parseFirestoreDoc(doc) {
  const fields = doc.fields || {};
  const str = (f) => f?.stringValue || '';
  const num = (f) => Number(f?.integerValue || f?.doubleValue || 0);
  return {
    docId: doc.name.split('/').pop(),
    name: str(fields.name),
    email: str(fields.email),
    phone: str(fields.phone),
    address: str(fields.address),
    product: str(fields.product),
    price: num(fields.price),
    status: str(fields.status) || 'Confirmed',
    paymentId: str(fields.paymentId),
    orderId: str(fields.orderId),
    trackingNumber: str(fields.trackingNumber),
    carrier: str(fields.carrier),
    timestamp: fields.timestamp?.timestampValue || fields.timestamp?.stringValue || '',
  };
}

export async function GET(request) {
  if (!verifySession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.FIREBASE_API_KEY || 'AIzaSyB4-6hDvdCNwBG1RAkvDawLvIS58cpPcqo';
  const projectId = 'pinak-jewels';

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders?pageSize=200&key=${apiKey}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const data = await res.json();
  const orders = (data.documents || [])
    .map(parseFirestoreDoc)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return NextResponse.json({ orders });
}
