'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const STATUS_ORDER = ['Confirmed', 'Packed', 'Shipped', 'Delivered'];
const STATUS_COLORS = {
  Confirmed: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  Packed:    { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  Shipped:   { bg: '#EDE9FE', text: '#5B21B6', dot: '#7C3AED' },
  Delivered: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
};

const NEXT_STATUS = { Confirmed: 'Packed', Packed: 'Shipped', Shipped: 'Delivered' };

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Confirmed;
  return (
    <span style={{ background: c.bg, color: c.text, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(null); // { order, nextStatus }
  const [tracking, setTracking] = useState('');
  const [carrier, setCarrier] = useState('Delhivery');
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState('');
  const router = useRouter();

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/orders');
    if (res.status === 401) { router.push('/admin'); return; }
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const openModal = (order, nextStatus) => {
    setModal({ order, nextStatus });
    setTracking('');
    setCarrier('Delhivery');
  };

  const handleUpdate = async () => {
    if (!modal) return;
    if (modal.nextStatus === 'Shipped' && !tracking.trim()) {
      alert('Please enter a tracking number.'); return;
    }
    setUpdating(true);
    const res = await fetch('/api/admin/update-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        docId: modal.order.docId,
        status: modal.nextStatus,
        trackingNumber: tracking,
        carrier,
        customerEmail: modal.order.email,
        customerName: modal.order.name,
        orderId: modal.order.orderId,
        total: modal.order.price,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setOrders(prev => prev.map(o => o.docId === modal.order.docId
        ? { ...o, status: modal.nextStatus, trackingNumber: tracking, carrier }
        : o
      ));
      const msg = modal.nextStatus === 'Shipped'
        ? `Order marked as Shipped — customer notified with tracking number`
        : `Order marked as ${modal.nextStatus}${modal.nextStatus === 'Delivered' ? ' — customer notified' : ''}`;
      showToast(msg);
    }
    setModal(null);
    setUpdating(false);
  };

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);
  const counts = STATUS_ORDER.reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.status === s).length }), {});
  const todayOrders = orders.filter(o => {
    const d = new Date(o.timestamp);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  }).length;

  const fmtDate = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <img src="/logo-pinak-transparent.png" alt="Pinak Jewels" className={styles.headerLogo} />
          <span className={styles.adminTag}>Admin</span>
        </div>
        <div className={styles.headerRight}>
          <button onClick={fetchOrders} className={styles.refreshBtn} title="Refresh orders">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
            Refresh
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>Sign Out</button>
        </div>
      </header>

      <div className={styles.container}>
        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Orders</p>
            <p className={styles.statValue}>{orders.length}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Today</p>
            <p className={styles.statValue}>{todayOrders}</p>
          </div>
          <div className={styles.statCard} style={{ borderLeft: '4px solid #F59E0B' }}>
            <p className={styles.statLabel}>To Pack</p>
            <p className={styles.statValue} style={{ color: '#92400E' }}>{counts.Confirmed || 0}</p>
          </div>
          <div className={styles.statCard} style={{ borderLeft: '4px solid #7C3AED' }}>
            <p className={styles.statLabel}>In Transit</p>
            <p className={styles.statValue} style={{ color: '#5B21B6' }}>{(counts.Packed || 0) + (counts.Shipped || 0)}</p>
          </div>
          <div className={styles.statCard} style={{ borderLeft: '4px solid #10B981' }}>
            <p className={styles.statLabel}>Delivered</p>
            <p className={styles.statValue} style={{ color: '#065F46' }}>{counts.Delivered || 0}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          {['All', ...STATUS_ORDER].map(f => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`} onClick={() => setFilter(f)}>
              {f}
              <span className={styles.filterCount}>{f === 'All' ? orders.length : counts[f] || 0}</span>
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3>No orders {filter !== 'All' ? `with status "${filter}"` : 'yet'}</h3>
            <p>Orders will appear here once customers place them.</p>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {filtered.map(order => {
              const next = NEXT_STATUS[order.status];
              const trackUrl = order.trackingNumber
                ? (order.carrier === 'Delhivery'
                    ? `https://www.delhivery.com/track/?waybill=${order.trackingNumber}`
                    : `https://www.indiapost.gov.in/vas/pages/trackConsignment.aspx`)
                : null;
              return (
                <div key={order.docId} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div>
                      <span className={styles.orderId}>#{order.orderId || order.docId}</span>
                      <span className={styles.orderDate}>{fmtDate(order.timestamp)}</span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className={styles.orderBody}>
                    <div className={styles.customerInfo}>
                      <h4>{order.name}</h4>
                      <p>📞 {order.phone}</p>
                      <p>✉️ {order.email}</p>
                      <p style={{ marginTop: '6px', fontSize: '13px', color: '#6b7280' }}>📍 {order.address}</p>
                    </div>
                    <div className={styles.orderMeta}>
                      <div className={styles.items}>
                        <p className={styles.itemsLabel}>Items</p>
                        <p className={styles.itemsValue}>{order.product}</p>
                      </div>
                      <div className={styles.totalBox}>
                        <p className={styles.totalLabel}>Total</p>
                        <p className={styles.totalValue}>₹{Number(order.price).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {order.trackingNumber && (
                    <div className={styles.trackingBar}>
                      <span>🚚 {order.carrier} · {order.trackingNumber}</span>
                      {trackUrl && <a href={trackUrl} target="_blank" rel="noopener noreferrer" className={styles.trackLink}>Track →</a>}
                    </div>
                  )}

                  {next && (
                    <div className={styles.orderFooter}>
                      <button className={styles.actionBtn} onClick={() => openModal(order, next)}>
                        {next === 'Packed' && '📦 Mark as Packed'}
                        {next === 'Shipped' && '🚚 Mark as Shipped'}
                        {next === 'Delivered' && '✅ Mark as Delivered'}
                      </button>
                    </div>
                  )}
                  {!next && <div className={styles.orderFooter}><span className={styles.doneTag}>✓ Order Complete</span></div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>
              {modal.nextStatus === 'Packed' && '📦 Mark as Packed'}
              {modal.nextStatus === 'Shipped' && '🚚 Mark as Shipped'}
              {modal.nextStatus === 'Delivered' && '✅ Mark as Delivered'}
            </h3>
            <p className={styles.modalSub}>Order #{modal.order.orderId} · {modal.order.name}</p>

            {modal.nextStatus === 'Shipped' && (
              <div className={styles.modalFields}>
                <div className={styles.modalField}>
                  <label>Tracking Number *</label>
                  <input type="text" value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Enter courier tracking number" autoFocus />
                </div>
                <div className={styles.modalField}>
                  <label>Carrier</label>
                  <select value={carrier} onChange={e => setCarrier(e.target.value)}>
                    <option>Delhivery</option>
                    <option>India Post</option>
                    <option>DTDC</option>
                    <option>Blue Dart</option>
                    <option>Ekart</option>
                    <option>Xpressbees</option>
                  </select>
                </div>
                <p className={styles.modalNote}>📧 Customer will receive an email with tracking details and a direct tracking link.</p>
              </div>
            )}

            {modal.nextStatus === 'Delivered' && (
              <p className={styles.modalNote}>📧 Customer will receive a delivery confirmation email.</p>
            )}

            {modal.nextStatus === 'Packed' && (
              <p className={styles.modalNote}>Order will be marked as packed. No customer email for this step.</p>
            )}

            <div className={styles.modalActions}>
              <button onClick={() => setModal(null)} className={styles.cancelBtn} disabled={updating}>Cancel</button>
              <button onClick={handleUpdate} className={styles.confirmBtn} disabled={updating}>
                {updating ? 'Updating...' : `Confirm — ${modal.nextStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
