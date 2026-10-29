import { useState } from 'react';
import DropCountdown from '../common/DropCountdown';
import useTextScramble from '../../hooks/useTextScramble';
import { Bell, Check, Sparkles, Shield, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const NextBatchDrop = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Scramble text hooks for interactive brutalist elements
  const btnScramble = useTextScramble('NOTIFY ME FOR DROP');
  const alertScramble = useTextScramble('LIMITED BATCH 04');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    setSubscribed(true);
    toast.success('You are on the VIP Drop list! Allocation notification confirmed.');
  };

  return (
    <section className="egress-drop-section">
      <div className="container">
        <div className="egress-concrete-card">
          {/* Top Bar with scramble label & allocation badge */}
          <div className="egress-card-top">
            <span
              className="egress-pill"
              onMouseEnter={() => alertScramble.triggerScramble()}
              style={{ cursor: 'pointer' }}
            >
              <span className="egress-dot" /> {alertScramble.displayText}
            </span>

            <span className="egress-mono-meta">
              ALLOCATION: 50 UNITS · VERIFIED GRAPHENEOS
            </span>
          </div>

          {/* Huge Brutalist Headline */}
          <div className="egress-hero-heading">
            <h2 className="egress-giant-title">
              WE'RE DROPPING BATCH 04 SOON
            </h2>
            <p className="egress-subtitle">
              Pre-flashed Pixel 8 Pro & Fairphone 4 units. Each device cryptographic memory-wiped, benchmarked, and warrantied.
            </p>
          </div>

          {/* The Precision Digital Monospace Countdown */}
          <div className="egress-countdown-wrapper">
            <DropCountdown lightMode={true} />
          </div>

          {/* Email Subscription Waitlist Capture */}
          <div className="egress-signup-box">
            {subscribed ? (
              <div className="egress-success-badge">
                <Check size={18} />
                <span>ACCESS SECURED // YOU WILL RECEIVE VIP PRE-ORDER LINK 15 MINUTES BEFORE DROP</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="egress-form">
                <input
                  type="email"
                  className="egress-input"
                  placeholder="ENTER EMAIL FOR EARLY ACCESS"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="egress-btn"
                  onMouseEnter={() => btnScramble.triggerScramble()}
                >
                  <Bell size={14} />
                  <span>{btnScramble.displayText}</span>
                </button>
              </form>
            )}
          </div>

          {/* Minimalist Brutalist Footer Bar */}
          <div className="egress-card-bottom">
            <div className="egress-copyright">
              ©2026 VOLTKART HARDWARE LABS · ALL RIGHTS RESERVED.
            </div>
            <div className="egress-social-links">
              <a href="https://instagram.com" target="_blank" rel="noreferrer">INSTAGRAM</a>
              <span>/</span>
              <a href="https://youtube.com" target="_blank" rel="noreferrer">YOUTUBE</a>
              <span>/</span>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">LINKEDIN</a>
              <span>/</span>
              <a href="https://t.me" target="_blank" rel="noreferrer">TELEGRAM</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NextBatchDrop;
