// Shared input-hardening helpers for public API routes.

/**
 * Escape user text before interpolating it into an HTML email body.
 * Without this, a message containing markup is rendered as live HTML in the
 * inbox — a phishing vector aimed at whoever reads the admin mail.
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Trim, cap length, and strip control characters. */
// Built via RegExp so no literal control bytes appear in this source file.
const CONTROL_CHARS = new RegExp('[\u0000-\u001F\u007F]', 'g');

export function clean(value, maxLength = 200) {
  return String(value ?? '').replace(CONTROL_CHARS, ' ').trim().slice(0, maxLength);
}

export function isValidEmail(value) {
  const email = String(value ?? '').trim();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/**
 * Reject header-injection attempts in values used for email headers
 * (newlines can smuggle extra Bcc/Subject headers).
 */
export function isHeaderSafe(value) {
  return !/[\r\n]/.test(String(value ?? ''));
}

/** Extract a best-effort client IP from proxy headers. */
export function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// ─── In-memory rate limiting ───
// Per-instance, resets on redeploy. Enough to stop casual abuse and inbox
// flooding without adding a Redis dependency.
const buckets = new Map();

export function rateLimit(key, { max = 5, windowMs = 60 * 60 * 1000 } = {}) {
  const now = Date.now();

  // Opportunistic cleanup so the map cannot grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (now > v.resetAt) buckets.delete(k);
    }
  }

  const record = buckets.get(key);
  if (!record || now > record.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  record.count += 1;
  if (record.count > max) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }
  return { allowed: true, remaining: max - record.count };
}
