import { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  Shield, Lock, Unlock, Clock, MapPin, Bell,
  Check, X, Smartphone, Moon, BookOpen, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_REQUESTS = [
  { id: 1, app: 'Duolingo (Language Learning)', icon: '🦉', category: 'Education', requester: 'Aarav (Kids Edition)', time: '12m ago' },
  { id: 2, app: 'Spotify Music', icon: '🎵', category: 'Music & Audio', requester: 'Ananya (Teen Edition)', time: '1h ago' },
  { id: 3, app: 'Discord', icon: '💬', category: 'Social / Gaming', requester: 'Ananya (Teen Edition)', time: '3h ago' },
];

const GuardianDashboard = () => {
  const [deviceLocked, setDeviceLocked] = useState(false);
  const [bedtimeActive, setBedtimeActive] = useState(true);
  const [schoolModeActive, setSchoolModeActive] = useState(false);
  const [screenLimitHours, setScreenLimitHours] = useState(2.5);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const handleApprove = (id, name) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    toast.success(`Approved "${name}" install!`);
  };

  const handleDeny = (id, name) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    toast.error(`Denied request for "${name}".`);
  };

  const handleToggleLock = () => {
    const nextState = !deviceLocked;
    setDeviceLocked(nextState);
    if (nextState) {
      toast('🔒 Child device locked remotely', { icon: '🛡️' });
    } else {
      toast.success('🔓 Child device unlocked');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--avrel-bg)', color: 'var(--avrel-text)' }}>
      <Navbar />

      <section style={{ padding: '5rem 0 3rem', background: 'var(--avrel-bg)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span className="avrel-eyebrow">GUARDIAN CONSOLE</span>
              <h1 className="avrel-section-title" style={{ fontSize: '2.5rem', margin: '0.2rem 0' }}>
                Parent & Guardian Dashboard
              </h1>
              <p style={{ color: 'var(--avrel-text-muted)', fontSize: '1rem', margin: 0 }}>
                Manage approved apps, screen-time boundaries, and live safety for Kids & Teen devices.
              </p>
            </div>

            <button
              onClick={handleToggleLock}
              className={`btn ${deviceLocked ? 'btn-outline' : 'btn-primary'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1.6rem',
                fontSize: '0.9rem',
                fontWeight: 800,
                background: deviceLocked ? '#ff4757' : 'var(--avrel-btn-bg)',
                color: '#ffffff',
                borderColor: deviceLocked ? '#ff4757' : 'transparent',
              }}
            >
              {deviceLocked ? <Unlock size={16} /> : <Lock size={16} />}
              <span>{deviceLocked ? 'UNLOCK CHILD DEVICE' : 'INSTANT REMOTE LOCK'}</span>
            </button>
          </div>
        </div>
      </section>

      <section style={{ padding: '3.5rem 0 6rem', background: 'var(--avrel-bg)' }}>
        <div className="container">
          {/* Active Devices Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {/* Device 1: Aarav (Kids) */}
            <div style={{ background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 16px rgba(18, 20, 23, 0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0, 212, 170, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    🧸
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Aarav’s Pixel 6a</h3>
                    <span style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', color: '#00d4aa', fontWeight: 600 }}>VOLTKART KIDS (AGE 8)</span>
                  </div>
                </div>
                <span style={{ fontFamily: 'DM Mono', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: deviceLocked ? '#ffebee' : '#e8f5e9', color: deviceLocked ? '#d32f2f' : '#2e7d32', fontWeight: 700 }}>
                  {deviceLocked ? 'LOCKED' : 'ONLINE'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid var(--avrel-border)', borderBottom: '1px solid var(--avrel-border)', padding: '1.25rem 0', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--avrel-text)' }}>1h 12m</div>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', color: 'var(--avrel-text-muted)' }}>TODAY'S USAGE</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--avrel-text)' }}>84%</div>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', color: 'var(--avrel-text-muted)' }}>BATTERY LEVEL</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#20bf6b' }}>Home</div>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', color: 'var(--avrel-text-muted)' }}>GPS GEO-FENCE</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--avrel-text-muted)' }}>Next schedule:</span>
                <strong style={{ color: 'var(--avrel-text)' }}>Bedtime Lock at 8:30 PM</strong>
              </div>
            </div>

            {/* Device 2: Ananya (Teen) */}
            <div style={{ background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 16px rgba(18, 20, 23, 0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(108, 99, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    🎧
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Ananya’s Pixel 7</h3>
                    <span style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', color: '#6c63ff', fontWeight: 600 }}>VOLTKART TEEN (AGE 15)</span>
                  </div>
                </div>
                <span style={{ fontFamily: 'DM Mono', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: '#e8f5e9', color: '#2e7d32', fontWeight: 700 }}>
                  ONLINE
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid var(--avrel-border)', borderBottom: '1px solid var(--avrel-border)', padding: '1.25rem 0', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--avrel-text)' }}>2h 45m</div>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', color: 'var(--avrel-text-muted)' }}>TODAY'S USAGE</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--avrel-text)' }}>62%</div>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', color: 'var(--avrel-text-muted)' }}>BATTERY LEVEL</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#6c63ff' }}>School</div>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', color: 'var(--avrel-text-muted)' }}>GPS GEO-FENCE</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--avrel-text-muted)' }}>Study Focus Mode:</span>
                <strong style={{ color: 'var(--avrel-text)' }}>Active until 4:00 PM</strong>
              </div>
            </div>
          </div>

          {/* Bottom Two Columns: App Requests Queue & Schedule Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2.5rem' }}>
            {/* App Approval Queue */}
            <div style={{ background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '20px', padding: '2.25rem', boxShadow: '0 4px 16px rgba(18, 20, 23, 0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  App Approval Requests
                </h3>
                <span style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', color: '#b56c00', fontWeight: 700 }}>
                  {requests.length} PENDING
                </span>
              </div>

              {requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--avrel-text-muted)' }}>
                  <Check size={32} color="#20bf6b" style={{ margin: '0 auto 0.75rem auto' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>All app requests reviewed!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {requests.map(req => (
                    <div
                      key={req.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        background: 'var(--avrel-bg)',
                        borderRadius: '12px',
                        border: '1px solid var(--avrel-border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{req.icon}</span>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--avrel-text)', display: 'block' }}>
                            {req.app}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--avrel-text-muted)' }}>
                            {req.requester} · {req.time}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleApprove(req.id, req.app)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            border: '1px solid #20bf6b',
                            background: '#e8f5e9',
                            color: '#2e7d32',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDeny(req.id, req.app)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            border: '1px solid var(--avrel-border)',
                            background: 'transparent',
                            color: '#d32f2f',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Guardrail Rules Controls */}
            <div style={{ background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '20px', padding: '2.25rem', boxShadow: '0 4px 16px rgba(18, 20, 23, 0.04)', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Safety Guardrails
              </h3>

              {/* Slider: Daily Limit */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Daily Screen Allowance</span>
                  <span style={{ fontFamily: 'DM Mono', fontSize: '0.85rem', fontWeight: 700, color: '#b56c00' }}>{screenLimitHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={screenLimitHours}
                  onChange={e => setScreenLimitHours(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#121417' }}
                />
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--avrel-border)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>Bedtime Auto-Lock</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--avrel-text-muted)' }}>Locks between 8:30 PM and 7:00 AM</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={bedtimeActive}
                    onChange={e => setBedtimeActive(e.target.checked)}
                    style={{ width: 20, height: 20, accentColor: '#121417' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>School Hours Focus Mode</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--avrel-text-muted)' }}>Silences non-emergency apps 8 AM - 3 PM</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={schoolModeActive}
                    onChange={e => setSchoolModeActive(e.target.checked)}
                    style={{ width: 20, height: 20, accentColor: '#121417' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GuardianDashboard;
