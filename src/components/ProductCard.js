'use client';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  return (
    <div className={styles.card}>
      <Link href={`/product/${product.slug}`} className={styles.imageWrapper}>
        <img
          src={product.image}
          alt={product.name}
          className={styles.image}
          loading="lazy"
        />
        {product.isNew && <span className={styles.tagNew}>New</span>}
      </Link>

      <button
        className={`${styles.wishlistBtn} ${wishlisted ? styles.active : ''}`}
        onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill={wishlisted ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      <div className={styles.info}>
        <Link href={`/product/${product.slug}`}>
          <h3 className={styles.name}>{product.name}</h3>
        </Link>
        <p className={styles.category}>{product.category}</p>
        <p className={styles.price}>₹{product.price.toLocaleString()}</p>
      </div>
    </div>
  );
}
