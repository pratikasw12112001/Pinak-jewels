import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function getDeliveryDate() {
  const now = new Date();
  let workingDays = 0;
  const minDate = new Date(now);
  while (workingDays < 8) {
    minDate.setDate(minDate.getDate() + 1);
    if (minDate.getDay() !== 0) workingDays++;
  }
  const maxDate = new Date(minDate);
  workingDays = 0;
  while (workingDays < 1) {
    maxDate.setDate(maxDate.getDate() + 1);
    if (maxDate.getDay() !== 0) workingDays++;
  }
  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fmt(minDate)} — ${fmt(maxDate)}`;
}

export async function POST(request) {
  try {
    const { name, email, phone, address, product, price, paymentId, orderId } = await request.json();

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
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

    const formattedPrice = `₹${Number(price).toLocaleString('en-IN')}`;
    const deliveryDate = getDeliveryDate();

    // ─── ADMIN EMAIL ───
    const adminHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #0F4F3A; padding: 24px 32px; text-align: center;">
          <h1 style="color: #E6C36A; margin: 0; font-size: 22px; letter-spacing: 1px;">🛍️ New Order Received!</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">Pinak Jewels — Order Notification</p>
        </div>
        <div style="padding: 28px 32px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6; width: 140px;">Order ID</td><td style="padding: 10px 0; font-weight: 600; border-bottom: 1px solid #f3f4f6;">${orderId}</td></tr>
            <tr><td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;">Payment ID</td><td style="padding: 10px 0; font-weight: 600; border-bottom: 1px solid #f3f4f6;">${paymentId}</td></tr>
            <tr><td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;">Timestamp</td><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">${timestamp}</td></tr>
          </table>
          <h3 style="margin: 24px 0 12px; color: #0F4F3A; font-size: 15px; text-transform: uppercase; letter-spacing: 1px;">Customer Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 500;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;">${email}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Phone</td><td style="padding: 8px 0;">${phone}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Address</td><td style="padding: 8px 0;">${address}</td></tr>
          </table>
          <h3 style="margin: 24px 0 12px; color: #0F4F3A; font-size: 15px; text-transform: uppercase; letter-spacing: 1px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Product(s)</td><td style="padding: 8px 0;">${product}</td></tr>
            <tr style="background: #f0fdf4;"><td style="padding: 12px 8px; color: #0F4F3A; font-weight: 600; font-size: 16px;">Total Amount</td><td style="padding: 12px 8px; color: #0F4F3A; font-weight: 700; font-size: 18px;">${formattedPrice}</td></tr>
          </table>
        </div>
        <div style="background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af;">
          This is an automated notification from Pinak Jewels.
        </div>
      </div>
    `;

    // ─── BUYER THANK YOU EMAIL ───
    const buyerHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #0F4F3A; padding: 32px; text-align: center;">
          <h1 style="color: #E6C36A; margin: 0; font-size: 24px; letter-spacing: 1px;">Thank You for Your Order! 💛</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Your order has been confirmed</p>
        </div>

        <div style="padding: 28px 32px;">
          <p style="font-size: 15px; color: #374151; line-height: 1.6; margin: 0 0 20px;">
            Hi <strong>${name}</strong>,<br><br>
            Thank you for shopping with <strong>Pinak Jewels</strong>! We're excited to confirm your order. Here are your order details:
          </p>

          <!-- Order Summary -->
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #6b7280; width: 130px;">Order ID</td><td style="padding: 8px 0; font-weight: 600;">${orderId}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Payment ID</td><td style="padding: 8px 0; font-weight: 600;">${paymentId}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Product(s)</td><td style="padding: 8px 0;">${product}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Amount Paid</td><td style="padding: 8px 0; font-weight: 700; color: #0F4F3A; font-size: 16px;">${formattedPrice}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Order Date</td><td style="padding: 8px 0;">${timestamp}</td></tr>
            </table>
          </div>

          <!-- Delivery Address -->
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px; font-size: 14px; color: #0F4F3A; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Address</h3>
            <p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.6;">
              <strong>${name}</strong><br>
              ${address}<br>
              📞 ${phone}
            </p>
          </div>

          <!-- Delivery Estimate -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #0F4F3A;">
              🚚 <strong>Estimated Delivery:</strong> ${deliveryDate}<br>
              <span style="font-size: 13px; color: #6b7280;">(8-9 working days)</span>
            </p>
          </div>

          <!-- Contact Info -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.8;">
              For any queries regarding your order, please contact us at:<br>
              📧 <a href="mailto:pinakjewels04@gmail.com" style="color: #0F4F3A; font-weight: 600; text-decoration: none;">pinakjewels04@gmail.com</a>
            </p>
          </div>
        </div>

        <div style="background: #0F4F3A; padding: 20px 32px; text-align: center;">
          <p style="color: #E6C36A; margin: 0; font-size: 16px; font-weight: 600; letter-spacing: 1px;">Pinak Jewels</p>
          <p style="color: rgba(255,255,255,0.5); margin: 4px 0 0; font-size: 11px;">Modern Jewellery, Timeless You</p>
        </div>
      </div>
    `;

    // Send both emails in parallel
    await Promise.all([
      // Admin notification
      transporter.sendMail({
        from: `"Pinak Jewels" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO || 'pinakjewels04@gmail.com',
        subject: `🛍️ New Order #${orderId} — ${formattedPrice} from ${name}`,
        html: adminHtml,
      }),
      // Buyer thank you
      transporter.sendMail({
        from: `"Pinak Jewels" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Thank you for your order, ${name}! 💛 — Order #${orderId}`,
        html: buyerHtml,
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
