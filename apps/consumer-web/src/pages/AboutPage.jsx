import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Shield, Leaf, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

const AboutPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--avrel-bg)', color: 'var(--avrel-text)' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: '6rem 0 4.5rem', background: 'var(--avrel-bg)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '820px' }}>
          <span className="avrel-eyebrow">ABOUT VOLTKART</span>
          <h1 className="avrel-section-title" style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.4rem)', lineHeight: 1.05 }}>
            Any hardware. Our software.<br />
            Made for the person who holds it.
          </h1>
          <p className="avrel-section-desc" style={{ maxWidth: '680px', margin: '0 auto' }}>
            VoltKart buys used phones and tablets from people, gives them a fresh start with our own custom operating system, and sells them to buyers who choose the version that fits who will use the device: a child or a teenager.
          </p>
        </div>
      </section>

      {/* Mission & Beliefs from Section 1 */}
      <section style={{ padding: '6rem 0', background: 'var(--avrel-card-bg)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="avrel-eyebrow" style={{ color: '#20bf6b' }}>OUR GUIDING PRINCIPLES</span>
            <h2 className="avrel-section-title" style={{ fontSize: '2.5rem' }}>
              What we believe.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              {
                num: '01',
                title: 'A phone that still works should never become waste.',
                desc: 'Hardware doesn’t wear out as fast as software slows down. By decoupling devices from planned obsolescence, we keep good electronics in service for years longer.',
              },
              {
                num: '02',
                title: 'The right software matters more than the logo on the back.',
                desc: 'A reliable device with privacy-respecting software provides far more value and dignity than an expensive phone burdened with telemetry.',
              },
              {
                num: '03',
                title: 'Different ages need different software.',
                desc: 'A child and a teenager do not need the same phone. They should not be forced into the same one-size-fits-all software.',
              },
              {
                num: '04',
                title: 'Privacy and security should be default, not an extra.',
                desc: 'You should not have to be a cybersecurity specialist to protect your private communications. Every VoltKart device is private from the moment it boots.',
              },
            ].map(b => (
              <div key={b.num} style={{ background: 'var(--avrel-bg)', border: '1px solid var(--avrel-border)', borderRadius: '18px', padding: '2.25rem 2rem' }}>
                <div style={{ fontFamily: 'DM Mono', fontSize: '1.25rem', fontWeight: 900, color: '#b56c00', marginBottom: '1rem' }}>
                  {b.num}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: 'var(--avrel-text)', lineHeight: 1.35 }}>
                  {b.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--avrel-text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 3 Problems We Solve from Section 2 */}
      <section style={{ padding: '6rem 0', background: 'var(--avrel-bg)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div className="avrel-section-header">
            <span className="avrel-eyebrow">INDUSTRY REALITY</span>
            <h2 className="avrel-section-title">The problem we solve.</h2>
            <p className="avrel-section-desc">
              Three systemic failures in modern consumer electronics that VoltKart directly remedies.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '20px', padding: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Leaf size={20} color="#20bf6b" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>1. The E-Waste Crisis</h3>
              </div>
              <p style={{ color: 'var(--avrel-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                Millions of working phones are replaced every year because they feel slow, stop getting updates or no longer suit the person using them. Most of them are thrown away or sit in drawers. The hardware is fine. The software is what lets it down.
              </p>
            </div>

            <div style={{ background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '20px', padding: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Sparkles size={20} color="#6c63ff" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>2. One-Size-Fits-All Software</h3>
              </div>
              <p style={{ color: 'var(--avrel-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                Unfiltered open internet access without guardrails is handed to a seven-year-old. Parents then have to struggle to bolt on separate third-party apps to control screen time and content. VoltKart solves this at the operating system root.
              </p>
            </div>

            <div style={{ background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '20px', padding: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Shield size={20} color="#00d4aa" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>3. Software That Tracks You</h3>
              </div>
              <p style={{ color: 'var(--avrel-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                Most phones ship with apps and services that collect telemetry, location, and behavioral data from the very first day. Many people never chose that, and modern operating systems make it almost impossible to turn off.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
