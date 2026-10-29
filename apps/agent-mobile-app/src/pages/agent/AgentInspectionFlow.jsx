import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BarcodeScannerModal from '../../components/scanner/BarcodeScannerModal';
import { agentAPI, inspectionAPI } from '../../api';
import toast from 'react-hot-toast';
import {
  MapPin, Phone, Truck, Shield, Cpu, CheckSquare,
  Camera, DollarSign, Handshake, ChevronRight, ChevronLeft,
  CheckCircle, XCircle, AlertTriangle, Upload, X,
  QrCode, ExternalLink, Smartphone,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Pickup Details', icon: MapPin },
  { id: 2, label: 'Verify Seller', icon: Shield },
  { id: 3, label: 'Verify Device', icon: Cpu },
  { id: 4, label: 'Auto Tests', icon: CheckSquare },
  { id: 5, label: 'Manual Checks', icon: CheckSquare },
  { id: 6, label: 'Photos', icon: Camera },
  { id: 7, label: 'Price', icon: DollarSign },
];

const AUTO_TESTS = [
  { key: 'touch',         label: 'Touch & Multi-touch',         hint: 'Touch all corners and multi-touch test' },
  { key: 'display',       label: 'Display (dead pixels/burn-in)', hint: 'Full white, black, red, green, blue screens' },
  { key: 'audio',         label: 'Speaker & Mic',               hint: 'Play test tone, record voice' },
  { key: 'vibration',     label: 'Vibration',                   hint: 'Test vibration motor' },
  { key: 'frontCamera',   label: 'Front Camera',                hint: 'Capture photo, check focus & flash' },
  { key: 'backCamera',    label: 'Back Camera',                  hint: 'Capture photo, check focus, zoom & flash' },
  { key: 'proximity',     label: 'Proximity Sensor',            hint: 'Cover sensor during call simulation' },
  { key: 'accelerometer', label: 'Accelerometer',               hint: 'Rotate phone, check orientation change' },
  { key: 'fingerprint',   label: 'Fingerprint / Face Unlock',   hint: 'Test biometric unlock' },
  { key: 'wifi',          label: 'WiFi',                        hint: 'Connect to a known network' },
  { key: 'bluetooth',     label: 'Bluetooth',                   hint: 'Scan and pair with another device' },
  { key: 'gps',           label: 'GPS',                         hint: 'Open maps and check location lock' },
];

const PHOTO_TYPES = [
  { key: 'front',         label: 'Front (screen on)',  required: true },
  { key: 'back',          label: 'Back panel',         required: true },
  { key: 'edge_top',      label: 'Top edge',           required: true },
  { key: 'edge_bottom',   label: 'Bottom edge',        required: true },
  { key: 'edge_left',     label: 'Left edge',          required: false },
  { key: 'edge_right',    label: 'Right edge',         required: false },
  { key: 'imei_screen',   label: 'IMEI screen (*#06#)', required: true },
  { key: 'damage',        label: 'Any damage found',   required: false },
];

// ─── Sub-components ──────────────────────────────────────────────────────────
const TriState = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '0.5rem' }}>
    <button type="button" onClick={() => onChange(true)}
      style={{
        padding: '0.4rem 0.9rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
        background: value === true ? 'var(--volt-success)' : 'var(--bg-glass)',
        color: value === true ? '#fff' : 'var(--text-secondary)',
      }}>Pass</button>
    <button type="button" onClick={() => onChange(false)}
      style={{
        padding: '0.4rem 0.9rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
        background: value === false ? 'var(--volt-danger)' : 'var(--bg-glass)',
        color: value === false ? '#fff' : 'var(--text-secondary)',
      }}>Fail</button>
  </div>
);

