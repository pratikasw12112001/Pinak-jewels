import crypto from 'crypto';
import nodemailer from 'nodemailer';
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

function getDeliveryEstimate() {
  const date = new Date();
  let days = 0;
  while (days < 7) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) days++;
  }
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function POST(request) {
  if (!verifySession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { docId, status, trackingNumber, carrier, customerEmail, customerName, orderId, total } = await request.json();

  const apiKey = process.env.FIREBASE_API_KEY || 'AIzaSyB4-6hDvdCNwBG1RAkvDawLvIS58cpPcqo';
  const projectId = 'pinak-jewels';

  // Update in Firestore
  const fields = {
    status: { stringValue: status },
    trackingNumber: { stringValue: trackingNumber || '' },
    carrier: { stringValue: carrier || 'Delhivery' },
    updatedAt: { stringValue: new Date().toISOString() },
  };

  const updateMask = Object.keys(fields).map(f => `updateMask.fieldPaths=${f}`).join('&');

  await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${docId}?${updateMask}&key=${apiKey}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    }
  );

  // Send customer email if status is Shipped or Delivered
  if ((status === 'Shipped' || status === 'Delivered') && customerEmail) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      let subject, html;
      const trackingUrls = {
        'Delhivery':   'https://www.delhivery.com/track/',
        'India Post':  'https://www.indiapost.gov.in/vas/pages/trackConsignment.aspx',
        'DTDC':        'https://www.dtdc.com/in',
        'Blue Dart':   'https://www.bluedart.com/tracking',
        'Ekart':       'https://ekartlogistics.com/shipmenttrack',
        'Xpressbees':  'https://www.xpressbees.com/shipment/tracking',
      };
      const trackingUrl = trackingUrls[carrier] || 'https://www.delhivery.com/track/';

      if (status === 'Shipped') {
        const estimate = getDeliveryEstimate();
        subject = `Your Pinak Jewels order is on its way! 🚚`;
        html = `
          <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#0F4F3A;padding:28px 32px;text-align:center;">
              <h1 style="color:#E6C36A;margin:0;font-size:22px;letter-spacing:1px;">Your Order is Shipped! 🚚</h1>
              <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px;">Pinak Jewels</p>
            </div>
            <div style="padding:32px;">
              <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
                Hi <strong>${customerName || 'there'}</strong>,<br><br>
                Great news! Your order has been shipped and is on its way to you.
              </p>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center;">
                <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Order ID</p>
                <p style="margin:0 0 16px;font-weight:700;font-size:15px;color:#1f2937;">${orderId}</p>
                <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Tracking Number</p>
                <p style="margin:0 0 16px;font-weight:700;font-size:18px;color:#0F4F3A;letter-spacing:1px;">${trackingNumber}</p>
                <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Carrier</p>
                <p style="margin:0 0 16px;font-weight:600;font-size:14px;color:#374151;">${carrier}</p>
                <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Estimated Delivery</p>
                <p style="margin:0;font-weight:600;font-size:14px;color:#374151;">By ${estimate}</p>
              </div>
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${trackingUrl}" style="display:inline-block;background:#0F4F3A;color:#E6C36A;padding:14px 32px;border-radius:50px;font-weight:600;font-size:14px;text-decoration:none;letter-spacing:0.5px;">Track on ${carrier} →</a>
              </div>
              <p style="font-size:13px;color:#6b7280;text-align:center;margin:0;">
                Questions? Email us at <a href="mailto:pinakjewels04@gmail.com" style="color:#0F4F3A;font-weight:600;">pinakjewels04@gmail.com</a>
              </p>
            </div>
            <div style="background:#0F4F3A;padding:16px 32px;text-align:center;">
              <p style="color:#E6C36A;margin:0;font-size:15px;font-weight:600;letter-spacing:1px;">Pinak Jewels</p>
              <p style="color:rgba(255,255,255,0.5);margin:4px 0 0;font-size:11px;">Modern Jewellery, Timeless You</p>
            </div>
          </div>`;
      } else {
        subject = `Your Pinak Jewels order has been delivered! 💛`;
        html = `
          <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#0F4F3A;padding:28px 32px;text-align:center;">
              <h1 style="color:#E6C36A;margin:0;font-size:22px;letter-spacing:1px;">Order Delivered! 💛</h1>
              <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px;">Pinak Jewels</p>
            </div>
            <div style="padding:32px;">
              <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
                Hi <strong>${customerName || 'there'}</strong>,<br><br>
                Your Pinak Jewels order <strong>#${orderId}</strong> has been delivered! We hope you love your new jewellery. 💫
              </p>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center;">
                <div style="font-size:40px;margin-bottom:8px;">✅</div>
                <p style="margin:0;font-weight:700;font-size:16px;color:#0F4F3A;">Successfully Delivered</p>
              </div>
              <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 16px;">
                If you have any issues with your order or need assistance, please don't hesitate to reach out.
              </p>
              <p style="font-size:13px;color:#6b7280;text-align:center;margin:0;">
                Email us at <a href="mailto:pinakjewels04@gmail.com" style="color:#0F4F3A;font-weight:600;">pinakjewels04@gmail.com</a>
              </p>
            </div>
            <div style="background:#0F4F3A;padding:16px 32px;text-align:center;">
              <p style="color:#E6C36A;margin:0;font-size:15px;font-weight:600;letter-spacing:1px;">Pinak Jewels</p>
            </div>
          </div>`;
      }

      await transporter.sendMail({
        from: `"Pinak Jewels" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject,
        html,
      });
    } catch (err) {
      console.error('Status email error:', err);
    }
  }

  return NextResponse.json({ success: true });
}
