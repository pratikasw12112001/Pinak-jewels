import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { calculateOrderTotal } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys are not configured');
      return NextResponse.json(
        { error: 'Payments are temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { items, giftWrap, couponCode } = body || {};

    // The amount is NEVER taken from the request. It is recomputed here from
    // the server's own product data so a tampered cart cannot change the price.
    const pricing = calculateOrderTotal(items, { giftWrap, couponCode });
    if (!pricing.ok) {
      return NextResponse.json({ error: pricing.error }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: pricing.total * 100, // paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        itemCount: String(pricing.items.length),
        subtotal: String(pricing.subtotal),
        shipping: String(pricing.shipping),
        discount: String(pricing.discount),
        coupon: pricing.appliedCoupon || 'none',
        giftWrap: pricing.giftWrap ? 'yes' : 'no',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      // Returned so the UI can display authoritative figures, not to be trusted back.
      pricing: {
        subtotal: pricing.subtotal,
        shipping: pricing.shipping,
        giftWrapFee: pricing.giftWrapFee,
        discount: pricing.discount,
        appliedCoupon: pricing.appliedCoupon,
        total: pricing.total,
      },
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to start payment. Please try again.' },
      { status: 500 }
    );
  }
}
