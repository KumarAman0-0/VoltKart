import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PhoneBreakdown from '../components/home/PhoneBreakdown';
import NextBatchDrop from '../components/home/NextBatchDrop';
import Hero3DPhone from '../components/home/Hero3DPhone';
import CustomerReviews from '../components/home/CustomerReviews';
import DropSubscribeCard from '../components/home/DropSubscribeCard';
import {
  Shield, ArrowDown, ArrowRight, CheckCircle2,
  Users, Lock, Sparkles, HeartHandshake, Battery,
  RefreshCw, Check, Smartphone, Tablet, Headphones,
  Briefcase, Heart, Target, Leaf
} from 'lucide-react';

const EDITIONS = [
  {
    id: 'kids',
    name: 'VoltKart Kids',
    age: 'Ages 5 to 12',
    Icon: Sparkles,
    pitch: 'A phone that a child can use safely, and a parent can trust.',
    features: [
      'Playful, big-icon home screen',
      'Parent-approved apps only',
      'Strict safe-browsing filter',
      'Daily screen-time & bedtime lock',
      'Whitelisted calls & location beacon',
    ],
    color: '#00d4aa',
    shopQuery: '?edition=Kids',
  },
  {
    id: 'teen',
    name: 'VoltKart Teen',
    age: 'Ages 13 to 17',
    Icon: Headphones,
    pitch: 'More freedom, with guardrails that teenagers can accept.',
    features: [
      'Standard home screen with more apps',
      'Transparent rules: teen sees all controls',
      'Focus mode for study, exams & sleep',
      'Shared digital wellbeing screen-time reports',
      'Social apps allowed with custom time limits',
    ],
    color: '#6c63ff',
    shopQuery: '?edition=Teen',
  },
];

