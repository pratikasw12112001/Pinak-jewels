'use client';
import styles from './PromoBanner.module.css';

export default function PromoBanner() {
  return (
    <div className={styles.promoBanner}>
      <div className={styles.scrollContainer}>
        <div className={styles.scrollContent}>
          <span>✦ Free shipping on orders above ₹2499 ✦</span>
          <span>✦ Anti-Tarnish & Waterproof Jewellery ✦</span>
          <span>✦ Premium Quality at Affordable Prices ✦</span>
          <span>✦ Free shipping on orders above ₹2499 ✦</span>
          <span>✦ Anti-Tarnish & Waterproof Jewellery ✦</span>
          <span>✦ Premium Quality at Affordable Prices ✦</span>
        </div>
      </div>
    </div>
  );
}
