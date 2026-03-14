'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import styles from './page.module.css';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const shipping = cartTotal >= 2499 ? 0 : 99;
  const total = cartTotal + shipping;

  const [step, setStep] = useState(isLoggedIn ? 2 : 1);
  const [form, setForm] = useState({
    fullName: user?.name || '', address1: '', address2: '', city: '', state: '', pinCode: '',
    phone: '', email: user?.email || ''
  });
  const [processing, setProcessing] = useState(false);

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  if (cartItems.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>No items in cart</h2>
        <p>Add some items before checking out.</p>
        <Link href="/" className="btn btn-primary">Shop Now</Link>
      </div>
    );
  }

  if (!isLoggedIn && step === 1) {
    return (
      <div className={styles.checkoutPage}>
        <div className="container">
          <h1 className={styles.title}>Checkout</h1>
          <div className={styles.authPrompt}>
            <h3>Please sign in to continue</h3>
            <p>You need to be logged in to complete your purchase.</p>
            <Link href="/auth" className="btn btn-primary">Sign In / Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!form.fullName || !form.address1 || !form.city || !form.state || !form.pinCode || !form.phone || !form.email) {
      alert('Please fill all required fields');
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      });
      const data = await res.json();

      if (!data.orderId) throw new Error('Failed to create payment order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: 'INR',
        name: 'Pinak Jewels',
        description: 'Jewellery Purchase',
        order_id: data.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customer: form,
                items: cartItems,
                total
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              router.push(`/order-confirmation/${verifyData.orderId || response.razorpay_order_id}`);
            }
          } catch (e) {
            clearCart();
            router.push(`/order-confirmation/${response.razorpay_order_id}`);
          }
        },
        prefill: { name: form.fullName, email: form.email, contact: form.phone },
        theme: { color: '#0F4F3A' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Payment failed. Please try again.');
    }
    setProcessing(false);
  };

  return (
    <div className={styles.checkoutPage}>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <div className="container">
        <h1 className={styles.title}>Checkout</h1>
        <div className={styles.layout}>
          <div className={styles.formSection}>
            {/* Steps indicator */}
            <div className={styles.steps}>
              <div className={`${styles.stepItem} ${step >= 2 ? styles.active : ''}`}>
                <span>1</span> Address
              </div>
              <div className={styles.stepLine} />
              <div className={`${styles.stepItem} ${step >= 3 ? styles.active : ''}`}>
                <span>2</span> Contact
              </div>
              <div className={styles.stepLine} />
              <div className={`${styles.stepItem} ${step >= 4 ? styles.active : ''}`}>
                <span>3</span> Payment
              </div>
            </div>

            {step === 2 && (
              <div className={styles.stepContent}>
                <h3>Delivery Address</h3>
                <div className={styles.grid2}>
                  <div className={styles.field}><label>Full Name *</label><input type="text" value={form.fullName} onChange={e => update('fullName', e.target.value)} /></div>
                </div>
                <div className={styles.field}><label>Address Line 1 *</label><input type="text" value={form.address1} onChange={e => update('address1', e.target.value)} /></div>
                <div className={styles.field}><label>Address Line 2</label><input type="text" value={form.address2} onChange={e => update('address2', e.target.value)} /></div>
                <div className={styles.grid3}>
                  <div className={styles.field}><label>City *</label><input type="text" value={form.city} onChange={e => update('city', e.target.value)} /></div>
                  <div className={styles.field}><label>State *</label><input type="text" value={form.state} onChange={e => update('state', e.target.value)} /></div>
                  <div className={styles.field}><label>Pin Code *</label><input type="text" value={form.pinCode} onChange={e => update('pinCode', e.target.value)} maxLength={6} /></div>
                </div>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Continue to Contact</button>
              </div>
            )}

            {step === 3 && (
              <div className={styles.stepContent}>
                <h3>Contact Details</h3>
                <div className={styles.field}><label>Phone Number *</label><input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} maxLength={10} /></div>
                <div className={styles.field}><label>Email *</label><input type="email" value={form.email} onChange={e => update('email', e.target.value)} /></div>
                <div className={styles.btnGroup}>
                  <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(4)}>Continue to Payment</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className={styles.stepContent}>
                <h3>Payment</h3>
                <div className={styles.codNotice}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Cash on Delivery (COD) is not available for this order.
                </div>
                <p className={styles.paymentInfo}>Secure payment powered by <strong>Razorpay</strong>. Supports UPI, Debit/Credit Cards, Net Banking & Wallets.</p>
                <div className={styles.btnGroup}>
                  <button className="btn btn-outline" onClick={() => setStep(3)}>← Back</button>
                  <button className="btn btn-secondary" onClick={handlePayment} disabled={processing}>
                    {processing ? 'Processing...' : `Pay ₹${total.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className={styles.summary}>
            <h3>Order Summary</h3>
            <div className={styles.summaryItems}>
              {cartItems.map(item => (
                <div key={item.id} className={styles.summaryItem}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <p className={styles.summaryItemName}>{item.name}</p>
                    <p className={styles.summaryItemQty}>Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                  </div>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className={styles.summaryTotal}>
              <div><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
              <div><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
              <div className={styles.grandTotal}><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