const HomePage = () => {
  const [activeStepTab, setActiveStepTab] = useState('buyers'); // 'buyers' | 'sellers'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--avrel-bg)', color: 'var(--avrel-text)' }}>
      {/* 1. Global Navigation */}
      <Navbar />

      {/* =========================================================================
          HERO SECTION (From Section 9: "Home page copy")
          ========================================================================= */}
      <section className="avrel-hero-section">
        <div className="container">
          <div className="avrel-hero-grid">
            <div className="avrel-hero-left">
              <div className="avrel-tag">
                <span className="avrel-tag-dot" /> ANY HARDWARE. OUR SOFTWARE. YOUR PERSON.
              </div>

              <h1 className="avrel-hero-title">
                Any phone.<br />
                Our software.<br />
                Your person.
              </h1>

              <p className="avrel-hero-desc">
                We give good phones a second life with an operating system made for who will use it: a child or a teenager.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link to="/shop" className="btn btn-primary btn-xl" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span>Shop phones</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/seller/new" className="btn btn-outline btn-xl">
                  Sell your phone
                </Link>
              </div>

              <div className="avrel-scroll-cue-box" style={{ marginTop: '2.5rem' }}>
                <a href="#phone-breakdown" className="avrel-scroll-cue-link">
                  <span className="avrel-scroll-pill">Scroll to take apart (3D)</span>
                  <ArrowDown size={14} className="avrel-bounce" />
                </a>
              </div>
            </div>

            {/* Interactive 3D Phone Hero Canvas */}
            <div className="avrel-hero-right">
              <Hero3DPhone />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: TAKE IT APART (Interactive 3D Hardware Teardown - 6 Layers)
          ========================================================================= */}
      <PhoneBreakdown />

      {/* =========================================================================
          SECTION 1: WHO IS IT FOR? (From Section 9 & Section 6)
          ========================================================================= */}
      <section id="who-is-it-for" style={{ padding: '6rem 0', background: 'var(--avrel-bg)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container">
          <div className="avrel-section-header">
            <span className="avrel-eyebrow">Targeted Operating System</span>
            <h2 className="avrel-section-title">Who is it for?</h2>
            <p className="avrel-section-desc">
              A child and a teenager do not need the same phone. Choose the edition that matches who will use the device.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem' }}>
            {EDITIONS.map(ed => (
              <div
                key={ed.id}
                style={{
                  background: 'var(--avrel-card-bg)',
                  border: '1px solid var(--avrel-border)',
                  borderRadius: '20px',
                  padding: '2.25rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 16px rgba(18, 20, 23, 0.03)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 16px 36px rgba(18, 20, 23, 0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(18, 20, 23, 0.03)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ color: ed.color }}><ed.Icon size={32} /></div>
                    <span style={{
                      fontFamily: 'DM Mono',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '0.25rem 0.6rem',
                      borderRadius: '9999px',
                      background: 'var(--avrel-bg-subtle)',
                      color: 'var(--avrel-text-muted)',
                      border: '1px solid var(--avrel-border)'
                    }}>
                      {ed.age}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--avrel-text)', letterSpacing: '-0.02em' }}>
                    {ed.name}
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: 'var(--avrel-text-muted)', lineHeight: 1.5, marginBottom: '1.5rem', minHeight: '42px' }}>
                    {ed.pitch}
                  </p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {ed.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--avrel-text)' }}>
                        <Check size={14} color="#20bf6b" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={`/shop${ed.shopQuery}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1.25rem',
                    background: 'var(--avrel-btn-bg)',
                    color: 'var(--avrel-btn-text)',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>Shop {ed.name.replace('VoltKart ', '')}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link to="/editions" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--avrel-text)', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
              <span>Compare all four editions side-by-side</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: HOW IT WORKS (From Section 5 & Section 9)
          ========================================================================= */}
      <section style={{ padding: '6rem 0', background: 'var(--avrel-bg-subtle)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container">
          <div className="avrel-section-header">
            <span className="avrel-eyebrow">Transparent Process</span>
            <h2 className="avrel-section-title">How it works.</h2>
            <p className="avrel-section-desc">
              Whether you are buying a personalized device or selling a used phone from your drawer, our process is simple, secure, and fast.
            </p>

            {/* Toggle Switch */}
            <div style={{ display: 'inline-flex', padding: '0.35rem', background: 'var(--avrel-card-bg)', borderRadius: '9999px', border: '1px solid var(--avrel-border)', marginTop: '1.5rem' }}>
              <button
                onClick={() => setActiveStepTab('buyers')}
                style={{
                  padding: '0.55rem 1.75rem',
                  borderRadius: '9999px',
                  border: 'none',
                  background: activeStepTab === 'buyers' ? 'var(--avrel-btn-bg)' : 'transparent',
                  color: activeStepTab === 'buyers' ? '#ffffff' : 'var(--avrel-text-muted)',
                  fontFamily: 'Inter',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                For Buyers (6 Steps)
              </button>
              <button
                onClick={() => setActiveStepTab('sellers')}
                style={{
                  padding: '0.55rem 1.75rem',
                  borderRadius: '9999px',
                  border: 'none',
                  background: activeStepTab === 'sellers' ? 'var(--avrel-btn-bg)' : 'transparent',
                  color: activeStepTab === 'sellers' ? '#ffffff' : 'var(--avrel-text-muted)',
                  fontFamily: 'Inter',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                For Sellers (4 Steps)
              </button>
            </div>
          </div>

          {activeStepTab === 'buyers' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
              {[
                { step: '01', title: 'Choose who it is for', desc: 'Pick Kids or Teen based on who will hold the device.' },
                { step: '02', title: 'Choose your device', desc: 'Browse verified phones & tablets by brand, storage, grade and price.' },
                { step: '03', title: 'Order securely', desc: 'Pay online with free insured doorstep delivery.' },
                { step: '04', title: 'We prepare it', desc: 'Our engineers flash the matching OS edition and test all hardware.' },
                { step: '05', title: 'Delivery ready to use', desc: 'Device arrives with quick start guide and 6-month warranty.' },
                { step: '06', title: 'Manage with dashboard', desc: 'Parents use the guardian dashboard to set app rules and bedtime.' },
              ].map(s => (
                <div key={s.step} style={{ background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '16px', padding: '2rem' }}>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.85rem', fontWeight: 800, color: '#b56c00', marginBottom: '0.75rem' }}>
                    STEP {s.step}
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--avrel-text)' }}>
                    {s.title}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--avrel-text-muted)', lineHeight: 1.5, margin: 0 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.75rem' }}>
              {[
                { step: '01', title: 'Tell us about your phone', desc: 'Fill a short form: model, expected price, and 1-2 photos.' },
                { step: '02', title: 'Get an instant offer', desc: 'Our team reviews and sends a fair price. You can accept or decline.' },
                { step: '03', title: 'We come to you', desc: 'A VoltKart pickup agent visits at your chosen time and collects it.' },
                { step: '04', title: 'Get paid instantly', desc: 'Payment is transferred directly to your UPI/Bank upon collection.' },
              ].map(s => (
                <div key={s.step} style={{ background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '16px', padding: '2rem' }}>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '0.85rem', fontWeight: 800, color: '#b56c00', marginBottom: '0.75rem' }}>
                    STEP {s.step}
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--avrel-text)' }}>
                    {s.title}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--avrel-text-muted)', lineHeight: 1.5, margin: 0 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Privacy Guarantee Callout from Section 5 */}
          <div style={{
            maxWidth: '720px',
            margin: '3.5rem auto 0',
            background: 'var(--avrel-card-bg)',
            border: '1px solid var(--avrel-border)',
            borderRadius: '14px',
            padding: '1.5rem 2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}>
            <Shield size={28} color="#20bf6b" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--avrel-text-muted)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--avrel-text)' }}>Your privacy is guaranteed:</strong> Sellers’ personal details are stored privately in a segregated database. They are never attached to the device or shown to any buyer. Every phone is fully wiped when it reaches our warehouse.
            </p>
          </div>
        </div>
      </section>



      {/* =========================================================================
          SECTION 4: WHY VOLTKART (From Section 9: "Why VoltKart")
          ========================================================================= */}
      <section style={{ padding: '6rem 0', background: 'var(--avrel-bg)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container">
          <div className="avrel-section-header">
            <span className="avrel-eyebrow">Our Philosophy</span>
            <h2 className="avrel-section-title">Why VoltKart.</h2>
            <p className="avrel-section-desc">
              Four core commitments that define every phone, tablet, and operating system we deliver.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.75rem' }}>
            {[
              {
                Icon: Lock,
                color: '#2ed573',
                title: 'Private by default',
                desc: 'Location, camera, microphone, contacts and storage are off until you permit them. Zero pre-installed telemetry trackers.',
              },
              {
                Icon: Target,
                color: '#6c63ff',
                title: 'Made for each age',
                desc: 'From playful big icons for kids to large high-contrast tiles for grandparents, each edition matches the person holding it.',
              },
              {
                Icon: Leaf,
                color: '#00d4aa',
                title: 'A second life for hardware',
                desc: 'A phone that still works should never become waste. We revitalize great hardware with clean, fast software.',
              },
              {
                Icon: Shield,
                color: '#ffa502',
                title: 'Warranty on every device',
                desc: 'Every phone passes 8-point hardware testing and comes backed by the official VoltKart repair & replacement warranty.',
              },
            ].map(col => (
              <div key={col.title} style={{ background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '18px', padding: '2.25rem 2rem' }}>
                <div style={{ color: col.color, marginBottom: '1rem' }}><col.Icon size={32} /></div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--avrel-text)' }}>
                  {col.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--avrel-text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {col.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: THE NUMBERS (From Section 9: "The numbers")
          ========================================================================= */}
      <section className="avrel-numbers-section" id="the-numbers">
        <div className="container">
          <div className="avrel-section-header">
            <span className="avrel-eyebrow">The numbers</span>
            <h2 className="avrel-section-title">Six figures that matter.</h2>
            <p className="avrel-section-desc">
              Example figures for a Pixel 7. Real parameters measured across every refurbished unit before listing.
            </p>
          </div>

          <div className="avrel-numbers-grid">
            <div className="avrel-stat-card">
              <div className="avrel-stat-number">32 h</div>
              <div className="avrel-stat-tag">Battery · normal playback</div>
              <p className="avrel-stat-desc">Playback at normal volume, verified healthy cell impedance.</p>
            </div>
            <div className="avrel-stat-card">
              <div className="avrel-stat-number">50 MP</div>
              <div className="avrel-stat-tag">Optics · dual camera array</div>
              <p className="avrel-stat-desc">50MP main optical sensor micro-cleaned in cleanroom air.</p>
            </div>
            <div className="avrel-stat-card">
              <div className="avrel-stat-number">100%</div>
              <div className="avrel-stat-tag">Storage · NIST 800-88</div>
              <p className="avrel-stat-desc">Cryptographically wiped prior to OS installation.</p>
            </div>
            <div className="avrel-stat-card">
              <div className="avrel-stat-number">Titan M2</div>
              <div className="avrel-stat-tag">Security · hardware HSM</div>
              <p className="avrel-stat-desc">Dedicated cryptographic chip verifying boot integrity.</p>
            </div>
            <div className="avrel-stat-card">
              <div className="avrel-stat-number">0</div>
              <div className="avrel-stat-tag">Trackers · zero telemetry</div>
              <p className="avrel-stat-desc">No Google Play services telemetry or background beacons.</p>
            </div>
            <div className="avrel-stat-card">
              <div className="avrel-stat-number">6 Mo</div>
              <div className="avrel-stat-tag">Warranty · from us</div>
              <p className="avrel-stat-desc">Direct hardware replacement warranty backed by VoltKart.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: NEXT BATCH DROP (Egress Concrete Brutalist Banner)
          ========================================================================= */}
      <NextBatchDrop />

      {/* =========================================================================
          SECTION 7: QUICK SELL BANNER (From Section 9: "Sell page copy")
          ========================================================================= */}
      <section style={{ padding: '6rem 0', background: 'var(--avrel-bg)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container">
          <div style={{
            background: 'var(--avrel-text)',
            color: '#ffffff',
            borderRadius: '24px',
            padding: '4rem 3rem',
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            alignItems: 'center',
            gap: '3rem',
          }}>
            <div>
              <span style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', letterSpacing: '0.12em', color: '#00d4aa', textTransform: 'uppercase' }}>
                DOORSTEP PICKUP & INSTANT PAYOUT
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, margin: '0.75rem 0 1rem 0', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Sell your phone in minutes.
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '520px', margin: '0 0 2rem 0' }}>
                Tell us about your device. We make an offer, collect it from your door, and pay you. We keep your details private.
              </p>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontFamily: 'DM Mono', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Check size={14} color="#20bf6b" /> Any Brand Accepted</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Check size={14} color="#20bf6b" /> Zero Data Leak Guarantee</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Check size={14} color="#20bf6b" /> Direct UPI/Bank Payout</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '16px', padding: '2rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 800 }}>
                Get an instant valuation
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)', marginBottom: '1.5rem' }}>
                Select your device to see what it is worth on VoltKart:
              </p>
              <Link
                to="/seller/new"
                className="btn btn-xl"
                style={{
                  width: '100%',
                  background: '#ffffff',
                  color: '#121417',
                  fontWeight: 800,
                  justifyContent: 'center',
                  display: 'flex',
                }}
              >
                <span>Start selling now →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CUSTOMER REVIEWS CAROUSEL (From MaiShop UX - 4 Editions Testimonials)
          ========================================================================= */}
      <CustomerReviews />

      {/* =========================================================================
          PRIORITY HARDWARE DROP ACCESS (Floating Newsletter Card)
          ========================================================================= */}
      <DropSubscribeCard />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
