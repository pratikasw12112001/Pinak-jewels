import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { escapeHtml, clean, isValidEmail, isHeaderSafe, rateLimit, getClientIp } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Without a limit, anyone can flood the shop inbox until Gmail throttles it.
    const limit = rateLimit(`contact:${getClientIp(request)}`, { max: 5, windowMs: 60 * 60 * 1000 });
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many messages. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const name = clean(body.name, 100);
    const email = clean(body.email, 254);
    const subject = clean(body.subject, 150);
    const message = clean(body.message, 5000);

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }
    // Newlines in a header value can smuggle extra Bcc/Subject headers.
    if (!isHeaderSafe(email) || !isHeaderSafe(name) || !isHeaderSafe(subject)) {
      return NextResponse.json({ success: false, error: 'Invalid input.' }, { status: 400 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Contact form: email credentials are not configured');
      return NextResponse.json(
        { success: false, error: 'Unable to send right now. Please email us directly.' },
        { status: 503 }
      );
    }

    // All interpolations below are escaped — raw values would render as live
    // HTML in the inbox, which is a phishing vector aimed at the shop owner.
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    await transporter.sendMail({
      from: `"Pinak Jewels Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || 'pinakjewels04@gmail.com',
      replyTo: email,
      subject: `📩 Contact Form: ${subject || 'New Message'} — from ${name}`.slice(0, 200),
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <div style="background:#0F4F3A;padding:24px 32px;">
            <h2 style="color:#E6C36A;margin:0;font-size:18px;">📩 New Contact Form Message</h2>
            <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">Received at ${timestamp} IST</p>
          </div>
          <div style="padding:28px 32px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
              <tr><td style="padding:8px 0;color:#6b7280;width:100px;border-bottom:1px solid #f3f4f6;">Name</td><td style="padding:8px 0;font-weight:600;border-bottom:1px solid #f3f4f6;">${safeName}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Email</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;"><a href="mailto:${safeEmail}" style="color:#0F4F3A;">${safeEmail}</a></td></tr>
              ${safeSubject ? `<tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Subject</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">${safeSubject}</td></tr>` : ''}
            </table>
            <h4 style="margin:0 0 10px;color:#0F4F3A;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Message</h4>
            <div style="background:#f9fafb;padding:16px;border-radius:8px;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${safeMessage}</div>
          </div>
          <div style="background:#f9fafb;padding:14px 32px;text-align:center;font-size:12px;color:#9ca3af;">
            Reply directly to this email to respond to ${safeName}
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log the detail server-side; never return internals to the caller.
    console.error('Contact email error:', error);
    return NextResponse.json(
      { success: false, error: 'Could not send your message. Please try again.' },
      { status: 500 }
    );
  }
}
