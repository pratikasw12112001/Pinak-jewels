'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import styles from './page.module.css';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Lakshadweep", "Puducherry"
];

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const { orders, addOrder, isLoaded: ordersLoaded } = useOrders();
  const router = useRouter();
  const shipping = cartTotal >= 2499 ? 0 : 99;
  const GIFT_WRAP_PRICE = 40;
  const [giftWrap, setGiftWrap] = useState(false);
  const total = cartTotal + shipping + (giftWrap ? GIFT_WRAP_PRICE : 0);

  const [step, setStep] = useState(isLoggedIn ? 2 : 1);
  const [usesSavedAddress, setUsesSavedAddress] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.name || '', address1: '', address2: '', city: '', state: '', pinCode: '',
    phone: '', email: user?.email || ''
  });
  const [processing, setProcessing] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [formError, setFormError] = useState('');

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  // Auto-fill from latest previous order
  
  useEffect(() => {
    if (ordersLoaded && orders.length > 0 && !usesSavedAddress && !form.address1) {
      const latest = orders[0];
      if (latest.customer) {
        setForm(latest.customer);
        setUsesSavedAddress(true);
      }
    }
  }, [ordersLoaded, orders, form.address1]);

  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    update('pinCode', val);

    if (val.length === 6) {
      setFetchingPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const po = data[0].PostOffice[0];
          setForm(prev => ({
            ...prev,
            city: prev.city || po.District || po.Block,
            state: po.State
          }));
        }
      } catch (err) {
        console.error('Failed to fetch pincode data', err);
      } finally {
        setFetchingPincode(false);
      }
    }
  };

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
    setFormError('');
    if (!form.fullName || !form.address1 || !form.city || !form.state || !form.pinCode || !form.phone || !form.email) {
      setFormError('Please fill all required fields before proceeding.');
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      setFormError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (form.pinCode.length !== 6) {
      setFormError('Please enter a valid 6-digit PIN code.');
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
              // Save to Firebase Firestore
              try {
                await addDoc(collection(db, 'orders'), {
                  name: form.fullName,
                  email: form.email,
                  phone: form.phone,
                  address: `${form.address1}${form.address2 ? ', ' + form.address2 : ''}, ${form.city}, ${form.state} — ${form.pinCode}`,
                  product: cartItems.map(item => `${item.name} (x${item.quantity})`).join(', '),
                  price: total,
                  status: 'Confirmed',
                  paymentId: response.razorpay_payment_id,
                  orderId: verifyData.orderId || response.razorpay_order_id,
                  timestamp: serverTimestamp(),
                });
              } catch (firebaseErr) {
                console.error('Firebase save error:', firebaseErr);
              }
              // Send admin email notification
              const orderAddress = `${form.address1}${form.address2 ? ', ' + form.address2 : ''}, ${form.city}, ${form.state} — ${form.pinCode}`;
              fetch('/api/send-order-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: form.fullName,
                  email: form.email,
                  phone: form.phone,
                  address: orderAddress,
                  product: cartItems.map(item => `${item.name} (x${item.quantity})`).join(', '),
                  price: total,
                  paymentId: response.razorpay_payment_id,
                  orderId: verifyData.orderId || response.razorpay_order_id,
                }),
              }).catch(err => console.error('Email send error:', err));
              addOrder({
                orderId: verifyData.orderId || response.razorpay_order_id,
                items: cartItems,
                total,
                subtotal: cartTotal,
                shipping,
                customer: form,
                paymentMode: 'Online (Razorpay)',
                paymentId: response.razorpay_payment_id,
              });
              clearCart();
              router.push(`/order-confirmation/${verifyData.orderId || response.razorpay_order_id}`);
            }
          } catch (e) {
            // Fallback: still save to Firebase Firestore
            try {
              await addDoc(collection(db, 'orders'), {
                name: form.fullName,
                email: form.email,
                phone: form.phone,
                address: `${form.address1}${form.address2 ? ', ' + form.address2 : ''}, ${form.city}, ${form.state} — ${form.pinCode}`,
                product: cartItems.map(item => `${item.name} (x${item.quantity})`).join(', '),
                price: total,
                status: 'Confirmed',
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                timestamp: serverTimestamp(),
              });
            } catch (firebaseErr) {
              console.error('Firebase save error:', firebaseErr);
            }
            // Send admin email notification (fallback)
            const orderAddress = `${form.address1}${form.address2 ? ', ' + form.address2 : ''}, ${form.city}, ${form.state} — ${form.pinCode}`;
            fetch('/api/send-order-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: form.fullName,
                email: form.email,
                phone: form.phone,
                address: orderAddress,
                product: cartItems.map(item => `${item.name} (x${item.quantity})`).join(', '),
                price: total,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
              }),
            }).catch(err => console.error('Email send error:', err));
            addOrder({
              orderId: response.razorpay_order_id,
              items: cartItems,
              total,
              subtotal: cartTotal,
              shipping,
              customer: form,
              paymentMode: 'Online (Razorpay)',
              paymentId: response.razorpay_payment_id,
            });
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
      setFormError('Payment failed. Please try again.');
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
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                  <h3 style={{marginBottom: 0}}>Delivery Address</h3>
                  {usesSavedAddress && (
                    <button className="btn btn-outline" onClick={() => { setUsesSavedAddress(false); setForm({fullName: user?.name||'', address1: '', address2: '', city: '', state: '', pinCode: '', phone: '', email: user?.email||''}); }} style={{padding: '6px 12px', fontSize: '13px'}}>
                      + Add New Address
                    </button>
                  )}
                </div>
                
                {usesSavedAddress ? (
                  <div className={styles.savedAddressCard} style={{background: 'var(--ivory)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px'}}>
                    <p style={{fontWeight: 600, marginBottom: '8px'}}>{form.fullName}</p>
                    <p style={{color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5}}>
                      {form.address1} {form.address2 && `, ${form.address2}`}<br/>
                      {form.city}, {form.state} — {form.pinCode}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className={styles.grid2}>
                      <div className={styles.field}><label>Full Name *</label><input type="text" value={form.fullName} onChange={e => update('fullName', e.target.value)} /></div>
                    </div>
                    <div className={styles.field}><label>Address Line 1 *</label><input type="text" value={form.address1} onChange={e => update('address1', e.target.value)} /></div>
                    <div className={styles.field}><label>Address Line 2</label><input type="text" value={form.address2} onChange={e => update('address2', e.target.value)} /></div>
                    <div className={styles.grid3}>
                      <div className={styles.field}><label>Pin Code *</label><input type="text" value={form.pinCode} onChange={handlePincodeChange} maxLength={6} placeholder={fetchingPincode ? "Fetching..." : ""} /></div>
                      <div className={styles.field}><label>City *</label><input type="text" value={form.city} onChange={e => update('city', e.target.value)} /></div>
                      <div className={styles.field}>
                        <label>State *</label>
                        <input type="text" list="indian-states" value={form.state} onChange={e => update('state', e.target.value)} />
                        <datalist id="indian-states">
                          {INDIAN_STATES.map(state => <option key={state} value={state} />)}
                        </datalist>
                      </div>
                    </div>
                  </>
                )}
                <button className="btn btn-primary" onClick={() => setStep(3)}>Continue</button>
              </div>
            )}

            {step === 3 && (
              <div className={styles.stepContent}>
                <h3>Contact Details</h3>
                <div className={styles.field}><label>Phone Number *</label><input type="tel" value={form.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" maxLength={10} /></div>
                <div className={styles.field}><label>Email *</label><input type="email" value={form.email} onChange={e => update('email', e.target.value)} /></div>
                <div className={styles.btnGroup}>
                  <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(4)}>Continue</button>
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
                {/* Gift Wrapping */}
                <label style={{display:'flex',alignItems:'center',gap:'12px',background:'var(--ivory)',padding:'14px 16px',borderRadius:'var(--radius-sm)',marginBottom:'16px',cursor:'pointer',border:`1.5px solid ${giftWrap ? 'var(--primary-green)' : 'var(--border-color)'}`,transition:'border-color 0.2s'}}>
                  <input type="checkbox" checked={giftWrap} onChange={e => setGiftWrap(e.target.checked)} style={{width:'18px',height:'18px',accentColor:'var(--primary-green)',cursor:'pointer'}} />
                  <div style={{flex:1}}>
                    <p style={{fontWeight:600,fontSize:'14px',margin:0}}>🎁 Gift Wrapping</p>
                    <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:'2px 0 0'}}>Beautiful gift packaging with a personal touch</p>
                  </div>
                  <span style={{fontWeight:700,color:'var(--primary-green)',fontSize:'14px'}}>+₹40</span>
                </label>
                <p className={styles.paymentInfo}>Secure payment powered by <strong>Razorpay</strong>. Supports UPI, Debit/Credit Cards, Net Banking & Wallets.</p>
                {formError && <div style={{background:'#fef2f2',color:'#dc2626',padding:'12px 16px',borderRadius:'var(--radius-sm)',fontSize:'13px',marginBottom:'16px'}}>{formError}</div>}
                <div className={styles.btnGroupCol}>
                  <button className="btn btn-secondary" onClick={handlePayment} disabled={processing} style={{width: '100%', fontSize: '16px', padding: '16px'}}>
                    {processing ? 'Processing...' : `Pay ₹${total.toLocaleString()}`}
                  </button>
                  <button className="btn btn-outline" onClick={() => setStep(3)} style={{width: '100%'}}>← Back to Contact</button>
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
              {giftWrap && <div><span>🎁 Gift Wrapping</span><span>₹40</span></div>}
              <div className={styles.grandTotal}><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
