'use client';
import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useOrders } from '@/context/OrderContext';
import styles from './page.module.css';

function OrderContent() {
  const params = useParams();
  const orderId = params.id;
  const { orders, isLoaded } = useOrders();
  const localOrder = orders.find(o => o.id === orderId);
  const [remoteOrder, setRemoteOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // The local copy only exists on the device that placed the order, so fall
  // back to the server — otherwise opening this link elsewhere shows an
  // "Order Confirmed" page with no items or total on it.
  useEffect(() => {
    if (!isLoaded) return;
    if (localOrder) { setLoading(false); return; }

    let cancelled = false;
    fetch(`/api/order/${encodeURIComponent(orderId)}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (!cancelled && data?.order) setRemoteOrder(data.order); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [isLoaded, localOrder, orderId]);

  const order = localOrder
    ? localOrder
    : remoteOrder
      ? { total: remoteOrder.price, items: remoteOrder.items }
      : null;

  return (
    <div className={styles.confirmPage}>
      <div className={styles.card}>
        <div className={styles.checkmark}>✓</div>
        <h1>Order Confirmed!</h1>
        <p className={styles.subtitle}>Thank you for shopping with Pinak Jewels</p>

        <div className={styles.orderInfo}>
          <div className={styles.orderRow}>
            <span>Order ID</span>
            <strong>{orderId}</strong>
          </div>
          {loading && !order && (
            <div className={styles.orderRow} style={{marginTop:'8px'}}>
              <span>Loading order details…</span>
            </div>
          )}
          {order && (
            <>
              <div className={styles.orderRow} style={{marginTop:'8px'}}>
                <span>Total Paid</span>
                <strong style={{color:'var(--primary-green)'}}>₹{(Number(order.total) || 0).toLocaleString()}</strong>
              </div>
              <div className={styles.orderRow} style={{marginTop:'8px'}}>
                <span>Items</span>
                <strong>{order.items?.length || 0} item{(order.items?.length || 0) === 1 ? '' : 's'}</strong>
              </div>
            </>
          )}
        </div>

        {Array.isArray(order?.items) && order.items.length > 0 && (
          <div className={styles.itemsList}>
            {order.items.map((item, i) => {
              const price = Number(item?.price) || 0;
              const qty = Number(item?.quantity) || 0;
              return (
                <div key={item?.id ?? i} className={styles.itemRow}>
                  {item?.image && <img src={item.image} alt={item?.name || 'Product'} className={styles.itemImg} />}
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item?.name || 'Item'}</p>
                    <p className={styles.itemMeta}>Qty: {qty} × ₹{price.toLocaleString()}</p>
                  </div>
                  <span className={styles.itemTotal}>₹{(price * qty).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.message}>
          🚚 Your order will be delivered within <strong>7–10 working days</strong>
        </div>

        <div className={styles.support}>
          <p>Questions? Reach us at:</p>
          <a href="mailto:pinakjewels04@gmail.com">pinakjewels04@gmail.com</a>
        </div>

        <Link href="/orders" className="btn btn-outline" style={{width:'100%',marginBottom:'10px'}}>View My Orders</Link>
        <Link href="/" className="btn btn-primary" style={{width:'100%'}}>Continue Shopping</Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div style={{textAlign:'center',padding:'80px'}}>Loading...</div>}>
      <OrderContent />
    </Suspense>
  );
}
