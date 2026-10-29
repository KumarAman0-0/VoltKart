import { useState, useEffect } from 'react';

const DropCountdown = ({ targetDate, lightMode = false }) => {
  // Default to 6 days 17 hours from now if no targetDate provided
  const [target] = useState(() => {
    if (targetDate) return new Date(targetDate).getTime();
    return Date.now() + (6 * 86400000) + (17 * 3600000) + (7 * 60000) + (44 * 1000);
  });

  const [timeLeft, setTimeLeft] = useState({
    days: '06',
    hours: '17',
    minutes: '07',
    seconds: '44',
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(target - now, 0);

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const textColor = lightMode ? '#000000' : '#ffffff';
  const colonColor = lightMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)';
  const labelColor = lightMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.4)';

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: textColor,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          userSelect: 'none',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span style={{ minWidth: '1.2em', textAlign: 'center' }}>{timeLeft.days}</span>
        <span style={{ color: colonColor, margin: '0 0.15em' }}>:</span>
        <span style={{ minWidth: '1.2em', textAlign: 'center' }}>{timeLeft.hours}</span>
        <span style={{ color: colonColor, margin: '0 0.15em' }}>:</span>
        <span style={{ minWidth: '1.2em', textAlign: 'center' }}>{timeLeft.minutes}</span>
        <span style={{ color: colonColor, margin: '0 0.15em' }}>:</span>
        <span style={{ minWidth: '1.2em', textAlign: 'center', color: lightMode ? '#0094F7' : 'var(--volt-accent)' }}>
          {timeLeft.seconds}
        </span>
      </div>

      {/* Sublabels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          width: '100%',
          marginTop: '0.5rem',
          fontFamily: '"DM Mono", monospace',
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: labelColor,
          textAlign: 'center',
        }}
      >
        <span>Days</span>
        <span>Hours</span>
        <span>Mins</span>
        <span>Secs</span>
      </div>
    </div>
  );
};

export default DropCountdown;
