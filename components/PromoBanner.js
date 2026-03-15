'use client';
import styles from './PromoBanner.module.css';

export default function PromoBanner() {
  return (
    <div className={styles.promoBanner}>
      {/* Mobile: only first message, centered */}
      <div className={styles.mobileOnly}>
        <span>✦ Free shipping on orders above ₹2499 ✦</span>
      </div>
      {/* Desktop: scrolling marquee with all messages */}
      <div className={styles.desktopOnly}>
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
