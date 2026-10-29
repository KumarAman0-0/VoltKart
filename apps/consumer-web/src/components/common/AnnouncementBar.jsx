import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Truck, Leaf, X } from 'lucide-react';

const MESSAGES = [
  { icon: '🌱', text: 'Every phone prevents 380g of landfill e-waste & carbon footprint', link: '/about' },
  { icon: '🛡️', text: '6-Month Direct VoltKart Warranty & Hardware Replacement Coverage', link: '/policies?tab=warranty' },
  { icon: '🚚', text: 'Free Insured Express Doorstep Delivery Across All Indian Pincodes', link: '/shop' },
  { icon: '🔐', text: '100% Zero Pre-installed Spyware · Choice of 4 Age-Specific OS Editions', link: '/editions' },
];

const AnnouncementBar = () => {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  if (dismissed) return null;

  const current = MESSAGES[index];

  return (
    <aside aria-label="Announcement" className="avrel-announcement-bar">
      <div className="container avrel-announcement-inner">
        <div className="avrel-announcement-content">
          <span className="avrel-announcement-icon">{current.icon}</span>
          <span className="avrel-announcement-text">{current.text}</span>
          <Link to={current.link} className="avrel-announcement-link">
            Learn more →
          </Link>
        </div>

        <button
          className="avrel-announcement-close"
          onClick={() => setDismissed(true)}
          title="Dismiss announcement"
          aria-label="Dismiss announcement"
        >
          <X size={13} />
        </button>
      </div>
    </aside>
  );
};

export default AnnouncementBar;
