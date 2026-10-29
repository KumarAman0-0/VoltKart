import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const DropSubscribeCard = () => {
  const [contact, setContact] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contact.trim()) {
      toast.error('Please enter your email or phone number');
      return;
    }
    setSubscribed(true);
    toast.success('You have been added to the Priority Hardware Drop list!', {
      icon: '🔔',
    });
  };

  return (
    <section className="avrel-drop-newsletter-section">
      <div className="container">
        <div className="avrel-drop-floating-card">
          <div className="avrel-drop-card-left">
            <div className="avrel-drop-tag">
              <Bell size={12} color="#f0a12c" />
              <span>PRIORITY ACCESS</span>
            </div>
            <h3 className="avrel-drop-title">
              Never miss a verified hardware drop.
            </h3>
            <p className="avrel-drop-desc">
              Refurbished Pixel devices flashed with custom VoltKart OS editions sell out within hours of release. Enter your email or phone to receive 15-minute early access alerts.
            </p>
          </div>

          <div className="avrel-drop-card-right">
            {subscribed ? (
              <div className="avrel-drop-success-box">
                <CheckCircle2 size={24} color="#20bf6b" />
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#121417' }}>
                    You're on the priority VIP list!
                  </h4>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--avrel-text-muted)' }}>
                    We will notify you 15 minutes before Batch #09 goes live.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="avrel-drop-subscribe-form">
                <div className="avrel-drop-input-wrapper">
                  <Mail size={16} color="var(--avrel-text-stone)" />
                  <input
                    type="text"
                    placeholder="Enter email or mobile number..."
                    className="avrel-drop-input"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary avrel-drop-submit-btn">
                  <span>Get Drop Alert</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}

            <div className="avrel-drop-disclaimer">
              🔒 Zero spam. Unsubscribe at any time. Segregated subscriber database.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DropSubscribeCard;
