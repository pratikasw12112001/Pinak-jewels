'use client';
import Link from 'next/link';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

function getDeliveryDates(orderDateStr) {
  const orderDate = new Date(orderDateStr);
  // An unparseable date would otherwise produce "Invalid Date" in the UI.
  if (Number.isNaN(orderDate.getTime())) return null;
  let workingDays = 0;
  const minDate = new Date(orderDate);
  while (workingDays < 7) {
    minDate.setDate(minDate.getDate() + 1);
    const day = minDate.getDay();
    if (day !== 0 && day !== 6) workingDays++;
  }
  const maxDate = new Date(minDate);
  maxDate.setDate(maxDate.getDate() + 3);
  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return { min: fmt(minDate), max: fmt(maxDate) };
}

export default function OrdersPage() {
  const { orders, isLoaded } = useOrders();
  const { isLoggedIn } = useAuth();

  if (!isLoaded) return (
    <div style={{textAlign:'center',padding:'120px 24px',color:'var(--text-secondary)'}}>
      <div style={{fontSize:'32px',marginBottom:'16px'}}>📦</div>
      <p>Loading your orders...</p>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🔒</div>
        <h2>Please sign in</h2>
        <p>You need to be logged in to view your orders.</p>
        <Link href="/auth" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📦</div>
        <h2>No orders yet</h2>
        <p>You haven't placed any orders. Start shopping to see your orders here!</p>
        <Link href="/" className="btn btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.ordersPage}>
        <h1 className={styles.title}>My Orders</h1>
        <p className={styles.count}>{orders.length} order{orders.length > 1 ? 's' : ''}</p>

        <div className={styles.orderList}>
          {orders.map(order => {
            // Older or partially-written orders may be missing fields; render
            // them defensively rather than crashing the whole page.
            const delivery = getDeliveryDates(order.date);
            const parsedDate = new Date(order.date);
            const orderDate = Number.isNaN(parsedDate.getTime())
              ? '—'
              : parsedDate.toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                });
            const items = Array.isArray(order.items) ? order.items : [];
            const customer = order.customer || {};
            const orderTotal = Number(order.total) || 0;
            const orderSubtotal = Number(order.subtotal ?? order.total) || 0;

            return (
              <div key={order.id} className={styles.orderCard}>
                {/* Order Header */}
                <div className={styles.orderHeader}>
                  <div>
                    <span className={styles.orderId}>Order #{order.id}</span>
                    <span className={styles.orderDate}>{orderDate}</span>
                  </div>
                  <span className={styles.statusBadge}>{order.status || 'Confirmed'}</span>
                </div>

                {/* Items */}
                <div className={styles.orderItems}>
                  {items.map((item, i) => {
                    const price = Number(item?.price) || 0;
                    const qty = Number(item?.quantity) || 0;
                    return (
                      <div key={item?.id ?? i} className={styles.orderItem}>
                        {item?.image && <img src={item.image} alt={item?.name || 'Product'} className={styles.itemImg} />}
                        <div className={styles.itemDetails}>
                          <h4>{item?.name || 'Item'}</h4>
                          <p className={styles.itemMeta}>Qty: {qty} × ₹{price.toLocaleString()}</p>
                        </div>
                        <span className={styles.itemTotal}>₹{(price * qty).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Order Info Grid */}
                <div className={styles.infoGrid}>
                  {/* Payment Info */}
                  <div className={styles.infoBlock}>
                    <h5>Payment</h5>
                    <p><strong>Mode:</strong> {order.paymentMode || 'Online (Razorpay)'}</p>
                    {order.paymentId && <p><strong>Payment ID:</strong> {order.paymentId}</p>}
                    <p><strong>Subtotal:</strong> ₹{orderSubtotal.toLocaleString()}</p>
                    <p><strong>Shipping:</strong> {Number(order.shipping) > 0 ? `₹${order.shipping}` : 'Free'}</p>
                    <p className={styles.totalAmount}><strong>Total:</strong> ₹{orderTotal.toLocaleString()}</p>
                  </div>

                  {/* Delivery Address */}
                  <div className={styles.infoBlock}>
                    <h5>Delivery Address</h5>
                    <p><strong>{customer.fullName || '—'}</strong></p>
                    {customer.address1 && <p>{customer.address1}</p>}
                    {customer.address2 && <p>{customer.address2}</p>}
                    {(customer.city || customer.state || customer.pinCode) && (
                      <p>{customer.city}, {customer.state} — {customer.pinCode}</p>
                    )}
                    {customer.phone && <p>📞 {customer.phone}</p>}
                  </div>
                </div>

                {/* Delivery Estimate */}
                {delivery && <div className={styles.deliveryBanner}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  <span>Estimated delivery by <strong>{delivery.min} — {delivery.max}</strong> (9 working days)</span>
                </div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
