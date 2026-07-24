import { NextResponse } from 'next/server';
import { getAdminConfig, createSessionToken, safeEqual, ADMIN_COOKIE } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// In-memory brute-force throttle. Resets on redeploy, which is acceptable for
// a single admin account and costs no external dependency.
const attempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function rateLimit(ip) {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  record.count += 1;
  if (record.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

export async function POST(request) {
  try {
    const config = getAdminConfig();
    if (!config.configured) {
      return NextResponse.json(
        { success: false, error: 'Admin access is not configured on this server.' },
        { status: 503 }
      );
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const limit = rateLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many attempts. Try again in ${limit.retryAfter}s.` },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    const emailOk = safeEqual(String(email || '').trim().toLowerCase(), config.email.toLowerCase());
    const passwordOk = safeEqual(password, config.password);

    if (!emailOk || !passwordOk) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    attempts.delete(ip);

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, createSessionToken(config.secret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 12,
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
