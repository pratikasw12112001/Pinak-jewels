'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

function OrderContent() {
  const params = useParams();
  const orderId = params.id;

  return (
    <div className={styles.confirmPage}>
      <div className={styles.card}>
        <div className={styles.checkmark}>✓</div>
        <img src="/logo-pinak-transparent.png" alt="Pinak Jewels" className={styles.logo} />
        <h1>Order Confirmed!</h1>
        <p className={styles.subtitle}>Thank you for shopping with Pinak Jewels</p>

        <div className={styles.orderInfo}>
          <div className={styles.orderRow}><span>Order ID</span><strong>{orderId}</strong></div>
        </div>

        <div className={styles.message}>
          <p>🚚 Your order will be delivered within <strong>9 working days</strong>.</p>
        </div>

        <div className={styles.support}>
          <p>For any queries, contact us at:</p>
          <a href="mailto:pinakjewels04@gmail.com">pinakjewels04@gmail.com</a>
        </div>

        <Link href="/orders" className="btn btn-outline" style={{width:'100%',marginBottom:'10px'}}>View My Orders</Link>
        <Link href="/" className="btn btn-primary" style={{width:'100%'}}>Continue Shopping</Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return <Suspense fallback={<div style={{textAlign:'center',padding:'80px'}}>Loading...</div>}><OrderContent /></Suspense>;
}