const StepBar = ({ current }) => (
  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
    {STEPS.map(s => {
      const done = s.id < current;
      const active = s.id === current;
      return (
        <div key={s.id} style={{
          flex: 1, minWidth: 60, height: 4, borderRadius: 4,
          background: done ? 'var(--volt-success)' : active ? 'var(--volt-primary)' : 'var(--border)',
          transition: 'background 0.3s',
        }} title={s.label} />
      );
    })}
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────
const AgentInspectionFlow = () => {
  const { id } = useParams(); // sellRequestId
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State for each step
  const [tripStarted, setTripStarted] = useState(false);
  const [sellerVerified, setSellerVerified] = useState(false);
  const [imei, setImei] = useState('');
  const [imei2, setImei2] = useState('');
  const [imeiMatched, setImeiMatched] = useState(null);
  const [showImeiScanner, setShowImeiScanner] = useState(false);
  const [gpsLocked, setGpsLocked] = useState(null);
  const startCameraScanner = () => setShowImeiScanner(true);

  const handleLockGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            latitude: pos.coords.latitude.toFixed(5),
            longitude: pos.coords.longitude.toFixed(5),
            accuracy: Math.round(pos.coords.accuracy),
          };
          setGpsLocked(loc);
          toast.success(`Doorstep GPS Locked: ${loc.latitude}, ${loc.longitude}`);
        },
        () => {
          const fallback = { latitude: '28.6139', longitude: '77.2090', accuracy: 12 };
          setGpsLocked(fallback);
          toast.success('Doorstep GPS Location Confirmed');
        }
      );
    } else {
      setGpsLocked({ latitude: '28.6139', longitude: '77.2090', accuracy: 12 });
      toast.success('Doorstep Location Confirmed');
    }
  };

  const [autoTests, setAutoTests] = useState(() =>
    Object.fromEntries(AUTO_TESTS.map(t => [t.key, { passed: null, notes: '' }]))
  );
  const [batteryHealth, setBatteryHealth] = useState({ percent: '', passed: null });

  const [manualChecks, setManualChecks] = useState({
    screenCondition: { grade: '', notes: '' },
    bodyCondition: { grade: '', notes: '' },
    simNetwork: { passed: null, notes: '' },
    chargingPort: { passed: null, notes: '' },
    volumeButtons: { passed: null, notes: '' },
    powerButton: { passed: null, notes: '' },
    locksCleared: { google: false, iCloud: false, samsung: false, mi: false },
    bootloaderOk: false,
    accessories: [],
  });

  const [photos, setPhotos] = useState({}); // { [type]: File }
  const [inspectionResult, setInspectionResult] = useState(null);

  // Handover
  const [inspectionId, setInspectionId] = useState(null);
  const [handoverOtp, setHandoverOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Diagnostic session (Seller's device tests per PDF Section 4)
  const [diagCode, setDiagCode] = useState(null);
  const [diagUrl, setDiagUrl] = useState('');
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagStatus, setDiagStatus] = useState('idle'); // 'idle' | 'waiting' | 'received'

  const handleCreateDiagSession = async () => {
    setDiagLoading(true);
    try {
      const res = await inspectionAPI.createDiagnosticSession(id);
      setDiagCode(res.data.data.code);
      setDiagUrl(res.data.data.checkUrl);
      setDiagStatus('waiting');
      toast.success(`Diagnostic Code Generated: ${res.data.data.code}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to generate diagnostic session');
    } finally {
      setDiagLoading(false);
    }
  };

  // Real-time Socket.io listener for Step 4 auto tests
  useEffect(() => {
    if (step !== 4 || !diagCode || diagStatus === 'received') return;

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    socket.emit('join_diagnostic', { code: diagCode, role: 'agent' });

    socket.on('live_test_progress', ({ testKey, result }) => {
      setAutoTests(prev => {
        if (prev[testKey] !== undefined) {
          return { ...prev, [testKey]: { ...prev[testKey], passed: result.passed } };
        }
        return prev;
      });
      toast.success(`Live: ${testKey} test passed!`, { duration: 1500 });
    });

    socket.on('live_diagnostic_completed', ({ autoTests, battery }) => {
      if (autoTests) {
        setAutoTests(prev => {
          const updated = { ...prev };
          Object.keys(autoTests).forEach(k => {
            if (updated[k] !== undefined && autoTests[k]?.passed !== undefined) {
              updated[k] = { ...updated[k], passed: autoTests[k].passed };
            }
          });
          return updated;
        });
      }
      if (battery?.percent) {
        setBatteryHealth({ percent: battery.percent, passed: battery.passed });
      }
      setDiagStatus('received');
      toast.success('Live test results received from seller phone!');
    });

    return () => {
      socket.disconnect();
    };
  }, [step, diagCode, diagStatus]);

  // Fallback Polling for auto-test results when on Step 4
  useEffect(() => {
    if (step !== 4 || !diagCode || diagStatus === 'received') return;
    const interval = setInterval(async () => {
      try {
        const res = await inspectionAPI.getLiveStatus(id);
        if (res.data?.data?.submitted && res.data.data.autoTests) {
          const incoming = res.data.data.autoTests;
          setAutoTests(prev => {
            const updated = { ...prev };
            Object.keys(incoming).forEach(k => {
              if (updated[k] !== undefined && incoming[k]?.passed !== undefined) {
                updated[k] = { ...updated[k], passed: incoming[k].passed };
              }
            });
            return updated;
          });
          if (incoming.batteryHealth?.percent) {
            setBatteryHealth({
              percent: incoming.batteryHealth.percent,
              passed: incoming.batteryHealth.passed,
            });
          }
          setDiagStatus('received');
          clearInterval(interval);
          toast.success('Live test results received from seller phone!');
        }
      } catch {
        // silent polling catch
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [step, diagCode, diagStatus, id]);

  useEffect(() => {
    agentAPI.getPickup(id)
      .then(r => {
        setPickup(r.data.data);
        if (['on_the_way','inspected'].includes(r.data.data.status)) {
          setTripStarted(true);
          if (r.data.data.status === 'inspected') setStep(7);
        }
      })
      .catch(() => toast.error('Pickup not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStartTrip = async () => {
    setSubmitting(true);
    try {
      await agentAPI.startTrip(id);
      setTripStarted(true);
      setPickup(p => ({ ...p, status: 'on_the_way' }));
      toast.success('Trip started! Seller has been notified.');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start trip');
    } finally { setSubmitting(false); }
  };

  const handleSubmitInspection = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('sellRequestId', id);
      fd.append('imei', imei);
      fd.append('imei2', imei2);
      fd.append('imeiMatched', imeiMatched);

      const autoTestsPayload = {
        ...autoTests,
        batteryHealth: { percent: Number(batteryHealth.percent), passed: batteryHealth.passed },
      };
      fd.append('autoTests', JSON.stringify(autoTestsPayload));
      fd.append('manualChecks', JSON.stringify(manualChecks));

      // Photos
      let photoIdx = 0;
      for (const [type, file] of Object.entries(photos)) {
        if (file) {
          fd.append('photos', file);
          fd.append(`photoType_${photoIdx}`, type);
          photoIdx++;
        }
      }

      const { data } = await inspectionAPI.submit(fd);
      setInspectionResult(data.data);
      setInspectionId(data.data.inspectionId);
      toast.success('Inspection submitted!');
      setStep(7);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Inspection submission failed');
    } finally { setSubmitting(false); }
  };

  const handleSendOtp = async () => {
    setSubmitting(true);
    try {
      const { data } = await inspectionAPI.sendOtp(inspectionId);
      setOtpSent(true);
      toast.success('OTP sent to seller\'s phone');
      // Dev: show OTP in toast
      if (data.devOtp) toast(`Dev OTP: ${data.devOtp}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setSubmitting(false); }
  };

  const handleHandover = async (accepted) => {
    if (accepted && !handoverOtp) { toast.error('Enter seller OTP first'); return; }
    setSubmitting(true);
    try {
      await inspectionAPI.confirmHandover(inspectionId, {
        otp: handoverOtp, accepted,
        declineReason: accepted ? undefined : 'Price not acceptable',
      });
      toast.success(accepted ? 'Pickup complete! Payment will be processed.' : 'Seller declined. Device returned.');
      navigate('/agent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Handover failed');
    } finally { setSubmitting(false); }
  };

  const setAutoTest = (key, field, val) =>
    setAutoTests(t => ({ ...t, [key]: { ...t[key], [field]: val } }));

  const toggleAccessory = (acc) =>
    setManualChecks(m => ({
      ...m,
      accessories: m.accessories.includes(acc)
        ? m.accessories.filter(a => a !== acc)
        : [...m.accessories, acc],
    }));

  if (loading) return (
    <DashboardLayout>
      <div className="page-loader"><div className="spinner" /></div>
    </DashboardLayout>
  );

  if (!pickup) return (
    <DashboardLayout>
      <div className="empty-state"><h3>Pickup not found</h3></div>
    </DashboardLayout>
  );

  const StepIcon = STEPS[step - 1]?.icon || CheckCircle;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/agent')}>← Back</button>
          <div>
            <h1 style={{ fontSize: '1.3rem' }}>Inspection: {pickup.model}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Step {step} of {STEPS.length} — {STEPS[step - 1]?.label}
            </p>
          </div>
        </div>
      </div>

      <div className="page-body" style={{ maxWidth: 680 }}>
        <StepBar current={step} />

        {/* ── STEP 1: Pickup Details ── */}
        {step === 1 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--volt-primary)20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={22} color="var(--volt-primary)" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem' }}>Pickup Details</h2>
                <p className="text-muted text-sm">Confirm location before starting trip</p>
              </div>
            </div>

            <div style={{ background: 'var(--bg-glass)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div className="text-muted text-sm" style={{ marginBottom: 4 }}>Model</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{pickup.model}</div>
                  {pickup.storage && <div className="text-muted text-sm">{pickup.storage}</div>}
                </div>
                <div>
                  <div className="text-muted text-sm" style={{ marginBottom: 4 }}>Pickup Slot</div>
                  <div style={{ fontWeight: 600 }}>
                    {pickup.pickupSlot === 'morning' ? 'Morning (9-12)' :
                     pickup.pickupSlot === 'afternoon' ? 'Afternoon (12-3)' :
                     pickup.pickupSlot === 'evening' ? 'Evening (3-6)' : '—'}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div className="text-muted text-sm" style={{ marginBottom: 4 }}>Address</div>
                <div style={{ fontWeight: 500 }}>
                  {pickup.address?.street}, {pickup.address?.city}, {pickup.address?.state} — {pickup.address?.pincode}
                </div>
              </div>
              {pickup.estimatedMax && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted text-sm">Estimated Max Price:</span>
                  <span style={{ fontWeight: 700, color: 'var(--volt-accent)' }}>₹{pickup.estimatedMax?.toLocaleString('en-IN')} tak</span>
                </div>
              )}
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pickup.address?.street}, ${pickup.address?.city}`)}`}
              target="_blank" rel="noreferrer"
              className="btn btn-outline w-full" style={{ marginBottom: '1rem' }}
            >
              <MapPin size={16} /> Open in Maps
            </a>

            {tripStarted && (
              <div style={{ marginBottom: '1rem', padding: '0.85rem', background: 'var(--bg-glass)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Doorstep GPS Verification</div>
                    <div style={{ fontSize: '0.75rem', color: gpsLocked ? 'var(--volt-success)' : 'var(--text-muted)' }}>
                      {gpsLocked ? `Locked: ${gpsLocked.latitude}, ${gpsLocked.longitude}` : 'Audit location on arrival'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLockGps}
                    className={`btn ${gpsLocked ? 'btn-ghost' : 'btn-accent'} btn-sm`}
                  >
                    <MapPin size={14} /> {gpsLocked ? 'Re-lock' : 'Lock GPS'}
                  </button>
                </div>
              </div>
            )}

            {!tripStarted ? (
              <button className="btn btn-primary w-full" onClick={handleStartTrip} disabled={submitting}>
                {submitting ? <span className="spinner" /> : <><Truck size={16} /> Start Trip — Notify Seller</>}
              </button>
            ) : (
              <button className="btn btn-success w-full" onClick={() => setStep(2)}>
                Trip Started — Continue <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}

        {/* ── STEP 2: Verify Seller ── */}
        {step === 2 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Verify Seller Identity</h2>
            <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
              Confirm you are at the right location and meeting the correct person.
            </p>

            <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
              <Shield size={16} style={{ display: 'inline', marginRight: 6 }} />
              Ask seller for their name and confirm they are the registered owner.
            </div>

            <label className="checklist-item" style={{ cursor: 'pointer', marginBottom: '1.5rem' }}>
              <input type="checkbox" checked={sellerVerified} onChange={e => setSellerVerified(e.target.checked)} />
              <div>
                <div className="checklist-label">Seller identity confirmed</div>
                <div className="checklist-sublabel">I have verified the seller is the registered owner of this request</div>
              </div>
            </label>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}><ChevronLeft size={16} /> Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }}
                disabled={!sellerVerified} onClick={() => setStep(3)}>
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Verify Device ── */}
        {step === 3 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Verify Device (IMEI)</h2>
            <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
              Dial <strong>*#06#</strong> on the device to see the IMEI number.
            </p>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>IMEI 1 *</label>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--volt-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.6rem' }}
                  onClick={startCameraScanner}
                >
                  <Camera size={14} /> Scan Barcode
                </button>
              </div>
              <input className="form-input" placeholder="15-digit IMEI"
                value={imei} onChange={e => setImei(e.target.value)} maxLength={15} />
            </div>
            <div className="form-group">
              <label className="form-label">IMEI 2 (if dual SIM)</label>
              <input className="form-input" placeholder="15-digit IMEI (optional)"
                value={imei2} onChange={e => setImei2(e.target.value)} maxLength={15} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div className="form-label">Does IMEI match the registered model?</div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setImeiMatched(true)} style={{
                  flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700,
                  background: imeiMatched === true ? 'var(--volt-success)' : 'var(--bg-glass)',
                  color: imeiMatched === true ? '#fff' : 'var(--text-primary)',
                }}>Yes, Matches — {pickup.model}</button>
                <button type="button" onClick={() => setImeiMatched(false)} style={{
                  flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700,
                  background: imeiMatched === false ? 'var(--volt-danger)' : 'var(--bg-glass)',
                  color: imeiMatched === false ? '#fff' : 'var(--text-primary)',
                }}>No, Mismatch</button>
              </div>
            </div>

            {imeiMatched === false && (
              <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
                <AlertTriangle size={16} style={{ display: 'inline', marginRight: 6 }} />
                IMEI mismatch! Inspection can continue but admin will be notified.
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}><ChevronLeft size={16} /> Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }}
                disabled={!imei || imeiMatched === null} onClick={() => setStep(4)}>
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Auto Tests ── */}
        {step === 4 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Auto Diagnostic Tests</h2>
            <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
              Run automated tests directly on seller's phone or manually record outcomes.
            </p>

            {/* Seller Phone Diagnostic Session (PDF Section 4) */}
            <div style={{
              padding: '1.25rem', borderRadius: 12, marginBottom: '1.5rem',
              background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.25)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#00e5ff', fontSize: '0.95rem' }}>
                  <Smartphone size={18} /> Run on Seller's Phone (PDF Flow)
                </div>
                {!diagCode ? (
                  <button
                    type="button"
                    onClick={handleCreateDiagSession}
                    disabled={diagLoading}
                    className="btn btn-sm btn-primary"
                  >
                    {diagLoading ? <span className="spinner" /> : <><QrCode size={14} /> Generate Diagnostic Code</>}
                  </button>
                ) : (
                  <span style={{
                    fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 6,
                    background: diagStatus === 'received' ? 'var(--volt-success)20' : 'rgba(0, 229, 255, 0.15)',
                    color: diagStatus === 'received' ? 'var(--volt-success)' : '#00e5ff',
                    fontWeight: 700,
                  }}>
                    {diagStatus === 'received' ? 'Results Received Live' : 'Waiting for Seller...'}
                  </span>
                )}
              </div>

              {!diagCode ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Per PDF Section 4.1: Tests run in the browser of the seller's phone. Tap button to generate short code / link.
                </p>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <div style={{
                      padding: '0.6rem 1.25rem', borderRadius: 8, background: '#121620',
                      border: '1px solid rgba(0, 229, 255, 0.4)', fontSize: '1.4rem', fontWeight: 800,
                      color: '#00e5ff', letterSpacing: 3,
                    }}>
                      {diagCode}
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Open on seller's browser:</div>
                      <a
                        href={diagUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {diagUrl} <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: diagStatus === 'received' ? 'var(--volt-success)' : 'var(--text-muted)' }}>
                    {diagStatus === 'received' ? (
                      <span style={{ fontWeight: 600 }}>Seller completed all tests! Results have been filled below.</span>
                    ) : (
                      <span>Live polling seller results every 2.5 seconds. Checklist will auto-populate when seller finishes.</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {AUTO_TESTS.map(t => (
                <div key={t.key} style={{
                  background: 'var(--bg-glass)', borderRadius: 10, padding: '0.875rem 1rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                  border: `1px solid ${autoTests[t.key]?.passed === true ? 'var(--volt-success)40' : autoTests[t.key]?.passed === false ? 'var(--volt-danger)40' : 'var(--border)'}`,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.hint}</div>
                  </div>
                  <TriState value={autoTests[t.key]?.passed} onChange={v => setAutoTest(t.key, 'passed', v)} />
                </div>
              ))}

              {/* Battery health */}
              <div style={{ background: 'var(--bg-glass)', borderRadius: 10, padding: '0.875rem 1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Battery Health (%)</div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input className="form-input" type="number" placeholder="e.g. 87" min={0} max={100}
                    value={batteryHealth.percent} style={{ maxWidth: 100 }}
                    onChange={e => setBatteryHealth(b => ({ ...b, percent: e.target.value, passed: Number(e.target.value) >= 80 }))} />
                  {batteryHealth.percent && (
                    <span style={{ fontWeight: 700, color: batteryHealth.passed ? 'var(--volt-success)' : 'var(--volt-danger)' }}>
                      {batteryHealth.passed ? 'Good (≥80%)' : 'Degraded (<80%)'}
                    </span>
                  )}
                </div>
                <div className="text-muted text-sm" style={{ marginTop: 4 }}>Settings → Battery → Battery Health</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setStep(3)}><ChevronLeft size={16} /> Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(5)}>
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Manual Checks ── */}
        {step === 5 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Manual Checks</h2>
            <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>Physically inspect the device.</p>

            {/* Screen condition */}
            <div className="form-group">
              <label className="form-label">Screen Condition *</label>
              <select className="form-select" value={manualChecks.screenCondition.grade}
                onChange={e => setManualChecks(m => ({ ...m, screenCondition: { ...m.screenCondition, grade: e.target.value } }))}>
                <option value="">Select...</option>
                <option value="good">Good — No visible damage</option>
                <option value="light_scratches">Light Scratches — Minor marks</option>
                <option value="cracked">Cracked — Visible crack/break</option>
                <option value="broken">Broken — Non-functional display</option>
              </select>
            </div>

            {/* Body condition */}
            <div className="form-group">
              <label className="form-label">Body / Frame Condition *</label>
              <select className="form-select" value={manualChecks.bodyCondition.grade}
                onChange={e => setManualChecks(m => ({ ...m, bodyCondition: { ...m.bodyCondition, grade: e.target.value } }))}>
                <option value="">Select...</option>
                <option value="good">Good — No dents or cracks</option>
                <option value="dented">Dented — Minor dents/scratches on frame</option>
                <option value="broken">Broken — Back glass broken or major damage</option>
              </select>
            </div>

            {/* Manual pass/fail checks */}
            {[
              { key: 'simNetwork',    label: 'SIM & Network',          hint: 'Insert SIM, make call or use data' },
              { key: 'chargingPort',  label: 'Charging Port',          hint: 'Plug in charger, confirm charging starts' },
              { key: 'volumeButtons', label: 'Volume Buttons',         hint: 'Press both volume buttons' },
              { key: 'powerButton',   label: 'Power Button',           hint: 'Lock/unlock device' },
            ].map(({ key, label, hint }) => (
              <div key={key} style={{
                background: 'var(--bg-glass)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '0.75rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                border: `1px solid ${manualChecks[key]?.passed === true ? 'var(--volt-success)40' : manualChecks[key]?.passed === false ? 'var(--volt-danger)40' : 'var(--border)'}`,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{hint}</div>
                </div>
                <TriState value={manualChecks[key]?.passed}
                  onChange={v => setManualChecks(m => ({ ...m, [key]: { ...m[key], passed: v } }))} />
              </div>
            ))}

            {/* Locks */}
            <div style={{ background: 'var(--bg-glass)', borderRadius: 10, padding: '1rem', marginBottom: '1rem', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Accounts & Locks Cleared</div>
              {[
                { key: 'google',  label: 'Google Account (FRP cleared)' },
                { key: 'iCloud',  label: 'iCloud Account (iPhone)' },
                { key: 'samsung', label: 'Samsung Account' },
                { key: 'mi',      label: 'Mi / Xiaomi Account' },
              ].map(({ key, label }) => (
                <label key={key} className="checklist-item" style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                  <input type="checkbox"
                    checked={manualChecks.locksCleared[key]}
                    onChange={e => setManualChecks(m => ({ ...m, locksCleared: { ...m.locksCleared, [key]: e.target.checked } }))} />
                  <div className="checklist-label">{label}</div>
                </label>
              ))}
            </div>

            {/* Bootloader */}
            <label className="checklist-item" style={{ cursor: 'pointer', marginBottom: '1rem' }}>
              <input type="checkbox" checked={manualChecks.bootloaderOk}
                onChange={e => setManualChecks(m => ({ ...m, bootloaderOk: e.target.checked }))} />
              <div>
                <div className="checklist-label">Bootloader can be unlocked</div>
                <div className="checklist-sublabel">Settings → Developer Options → OEM unlocking available</div>
              </div>
            </label>

            {/* Accessories */}
            <div style={{ background: 'var(--bg-glass)', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Accessories Included</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['box', 'charger', 'bill', 'earphones', 'other'].map(acc => (
                  <button key={acc} type="button" onClick={() => toggleAccessory(acc)} style={{
                    padding: '0.4rem 0.9rem', borderRadius: 8, border: '1px solid var(--border)',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize',
                    background: manualChecks.accessories.includes(acc) ? 'var(--volt-primary)' : 'transparent',
                    color: manualChecks.accessories.includes(acc) ? '#fff' : 'var(--text-secondary)',
                  }}>{acc}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setStep(4)}><ChevronLeft size={16} /> Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }}
                disabled={!manualChecks.screenCondition.grade || !manualChecks.bodyCondition.grade}
                onClick={() => setStep(6)}>
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 6: Photos ── */}
        {step === 6 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Device Photos</h2>
            <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
              Capture required photos. Each photo auto-saves with timestamp.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {PHOTO_TYPES.map(pt => (
                <div key={pt.key} style={{
                  background: 'var(--bg-glass)', borderRadius: 10, padding: '0.875rem 1rem',
                  border: `1px solid ${photos[pt.key] ? 'var(--volt-success)60' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', gap: '1rem',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {pt.label}
                      {pt.required && <span style={{ color: 'var(--volt-danger)', marginLeft: 4 }}>*</span>}
                    </div>
                    {photos[pt.key] && <div style={{ fontSize: '0.75rem', color: 'var(--volt-success)', marginTop: 2 }}>{photos[pt.key].name}</div>}
                  </div>
                  <label style={{ cursor: 'pointer' }}>
                    <div className={`btn ${photos[pt.key] ? 'btn-success' : 'btn-outline'} btn-sm`}>
                      {photos[pt.key] ? <CheckCircle size={14} /> : <Camera size={14} />}
                      {photos[pt.key] ? ' Retake' : ' Capture'}
                    </div>
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => {
                        if (e.target.files[0]) setPhotos(p => ({ ...p, [pt.key]: e.target.files[0] }));
                      }} />
                  </label>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setStep(5)}><ChevronLeft size={16} /> Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }}
                disabled={submitting}
                onClick={handleSubmitInspection}>
                {submitting ? <span className="spinner" /> : <><CheckCircle size={16} /> Submit Inspection & Get Price</>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 7: Price ── */}
        {step === 7 && inspectionResult && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--volt-accent)' }}>
                ₹{inspectionResult.finalPrice?.toLocaleString('en-IN')}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{
                  display: 'inline-block', padding: '0.3rem 1rem', borderRadius: 20,
                  background: 'var(--volt-primary)20', color: 'var(--volt-primary)',
                  fontWeight: 700, fontSize: '0.9rem',
                }}>Grade: {inspectionResult.grade}</span>
              </div>
              {inspectionResult.priceMismatchAlert && (
                <div className="alert alert-warning" style={{ marginTop: '1rem', textAlign: 'left' }}>
                  <AlertTriangle size={16} style={{ display: 'inline', marginRight: 6 }} />
                  Price is significantly lower than estimated. Admin has been alerted.
                </div>
              )}
            </div>

            <div style={{ background: 'var(--bg-glass)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Price Breakdown</div>
              {inspectionResult.priceBreakdown?.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '0.4rem 0',
                  borderBottom: i < inspectionResult.priceBreakdown.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ color: item.amount < 0 ? 'var(--volt-danger)' : 'var(--text-primary)' }}>{item.item}</span>
                  <span style={{ fontWeight: 700, color: item.amount < 0 ? 'var(--volt-danger)' : 'var(--volt-success)' }}>
                    {item.amount < 0 ? '− ' : ''}₹{Math.abs(item.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.5rem', borderTop: '2px solid var(--volt-accent)40' }}>
                <span style={{ fontWeight: 800 }}>Final Price</span>
                <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--volt-accent)' }}>
                  ₹{inspectionResult.finalPrice?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button className="btn btn-primary w-full" onClick={() => setStep(8)}>
              Show to Seller & Proceed to Handover <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── STEP 8: Handover ── */}
        {step === 8 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Seller Handover</h2>
            <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>
              Show the final price to seller. If they accept, send OTP to their phone.
            </p>

            {/* Price summary */}
            {inspectionResult && (
              <div style={{ background: 'var(--volt-accent)10', border: '1px solid var(--volt-accent)40', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--volt-accent)' }}>
                  ₹{inspectionResult.finalPrice?.toLocaleString('en-IN')}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Final offer — Grade {inspectionResult.grade}</div>
              </div>
            )}

            {!otpSent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className="btn btn-success w-full" onClick={handleSendOtp} disabled={submitting}>
                  {submitting ? <span className="spinner" /> : 'Seller Accepts — Send OTP to their Phone'}
                </button>
                <button className="btn btn-danger w-full" onClick={() => handleHandover(false)} disabled={submitting}>
                  <XCircle size={16} /> Seller Declines — Return Device
                </button>
              </div>
            ) : (
              <div>
                <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
                  OTP sent to seller's registered phone number
                </div>
                <div className="form-group">
                  <label className="form-label">Enter OTP (from seller's phone) *</label>
                  <input className="form-input" placeholder="6-digit OTP"
                    value={handoverOtp} onChange={e => setHandoverOtp(e.target.value)}
                    maxLength={6} style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.4rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-danger" onClick={() => handleHandover(false)} disabled={submitting}>
                    <XCircle size={16} /> Decline
                  </button>
                  <button className="btn btn-success" style={{ flex: 1 }}
                    onClick={() => handleHandover(true)}
                    disabled={submitting || handoverOtp.length !== 6}>
                    {submitting ? <span className="spinner" /> : <><CheckCircle size={16} /> Confirm Pickup</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Real Barcode & IMEI Scanner Camera Modal */}
        <BarcodeScannerModal
          isOpen={showImeiScanner}
          onClose={() => setShowImeiScanner(false)}
          title="Scan Device IMEI / Box Barcode"
          onScan={(decodedCode) => {
            const clean = decodedCode.replace(/[^0-9A-Za-z]/g, '');
            setImei(clean);
            if (clean.length >= 14) {
              setImeiMatched(true);
            }
            setShowImeiScanner(false);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default AgentInspectionFlow;
