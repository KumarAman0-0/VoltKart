import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Shield, FileText, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

const POLICIES = {
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'Segregated storage, zero telemetry, and seller anonymity guarantee.',
    content: (
      <div>
        <h3>1. Information We Collect</h3>
        <p>VoltKart operates on a principle of radical data minimization. We only collect the minimal information required to execute our services:</p>
        <ul>
          <li><strong>From Sellers:</strong> Contact phone number (for OTP verification), physical pickup address, device specifications, and bank/UPI payout details.</li>
          <li><strong>From Buyers:</strong> Shipping address, recipient name, contact phone number, and online payment transaction records.</li>
        </ul>

        <h3>2. Segregated Database Architecture</h3>
        <p>A core architectural pillar of VoltKart is that seller identities and buyer identities are physically segregated. A buyer will never see who previously owned a device, and no personal identifying records are ever flashed into or linked with any refurbished device sold.</p>

        <h3>3. Zero Telemetry in VoltKart OS</h3>
        <p>The VoltKart operating system contains zero proprietary telemetry trackers, ad-network beacons, or background analytic services. Operating system telemetry is completely disabled at the kernel and network layer.</p>

        <h3>4. Cryptographic Storage Sanitization</h3>
        <p>Every device entering our warehouse undergoes a certified NIST 800-88 cryptographic storage wipe before being flashed with any VoltKart OS edition. No residual user data can be recovered once a device completes check-in.</p>
      </div>
    ),
  },
  seller: {
    id: 'seller',
    title: 'Seller Terms & Payout',
    subtitle: 'Clear terms on doorstep pickups, 8-point physical check, and payout release.',
    content: (
      <div>
        <h3>1. Pickup Scheduling & Availability</h3>
        <p>When you submit a sell request, our team generates an algorithmic valuation. Upon your acceptance, a certified VoltKart pickup agent is assigned to visit your designated address during your requested time window.</p>

        <h3>2. 8-Point Physical Inspection</h3>
        <p>The agent will verify the physical condition against your submitted request:</p>
        <ul>
          <li>Power on test and display touch digitizer responsiveness</li>
          <li>Camera lens clarity and sensor autofocus</li>
          <li>Speaker, earpiece, and microphone functional checks</li>
          <li>USB-C charging port conductivity</li>
          <li>IMEI database verification against stolen or blacklisted records</li>
        </ul>

        <h3>3. Instant Payout Guarantee</h3>
        <p>Once the agent completes the verification checklist, the payout is transferred directly to your provided UPI ID or bank account before the agent departs with the hardware.</p>

        <h3>4. Responsibility for Accounts & Data</h3>
        <p>Sellers must remove all iCloud, Google, or proprietary brand device locks and back up their personal media prior to handing the device to our agent. Devices with active cloud locks cannot be accepted.</p>
      </div>
    ),
  },
  warranty: {
    id: 'warranty',
    title: 'Warranty Policy',
    subtitle: 'Official 6-month hardware coverage backed directly by VoltKart.',
    content: (
      <div>
        <h3>1. Coverage Scope</h3>
        <p>Every verified device sold on VoltKart comes standard with an official 6-Month Hardware Warranty. This covers:</p>
        <ul>
          <li>Display and touch digitizer hardware defects not caused by accidental drops</li>
          <li>Battery failure or sudden capacity degradation below 80%</li>
          <li>Motherboard, charging port, and internal power management IC faults</li>
          <li>Camera optical module or microphone hardware malfunctions</li>
        </ul>

        <h3>2. Repair and Replacement Process</h3>
        <p>All warranty claims are handled directly by VoltKart Hardware Labs. In the event of a covered defect, we arrange free insured courier collection, repair the hardware with certified OEM components, or replace the unit with an equivalent or upgraded model.</p>

        <h3>3. Exclusions</h3>
        <p>The warranty does not cover accidental water submersion beyond IP rating limits, severe physical drops resulting in cracked glass, or unauthorized third-party board-level repairs.</p>
      </div>
    ),
  },
  returns: {
    id: 'returns',
    title: 'Return Policy',
    subtitle: '7-day risk-free return window with no hidden restocking fees.',
    content: (
      <div>
        <h3>1. 7-Day Return Window</h3>
        <p>If you are not completely satisfied with the device condition or operating system edition, you may initiate a full return or edition exchange within 7 days of delivery.</p>

        <h3>2. Condition for Returns</h3>
        <p>The device must be returned in the same physical condition as received, along with the included USB-C cable and original packaging. Please back up any personal files and perform an OS factory reset before dispatch.</p>

        <h3>3. Refund Processing</h3>
        <p>Once our engineering lab inspects the returned hardware and confirms functional integrity, a 100% refund is processed to your original payment method within 48 hours.</p>
      </div>
    ),
  },
  updates: {
    id: 'updates',
    title: 'Software Update Policy',
    subtitle: 'Published, guaranteed security update schedules for every model.',
    content: (
      <div>
        <h3>1. Transparent Update Lifecycles</h3>
        <p>Unlike standard phone vendors that obscure planned obsolescence, VoltKart publishes the exact guaranteed security update date on every single product listing.</p>

        <h3>2. Security Patch Deliveries</h3>
        <p>VoltKart OS receives regular security updates targeting the hardened memory allocator, Chromium-based browser engine, and network-level tracker blocking databases over a published schedule.</p>

        <h3>3. Longevity Commitment</h3>
        <p>We actively backport critical security protections to older SoCs, ensuring that devices remain safe, fast, and fully usable long after OEM manufacturers have abandoned them.</p>
      </div>
    ),
  },
  terms: {
    id: 'terms',
    title: 'Terms of Use',
    subtitle: 'General conditions governing the VoltKart platform and guardian dashboards.',
    content: (
      <div>
        <h3>1. Platform Services</h3>
        <p>VoltKart operates an online marketplace facilitating the collection, refurbishment, operating system customization, and resale of consumer mobile devices.</p>

        <h3>2. Guardian Dashboard Usage</h3>
        <p>The Guardian Dashboard is provided exclusively for parents, legal guardians, and designated family helpers to assist minors or elderly family members. Unauthorized surveillance of non-consenting adults is strictly prohibited and constitutes grounds for immediate account termination.</p>

        <h3>3. Intellectual Property</h3>
        <p>VoltKart, the VoltKart logo, and VoltKart OS are trademarks of VoltKart Hardware Labs. All third-party device trademarks (e.g. Pixel, Apple, Samsung) remain the property of their respective holders and are used solely for descriptive compatibility purposes.</p>
      </div>
    ),
  },
};

const PoliciesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'privacy';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && POLICIES[tab]) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const selectTab = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  const currentPolicy = POLICIES[activeTab] || POLICIES.privacy;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--avrel-bg)', color: 'var(--avrel-text)' }}>
      <Navbar />

      <section style={{ padding: '6rem 0 4rem', background: 'var(--avrel-bg)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <span className="avrel-eyebrow">POLICIES TO PUBLISH</span>
          <h1 className="avrel-section-title" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', marginBottom: '1rem' }}>
            {currentPolicy.title}
          </h1>
          <p className="avrel-section-desc" style={{ maxWidth: '650px', margin: 0 }}>
            {currentPolicy.subtitle}
          </p>
        </div>
      </section>

      <section style={{ padding: '4rem 0 6rem', background: 'var(--avrel-bg)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '3.5rem', alignItems: 'flex-start' }}>
            {/* Sidebar Tabs */}
            <div style={{ background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {[
                { id: 'privacy', label: 'Privacy Policy' },
                { id: 'seller', label: 'Seller Terms & Payout' },
                { id: 'warranty', label: 'Warranty Policy' },
                { id: 'returns', label: 'Return Policy' },
                { id: 'updates', label: 'Update Policy' },
                { id: 'terms', label: 'Terms of Use' },
              ].map(t => {
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => selectTab(t.id)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      textAlign: 'left',
                      borderRadius: '10px',
                      border: 'none',
                      background: isActive ? 'var(--avrel-btn-bg)' : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--avrel-text-muted)',
                      fontFamily: 'Inter',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Policy Article Body */}
            <div style={{
              background: 'var(--avrel-card-bg)',
              border: '1px solid var(--avrel-border)',
              borderRadius: '20px',
              padding: '3rem',
              boxShadow: '0 4px 16px rgba(18, 20, 23, 0.03)',
              lineHeight: 1.7,
              fontSize: '0.95rem',
              color: 'var(--avrel-text-muted)',
            }}>
              {currentPolicy.content}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PoliciesPage;
