import { NextResponse } from 'next/server';
import crypto from 'crypto';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin/dashboard')) {
    const session = request.cookies.get('admin-session');
    const secret = process.env.ADMIN_SESSION_SECRET || 'pinak-admin-secure-key-2026';
    const email = process.env.ADMIN_EMAIL || 'pinakjewels04@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'mahakaswani';
    const expected = crypto.createHash('sha256').update(email + password + secret).digest('hex');

    if (!session || session.value !== expected) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
