import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin/dashboard')) {
    const session = request.cookies.get('admin-session');
    if (!session?.value) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Verify token using Web Crypto API (Edge-compatible)
    const email = process.env.ADMIN_EMAIL || 'pinakjewels04@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'mahakaswani';
    const secret = process.env.ADMIN_SESSION_SECRET || 'pinak-admin-secure-key-2026';
    const enc = new TextEncoder();
    const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(email + password + secret));
    const expected = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (session.value !== expected) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
