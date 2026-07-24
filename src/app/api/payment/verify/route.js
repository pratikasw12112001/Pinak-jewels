import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { calculateOrderTotal } from '@/lib/pricing';
import { setDocument, getDocument } from '@/lib/firestore-server';

export const dynamic = 'force-dynamic';

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
}

function sanitize(value, maxLength = 200) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function buildAddress(c) {
  const line2 = c.address2 ? `, ${c.address2}` : '';
  return `${c.address1}${line2}, ${c.city}, ${c.state} — ${c.pinCode}`;
}

export async function POST(request) {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('RAZORPAY_KEY_SECRET is not configured');
      return NextResponse.json(
        { success: false, error: 'Payment verification is unavailable.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer,
      items,
      giftWrap,
      couponCode,
    } = body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment details.' },
        { status: 400 }
      );
    }

    // ─── 1. Verify the signature (timing-safe) ───
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const provided = Buffer.from(String(razorpay_signature));
    const expected = Buffer.from(expectedSignature);
    const signatureValid =
      provided.length === expected.length && crypto.timingSafeEqual(provided, expected);

    if (!signatureValid) {
      console.error('Invalid payment signature for order', razorpay_order_id);
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature.' },
        { status: 400 }
      );
    }

    // ─── 2. Idempotency: a retry must not create a second order ───
    const existing = await getDocument('orders', razorpay_order_id).catch(err => {
      console.error('Order lookup failed:', err.message);
      return null;
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        order: existing,
      });
    }

    // ─── 3. Recompute the price server-side (never trust the client) ───
    const pricing = calculateOrderTotal(items, { giftWrap, couponCode });
    if (!pricing.ok) {
      // Payment already succeeded, so we must not lose it. Record for manual review.
      console.error('Pricing failed after successful payment:', pricing.error, razorpay_order_id);
    }

    const c = customer || {};
    const customerRecord = {
      name: sanitize(c.fullName, 120),
      email: sanitize(c.email, 160),
      phone: sanitize(c.phone, 20),
      address1: sanitize(c.address1, 200),
      address2: sanitize(c.address2, 200),
      city: sanitize(c.city, 80),
      state: sanitize(c.state, 80),
      pinCode: sanitize(c.pinCode, 10),
    };

    const total = pricing.ok ? pricing.total : 0;
    const productSummary = pricing.ok
      ? pricing.items.map(i => `${i.name} (x${i.quantity})`).join(', ')
      : 'UNKNOWN — needs manual review';

    // ─── 4. Persist server-side so a closed tab cannot lose the order ───
    const orderRecord = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      name: customerRecord.name,
      email: customerRecord.email,
      phone: customerRecord.phone,
      address: buildAddress(customerRecord),
      product: productSummary,
      price: total,
      subtotal: pricing.ok ? pricing.subtotal : 0,
      shipping: pricing.ok ? pricing.shipping : 0,
      discount: pricing.ok ? pricing.discount : 0,
      giftWrap: pricing.ok ? pricing.giftWrap : false,
      coupon: pricing.ok ? pricing.appliedCoupon || '' : '',
      items: pricing.ok
        ? pricing.items.map(i => ({
            id: i.id,
            name: i.name,
            image: i.image,
            price: i.price,
            quantity: i.quantity,
          }))
        : [],
      status: pricing.ok ? 'Confirmed' : 'Needs Review',
      paymentMode: 'Online (Razorpay)',
      trackingNumber: '',
      carrier: '',
      timestamp: new Date().toISOString(),
    };

    let persisted = true;
    try {
      // Keyed by Razorpay order id — replays overwrite instead of duplicating.
      await setDocument('orders', razorpay_order_id, orderRecord);
    } catch (err) {
      persisted = false;
      // Loud, structured log: the payment is real even if the DB write failed.
      console.error(
        'ORDER PERSIST FAILED — MANUAL ACTION REQUIRED',
        JSON.stringify({ ...orderRecord, error: err.message })
      );
    }

    // ─── 5. Send confirmation emails from the server (survives a closed tab) ───
    let emailSent = false;
    if (isValidEmail(customerRecord.email)) {
      try {
        const origin = new URL(request.url).origin;
        const res = await fetch(`${origin}/api/send-order-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: orderRecord.name,
            email: orderRecord.email,
            phone: orderRecord.phone,
            address: orderRecord.address,
            product: orderRecord.product,
            price: orderRecord.price,
            paymentId: orderRecord.paymentId,
            orderId: orderRecord.orderId,
            items: orderRecord.items,
          }),
        });
        emailSent = res.ok;
      } catch (err) {
        console.error('Order email failed (order is safe):', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      persisted,
      emailSent,
      order: orderRecord,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed. If you were charged, contact support.' },
      { status: 500 }
    );
  }
}
