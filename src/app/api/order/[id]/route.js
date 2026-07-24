import { NextResponse } from 'next/server';
import { getDocument } from '@/lib/firestore-server';
import { rateLimit, getClientIp } from '@/lib/security';

export const dynamic = 'force-dynamic';

// Public lookup for the order-confirmation page. Returns only what the
// customer already knows (their own items and total) and never exposes the
// address, phone, or email, so guessing an order id leaks nothing personal.
export async function GET(request, { params }) {
  const limit = rateLimit(`order-lookup:${getClientIp(request)}`, { max: 60, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  const id = String(params?.id || '').trim();
  // Razorpay order ids look like `order_XXXXXXXXXXXX`.
  if (!id || id.length > 100 || !/^[A-Za-z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid order reference.' }, { status: 400 });
  }

  try {
    const doc = await getDocument('orders', id);
    if (!doc) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        orderId: doc.orderId || id,
        price: Number(doc.price) || 0,
        status: doc.status || 'Confirmed',
        items: Array.isArray(doc.items) ? doc.items : [],
        timestamp: doc.timestamp || '',
      },
    });
  } catch (error) {
    console.error('Order lookup error:', error);
    return NextResponse.json({ error: 'Could not load this order.' }, { status: 502 });
  }
}
