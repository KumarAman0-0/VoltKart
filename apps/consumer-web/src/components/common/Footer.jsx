import { Link } from 'react-router-dom';
import { Shield, RefreshCw, Heart, Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--avrel-card-bg)', borderTop: '1px solid var(--avrel-border)', padding: '5rem 0 3rem', color: 'var(--avrel-text)' }}>
      <div className="container">
        {/* Environmental Impact Counter Block (From Section 8 of Document) */}
        <div style={{
          background: 'var(--avrel-bg)',
          border: '1px solid var(--avrel-border)',
          borderRadius: '18px',
          padding: '2.5rem',
          marginBottom: '4rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <Leaf size={16} color="#20bf6b" />
            <span style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#20bf6b' }}>
              OUR PROMISE ON THE ENVIRONMENT
            </span>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 1rem 0', letterSpacing: '-0.02em' }}>
            A second life for good hardware.
          </h3>
          <p style={{ color: 'var(--avrel-text-muted)', fontSize: '0.95rem', maxWidth: '750px', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
            Buying a used device that is refurbished and re-supported avoids the need to manufacture a new one. VoltKart keeps phones and tablets in use for more years and sends only truly unusable parts for responsible recycling.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', borderTop: '1px solid var(--avrel-border)', paddingTop: '1.75rem' }}>
            <div>
              <div style={{ fontFamily: 'Inter', fontSize: '2.2rem', fontWeight: 900, color: 'var(--avrel-text)', lineHeight: 1 }}>
                1,420+
              </div>
              <div style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', color: 'var(--avrel-text-muted)', marginTop: '0.4rem' }}>
                DEVICES GIVEN A SECOND LIFE
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'Inter', fontSize: '2.2rem', fontWeight: 900, color: 'var(--avrel-text)', lineHeight: 1 }}>
                380 kg
              </div>
              <div style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', color: 'var(--avrel-text-muted)', marginTop: '0.4rem' }}>
                WASTE KEPT OUT OF LANDFILL
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'Inter', fontSize: '2.2rem', fontWeight: 900, color: 'var(--avrel-text)', lineHeight: 1 }}>
                98.4%
              </div>
              <div style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', color: 'var(--avrel-text-muted)', marginTop: '0.4rem' }}>
                PARTS RECYCLED RESPONSIBLY
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'Inter', fontSize: '2.2rem', fontWeight: 900, color: '#20bf6b', lineHeight: 1 }}>
                100%
              </div>
              <div style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', color: 'var(--avrel-text-muted)', marginTop: '0.4rem' }}>
                CRYPTOGRAPHICALLY SANITIZED
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              VoltKart
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--avrel-text-muted)', lineHeight: 1.6, margin: 0 }}>
              Any hardware. Our software.<br />
              Made for the person who holds it.
            </p>
          </div>

          <div>
            <div style={{ fontFamily: 'DM Mono', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--avrel-text)' }}>
              EXPLORE
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <li><Link to="/shop" style={{ color: 'var(--avrel-text-muted)', textDecoration: 'none' }}>Verified Shop</Link></li>
              <li><Link to="/editions" style={{ color: 'var(--avrel-text-muted)', textDecoration: 'none' }}>OS Editions</Link></li>
              <li><Link to="/how-it-works" style={{ color: 'var(--avrel-text-muted)', textDecoration: 'none' }}>How It Works</Link></li>
              <li><Link to="/seller/new" style={{ color: 'var(--avrel-text-muted)', textDecoration: 'none' }}>Sell Your Phone</Link></li>
              <li><Link to="/guardian" style={{ color: 'var(--avrel-text-muted)', textDecoration: 'none' }}>Guardian Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <div style={{ fontFamily: 'DM Mono', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--avrel-text)' }}>
              EDITIONS
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <li><Link to="/editions#kids" style={{ color: 'var(--avrel-text-muted)', textDecoration: 'none' }}>VoltKart Kids (5–12)</Link></li>
              <li><Link to="/editions#teen" style={{ color: 'var(--avrel-text-muted)', textDecoration: 'none' }}>VoltKart Teen (13–17)</Link></li>
            </ul>
          </div>

          <div>
            <div style={{ fontFamily: 'DM Mono', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--avrel-text)' }}>
              POLICIES & LEGAL
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <li><Link to="/policies?tab=privacy" style={{ color: 'var(--avrel-text-muted)', textDecoration: 'none' }}>Privacy Policy</Link></li>
              <li><Link to="/policies?tab=seller" style={{ color: 'var(--avrel-text-muted)', textDecoration: 'none' }}>Seller Terms & Payout</Link></li>
              <li><Link to="/policies?tab=warranty" style={{ color: 'var(--avrel-text-muted)', textDecoration: 'none' }}>Warranty Policy</Link></li>
              <li><Link to="/policies?tab=returns" style={{ color: 'var(--avrel-text-muted)', textDecoration: 'none' }}>Return Policy</Link></li>
              <li><Link to="/policies?tab=updates" style={{ color: 'var(--avrel-text-muted)', textDecoration: 'none' }}>Update Policy</Link></li>
              <li><Link to="/policies?tab=terms" style={{ color: 'var(--avrel-text-muted)', textDecoration: 'none' }}>Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--avrel-border)', paddingTop: '2rem', fontSize: '0.75rem', fontFamily: 'DM Mono', color: 'var(--avrel-text-stone)' }}>
          <div>
            ©2026 VOLTKART HARDWARE LABS · ALL RIGHTS RESERVED.
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>NIST 800-88 SANITIZED</span>
            <span>·</span>
            <span>ISO/IEC 17025 VERIFIED</span>
            <span>·</span>
            <span>GRAPHENEOS SECURITY CORE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
