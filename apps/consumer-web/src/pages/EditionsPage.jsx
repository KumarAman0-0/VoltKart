import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import {
  Shield, Check, ArrowRight, Lock, Eye, Users,
  Smartphone, Bell, Compass, Heart, AlertCircle, Sparkles
} from 'lucide-react';

const EDITIONS_DATA = {
  kids: {
    id: 'kids',
    name: 'VoltKart Kids',
    tag: 'Ages 5 to 12',
    headline: 'A phone that a child can use safely, and a parent can trust.',
    color: '#00d4aa',
    launcherMock: {
      bg: 'linear-gradient(135deg, #e0f9f5 0%, #d5f5ee 100%)',
      clockColor: '#005b49',
      apps: [
        { icon: '📞', name: 'Parents' },
        { icon: '📚', name: 'Learning' },
        { icon: '🎨', name: 'Drawing' },
        { icon: '📷', name: 'Camera' },
        { icon: '🎵', name: 'Music' },
        { icon: '🆘', name: 'Emergency' },
      ],
      notice: 'Approved apps only · Safe web filter · Daily bedtime lock',
    },
    features: [
      { title: 'Playful, simple home screen', desc: 'Extra-large, cheerful icons that are easy to tap and navigate without clutter.' },
      { title: 'Approved apps only', desc: 'Parents choose exactly which apps appear from the dashboard. Nothing else can be installed.' },
      { title: 'Safe browsing filter', desc: 'Child-friendly web filter actively blocks adult content, or the browser can be turned off completely.' },
      { title: 'Whitelisted calls & messages', desc: 'Children can only communicate with trusted contacts pre-approved by parents.' },
      { title: 'Screen-time & Bedtime lock', desc: 'Automatic schedule locks the device during school hours and bedtime.' },
      { title: 'Parent Guardian Dashboard', desc: 'Real-time dashboard showing apps used, time spent, GPS location beacon, and 1-tap remote lock.' },
      { title: 'Zero advertising or tracking', desc: 'No trackers, no ad networks, and zero in-app purchases without parent permission.' },
    ],
  },
  teen: {
    id: 'teen',
    name: 'VoltKart Teen',
    tag: 'Ages 13 to 17',
    headline: 'More freedom, with guardrails that teenagers can accept.',
    color: '#6c63ff',
    launcherMock: {
      bg: 'linear-gradient(135deg, #edeafc 0%, #dfdafb 100%)',
      clockColor: '#2b2375',
      apps: [
        { icon: '💬', name: 'Chats' },
        { icon: '🌐', name: 'Browser' },
        { icon: '📸', name: 'Photos' },
        { icon: '🎧', name: 'Spotify' },
        { icon: '🗺️', name: 'Maps' },
        { icon: '📖', name: 'Study Focus' },
      ],
      notice: 'Transparent rules · Study mode · Shared wellbeing reports',
    },
    features: [
      { title: 'Full home screen with transparent rules', desc: 'A modern, unrestricted home screen where teenagers see all active rules with no hidden spyware.' },
      { title: 'Age-appropriate content filters', desc: 'Balanced content filtering categorized by age group to keep web exploration safe.' },
      { title: 'Study & Exam Focus Mode', desc: 'Silences distracting notifications and limits entertainment apps during homework and exam hours.' },
      { title: 'Shared screen-time reports', desc: 'Digital wellbeing summaries that both the teen and parent can see collaboratively.' },
      { title: 'Social apps with time limits', desc: 'Allows social networking with configurable daily limits to encourage balanced habits.' },
      { title: 'App install request workflow', desc: 'Teens can request new app installs, which prompt the parent for a quick 1-tap approval.' },
      { title: 'Location sharing for late travel', desc: 'Can be scheduled or activated during commute and evening hours for family peace of mind.' },
    ],
  },
  adult: {
    id: 'adult',
    name: 'VoltKart Adult',
    tag: 'Working Professionals',
    headline: 'A clean, powerful phone for people who want control.',
    color: '#2ed573',
    launcherMock: {
      bg: 'linear-gradient(135deg, #e8f9ef 0%, #dbf5e4 100%)',
      clockColor: '#0e4a23',
      apps: [
        { icon: '💼', name: 'Work Profile' },
        { icon: '🔒', name: 'Secure Folder' },
        { icon: '🛡️', name: 'Privacy Center' },
        { icon: '📧', name: 'Email' },
        { icon: '🌐', name: 'Brave/Vanadium' },
        { icon: '⚙️', name: 'Settings' },
      ],
      notice: 'Full freedom · Segregated profiles · Network tracker blocker',
    },
    features: [
      { title: '100% Full app freedom', desc: 'Install any application from trusted open repositories or Sandboxed Google Play with zero OS restrictions.' },
      { title: 'Maximum privacy in one screen', desc: 'A single, unified privacy console controlling all sensors, cameras, and data permissions.' },
      { title: 'Per-app one-time permissions', desc: 'Grant camera, mic, or location access for single sessions only; permissions revoke automatically.' },
      { title: 'Network-level tracker blocking', desc: 'Built-in DNS-over-HTTPS and tracker blocker halts ad networks before packets reach the screen.' },
      { title: 'Segregated Work & Personal profiles', desc: 'Keep corporate documents, Slack, and work email completely isolated from personal photos.' },
      { title: 'Encrypted Secure Folder', desc: 'Hardware-encrypted vault isolated by the Titan M2 security module for private documents.' },
      { title: 'Remote lock & cryptographic wipe', desc: 'Protect your identity and data even if your phone is lost or stolen.' },
    ],
  },
  senior: {
    id: 'senior',
    name: 'VoltKart Senior',
    tag: 'Parents & Grandparents',
    headline: 'Simple, large, and calm. Built for parents and grandparents.',
    color: '#ffa502',
    launcherMock: {
      bg: 'linear-gradient(135deg, #fff7eb 0%, #feeeda 100%)',
      clockColor: '#633900',
      apps: [
        { icon: '📞', name: 'CALL' },
        { icon: '📹', name: 'VIDEO CALL' },
        { icon: '🖼️', name: 'PHOTOS' },
        { icon: '💬', name: 'MESSAGES' },
        { icon: '💊', name: 'MEDICINE' },
        { icon: '🚨', name: 'EMERGENCY SOS' },
      ],
      notice: 'Large high-contrast tiles · Anti-scam warnings · 1-tap family video',
    },
    features: [
      { title: 'Large text & high-contrast tiles', desc: 'Oversized buttons and high-contrast typography designed specifically for effortless legibility.' },
      { title: '1-tap family video calls', desc: 'Call children and grandchildren with a single touch, with zero confusing menus or app switching.' },
      { title: 'Dedicated SOS Emergency button', desc: 'Prominent red button immediately dials designated family members and texts current GPS coordinates.' },
      { title: 'Active anti-scam warnings', desc: 'Identifies and visibly warns against suspicious incoming numbers and fraudulent spam text messages.' },
      { title: 'Medicine & appointment voice reminders', desc: 'Gentle, spoken reminders to take daily prescriptions and attend scheduled appointments.' },
      { title: 'Remote family helper support', desc: 'Trusted family members can assist with settings and resolve issues remotely with permission.' },
    ],
  },
};

