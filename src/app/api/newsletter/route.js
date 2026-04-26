import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    await transporter.sendMail({
      from: `"Pinak Jewels" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || 'pinakjewels04@gmail.com',
      subject: `📧 New Newsletter Subscriber — ${email}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: #0F4F3A; padding: 24px 32px; text-align: center;">
            <h1 style="color: #E6C36A; margin: 0; font-size: 20px; letter-spacing: 1px;">📧 New Subscriber!</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">Pinak Jewels Newsletter</p>
          </div>
          <div style="padding: 28px 32px;">
            <p style="font-size: 15px; color: #374151; margin: 0 0 20px;">Someone just subscribed to the Pinak Jewels newsletter.</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 10px 0; color: #6b7280; width: 120px; border-bottom: 1px solid #f3f4f6;">Email</td><td style="padding: 10px 0; font-weight: 600; border-bottom: 1px solid #f3f4f6;">${email}</td></tr>
              <tr><td style="padding: 10px 0; color: #6b7280;">Subscribed at</td><td style="padding: 10px 0;">${timestamp} IST</td></tr>
            </table>
          </div>
          <div style="background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af;">
            Automated notification from pinakjewels.com
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter email error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
