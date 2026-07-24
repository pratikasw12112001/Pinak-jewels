import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { listDocuments } from '@/lib/firestore-server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const denied = requireAdmin(request);
  if (denied) {
    return NextResponse.json({ error: denied.error }, { status: denied.status });
  }

  try {
    const docs = await listDocuments('orders', 200);

    const orders = docs
      .map(doc => ({
        docId: doc.docId,
        name: doc.name || '',
        email: doc.email || '',
        phone: doc.phone || '',
        address: doc.address || '',
        product: doc.product || '',
        price: Number(doc.price) || 0,
        status: doc.status || 'Confirmed',
        paymentId: doc.paymentId || '',
        orderId: doc.orderId || '',
        trackingNumber: doc.trackingNumber || '',
        carrier: doc.carrier || '',
        items: Array.isArray(doc.items) ? doc.items : [],
        timestamp: doc.timestamp || '',
      }))
      .sort((a, b) => {
        const ta = new Date(a.timestamp).getTime() || 0;
        const tb = new Date(b.timestamp).getTime() || 0;
        return tb - ta;
      });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to load orders.' }, { status: 502 });
  }
}
