import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { engineerAPI } from '../../api';
import toast from 'react-hot-toast';
import { Wrench, ChevronRight, Zap, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';

const STATUS_STEPS = ['received', 'verified', 'tested', 'wiped', 'os_flashed', 'final_qa', 'live'];
const NEXT_ACTION = {
  verified: { label: 'Start Testing', color: 'btn-primary' },
  tested: { label: 'Mark as Wiped', color: 'btn-warning' },
  wiped: { label: 'Flash OS', color: 'btn-accent' },
  os_flashed: { label: 'Move to Final QA', color: 'btn-primary' },
  final_qa: { label: 'Approve — Go Live!', color: 'btn-success' },
};

const DEFECT_PRESETS = [
  { id: 'SCREEN_DEFECT', label: 'Screen Scratch / Cracked Glass', deduction: 1500 },
  { id: 'BODY_DENT', label: 'Heavy Dent / Scratched Housing', deduction: 800 },
  { id: 'CAMERA_DEFECT', label: 'Camera Lens Scratch / Blur / Autofocus Fail', deduction: 1200 },
  { id: 'BATTERY_LOW', label: 'Battery Degraded (< 80% Capacity)', deduction: 900 },
  { id: 'SPEAKER_MIC', label: 'Speaker / Microphone Distortion', deduction: 600 },
  { id: 'PORTS_BUTTONS', label: 'Charging Port Loose / Button Stiff', deduction: 500 },
];

const EngineerDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [verifyModal, setVerifyModal] = useState(null);
  const [verifyForm, setVerifyForm] = useState({ grade: 'A', notes: '' });

  const [counterModal, setCounterModal] = useState(null);
  const [selectedDefects, setSelectedDefects] = useState({});
  const [customDeduction, setCustomDeduction] = useState('');
  const [counterNotes, setCounterNotes] = useState('');

  const [flashModal, setFlashModal] = useState(null);
  const [flashForm, setFlashForm] = useState({ os: 'GrapheneOS', osVersion: '', notes: '' });

  const [pricingModal, setPricingModal] = useState(null);
  const [pricingForm, setPricingForm] = useState({ sellingPrice: '', warrantyMonths: 6 });

  const fetchDevices = () => {
    setLoading(true);
    engineerAPI.getDevices(statusFilter ? { status: statusFilter } : {})
      .then(r => setDevices(r.data.data))
      .catch(() => toast.error('Failed to load devices'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDevices(); }, [statusFilter]);

  const handleAdvance = async (device) => {
    if (device.status === 'wiped') { setFlashModal(device); return; }
    if (device.status === 'final_qa') { setPricingModal(device); return; }
    try {
      const { data } = await engineerAPI.updateStatus(device._id, {});
      toast.success(`Status updated to ${data.data.status}`);
      setDevices(ds => ds.map(d => d._id === device._id ? data.data : d));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  // Verify and trigger seller payout (Faisla 1)
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await engineerAPI.verifyDevice(verifyModal._id, verifyForm);
      toast.success('Device verified! Seller payment disbursed. 🎉');
      setDevices(ds => ds.map(d => d._id === verifyModal._id ? data.data.device : d));
      setVerifyModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Open counter-offer modal (Faisla 4)
  const openCounterModal = (device) => {
    setCounterModal(device);
    setSelectedDefects({});
    setCustomDeduction('');
    setCounterNotes('');
  };

  const toggleDefect = (preset) => {
    setSelectedDefects(prev => {
      const copy = { ...prev };
      if (copy[preset.id]) {
        delete copy[preset.id];
      } else {
        copy[preset.id] = { title: preset.label, deductionAmount: preset.deduction };
      }
      return copy;
    });
  };

  const calculateTotalDeduction = () => {
    const presetSum = Object.values(selectedDefects).reduce((sum, item) => sum + (Number(item.deductionAmount) || 0), 0);
    const custom = Number(customDeduction) || 0;
    return presetSum + custom;
  };

  const handleCounterSubmit = async (e) => {
    e.preventDefault();
    const totalDeductions = calculateTotalDeduction();
    if (totalDeductions <= 0) {
      toast.error('Please select at least one defect deduction');
      return;
    }
    setSubmitting(true);
    try {
      const reasonsList = Object.entries(selectedDefects).map(([key, val]) => ({
        defectType: key,
        title: val.title,
        deductionAmount: Number(val.deductionAmount),
      }));

      if (customDeduction && Number(customDeduction) > 0) {
        reasonsList.push({
          defectType: 'OTHER',
          title: 'Additional Warehouse Defect',
          deductionAmount: Number(customDeduction),
        });
      }

      const { data } = await engineerAPI.createCounterOffer(counterModal._id, {
        reasons: reasonsList,
        engineerNotes: counterNotes,
      });

      toast.success('Counter-offer created! Sent to Admin for review.');
      setDevices(ds => ds.map(d => d._id === counterModal._id ? { ...d, status: 'counter_offered' } : d));
      setCounterModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Counter-offer submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFlash = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await engineerAPI.addFlashLog(flashModal._id, flashForm);
      toast.success(`${flashForm.os} flashed successfully!`);
      setDevices(ds => ds.map(d => d._id === flashModal._id ? data.data : d));
      setFlashModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Flash failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePricing = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await engineerAPI.setPricing(pricingModal._id, pricingForm);
      const { data } = await engineerAPI.updateStatus(pricingModal._id, {});
      toast.success('Device is now LIVE! 🎉');
      setDevices(ds => ds.map(d => d._id === pricingModal._id ? data.data : d));
      setPricingModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Warehouse & Engineering</h1>
        <p>Device intake verification, counter-offers, OS flashing, and QA</p>
      </div>
      <div className="page-body">
        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {['', ...STATUS_STEPS, 'counter_offered', 'return_to_seller'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-ghost'} btn-sm`}>
              {s ? s.replace('_', ' ') : 'All'}
            </button>
          ))}
        </div>

        {loading ? <div className="page-loader"><div className="spinner" /></div> : devices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Wrench size={48} /></div>
            <h3>No devices found</h3>
            <p>Devices appear here after agent pickup handover</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {devices.map(device => (
              <div key={device._id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{device.model}</h3>
                      <StatusBadge status={device.status} />
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                      <span>IMEI: <strong style={{ color: 'var(--text-primary)' }}>{device.imei}</strong></span>
                      {device.os && <span>OS: <strong style={{ color: 'var(--volt-accent)' }}>{device.os} {device.osVersion}</strong></span>}
                      {device.grade && <span>Grade: <strong>{device.grade}</strong></span>}
                      {device.batteryHealth && <span>Battery: <strong>{device.batteryHealth}%</strong></span>}
                      {device.inspectionNotes && <span>Notes: <em>{device.inspectionNotes}</em></span>}
                    </div>
                  </div>

                  {/* Actions depending on status */}
                  <div>
                    {device.status === 'received' ? (
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => {
                            setVerifyModal(device);
                            setVerifyForm({ grade: device.grade || 'A', notes: '' });
                          }}
                        >
                          <CheckCircle2 size={15} /> Verify & Trigger Payment
                        </button>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => openCounterModal(device)}
                        >
                          <AlertTriangle size={15} /> Report Defect (Counter-Offer)
                        </button>
                      </div>
                    ) : device.status === 'counter_offered' ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(234, 179, 8, 0.12)', color: '#ca8a04', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                        <AlertTriangle size={15} /> Counter-Offer in Review
                      </div>
                    ) : device.status === 'return_to_seller' ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                        Seller Declined — Return to Seller
                      </div>
                    ) : NEXT_ACTION[device.status] ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {['os_flashed', 'final_qa', 'live'].includes(device.status) && (
                          <a
                            href={`/api/devices/${device._id}/certificate`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                          >
                            <ShieldCheck size={14} /> Certificate
                          </a>
                        )}
                        <button className={`btn ${NEXT_ACTION[device.status].color}`} onClick={() => handleAdvance(device)}>
                          {device.status === 'wiped' ? <Zap size={16} /> : <ChevronRight size={16} />}
                          {NEXT_ACTION[device.status].label}
                        </button>
                      </div>
                    ) : device.status === 'live' ? (
                      <a
                        href={`/api/devices/${device._id}/certificate`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                      >
                        <ShieldCheck size={14} /> Print Audit Certificate
                      </a>
                    ) : null}
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {STATUS_STEPS.map(s => {
                      const current = STATUS_STEPS.indexOf(device.status);
                      const idx = STATUS_STEPS.indexOf(s);
                      return (
                        <div key={s} title={s} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: idx <= current && current !== -1 ? 'var(--volt-primary)' : 'var(--border)',
                          transition: 'background 0.3s ease',
                        }} />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 1. Verify Modal (Faisla 1: Payment Disbursement on Warehouse Verification) */}
        {verifyModal && (
          <div className="modal-overlay" onClick={() => setVerifyModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
              <div className="modal-header">
                <h2 className="modal-title">✓ Warehouse Verification</h2>
                <button className="modal-close" onClick={() => setVerifyModal(null)}>✕</button>
              </div>
              <div className="alert alert-info" style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                <strong>⚡ Faisla 1 Compliance:</strong> Confirming warehouse verification initiates instant payment disbursement to the seller's verified UPI/Bank.
              </div>
              <form onSubmit={handleVerifySubmit}>
                <div style={{ marginBottom: '1rem', background: 'var(--bg-elevated)', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Device Model</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{verifyModal.model}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>IMEI: {verifyModal.imei}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Final Quality Grade *</label>
                  <select
                    className="form-select"
                    value={verifyForm.grade}
                    onChange={e => setVerifyForm(f => ({ ...f, grade: e.target.value }))}
                  >
                    <option value="A+">Grade A+ (Pristine, 0 flaws)</option>
                    <option value="A">Grade A (Minor cosmetic micro-scratches)</option>
                    <option value="B">Grade B (Normal wear, light scratches)</option>
                    <option value="C">Grade C (Heavy wear / deep scuffs)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Verification Notes</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Physical condition confirmed, screen, body, battery matched..."
                    value={verifyForm.notes}
                    onChange={e => setVerifyForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ minHeight: 70 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-ghost flex-1" onClick={() => setVerifyModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success flex-1" disabled={submitting}>
                    {submitting ? <span className="spinner" /> : 'Confirm & Release Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. Counter-Offer Modal (Faisla 4: Undisclosed Defects → Propose New Price) */}
        {counterModal && (
          <div className="modal-overlay" onClick={() => setCounterModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
              <div className="modal-header">
                <h2 className="modal-title">⚠️ Report Defect & Counter-Offer</h2>
                <button className="modal-close" onClick={() => setCounterModal(null)}>✕</button>
              </div>
              <div className="alert alert-warning" style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                <strong>⚡ Faisla 4 Compliance:</strong> Phone is NOT rejected immediately. Document the undisclosed defects. The system calculates a counter-offer for Admin approval and Seller acceptance.
              </div>
              <form onSubmit={handleCounterSubmit}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Select Discovered Defects:</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 220, overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {DEFECT_PRESETS.map(preset => {
                      const isChecked = !!selectedDefects[preset.id];
                      return (
                        <label
                          key={preset.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.65rem 0.85rem',
                            border: `1px solid ${isChecked ? 'var(--volt-primary)' : 'var(--border)'}`,
                            borderRadius: '8px',
                            background: isChecked ? 'rgba(0, 210, 106, 0.08)' : 'var(--bg-elevated)',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleDefect(preset)}
                            />
                            <span style={{ fontSize: '0.85rem' }}>{preset.label}</span>
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--danger, #ef4444)' }}>
                            -₹{preset.deduction.toLocaleString()}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Custom Additional Deduction (₹ optional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    className="form-input"
                    value={customDeduction}
                    onChange={e => setCustomDeduction(e.target.value)}
                  />
                </div>

                {/* Calculation Summary */}
                <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Defect Deductions:</span>
                    <strong style={{ color: 'var(--danger, #ef4444)' }}>-₹{calculateTotalDeduction().toLocaleString()}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Admin will review and approve this counter-offer before notifying the seller.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Engineer Notes / Defect Details *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe exact defect location, scratches, or component failure..."
                    value={counterNotes}
                    onChange={e => setCounterNotes(e.target.value)}
                    required
                    style={{ minHeight: 70 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" className="btn btn-ghost flex-1" onClick={() => setCounterModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning flex-1" disabled={submitting}>
                    {submitting ? <span className="spinner" /> : 'Submit Counter-Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. Flash Modal */}
        {flashModal && (
          <div className="modal-overlay" onClick={() => setFlashModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">⚡ Flash OS: {flashModal.model}</h2>
                <button className="modal-close" onClick={() => setFlashModal(null)}>✕</button>
              </div>
              <div className="alert alert-warning">Device must be factory wiped before flashing.</div>
              <form onSubmit={handleFlash}>
                <div className="form-group">
                  <label className="form-label">Operating System *</label>
                  <select className="form-select" value={flashForm.os} onChange={e => setFlashForm(f => ({...f, os: e.target.value}))}>
                    <option value="GrapheneOS">GrapheneOS (Pixel only)</option>
                    <option value="/e/OS">/e/OS</option>
                    <option value="LineageOS">LineageOS</option>
                    <option value="CalyxOS">CalyxOS</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">OS Version</label>
                  <input className="form-input" placeholder="e.g. 2024111300" value={flashForm.osVersion}
                    onChange={e => setFlashForm(f => ({...f, osVersion: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Flash Notes</label>
                  <textarea className="form-textarea" placeholder="Any issues during flashing, special configs..."
                    value={flashForm.notes} onChange={e => setFlashForm(f => ({...f, notes: e.target.value}))} style={{ minHeight: 70 }} />
                </div>
                <button type="submit" className="btn btn-accent w-full" disabled={submitting}>
                  {submitting ? <span className="spinner" /> : '⚡ Confirm OS Flash'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. Pricing Modal (before going live) */}
        {pricingModal && (
          <div className="modal-overlay" onClick={() => setPricingModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">🚀 Set Pricing — Go Live</h2>
                <button className="modal-close" onClick={() => setPricingModal(null)}>✕</button>
              </div>
              <p className="text-muted text-sm" style={{ marginBottom: '1.25rem' }}>
                Set the selling price and warranty before this device goes live in the shop.
              </p>
              <form onSubmit={handlePricing}>
                <div className="form-group">
                  <label className="form-label">Selling Price (₹) *</label>
                  <input className="form-input" type="number" min="1" placeholder="e.g. 22000"
                    value={pricingForm.sellingPrice} onChange={e => setPricingForm(f => ({...f, sellingPrice: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Warranty (months)</label>
                  <select className="form-select" value={pricingForm.warrantyMonths}
                    onChange={e => setPricingForm(f => ({...f, warrantyMonths: Number(e.target.value)}))}>
                    {[3,6,12].map(m => <option key={m} value={m}>{m} months</option>)}
                  </select>
                </div>
                <button type="submit" className="btn btn-success w-full" disabled={submitting}>
                  {submitting ? <span className="spinner" /> : '🟢 Approve & Go Live'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EngineerDashboard;
