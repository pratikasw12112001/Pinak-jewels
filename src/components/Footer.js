'use client';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className="container">
          <div className={styles.footerGrid}>
            {/* Brand */}
            <div className={styles.footerBrand}>
              <Link href="/" className={styles.footerLogoWrap}>
                <img src="/logo-pinak-transparent.png" alt="Pinak Jewels" className={styles.footerLogo} />
              </Link>
              <p className={styles.brandDesc}>
                Modern jewellery crafted with love. Discover anti-tarnish, waterproof pieces that perfectly blend contemporary design with timeless elegance.
              </p>
              <div className={styles.socials}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="mailto:pinakjewels04@gmail.com" aria-label="Email">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.footerCol}>
              <h4>Quick Links</h4>
              <Link href="/">Home</Link>
              <Link href="/category/pendants">Pendants</Link>
              <Link href="/category/necklaces">Necklaces</Link>
              <Link href="/category/rings">Rings</Link>
              <Link href="/category/bracelets">Bracelets</Link>
              <Link href="/category/earrings">Earrings</Link>
            </div>

            {/* Help */}
            <div className={styles.footerCol}>
              <h4>Help</h4>
              <Link href="/contact">Contact Us</Link>
              <Link href="/orders">My Orders</Link>
              <Link href="/cart">Shopping Cart</Link>
              <Link href="/wishlist">Wishlist</Link>
              <Link href="/auth">My Account</Link>
            </div>

            {/* Newsletter */}
            <div className={styles.footerCol}>
              <h4>Stay Connected</h4>
              <p className={styles.newsletterText}>Subscribe for exclusive offers and new arrivals.</p>
              <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Your email" className={styles.newsletterInput} />
                <button type="submit" className={styles.newsletterBtn}>→</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className="container">
          <p>© {new Date().getFullYear()} Pinak Jewels. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
