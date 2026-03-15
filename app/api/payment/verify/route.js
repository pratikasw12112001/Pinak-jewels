import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer, items, total } = body;

    // Verify Razorpay signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
    }

    // Send email notification
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const itemsHtml = items.map(item => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <img src="${item.image}" alt="${item.name}" width="60" height="60" style="border-radius: 8px; object-fit: cover;" />
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px;">
            <strong>${item.name}</strong><br/>
            <span style="color: #6B6B6B;">Qty: ${item.quantity}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; text-align: right;">
            ₹${(item.price * item.quantity).toLocaleString()}
          </td>
        </tr>
      `).join('');

      const emailHtml = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
          <div style="background: #0F4F3A; padding: 24px; text-align: center;">
            <h1 style="color: #E6C36A; font-size: 24px; margin: 0;">Pinak Jewels</h1>
            <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 4px;">New Order Received!</p>
          </div>

          <div style="padding: 24px;">
            <h2 style="font-size: 18px; margin-bottom: 16px; color: #1F1F1F;">Customer Information</h2>
            <table style="width: 100%; font-size: 14px; margin-bottom: 24px;">
              <tr><td style="padding: 4px 0; color: #6B6B6B;">Name:</td><td style="padding: 4px 0;"><strong>${customer.fullName}</strong></td></tr>
              <tr><td style="padding: 4px 0; color: #6B6B6B;">Email:</td><td style="padding: 4px 0;">${customer.email}</td></tr>
              <tr><td style="padding: 4px 0; color: #6B6B6B;">Phone:</td><td style="padding: 4px 0;">${customer.phone}</td></tr>
              <tr><td style="padding: 4px 0; color: #6B6B6B;">Address:</td><td style="padding: 4px 0;">${customer.address1}${customer.address2 ? ', ' + customer.address2 : ''}, ${customer.city}, ${customer.state} - ${customer.pinCode}</td></tr>
            </table>

            <h2 style="font-size: 18px; margin-bottom: 16px; color: #1F1F1F;">Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">${itemsHtml}</table>

            <div style="text-align: right; margin-top: 16px; padding-top: 16px; border-top: 2px solid #0F4F3A;">
              <span style="font-size: 18px; font-weight: 700; color: #0F4F3A;">Total: ₹${total.toLocaleString()}</span>
            </div>

            <div style="margin-top: 24px; padding: 16px; background: #F8F5EE; border-radius: 8px;">
              <p style="font-size: 13px; color: #6B6B6B; margin: 0;">
                <strong>Payment ID:</strong> ${razorpay_payment_id}<br/>
                <strong>Order ID:</strong> ${razorpay_order_id}
              </p>
            </div>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Pinak Jewels" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO,
        subject: `New Order from ${customer.fullName} - ₹${total.toLocaleString()}`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the payment verification if email fails
    }

    return NextResponse.json({
      success: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