const EditionsPage = () => {
  const [selectedEdition, setSelectedEdition] = useState('kids');
  const edition = EDITIONS_DATA[selectedEdition];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--avrel-bg)', color: 'var(--avrel-text)' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: '5.5rem 0 4rem', background: 'var(--avrel-bg)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '820px' }}>
          <span className="avrel-eyebrow">ONE OPERATING SYSTEM · FOUR EDITIONS</span>
          <h1 className="avrel-section-title" style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.4rem)', lineHeight: 1.05 }}>
            The right software matters more than the logo on the back.
          </h1>
          <p className="avrel-section-desc" style={{ maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
            Every edition shares the same secure, encrypted core with zero pre-installed telemetry trackers. Choose the experience designed for who will hold the device.
          </p>

          {/* Interactive Edition Switcher Pills */}
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--avrel-card-bg)', padding: '0.4rem', borderRadius: '9999px', border: '1px solid var(--avrel-border)' }}>
            {Object.keys(EDITIONS_DATA).map(key => {
              const ed = EDITIONS_DATA[key];
              const isSelected = selectedEdition === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedEdition(key)}
                  style={{
                    padding: '0.65rem 1.6rem',
                    borderRadius: '9999px',
                    border: 'none',
                    background: isSelected ? 'var(--avrel-btn-bg)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--avrel-text-muted)',
                    fontFamily: 'Inter',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {ed.name} ({ed.tag})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Edition Deep Dive Stage */}
      <section style={{ padding: '5rem 0', background: 'var(--avrel-bg)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '4rem', alignItems: 'center' }}>
            {/* Left: Phone Screen Mockup */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '300px',
                height: '560px',
                borderRadius: '42px',
                background: '#121417',
                padding: '12px',
                boxShadow: '0 25px 60px rgba(18, 20, 23, 0.15)',
                border: '4px solid #dcd7cf',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Simulated Screen */}
                <div style={{
                  flex: 1,
                  borderRadius: '32px',
                  background: edition.launcherMock.bg,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  {/* Pinhole Camera Notch */}
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#000', margin: '0 auto 1.5rem' }} />

                  {/* Clock Widget */}
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: edition.launcherMock.clockColor, lineHeight: 1, letterSpacing: '-0.03em' }}>
                      09:41
                    </div>
                    <div style={{ fontFamily: 'DM Mono', fontSize: '0.72rem', color: edition.launcherMock.clockColor, opacity: 0.8, marginTop: '0.2rem' }}>
                      VOLTKART OS // {edition.name.toUpperCase()}
                    </div>
                  </div>

                  {/* App Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', flex: 1 }}>
                    {edition.launcherMock.apps.map(app => (
                      <div
                        key={app.name}
                        style={{
                          background: 'rgba(255, 255, 255, 0.75)',
                          borderRadius: '16px',
                          padding: '1rem 0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        <span style={{ fontSize: '1.8rem' }}>{app.icon}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#121417' }}>{app.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Notice Pill */}
                  <div style={{
                    marginTop: 'auto',
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    padding: '0.4rem 0.6rem',
                    textAlign: 'center',
                    fontFamily: 'DM Mono',
                    fontSize: '0.6rem',
                    letterSpacing: '0.04em',
                  }}>
                    {edition.launcherMock.notice}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Feature Specifications */}
            <div>
              <span className="avrel-eyebrow" style={{ color: edition.color }}>
                {edition.tag} · EDITION PROFILE
              </span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, margin: '0.35rem 0 1rem 0', color: 'var(--avrel-text)', letterSpacing: '-0.03em' }}>
                {edition.name}
              </h2>
              <p style={{ fontSize: '1.15rem', color: 'var(--avrel-text-muted)', lineHeight: 1.5, marginBottom: '2rem' }}>
                {edition.headline}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                {edition.features.map(f => (
                  <div key={f.title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <Check size={12} color="#20bf6b" />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--avrel-text)', display: 'block' }}>
                        {f.title}
                      </strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--avrel-text-muted)', lineHeight: 1.5 }}>
                        {f.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Link to={`/shop?edition=${edition.name.replace('VoltKart ', '')}`} className="btn btn-primary btn-xl" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                <span>Browse {edition.name} Devices</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Editions at a glance Comparison Matrix (From Section 6 of Document) */}
      <section style={{ padding: '6rem 0', background: 'var(--avrel-bg-subtle)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container">
          <div className="avrel-section-header">
            <span className="avrel-eyebrow">Full Feature Matrix</span>
            <h2 className="avrel-section-title">Editions at a glance.</h2>
            <p className="avrel-section-desc">
              Every edition is defined by a dedicated launcher, a strict policy layer, and a personalized configuration.
            </p>
          </div>

          <div style={{ overflowX: 'auto', background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '20px', boxShadow: '0 4px 16px rgba(18, 20, 23, 0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--avrel-border)', background: 'var(--avrel-bg)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', fontFamily: 'DM Mono', fontSize: '0.75rem', color: 'var(--avrel-text-stone)' }}>FEATURE</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontFamily: 'Inter', fontSize: '0.95rem', fontWeight: 800 }}>Kids (5–12)</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontFamily: 'Inter', fontSize: '0.95rem', fontWeight: 800 }}>Teen (13–17)</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontFamily: 'Inter', fontSize: '0.95rem', fontWeight: 800 }}>Adult</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontFamily: 'Inter', fontSize: '0.95rem', fontWeight: 800 }}>Senior</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.88rem' }}>
                {[
                  { f: 'Home screen', k: 'Playful, big icons', t: 'Standard sleek', a: 'Fully custom', s: 'Large, simple tiles' },
                  { f: 'App installs', k: 'Parent approves each', t: 'Parent approval request', a: '100% Free', s: 'Family helper assisted' },
                  { f: 'Screen-time limits', k: 'Strict daily & bedtime', t: 'Shared rules & focus', a: 'Optional', s: 'Optional' },
                  { f: 'Content filter', k: 'Strict child-safe', t: 'Age-based filter', a: 'Optional', s: 'Scam & spam warnings' },
                  { f: 'Calls & messages', k: 'Whitelisted only', t: 'Standard with limits', a: 'Unrestricted', s: '1-tap family video calls' },
                  { f: 'Location sharing', k: 'With parent', t: 'With parent', a: 'Optional', s: 'With family' },
                  { f: 'Guardian dashboard', k: 'Yes, full control', t: 'Yes, shared rules', a: 'No (Private)', s: 'Optional family helper' },
                  { f: 'Emergency SOS button', k: 'Yes, sends GPS', t: 'Yes, sends GPS', a: 'Optional', s: 'Yes, dedicated red button' },
                  { f: 'Privacy & tracker block', k: '100% Zero telemetry', t: '100% Zero telemetry', a: '100% Zero telemetry', s: '100% Zero telemetry' },
                ].map((row, i) => (
                  <tr key={row.f} style={{ borderBottom: i < 8 ? '1px solid var(--avrel-border)' : 'none' }}>
                    <td style={{ padding: '1.1rem 1.5rem', fontWeight: 700, color: 'var(--avrel-text)' }}>{row.f}</td>
                    <td style={{ padding: '1.1rem 1.5rem', color: 'var(--avrel-text-muted)' }}>{row.k}</td>
                    <td style={{ padding: '1.1rem 1.5rem', color: 'var(--avrel-text-muted)' }}>{row.t}</td>
                    <td style={{ padding: '1.1rem 1.5rem', color: 'var(--avrel-text-muted)' }}>{row.a}</td>
                    <td style={{ padding: '1.1rem 1.5rem', color: 'var(--avrel-text-muted)' }}>{row.s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* The Secure Core (In Every Edition) from Section 6 */}
      <section style={{ padding: '6rem 0', background: 'var(--avrel-bg)' }}>
        <div className="container">
          <div className="avrel-section-header">
            <span className="avrel-eyebrow">IN EVERY EDITION</span>
            <h2 className="avrel-section-title">The secure core.</h2>
            <p className="avrel-section-desc">
              No matter which edition you choose, every VoltKart device runs the same hardened, zero-telemetry base system.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
            {[
              { title: 'Clean start', desc: 'No pre-installed tracking apps, carrier bloatware, or advertising services.' },
              { title: 'Private by default', desc: 'Location, camera, mic, contacts and storage are off until you permit them.' },
              { title: 'Encrypted storage', desc: 'All data on the device is encrypted with dedicated hardware security keys.' },
              { title: 'Tracker blocking', desc: 'Built-in network protection blocks ad networks and telemetry beacons.' },
              { title: 'App permissions you can read', desc: 'A simple screen clearly shows which app accesses what hardware.' },
              { title: 'Regular updates', desc: 'Security updates on a published schedule stated for every model.' },
              { title: 'Backups you control', desc: 'Encrypted backup and restore without sending data to third parties.' },
              { title: 'Fast and light', desc: 'Tuned specifically so that older hardware feels responsive and snappy.' },
              { title: 'Useful from day one', desc: 'Calls, messages, camera, browser, maps, music and photos ready out of the box.' },
            ].map(item => (
              <div key={item.title} style={{ background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '16px', padding: '1.75rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--avrel-text)' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--avrel-text-muted)', lineHeight: 1.5, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EditionsPage;
