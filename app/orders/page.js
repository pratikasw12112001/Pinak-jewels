'use client';
import Link from 'next/link';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

function getDeliveryDates(orderDateStr) {
  const orderDate = new Date(orderDateStr);
  let workingDays = 0;
  const minDate = new Date(orderDate);
  while (workingDays < 8) {
    minDate.setDate(minDate.getDate() + 1);
    const day = minDate.getDay();
    if (day !== 0) workingDays++; // Skip Sundays
  }
  const maxDate = new Date(minDate);
  workingDays = 0;
  while (workingDays < 1) {
    maxDate.setDate(maxDate.getDate() + 1);
    const day = maxDate.getDay();
    if (day !== 0) workingDays++;
  }
  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return { min: fmt(minDate), max: fmt(maxDate) };
}

export default function OrdersPage() {
  const { orders, isLoaded } = useOrders();
  const { isLoggedIn } = useAuth();

  if (!isLoaded) return null;

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
            const delivery = getDeliveryDates(order.date);
            const orderDate = new Date(order.date).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div key={order.id} className={styles.orderCard}>
                {/* Order Header */}
                <div className={styles.orderHeader}>
                  <div>
                    <span className={styles.orderId}>Order #{order.id}</span>
                    <span className={styles.orderDate}>{orderDate}</span>
                  </div>
                  <span className={styles.statusBadge}>{order.status}</span>
                </div>

                {/* Items */}
                <div className={styles.orderItems}>
                  {order.items.map(item => (
                    <div key={item.id} className={styles.orderItem}>
                      <img src={item.image} alt={item.name} className={styles.itemImg} />
                      <div className={styles.itemDetails}>
                        <h4>{item.name}</h4>
                        <p className={styles.itemMeta}>Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                      </div>
                      <span className={styles.itemTotal}>₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Order Info Grid */}
                <div className={styles.infoGrid}>
                  {/* Payment Info */}
                  <div className={styles.infoBlock}>
                    <h5>Payment</h5>
                    <p><strong>Mode:</strong> {order.paymentMode}</p>
                    {order.paymentId && <p><strong>Payment ID:</strong> {order.paymentId}</p>}
                    <p><strong>Subtotal:</strong> ₹{(order.subtotal || order.total).toLocaleString()}</p>
                    <p><strong>Shipping:</strong> {order.shipping === 0 ? 'Free' : `₹${order.shipping}`}</p>
                    <p className={styles.totalAmount}><strong>Total:</strong> ₹{order.total.toLocaleString()}</p>
                  </div>

                  {/* Delivery Address */}
                  <div className={styles.infoBlock}>
                    <h5>Delivery Address</h5>
                    <p><strong>{order.customer.fullName}</strong></p>
                    <p>{order.customer.address1}</p>
                    {order.customer.address2 && <p>{order.customer.address2}</p>}
                    <p>{order.customer.city}, {order.customer.state} — {order.customer.pinCode}</p>
                    <p>📞 {order.customer.phone}</p>
                  </div>
                </div>

                {/* Delivery Estimate */}
                <div className={styles.deliveryBanner}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  <span>Estimated delivery by <strong>{delivery.min} — {delivery.max}</strong> (8-9 working days)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
