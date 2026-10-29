import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { shopAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  Shield, Battery, Award, CheckCircle2, ArrowLeft,
  Truck, Lock, Cpu, Sparkles, CreditCard, ChevronRight,
  Check, Box, RefreshCw, AlertCircle
} from 'lucide-react';

const EDITIONS_OPTIONS = [
  {
    id: 'Kids',
    name: 'VoltKart Kids',
    age: 'Ages 5 to 12',
    icon: '🧸',
    summary: 'Parent-approved apps only, strict child-safe browsing, bedtime lock, whitelisted calling.',
    color: '#00d4aa',
  },
  {
    id: 'Teen',
    name: 'VoltKart Teen',
    age: 'Ages 13 to 17',
    icon: '🎧',
    summary: 'Transparent guardrails, study focus mode, shared wellbeing reports, app install approval workflow.',
    color: '#6c63ff',
  },
  {
    id: 'Adult',
    name: 'VoltKart Adult',
    age: 'General / Work',
    icon: '💼',
    summary: 'Full app freedom, work and personal profiles, one-time permissions, network-level tracker blocking.',
    color: '#2ed573',
  },
  {
    id: 'Senior',
    name: 'VoltKart Senior',
    age: 'Parents & Grandparents',
    icon: '👓',
    summary: 'Oversized high-contrast tiles, 1-tap family video call, dedicated SOS emergency button with GPS.',
    color: '#ffa502',
  },
];

const GRADE_INFO = {
  'A+': { label: 'Like New', desc: 'No visible marks. Battery in excellent condition.' },
  'A': { label: 'Like New', desc: 'No visible marks. Battery in excellent condition.' },
  'B': { label: 'Good', desc: 'Light signs of use. Fully working.' },
  'C': { label: 'Fair', desc: 'Visible marks. Fully working. Lowest price.' },
};

const DeviceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [chosenEdition, setChosenEdition] = useState('Adult');

  // Checkout modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [step, setStep] = useState('address'); // address | payment | success
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchDevice();
  }, [id]);

  const fetchDevice = async () => {
    setLoading(true);
    try {
      const res = await shopAPI.getDevice(id);
      setDevice(res.data.data);
    } catch {
      toast.error('Device not found or no longer available');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCheckout = () => {
    if (!user) {
      toast.error('Please sign in to order this device');
      navigate('/login');
      return;
    }
    setShowCheckout(true);
    setStep('address');
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!address.name || !address.phone || !address.street || !address.city || !address.pincode) {
      toast.error('Please fill in all address fields');
      return;
    }
    setStep('payment');
  };

  const handleSimulatePayment = async () => {
    setPaying(true);
    try {
      const orderData = {
        deviceId: device._id,
        address,
        shippingAddress: address,
        edition: chosenEdition,
      };
      const res = await shopAPI.createOrder(orderData);
      const order = res.data.data;

      await shopAPI.verifyPayment(order._id, {
        razorpay_order_id: 'order_mock_' + Date.now(),
        razorpay_payment_id: 'pay_mock_' + Date.now(),
        razorpay_signature: 'sig_mock_verified',
      });

      setStep('success');
      toast.success('🎉 Order confirmed! Flashing & dispatch underway.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--avrel-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 44, height: 44, borderWidth: 3, borderTopColor: 'var(--avrel-text)' }} />
      </div>
    );
  }

  if (!device) return null;

  const gradeDetails = GRADE_INFO[device.grade] || GRADE_INFO['A'];
  const activeEditionObj = EDITIONS_OPTIONS.find(e => e.id === chosenEdition) || EDITIONS_OPTIONS[2];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--avrel-bg)', color: 'var(--avrel-text)' }}>
      <Navbar />

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '6rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--avrel-text-stone)', marginBottom: '2rem' }}>
          <Link to="/shop" style={{ color: 'var(--avrel-text)', textDecoration: 'none', fontWeight: 600 }}>Shop</Link>
          <ChevronRight size={14} />
          <span>{device.model}</span>
          <ChevronRight size={14} />
          <span style={{ color: '#b56c00', fontWeight: 600 }}>{chosenEdition} Edition</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '4rem', alignItems: 'start' }}>
          {/* Left Column: Photos & Verification QA */}
          <div>
            <div style={{
              background: 'var(--avrel-card-bg)',
              border: '1px solid var(--avrel-border)',
              borderRadius: '24px',
              overflow: 'hidden',
              height: '460px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 8px 24px rgba(18, 20, 23, 0.04)',
            }}>
              {device.photos && device.photos.length > 0 ? (
                <img
                  src={device.photos[selectedPhoto]}
                  alt={device.model}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ fontSize: '5rem' }}>📱</div>
              )}

              <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'DM Mono', fontSize: '0.72rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '9999px', background: 'var(--avrel-text)', color: '#ffffff' }}>
                  Grade: {gradeDetails.label}
                </span>
                <span style={{ fontFamily: 'DM Mono', fontSize: '0.72rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '9999px', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' }}>
                  🔋 {device.batteryHealth || 95}% Battery
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {device.photos && device.photos.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                {device.photos.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPhoto(i)}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: selectedPhoto === i ? '2px solid var(--avrel-text)' : '1px solid var(--avrel-border)',
                      background: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* 8-Point Hardware Test Report Card (From Section 7) */}
            <div style={{
              background: 'var(--avrel-card-bg)',
              border: '1px solid var(--avrel-border)',
              borderRadius: '20px',
              padding: '2rem',
              marginTop: '2rem',
              boxShadow: '0 4px 16px rgba(18, 20, 23, 0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <CheckCircle2 size={18} color="#20bf6b" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                  8-Point Engineering QA Passed
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', fontSize: '0.82rem' }}>
                {[
                  'Display & Multi-Touch: PASSED',
                  'Cameras & Autofocus: PASSED',
                  'Speakers & Microphone: PASSED',
                  'Sensors & Biometrics: PASSED',
                  'USB-C Charging Port: PASSED',
                  'Cellular & SIM Network: PASSED',
                  'Wi-Fi 6E & Bluetooth: PASSED',
                  'Battery Health Benchmark: PASSED',
                ].map(check => (
                  <div key={check} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--avrel-text-muted)' }}>
                    <Check size={13} color="#20bf6b" />
                    <span>{check}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What arrives in the box (From Section 9: item 6) */}
            <div style={{
              background: 'var(--avrel-card-bg)',
              border: '1px solid var(--avrel-border)',
              borderRadius: '20px',
              padding: '2rem',
              marginTop: '1.5rem',
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
                In the box
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--avrel-text-muted)' }}>
                <li><strong>01</strong> Phone with {activeEditionObj.name} pre-installed</li>
                <li><strong>02</strong> Certified high-speed USB-C to USB-C cable</li>
                <li><strong>03</strong> VoltKart Quick Start Guide</li>
                <li><strong>04</strong> 6-Month Official VoltKart Warranty Certificate</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Title, Edition Customizer, Price & Buy */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="avrel-eyebrow">VERIFIED REFURBISHED</span>
            </div>

            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, margin: '0 0 0.5rem 0', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {device.model} ({device.storage || '128GB'})
            </h1>
            <p style={{ color: 'var(--avrel-text-muted)', fontSize: '0.95rem', margin: '0 0 2rem 0', lineHeight: 1.5 }}>
              Hardware inspected and wiped. Choose the operating system edition below before placing your order.
            </p>

            {/* ⭐ SECTION 9: "Who will use this?" Edition Selector */}
            <div style={{
              background: 'var(--avrel-card-bg)',
              border: '2px solid var(--avrel-text)',
              borderRadius: '20px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 8px 30px rgba(18, 20, 23, 0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', fontWeight: 700, color: '#b56c00', letterSpacing: '0.08em' }}>
                  STEP 1: WHO WILL USE THIS PHONE?
                </span>
                <Link to="/editions" style={{ fontSize: '0.78rem', color: 'var(--avrel-text)', fontWeight: 600 }}>Compare all →</Link>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 1.25rem 0' }}>
                Select VoltKart OS Edition:
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
                {EDITIONS_OPTIONS.map(ed => {
                  const isChosen = chosenEdition === ed.id;
                  return (
                    <button
                      key={ed.id}
                      onClick={() => setChosenEdition(ed.id)}
                      style={{
                        padding: '1rem',
                        borderRadius: '14px',
                        border: isChosen ? '2px solid var(--avrel-text)' : '1px solid var(--avrel-border)',
                        background: isChosen ? 'var(--avrel-bg)' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.4rem' }}>{ed.icon}</span>
                        {isChosen && <Check size={16} color="var(--avrel-text)" />}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--avrel-text)' }}>
                        {ed.name}
                      </div>
                      <div style={{ fontFamily: 'DM Mono', fontSize: '0.68rem', color: 'var(--avrel-text-stone)' }}>
                        {ed.age}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Edition Feature Summary */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--avrel-border)', fontSize: '0.85rem', color: 'var(--avrel-text-muted)' }}>
                <strong>Configured for: </strong> {activeEditionObj.summary}
              </div>
            </div>

            {/* Price Block & Action Button */}
            <div style={{
              background: 'var(--avrel-card-bg)',
              border: '1px solid var(--avrel-border)',
              borderRadius: '20px',
              padding: '2rem',
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontFamily: 'DM Mono', fontSize: '0.72rem', color: 'var(--avrel-text-stone)' }}>ALL-INCLUSIVE PRICE</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--avrel-text)', lineHeight: 1 }}>
                  ₹{device.sellingPrice?.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#20bf6b', fontWeight: 600, marginTop: '0.3rem' }}>
                  ✓ Includes {chosenEdition} OS flashing & shipping
                </div>
              </div>

              <button
                className="btn btn-primary btn-xl"
                onClick={handleStartCheckout}
                style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', fontWeight: 800 }}
              >
                Order Device →
              </button>
            </div>

            {/* Trust line under the cart from Section 16 */}
            <p style={{ textAlign: 'center', fontSize: '0.82rem', fontFamily: 'DM Mono', color: 'var(--avrel-text-stone)', margin: '0 0 2rem 0' }}>
              Every device is wiped, tested and covered by the VoltKart warranty.
            </p>

            {/* Device Specifics Grid */}
            <div style={{ background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '20px', padding: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
                Hardware Specifications
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: 'var(--avrel-text-stone)' }}>Model:</span>
                  <div style={{ fontWeight: 700 }}>{device.model}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--avrel-text-stone)' }}>Storage & Color:</span>
                  <div style={{ fontWeight: 700 }}>{device.storage || '128GB'} · {device.color || 'Standard'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--avrel-text-stone)' }}>Cosmetic Condition:</span>
                  <div style={{ fontWeight: 700 }}>Grade {device.grade || 'A'} ({gradeDetails.label})</div>
                </div>
                <div>
                  <span style={{ color: 'var(--avrel-text-stone)' }}>Battery Capacity:</span>
                  <div style={{ fontWeight: 700, color: '#20bf6b' }}>{device.batteryHealth || 95}% Original</div>
                </div>
                <div>
                  <span style={{ color: 'var(--avrel-text-stone)' }}>Security Update Period:</span>
                  <div style={{ fontWeight: 700 }}>Guaranteed until Dec 2028</div>
                </div>
                <div>
                  <span style={{ color: 'var(--avrel-text-stone)' }}>Official Warranty:</span>
                  <div style={{ fontWeight: 700 }}>6 Months (Repair/Replace)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '520px', background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', color: 'var(--avrel-text)', borderRadius: '24px' }}>
            {step === 'address' && (
              <form onSubmit={handleAddressSubmit}>
                <div className="modal-header" style={{ borderBottom: '1px solid var(--avrel-border)' }}>
                  <h3 style={{ margin: 0, fontWeight: 900 }}>1. Delivery Address</h3>
                  <button type="button" className="modal-close" onClick={() => setShowCheckout(false)}>✕</button>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ background: 'var(--avrel-bg)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                    Ordering: <strong>{device.model}</strong> · <strong>{chosenEdition} Edition</strong> (₹{device.sellingPrice?.toLocaleString('en-IN')})
                  </div>
                  <div>
                    <label className="form-label">Full Name</label>
                    <input className="form-input" required value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Contact Phone Number</label>
                    <input className="form-input" required value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="10-digit mobile number" />
                  </div>
                  <div>
                    <label className="form-label">Street Address</label>
                    <input className="form-input" required value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder="Flat / House / Street name" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    <div>
                      <label className="form-label">City</label>
                      <input className="form-input" required value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label">State</label>
                      <input className="form-input" required value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label">Pincode</label>
                      <input className="form-input" required value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid var(--avrel-border)' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowCheckout(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Proceed to Payment →</button>
                </div>
              </form>
            )}

            {step === 'payment' && (
              <div>
                <div className="modal-header" style={{ borderBottom: '1px solid var(--avrel-border)' }}>
                  <h3 style={{ margin: 0, fontWeight: 900 }}>2. Complete Payment</h3>
                  <button type="button" className="modal-close" onClick={() => setShowCheckout(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <div style={{ background: 'var(--avrel-bg)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                      <span>Device:</span>
                      <strong>{device.model} ({device.storage})</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                      <span>Selected Edition:</span>
                      <strong style={{ color: '#b56c00' }}>{chosenEdition} Edition</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--avrel-border)', paddingTop: '0.6rem', fontSize: '1.1rem', fontWeight: 900 }}>
                      <span>Total:</span>
                      <span>₹{device.sellingPrice?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--avrel-text-muted)' }}>
                    Shipping to: {address.name}, {address.street}, {address.city} - {address.pincode}
                  </p>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid var(--avrel-border)' }}>
                  <button className="btn btn-ghost" onClick={() => setStep('address')}>← Back</button>
                  <button className="btn btn-primary" onClick={handleSimulatePayment} disabled={paying}>
                    {paying ? 'Verifying payment...' : `Pay ₹${device.sellingPrice?.toLocaleString('en-IN')}`}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>Order Placed!</h2>
                <p style={{ color: 'var(--avrel-text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                  Our warehouse engineers have received your order. Your device will be sanitized, flashed with <strong>{chosenEdition} Edition</strong>, and dispatched with tracking.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <Link to="/buyer/orders" className="btn btn-primary" onClick={() => setShowCheckout(false)}>
                    View My Orders
                  </Link>
                  <Link to="/shop" className="btn btn-ghost" onClick={() => setShowCheckout(false)}>
                    Continue Browsing
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DeviceDetailPage;
