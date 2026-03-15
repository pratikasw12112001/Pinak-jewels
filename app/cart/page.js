'use client';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const shipping = cartTotal >= 2499 ? 0 : 99;
  const total = cartTotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🛍️</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven not added any items to your cart yet.</p>
        <Link href="/" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.cartPage}>
        <h1 className={styles.title}>Shopping Cart</h1>
        <div className={styles.layout}>
          <div className={styles.items}>
            {cartItems.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <Link href={`/product/${item.slug}`} className={styles.itemImage}>
                  <img src={item.image} alt={item.name} />
                </Link>
                <div className={styles.itemInfo}>
                  <Link href={`/product/${item.slug}`}><h3>{item.name}</h3></Link>
                  <p className={styles.itemCategory}>{item.category}</p>
                  <p className={styles.itemPrice}>₹{item.price.toLocaleString()}</p>
                </div>
                <div className={styles.itemActions}>
                  <div className={styles.qty}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <p className={styles.itemTotal}>₹{(item.price * item.quantity).toLocaleString()}</p>
                  <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h3>Order Summary</h3>
            <div className={styles.summaryRow}><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
            <div className={styles.summaryRow}><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
            {shipping > 0 && <p className={styles.freeShipNote}>Add ₹{(2499 - cartTotal).toLocaleString()} more for free shipping</p>}
            <div className={`${styles.summaryRow} ${styles.totalRow}`}><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            <Link href="/checkout" className="btn btn-primary" style={{width:'100%'}}>Proceed to Checkout</Link>
            <Link href="/" className={styles.continueShopping}>← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
