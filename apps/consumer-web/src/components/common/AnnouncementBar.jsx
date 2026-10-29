import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Truck, Leaf, Lock, X } from 'lucide-react';

const MESSAGES = [
  { Icon: Leaf, text: 'Every phone prevents 380g of landfill e-waste & carbon footprint', link: '/about' },
  { Icon: Shield, text: '6-Month Direct VoltKart Warranty & Hardware Replacement Coverage', link: '/policies?tab=warranty' },
  { Icon: Truck, text: 'Free Insured Express Doorstep Delivery Across All Indian Pincodes', link: '/shop' },
  { Icon: Lock, text: '100% Zero Pre-installed Spyware · Choice of 4 Age-Specific OS Editions', link: '/editions' },
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
  const CurrentIcon = current.Icon;

  return (
    <aside aria-label="Announcement" className="avrel-announcement-bar">
      <div className="container avrel-announcement-inner">
        <div className="avrel-announcement-content">
          <span className="avrel-announcement-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <CurrentIcon size={14} />
          </span>
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
