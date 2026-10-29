import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { sellerAPI } from '../../api';
import { Link } from 'react-router-dom';
import { Plus, Package, TrendingUp, CheckCircle, XCircle, CreditCard, Info, Clock, DollarSign, Check, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  { key: 'submitted',      label: 'Request Sent',    num: 1 },
  { key: 'approved',       label: 'Offer Approved',  num: 2 },
  { key: 'on_the_way',     label: 'Agent En Route',  num: 3 },
  { key: 'picked_up',      label: 'Handover Done',   num: 4 },
  { key: 'received',       label: 'Warehouse Check', num: 5 },
  { key: 'paid',           label: 'Payment Sent',    num: 6 },
];

const getStepIndex = (status) => {
  if (['submitted'].includes(status)) return 0;
  if (['approved', 'agent_assigned'].includes(status)) return 1;
  if (['on_the_way', 'inspected'].includes(status)) return 2;
  if (['picked_up'].includes(status)) return 3;
  if (['received', 'verified', 'counter_offered', 'counter_accepted'].includes(status)) return 4;
  if (['paid'].includes(status)) return 5;
  return 0;
};

const StatusProgress = ({ status }) => {
  const currentIdx = getStepIndex(status);
  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {STATUS_STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const isLast = i === STATUS_STEPS.length - 1;
          return (
            <React.Fragment key={step.key}>
              <div title={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem',
                  background: done ? 'var(--volt-success)' : active ? 'var(--volt-primary)' : 'var(--bg-glass)',
                  border: active ? '2px solid var(--volt-primary)' : '2px solid transparent',
                  color: done || active ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700,
                  transition: 'all 0.3s',
                }}>{done ? <Check size={14} /> : step.num}</div>
                <div style={{ fontSize: '0.65rem', marginTop: 3, color: active ? 'var(--volt-primary)' : done ? 'var(--volt-success)' : 'var(--text-muted)', textAlign: 'center', maxWidth: 65 }}>{step.label}</div>
              </div>
              {!isLast && (
                <div style={{ height: 2, flex: 0.5, background: done ? 'var(--volt-success)' : 'var(--border)', marginBottom: 18 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
        <span>SLA: Payment is processed within 24 hours of warehouse arrival & verification.</span>
        {status === 'counter_offered' && <span style={{ color: 'var(--volt-warning)', fontWeight: 700 }}>Counter-Offer Received!</span>}
        {status === 'counter_declined' && <span style={{ color: 'var(--volt-danger)' }}>Phone will be returned</span>}
      </div>
    </div>
  );
};

const SellerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOffer, setActiveOffer] = useState(null);
  const [responding, setResponding] = useState(false);
  const [activeCounterOffer, setActiveCounterOffer] = useState(null);
  const [counterOfferLoading, setCounterOfferLoading] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // Profile modal
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ phone: '', upiId: '', accountNumber: '', ifscCode: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchProfile();
  }, []);

  const fetchRequests = () => {
    setLoading(true);
    sellerAPI.getMyRequests()
      .then(r => setRequests(r.data.data))
      .catch(() => toast.error('Failed to load requests'))
      .finally(() => setLoading(false));
  };

  const fetchProfile = () => {
    sellerAPI.getProfile()
      .then(r => {
        if (r.data.data) {
          const d = r.data.data;
          setProfile({
            phone: d.phone || '',
            upiId: d.bankDetails?.upiId || '',
            accountNumber: d.bankDetails?.accountNumber || '',
            ifscCode: d.bankDetails?.ifscCode || '',
          });
        }
      })
      .catch(() => {});
  };

  const handleRespondOffer = async (response) => {
    if (!activeOffer) return;
    setResponding(true);
    try {
      await sellerAPI.respondToOffer(activeOffer._id, response);
      toast.success(response === 'accepted' ? 'Offer accepted! Pickup agent will be assigned.' : 'Offer declined.');
      setActiveOffer(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond to offer');
    } finally {
      setResponding(false);
    }
  };

  const handleOpenCounterOffer = async (req) => {
    setCounterOfferLoading(true);
    try {
      const res = await sellerAPI.getPendingCounterOffer(req._id);
      if (res.data?.data) {
        setActiveCounterOffer({ ...res.data.data, requestModel: req.model });
      } else {
        toast.error('No pending counter-offer found for this request');
      }
    } catch {
      toast.error('Failed to load counter-offer');
    } finally {
      setCounterOfferLoading(false);
    }
  };

  const handleAcceptCounterOffer = async (id) => {
    try {
      await sellerAPI.acceptCounterOffer(id);
      toast.success('Counter-offer accepted! Payment processed.');
      setActiveCounterOffer(null);
      fetchRequests();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to accept counter-offer');
    }
  };

  const handleDeclineCounterOffer = async (id) => {
    try {
      await sellerAPI.declineCounterOffer(id, { reason: declineReason });
      toast.success('Counter-offer declined. Device will be returned to you.');
      setActiveCounterOffer(null);
      fetchRequests();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to decline');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('phone', profile.phone);
      formData.append('bankDetails', JSON.stringify({
        upiId: profile.upiId,
        accountNumber: profile.accountNumber,
        ifscCode: profile.ifscCode,
      }));
      await sellerAPI.updateProfile(formData);
      toast.success('Payout details saved successfully');
      setShowProfile(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => ['submitted','approved','agent_assigned'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'picked_up').length,
    earnings: requests.filter(r => r.payoutStatus === 'paid').reduce((s, r) => s + (r.payoutAmount || 0), 0),
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Seller Dashboard</h1>
            <p>Manage your sell requests, accept offers, and track instant payouts</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={() => setShowProfile(true)}>
              <CreditCard size={18} /> Payout Details
            </button>
            <Link to="/seller/new" className="btn btn-primary">
              <Plus size={18} /> Sell a Device
            </Link>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total Requests', value: stats.total, Icon: Package, color: 'var(--volt-primary)' },
            { label: 'In Progress', value: stats.pending, Icon: Clock, color: 'var(--volt-warning)' },
            { label: 'Picked Up', value: stats.completed, Icon: CheckCircle, color: 'var(--volt-success)' },
            { label: 'Payout Received', value: `₹${stats.earnings.toLocaleString('en-IN')}`, Icon: DollarSign, color: 'var(--volt-accent)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.Icon size={20} color={s.color} />
              </div>
              <div className="stat-value" style={{ background: 'none', WebkitTextFillColor: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Info Alert */}
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          <strong>VoltKart Direct Pickup:</strong> Once you accept our price offer, a field agent is dispatched to your address. After on-spot inspection, payout is credited directly to your UPI ID.
        </div>

        {/* Requests Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem' }}>My Sell Requests</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{requests.length} requests</span>
          </div>

          {loading ? (
            <div className="page-loader" style={{ minHeight: 200 }}><div className="spinner" /></div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Package size={40} /></div>
              <h3>No requests yet</h3>
              <p>Submit your first sell request to get an instant appraisal offer.</p>
              <Link to="/seller/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                <Plus size={16} /> Sell a Device
              </Link>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Expected</th>
                    <th>Our Offer</th>
                    <th>Status</th>
                    <th>Response / Action</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <React.Fragment key={r._id}><tr>
                      <td style={{ fontWeight: 600 }}>{r.model}</td>
                      <td>₹{r.expectedPrice?.toLocaleString('en-IN')}</td>
                      <td>
                        {r.estimatedMax ? (
                          <span style={{ color: 'var(--volt-accent)', fontWeight: 600 }}>₹{r.estimatedMax?.toLocaleString('en-IN')} tak</span>
                        ) : r.offeredPrice ? (
                          <strong style={{ color: 'var(--volt-accent)' }}>₹{r.offeredPrice.toLocaleString('en-IN')}</strong>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>
                        {r.status === 'approved' && r.sellerResponse === 'pending' ? (
                          <button
                            className="btn btn-accent btn-sm animate-pulse"
                            onClick={() => setActiveOffer(r)}
                          >
                            Review Offer
                          </button>
                        ) : r.status === 'counter_offered' ? (
                          <button
                            className="btn btn-sm animate-pulse"
                            style={{ background: 'var(--volt-warning)', color: '#000', fontWeight: 700 }}
                            onClick={() => handleOpenCounterOffer(r)}
                          >
                            Review Counter-Offer
                          </button>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span className="text-muted text-sm" style={{ textTransform: 'capitalize' }}>
                              {r.status === 'paid' ? 'Paid' :
                               r.status === 'counter_accepted' ? 'Counter Accepted' :
                               r.status === 'counter_declined' ? 'Counter Declined' :
                               r.sellerResponse === 'accepted' ? 'Accepted' :
                               r.sellerResponse === 'rejected' ? 'Declined' : r.sellerResponse}
                            </span>
                            {['paid', 'picked_up', 'received', 'verified', 'counter_accepted'].includes(r.status) && (
                              <a
                                href={`/api/sell-requests/${r._id}/receipt`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', textDecoration: 'none' }}
                                title="Download Official Payout & Handover Receipt (PDF)"
                              >
                                Receipt
                              </a>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="text-muted text-sm">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                    {/* Progress tracker row */}
                    {!['rejected','rejected_at_pickup','declined','cancelled'].includes(r.status) && (
                      <tr key={`${r._id}-progress`}>
                        <td colSpan={6} style={{ padding: '0 1rem 1rem', background: 'var(--bg-glass)10' }}>
                          <StatusProgress status={r.status} />
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Privacy notice per PDF Section 2.4 */}
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-glass)', borderRadius: 10, fontSize: '0.8rem', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          <strong>Privacy:</strong> Aapki details sirf pickup aur payment ke liye hain. Buyer ko kabhi nahi dikhengi.
        </div>
      </div>

      {/* Offer Review Modal */}
      {activeOffer && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>Appraisal Offer for {activeOffer.model}</h2>
              <button type="button" className="btn-close" onClick={() => setActiveOffer(null)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'var(--bg-glass)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="text-muted">Your Expected Price:</span>
                  <span style={{ fontWeight: 600 }}>₹{activeOffer.expectedPrice?.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 600 }}>VoltKart Approved Offer:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--volt-accent)' }}>
                    ₹{activeOffer.offeredPrice?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <p>By accepting this offer, an agent will be assigned to visit your pickup address. Payment will be credited directly to your registered UPI or bank account upon successful physical verification.</p>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                disabled={responding}
                onClick={() => handleRespondOffer('rejected')}
              >
                <XCircle size={16} /> Decline
              </button>
              <button
                type="button"
                className="btn btn-accent"
                disabled={responding}
                onClick={() => handleRespondOffer('accepted')}
              >
                <CheckCircle size={16} /> {responding ? 'Processing...' : 'Accept Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Counter-Offer Modal per PDF Section 5.3 */}
      {activeCounterOffer && (
        <div className="modal-backdrop" onClick={() => setActiveCounterOffer(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Counter-Offer for {activeCounterOffer.requestModel}</h2>
              <button type="button" className="btn-close" onClick={() => setActiveCounterOffer(null)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(255, 179, 0, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 179, 0, 0.25)', fontSize: '0.85rem' }}>
                Warehouse check mein kuch aisi kharabi mili jo pickup par notice nahi hui thi. Hum is naye price par phone kharid sakte hain:
              </div>

              {/* Old vs New Price per Section 5.3 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div className="text-muted text-xs">Purana Price</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, textDecoration: 'line-through', color: 'var(--text-muted)', marginTop: 4 }}>
                    ₹{activeCounterOffer.oldPrice?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ background: 'rgba(32, 191, 107, 0.1)', padding: '1rem', borderRadius: 10, border: '1px solid var(--volt-success)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--volt-success)', fontWeight: 700 }}>Naya Price (Proposed)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--volt-success)', marginTop: 4 }}>
                    ₹{activeCounterOffer.newPrice?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Reasons / Defects Discovered */}
              {activeCounterOffer.reasons?.length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Kya kharab mila (Defects Found):</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {activeCounterOffer.reasons.map((item, idx) => (
                      <div key={idx} style={{ padding: '0.75rem', borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.description || item.issueCode}</div>
                          {item.note && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.note}</div>}
                        </div>
                        {item.deductionAmount && (
                          <span style={{ color: 'var(--volt-danger)', fontWeight: 700, fontSize: '0.85rem' }}>
                            -₹{Number(item.deductionAmount).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1, borderColor: 'var(--volt-danger)', color: 'var(--volt-danger)' }}
                  onClick={() => handleDeclineCounterOffer(activeCounterOffer._id)}
                >
                  Decline & Return Phone
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  style={{ flex: 1 }}
                  onClick={() => handleAcceptCounterOffer(activeCounterOffer._id)}
                >
                  Accept ₹{activeCounterOffer.newPrice?.toLocaleString('en-IN')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout Details Modal */}
      {showProfile && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 500 }}>
            <form onSubmit={handleSaveProfile}>
              <div className="modal-header">
                <h2>Seller Payout Details</h2>
                <button type="button" className="btn-close" onClick={() => setShowProfile(false)}>×</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Enter your UPI ID or bank details for receiving instant pickup payouts.
                </p>
                <div className="form-group">
                  <label className="form-label">Contact Phone *</label>
                  <input
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">UPI ID (Fastest Payout) *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. name@okhdfcbank or phone@paytm"
                    value={profile.upiId}
                    onChange={e => setProfile({ ...profile, upiId: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Bank Account No.</label>
                    <input
                      className="form-input"
                      placeholder="Account number"
                      value={profile.accountNumber}
                      onChange={e => setProfile({ ...profile, accountNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">IFSC Code</label>
                    <input
                      className="form-input"
                      placeholder="HDFC0001234"
                      value={profile.ifscCode}
                      onChange={e => setProfile({ ...profile, ifscCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowProfile(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Payout Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SellerDashboard;
