import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import { Package, Truck, CheckCircle2, Clock, Filter, Eye, X } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Status update form
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('BlueDart Express');

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getOrders(filterStatus ? { status: filterStatus } : {});
      setOrders(res.data.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
    setCourierName(order.courierName || 'BlueDart Express');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await adminAPI.updateOrderStatus(selectedOrder._id, {
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
        courierName: courierName || undefined,
      });
      toast.success('Order status updated successfully');
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const STATUS_TABS = ['', 'placed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Orders Management</h1>
        <p>Monitor all customer purchases, update shipping details, and track deliveries</p>
      </div>

      <div className="page-body">
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`btn ${filterStatus === tab ? 'btn-primary' : 'btn-ghost'} btn-sm`}
              style={{ textTransform: 'capitalize' }}
            >
              {tab === '' ? 'All Orders' : tab}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem' }}>All Buyer Orders</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{orders.length} orders found</span>
          </div>

          {loading ? (
            <div className="page-loader" style={{ minHeight: 200 }}><div className="spinner" /></div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Package size={40} /></div>
              <h3>No orders found</h3>
              <p>There are no orders matching the selected status.</p>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Buyer</th>
                    <th>Device</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Tracking / Courier</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{order._id.slice(-6).toUpperCase()}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.buyer?.name || 'Customer'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.buyer?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{order.device?.model || 'Device'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--volt-accent)' }}>{order.device?.os}</div>
                      </td>
                      <td><strong>₹{order.price?.toLocaleString('en-IN')}</strong></td>
                      <td><StatusBadge status={order.status} /></td>
                      <td>
                        {order.trackingNumber ? (
                          <div style={{ fontSize: '0.8rem' }}>
                            <div style={{ color: 'var(--volt-primary)', fontWeight: 600 }}>{order.courierName}</div>
                            <span style={{ fontFamily: 'monospace' }}>{order.trackingNumber}</span>
                          </div>
                        ) : (
                          <span className="text-muted text-sm">—</span>
                        )}
                      </td>
                      <td className="text-muted text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openUpdateModal(order)}
                        >
                          <Eye size={14} /> Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Manage / Dispatch Modal */}
      {selectedOrder && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 540 }}>
            <form onSubmit={handleUpdateStatus}>
              <div className="modal-header">
                <h2>Manage Order #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}><X size={16} /></button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>{selectedOrder.device?.model} ({selectedOrder.device?.os})</span>
                    <strong style={{ color: 'var(--volt-accent)' }}>₹{selectedOrder.price?.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong>Delivery Address:</strong> {selectedOrder.address?.name}, {selectedOrder.address?.street}, {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <strong>Phone:</strong> {selectedOrder.address?.phone} | <strong>Payment ID:</strong> {selectedOrder.paymentId || 'N/A'}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Update Order Status *</label>
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    required
                  >
                    <option value="processing">Processing (Preparing in Warehouse)</option>
                    <option value="shipped">Shipped (In Transit)</option>
                    <option value="delivered">Delivered (Completed)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {(newStatus === 'shipped' || newStatus === 'processing' || selectedOrder.trackingNumber) && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Courier Name</label>
                      <input
                        className="form-input"
                        placeholder="e.g. BlueDart Express, Delhivery, DTDC"
                        value={courierName}
                        onChange={e => setCourierName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tracking Number / AWB</label>
                      <input
                        className="form-input"
                        placeholder="e.g. VKBLR9283746IN"
                        value={trackingNumber}
                        onChange={e => setTrackingNumber(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setSelectedOrder(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminOrders;
