import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, UserCheck, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

const AdminRequests = () => {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'counter-offers'
  const [requests, setRequests] = useState([]);
  const [counterOffers, setCounterOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [agents, setAgents] = useState([]);
  const [offerForm, setOfferForm] = useState({ offeredPrice: '', rejectionReason: '' });
  const [agentId, setAgentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    } else {
      fetchCounterOffers();
    }
    adminAPI.getAgents().then(r => setAgents(r.data.data)).catch(() => {});
  }, [activeTab, filterStatus]);

  const fetchRequests = () => {
    setLoading(true);
    adminAPI.getRequests(filterStatus ? { status: filterStatus } : {})
      .then(r => setRequests(r.data.data))
      .catch(() => toast.error('Failed to load requests'))
      .finally(() => setLoading(false));
  };

  const fetchCounterOffers = () => {
    setLoading(true);
    adminAPI.getCounterOffers()
      .then(r => setCounterOffers(r.data.data))
      .catch(() => toast.error('Failed to load counter-offers'))
      .finally(() => setLoading(false));
  };

  const handleOffer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminAPI.setOffer(selected._id, offerForm);
      toast.success('Offer sent to seller');
      fetchRequests();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!agentId) { toast.error('Select an agent'); return; }
    setSubmitting(true);
    try {
      await adminAPI.assignAgent(selected._id, agentId);
      toast.success('Agent assigned!');
      fetchRequests();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveCounterOffer = async (offerId) => {
    setSubmitting(true);
    try {
      await adminAPI.approveCounterOffer(offerId);
      toast.success('Counter-offer approved and sent to seller!');
      fetchCounterOffers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve counter-offer');
    } finally {
      setSubmitting(false);
    }
  };

  const STATUSES = [
    'submitted',
    'approved',
    'agent_assigned',
    'on_the_way',
    'inspected',
    'picked_up',
    'received',
    'verified',
    'paid',
    'counter_offered',
    'return_to_seller',
    'rejected',
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Sell Requests & Counter-Offers</h1>
        <p>Review device requests, warehouse counter-offers, and assign field agents</p>
      </div>

      <div className="page-body">
        {/* Main Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <button
            className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('requests')}
          >
            📋 Sell Requests ({requests.length})
          </button>
          <button
            className={`btn ${activeTab === 'counter-offers' ? 'btn-accent' : 'btn-ghost'}`}
            onClick={() => setActiveTab('counter-offers')}
          >
            ⚠️ Warehouse Counter-Offers ({counterOffers.filter(c => c.status === 'pending_admin').length} pending)
          </button>
        </div>

        {activeTab === 'requests' && (
          <>
            {/* Status filters */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {['', ...STATUSES].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-ghost'} btn-sm`} style={{ textTransform: 'capitalize' }}>
                  {s ? s.replace(/_/g, ' ') : 'All'}
                </button>
              ))}
            </div>

            <div className="table-wrap">
              {loading ? (
                <div className="page-loader" style={{ minHeight: 200 }}><div className="spinner" /></div>
              ) : (
                <table>
                  <thead><tr>
                    <th>Seller</th><th>Model</th><th>Seller Rate</th><th>Final Price</th><th>Status</th><th>Response</th><th>Action</th>
                  </tr></thead>
                  <tbody>
                    {requests.map(r => (
                      <tr key={r._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{r.seller?.name}</div>
                          <div className="text-muted text-xs">{r.seller?.email}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{r.model}</td>
                        <td>
                          {r.sellerRate ? (
                            <span>₹{r.sellerRate?.toLocaleString('en-IN')}</span>
                          ) : (
                            <span>₹{r.expectedPrice?.toLocaleString('en-IN')}</span>
                          )}
                        </td>
                        <td>
                          {r.finalPrice ? (
                            <strong style={{ color: 'var(--volt-accent)' }}>₹{r.finalPrice.toLocaleString('en-IN')}</strong>
                          ) : r.offeredPrice ? (
                            <span style={{ color: 'var(--volt-accent)' }}>₹{r.offeredPrice.toLocaleString('en-IN')}</span>
                          ) : '—'}
                        </td>
                        <td><StatusBadge status={r.status} /></td>
                        <td><span className="text-sm text-muted" style={{ textTransform: 'capitalize' }}>{r.sellerResponse}</span></td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(r)}>Manage</button>
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No requests found</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Counter Offers Tab (Faisla 4) */}
        {activeTab === 'counter-offers' && (
          <div className="table-wrap">
            {loading ? (
              <div className="page-loader" style={{ minHeight: 200 }}><div className="spinner" /></div>
            ) : counterOffers.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem' }}>
                <CheckCircle2 size={48} color="var(--volt-primary)" />
                <h3 style={{ marginTop: '0.75rem' }}>No Counter-Offers</h3>
                <p>Warehouse engineer reported defects will appear here for admin approval.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Device & Seller</th>
                    <th>Original Price</th>
                    <th>Discovered Defect(s)</th>
                    <th>New Offer</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {counterOffers.map(co => (
                    <tr key={co._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{co.sellRequest?.model || co.device?.model || 'Device'}</div>
                        <div className="text-muted text-xs">Seller: {co.seller?.name || co.seller?.email}</div>
                        {co.engineerNotes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                            <em>Note: {co.engineerNotes}</em>
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                          ₹{co.oldPrice?.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {co.reasons?.map((r, i) => (
                            <span key={i} style={{ fontSize: '0.8rem', color: '#ef4444' }}>
                              • {r.title} (-₹{r.deductionAmount})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--volt-accent)' }}>
                          ₹{co.newPrice?.toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge ${
                          co.status === 'accepted' ? 'badge-success' :
                          co.status === 'declined' ? 'badge-danger' :
                          co.status === 'pending_admin' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {co.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        {co.status === 'pending_admin' ? (
                          <button
                            className="btn btn-success btn-sm"
                            disabled={submitting}
                            onClick={() => handleApproveCounterOffer(co._id)}
                          >
                            ✓ Approve & Send to Seller
                          </button>
                        ) : (
                          <span className="text-xs text-muted">Sent to Seller</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Manage Modal for Sell Request */}
        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{selected.model} — {selected.seller?.name}</h2>
                <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  ['Seller Expected Rate', `₹${(selected.sellerRate || selected.expectedPrice)?.toLocaleString('en-IN')}`],
                  ['Final Price', selected.finalPrice ? `₹${selected.finalPrice.toLocaleString('en-IN')}` : 'Pending Warehouse Check'],
                  ['Condition', selected.condition?.replace('_', ' ')],
                  ['Status', null],
                  ['Location', `${selected.address?.city || ''}, ${selected.address?.state || ''}`],
                  ['Pickup Date', selected.pickupDate ? new Date(selected.pickupDate).toLocaleDateString('en-IN') : 'Flexible'],
                  ['Pickup Slot', selected.pickupSlot ? selected.pickupSlot.charAt(0).toUpperCase() + selected.pickupSlot.slice(1) : 'Standard'],
                  ['SLA Payment', selected.status === 'paid' ? 'Paid ✓' : 'Disburses after Warehouse Engineer Check'],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: 'var(--bg-glass)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div className="text-xs text-muted">{label}</div>
                    <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>
                      {value === null ? <StatusBadge status={selected.status} /> : value || '—'}
                    </div>
                  </div>
                ))}
              </div>

              {selected.photos?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
                  {selected.photos.map((p, i) => (
                    <img key={i} src={p} alt={`photo-${i}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
                  ))}
                </div>
              )}

              {/* Offer form */}
              {selected.status === 'submitted' && (
                <form onSubmit={handleOffer}>
                  <div className="divider-text" style={{ marginBottom: '1rem' }}>Set Initial Offer Price</div>
                  <div className="form-group">
                    <label className="form-label">Offered Price (₹)</label>
                    <input className="form-input" type="number" min="1" placeholder="e.g. 16000"
                      value={offerForm.offeredPrice} onChange={e => setOfferForm(f => ({...f, offeredPrice: e.target.value}))} />
                  </div>
                  <div className="divider-text">or Reject</div>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label" style={{ color: 'var(--volt-danger)' }}>Rejection Reason</label>
                    <input className="form-input" placeholder="Reason for rejection..."
                      value={offerForm.rejectionReason} onChange={e => setOfferForm(f => ({...f, rejectionReason: e.target.value}))} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" className="btn btn-accent" style={{ flex: 1 }} disabled={submitting}>
                      {submitting ? <span className="spinner" /> : <><CheckCircle size={16} /> Send Offer</>}
                    </button>
                  </div>
                </form>
              )}

              {/* Assign agent */}
              {selected.status === 'approved' && selected.sellerResponse === 'accepted' && (
                <form onSubmit={handleAssign}>
                  <div className="divider-text" style={{ marginBottom: '1rem' }}>Assign Field Agent</div>
                  <div className="form-group">
                    <label className="form-label">Select Agent</label>
                    <select className="form-select" value={agentId} onChange={e => setAgentId(e.target.value)} required>
                      <option value="">Choose agent...</option>
                      {agents.map(a => <option key={a._id} value={a._id}>{a.name} ({a.email})</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                    {submitting ? <span className="spinner" /> : <><UserCheck size={16} /> Assign Agent</>}
                  </button>
                </form>
              )}

              {['agent_assigned', 'on_the_way', 'inspected', 'picked_up', 'received', 'verified', 'paid', 'counter_offered', 'return_to_seller'].includes(selected.status) && (
                <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                  This request is in <strong>{selected.status.replace(/_/g, ' ')}</strong> state.
                  {selected.status === 'picked_up' && <span> Pickup OTP verified. Device in transit to warehouse.</span>}
                  {selected.status === 'received' && <span> Device received at warehouse. Secondary engineer check pending.</span>}
                  {selected.status === 'verified' && <span> Device verified by engineer. Payout initiated!</span>}
                  {selected.status === 'paid' && <span> Payout completed to seller!</span>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminRequests;
