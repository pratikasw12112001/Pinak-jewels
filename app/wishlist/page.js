'use client';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/Toast';
import styles from './page.module.css';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleMoveToCart = (item) => {
    addToCart(item);
    removeFromWishlist(item.id);
    showToast(`"${item.name}" moved to cart`, 'View Cart', '/cart');
  };

  if (wishlistItems.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>♡</div>
        <h2>Your wishlist is empty</h2>
        <p>Save your favourite pieces to come back to them later.</p>
        <Link href="/" className="btn btn-primary">Explore Collections</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.wishlistPage}>
        <h1 className={styles.title}>My Wishlist</h1>
        <p className={styles.count}>{wishlistItems.length} items saved</p>
        <div className={styles.grid}>
          {wishlistItems.map(item => (
            <div key={item.id} className={styles.card}>
              <Link href={`/product/${item.slug}`} className={styles.imageWrapper}>
                <img src={item.image} alt={item.name} />
              </Link>
              <div className={styles.info}>
                <Link href={`/product/${item.slug}`}><h3>{item.name}</h3></Link>
                <p className={styles.price}>₹{item.price.toLocaleString()}</p>
                <div className={styles.actions}>
                  <button className="btn btn-primary" style={{fontSize:'12px',padding:'10px 20px'}} onClick={() => handleMoveToCart(item)}>Move to Cart</button>
                  <button className={styles.removeBtn} onClick={() => removeFromWishlist(item.id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
