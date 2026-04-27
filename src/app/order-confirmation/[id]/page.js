'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useOrders } from '@/context/OrderContext';
import styles from './page.module.css';

function OrderContent() {
  const params = useParams();
  const orderId = params.id;
  const { orders } = useOrders();
  const order = orders.find(o => o.id === orderId);

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
          {order && (
            <>
              <div className={styles.orderRow} style={{marginTop:'8px'}}>
                <span>Total Paid</span>
                <strong style={{color:'var(--primary-green)'}}>₹{order.total?.toLocaleString()}</strong>
              </div>
              <div className={styles.orderRow} style={{marginTop:'8px'}}>
                <span>Items</span>
                <strong>{order.items?.length} item{order.items?.length > 1 ? 's' : ''}</strong>
              </div>
            </>
          )}
        </div>

        {order?.items && (
          <div className={styles.itemsList}>
            {order.items.map((item, i) => (
              <div key={i} className={styles.itemRow}>
                <img src={item.image} alt={item.name} className={styles.itemImg} />
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemMeta}>Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                </div>
                <span className={styles.itemTotal}>₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
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
