import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import {
  Shield, Check, ArrowRight, Truck, RefreshCw,
  Search, Lock, DollarSign, Award, Clock
} from 'lucide-react';

const HowItWorksPage = () => {
  const [tab, setTab] = useState('buyer');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--avrel-bg)', color: 'var(--avrel-text)' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: '5.5rem 0 4rem', background: 'var(--avrel-bg)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '780px' }}>
          <span className="avrel-eyebrow">SIMPLE · SAFE · VERIFIED</span>
          <h1 className="avrel-section-title" style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.4rem)', lineHeight: 1.05 }}>
            How VoltKart works.
          </h1>
          <p className="avrel-section-desc" style={{ maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
            We buy used phones from people, wipe them completely, flash the custom VoltKart OS edition of your choice, and deliver them ready to use.
          </p>

          {/* Tab Switcher */}
          <div style={{ display: 'inline-flex', padding: '0.4rem', background: 'var(--avrel-card-bg)', borderRadius: '9999px', border: '1px solid var(--avrel-border)' }}>
            <button
              onClick={() => setTab('buyer')}
              style={{
                padding: '0.65rem 2rem',
                borderRadius: '9999px',
                border: 'none',
                background: tab === 'buyer' ? 'var(--avrel-btn-bg)' : 'transparent',
                color: tab === 'buyer' ? '#ffffff' : 'var(--avrel-text-muted)',
                fontFamily: 'Inter',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              For Buyers (6 Steps)
            </button>
            <button
              onClick={() => setTab('seller')}
              style={{
                padding: '0.65rem 2rem',
                borderRadius: '9999px',
                border: 'none',
                background: tab === 'seller' ? 'var(--avrel-btn-bg)' : 'transparent',
                color: tab === 'seller' ? '#ffffff' : 'var(--avrel-text-muted)',
                fontFamily: 'Inter',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              For Sellers (4 Steps)
            </button>
          </div>
        </div>
      </section>

      {/* Content Steps */}
      <section style={{ padding: '6rem 0', background: 'var(--avrel-bg)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          {tab === 'buyer' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[
                {
                  step: '01',
                  title: 'Choose who it is for',
                  detail: 'Kids, Teen, Adult or Senior.',
                  desc: 'Every edition has its own custom launcher, strict policy layer, and privacy setup tailored to the person who will use it. No clunky third-party parental apps required.',
                },
                {
                  step: '02',
                  title: 'Choose your device',
                  detail: 'Browse verified phones and tablets by brand, storage, grade and price.',
                  desc: 'Every listing shows the exact cosmetic grade (Like New, Good, Fair), tested battery health %, and guaranteed security update period.',
                },
                {
                  step: '03',
                  title: 'Order online',
                  detail: 'Pay online and add your delivery address.',
                  desc: 'Secure checkout with atomic stock reservation so you are guaranteed to receive the exact tested device you chose.',
                },
                {
                  step: '04',
                  title: 'We prepare it in our cleanroom',
                  detail: 'We install the matching VoltKart OS edition and configure it for you.',
                  desc: 'Our engineers run a fresh NIST 800-88 cryptographic storage wipe, flash the official VoltKart OS build, and lock the bootloader to establish hardware trust.',
                },
                {
                  step: '05',
                  title: 'Delivery ready to use',
                  detail: 'The device arrives ready to use, with a quick start guide.',
                  desc: 'Unbox, power on, and start using. Includes certified USB-C cable and 6-month VoltKart warranty certificate.',
                },
                {
                  step: '06',
                  title: 'Manage it with Guardian Dashboard',
                  detail: 'Parents and guardians use the dashboard for Kids and Teen editions.',
                  desc: 'Set app approvals, configure daily screen-time limits, school mode, bedtime lock, and check live location from any browser.',
                },
              ].map(item => (
                <div key={item.step} style={{ background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '20px', padding: '2.5rem', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '2rem', alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '1.4rem', fontWeight: 900, color: '#b56c00' }}>
                    {item.step}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--avrel-text)' }}>
                      {item.title}
                    </h3>
                    <div style={{ fontFamily: 'DM Mono', fontSize: '0.85rem', color: '#b56c00', fontWeight: 600, marginBottom: '0.75rem' }}>
                      {item.detail}
                    </div>
                    <p style={{ fontSize: '0.95rem', color: 'var(--avrel-text-muted)', lineHeight: 1.6, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to="/shop" className="btn btn-primary btn-xl" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span>Start browsing verified devices</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[
                {
                  step: '01',
                  title: 'Tell us about your phone',
                  detail: 'Fill a short form with photos.',
                  desc: 'Takes under two minutes: enter your phone number, pickup address, device type & model, expected price, and one or two photos.',
                },
                {
                  step: '02',
                  title: 'Get an offer',
                  detail: 'Our team reviews your request and sends a price.',
                  desc: 'We calculate a transparent market quote based on condition and demand. You can accept or decline with zero obligation.',
                },
                {
                  step: '03',
                  title: 'We come to you',
                  detail: 'A VoltKart pickup agent visits at the time you choose.',
                  desc: 'The agent runs our rapid 8-point physical check, confirms IMEI legitimacy, and collects the phone directly from your doorstep.',
                },
                {
                  step: '04',
                  title: 'Get paid instantly',
                  detail: 'Payment is made immediately upon collection.',
                  desc: 'Funds are transferred to your verified UPI ID or bank account before the agent steps away.',
                },
              ].map(item => (
                <div key={item.step} style={{ background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '20px', padding: '2.5rem', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '2rem', alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '1.4rem', fontWeight: 900, color: '#b56c00' }}>
                    {item.step}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--avrel-text)' }}>
                      {item.title}
                    </h3>
                    <div style={{ fontFamily: 'DM Mono', fontSize: '0.85rem', color: '#b56c00', fontWeight: 600, marginBottom: '0.75rem' }}>
                      {item.detail}
                    </div>
                    <p style={{ fontSize: '0.95rem', color: 'var(--avrel-text-muted)', lineHeight: 1.6, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to="/seller/new" className="btn btn-primary btn-xl" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span>Request a doorstep pickup now</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* Segregated Privacy Callout from Section 5 */}
          <div style={{
            marginTop: '4rem',
            background: 'var(--avrel-card-bg)',
            border: '1px solid var(--avrel-border)',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 4px 16px rgba(18, 20, 23, 0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Shield size={22} color="#20bf6b" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--avrel-text)' }}>
                Your Privacy as a Seller and Buyer
              </h3>
            </div>
            <p style={{ color: 'var(--avrel-text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
              We ask for the minimum needed to arrange the pickup and the payment. Your details are stored privately by VoltKart in a segregated database. They are <strong>never shown to a buyer</strong>, and they are not attached to the device we sell.
            </p>
            <p style={{ color: 'var(--avrel-text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              Before handing over, remove your accounts and back up your data. When the device arrives at our warehouse, our engineers run a complete <strong>NIST 800-88 cryptographic storage wipe</strong> before any software is installed.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
