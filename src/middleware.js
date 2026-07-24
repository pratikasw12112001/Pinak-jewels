import { NextResponse } from 'next/server';

// Edge runtime: node:crypto is unavailable, so this mirrors the HMAC scheme in
// src/lib/admin-auth.js using Web Crypto. Keep the two in sync.
async function verifySessionToken(token, secret) {
  if (!token || typeof token !== 'string') return false;

  const [expiry, signature] = token.split('.');
  if (!expiry || !signature) return false;

  const expiryMs = Number(expiry);
  if (!Number.isFinite(expiryMs) || Date.now() > expiryMs) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(expiry));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (signature.length !== expected.length) return false;

  // Constant-time compare.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin/dashboard')) {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    const session = request.cookies.get('admin-session');
    const valid = await verifySessionToken(session?.value, secret);
    if (!valid) {
      const response = NextResponse.redirect(new URL('/admin', request.url));
      response.cookies.delete('admin-session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
