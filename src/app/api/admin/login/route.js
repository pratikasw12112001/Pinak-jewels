import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'pinakjewels04@gmail.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mahakaswani';
    const SECRET = process.env.ADMIN_SESSION_SECRET || 'pinak-admin-secure-key-2026';

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const token = crypto.createHash('sha256').update(email + password + SECRET).digest('hex');

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin-session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
