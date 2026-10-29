import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { ChevronDown, Search } from 'lucide-react';

const FAQS = [
  {
    category: 'About & Operating System',
    items: [
      {
        q: 'What is VoltKart?',
        a: 'A marketplace for refurbished phones and tablets that run our own custom operating system, in an edition made specifically for the person who will use it: Kids or Teen.',
      },
      {
        q: 'Which edition should I choose?',
        a: 'Pick the one that matches the person who will use the phone: Kids for young children (ages 5–12) and Teen for teenagers (ages 13–17).',
      },
      {
        q: 'Can I change the edition later?',
        a: 'Yes. Contact our support team and we will switch it, or you can request an edition profile change from your account page where supported.',
      },
      {
        q: 'Is it secure?',
        a: 'Yes. The core operating system is private by default, storage is hardware-encrypted, telemetry trackers are blocked, and security patches arrive on a published schedule.',
      },
      {
        q: 'How long will it get updates?',
        a: 'Each product page clearly states the guaranteed security update period for that specific hardware model before you purchase.',
      },
    ],
  },
  {
    category: 'For Buyers & Guardians',
    items: [
      {
        q: 'Can parents control a child\'s phone?',
        a: 'Yes. Kids and Teen editions come with a dedicated guardian dashboard where parents can approve apps, set daily screen-time limits, activate bedtime lock, and view location beacons.',
      },
      {
        q: 'Can I install my favourite apps?',
        a: 'On Kids and Teen editions, apps are safely approved by the parent or guardian via the Guardian Dashboard, keeping screen time healthy and safe.',
      },
      {
        q: 'What is the warranty?',
        a: 'Every device comes backed by the official VoltKart warranty. The coverage period is stated on every product page, and all repairs and replacements are handled directly by VoltKart.',
      },
      {
        q: 'How is this good for the environment?',
        a: 'Every device we reuse is a device that did not become electronic waste, and a new phone that did not need to be manufactured from virgin mined materials.',
      },
    ],
  },
  {
    category: 'For Sellers',
    items: [
      {
        q: 'Can any brand of phone be sold to you?',
        a: 'Yes! We accept phones and tablets from every brand (Pixel, Apple, Samsung, OnePlus, Xiaomi, Fairphone, etc.). Each device is physically assessed by our engineers before preparation.',
      },
      {
        q: 'Does my phone need to be working?',
        a: 'Working devices get the best offers. We encourage you to tell us the functional and cosmetic condition honestly in the sell request form.',
      },
      {
        q: 'Will the buyer know who I am?',
        a: 'No. Buyers deal only with VoltKart. Your personal details, address, and payout records are stored in a segregated database and are never attached to the device or shown to any buyer.',
      },
      {
        q: 'What happens to my data?',
        a: 'Every device undergoes a certified NIST 800-88 cryptographic storage wipe upon arrival at our warehouse. Even so, please remove your personal accounts and back up your data before handing it to our agent.',
      },
      {
        q: 'How do I get paid as a seller?',
        a: 'After our pickup agent inspects the device at your door and verifies condition, payment is transferred immediately to your verified UPI ID or bank account.',
      },
    ],
  },
];

const FAQPage = () => {
  const [openItems, setOpenItems] = useState({});
  const [search, setSearch] = useState('');

  const toggle = (id) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--avrel-bg)', color: 'var(--avrel-text)' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: '6rem 0 4rem', background: 'var(--avrel-bg)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '750px' }}>
          <span className="avrel-eyebrow">HELP & KNOWLEDGE BASE</span>
          <h1 className="avrel-section-title" style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.4rem)', lineHeight: 1.05 }}>
            Frequently asked questions.
          </h1>
          <p className="avrel-section-desc" style={{ maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
            Everything you need to know about our custom operating system, age-based editions, seller doorstep pickups, and warranty coverage.
          </p>

          {/* Search Bar */}
          <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--avrel-text-stone)' }} />
            <input
              type="text"
              placeholder="Search questions (e.g. warranty, kids, data, payout)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input"
              style={{
                width: '100%',
                paddingLeft: '3rem',
                paddingTop: '0.9rem',
                paddingBottom: '0.9rem',
                borderRadius: '9999px',
                fontSize: '0.95rem',
              }}
            />
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section style={{ padding: '5rem 0 6rem', background: 'var(--avrel-bg)' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          {FAQS.map(cat => {
            const filteredItems = cat.items.filter(
              i => i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase())
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={cat.category} style={{ marginBottom: '3.5rem' }}>
                <h3 style={{
                  fontFamily: 'DM Mono',
                  fontSize: '0.85rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#b56c00',
                  marginBottom: '1.25rem',
                  borderBottom: '1px solid var(--avrel-border)',
                  paddingBottom: '0.5rem',
                }}>
                  {cat.category}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredItems.map(item => {
                    const isOpen = !!openItems[item.q];
                    return (
                      <div
                        key={item.q}
                        style={{
                          background: 'var(--avrel-card-bg)',
                          border: '1px solid var(--avrel-border)',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(18, 20, 23, 0.02)',
                        }}
                      >
                        <button
                          onClick={() => toggle(item.q)}
                          style={{
                            width: '100%',
                            padding: '1.25rem 1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: 'var(--avrel-text)',
                            fontFamily: 'Inter',
                            fontSize: '1rem',
                            fontWeight: 700,
                          }}
                        >
                          <span>{item.q}</span>
                          <ChevronDown
                            size={18}
                            color="var(--avrel-text-muted)"
                            style={{
                              transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                              transition: 'transform 0.2s ease',
                              flexShrink: 0,
                              marginLeft: '1rem',
                            }}
                          />
                        </button>

                        {isOpen && (
                          <div style={{
                            padding: '0 1.5rem 1.35rem',
                            fontSize: '0.92rem',
                            color: 'var(--avrel-text-muted)',
                            lineHeight: 1.6,
                            borderTop: '1px solid var(--avrel-border)',
                            paddingTop: '1rem',
                          }}>
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQPage;
