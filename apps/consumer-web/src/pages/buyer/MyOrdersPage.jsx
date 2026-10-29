import { useState, useEffect } from 'react';
import { shopAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { Package, MapPin, CreditCard, ChevronRight, Download, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    shopAPI.getMyOrders()
      .then(r => setOrders(r.data.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const ORDER_STEPS = ['placed', 'paid', 'processing', 'shipped', 'delivered'];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>My Orders</h1>
        <p>Track all your purchases</p>
      </div>
      <div className="page-body">
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Package size={48} /></div>
            <h3>No orders yet</h3>
            <p>Your orders will appear here after purchase</p>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1rem' }}>Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => (
              <div key={order._id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {order.device?.photos?.[0] ? (
                      <img src={order.device.photos[0]} alt={order.device.model} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }} />
                    ) : (
                      <div style={{ width: 72, height: 72, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📱</div>
                    )}
                    <div>
                      <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{order.device?.listingTitle || order.device?.model}</h3>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <StatusBadge status={order.status} />
                        <StatusBadge status={order.paymentStatus} />
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Space Grotesk', background: 'var(--grad-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      ₹{order.price?.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {!['cancelled', 'returned'].includes(order.status) && (
                  <div style={{ marginTop: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      {ORDER_STEPS.map((step, i) => {
                        const current = ORDER_STEPS.indexOf(order.status);
                        const done = i <= current;
                        return (
                          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: done ? 'var(--volt-success)' : 'var(--bg-secondary)',
                              border: `2px solid ${done ? 'var(--volt-success)' : 'var(--border)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.7rem', color: done ? '#fff' : 'var(--text-muted)',
                              fontWeight: 700, zIndex: 1, position: 'relative',
                            }}>
                              {done ? '✓' : i + 1}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: done ? 'var(--text-primary)' : 'var(--text-muted)', marginTop: '0.3rem', textTransform: 'capitalize', textAlign: 'center' }}>
                              {step}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, marginTop: '-1.5rem', position: 'relative', zIndex: 0, margin: '-1.5rem 14px 0' }}>
                      <div style={{
                        height: '100%',
                        width: `${(ORDER_STEPS.indexOf(order.status) / (ORDER_STEPS.length - 1)) * 100}%`,
                        background: 'var(--volt-success)',
                        borderRadius: 1,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="alert alert-info" style={{ marginTop: '1rem', marginBottom: 0 }}>
                    📦 Tracking: {order.trackingNumber} via {order.courierName}
                  </div>
                )}

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <a
                    href={`/api/orders/${order._id}/invoice`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
                  >
                    <Download size={14} /> Tax Invoice (PDF)
                  </a>
                  {order.device && (
                    <a
                      href={`/api/devices/${order.device._id || order.device}/certificate`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
                    >
                      <ShieldCheck size={14} /> Privacy Audit Certificate (PDF)
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyOrdersPage;
