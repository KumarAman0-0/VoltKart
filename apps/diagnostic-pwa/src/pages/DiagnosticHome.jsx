import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Zap, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

const DiagnosticHome = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleStart = (e) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean || clean.length < 4) {
      toast.error('Please enter a valid diagnostic code');
      return;
    }
    navigate(`/check/${clean}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at 50% 20%, #064e3b 0%, #030712 100%)',
      color: '#f8fafc',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '24px',
        padding: '2.5rem 1.75rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        textAlign: 'center',
      }}>
        {/* Badge & Icon */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '72px',
          height: '72px',
          borderRadius: '22px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
          marginBottom: '1.25rem',
        }}>
          <Smartphone size={36} color="#ffffff" />
        </div>

        <div style={{
          display: 'inline-block',
          padding: '0.2rem 0.75rem',
          borderRadius: '9999px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '0.75rem',
        }}>
          Zero-Install PWA
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
          Device Diagnostics
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>
          Enter the diagnostic code shown on your VoltKart Pickup Agent’s screen to launch instant hardware testing.
        </p>

        <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. 7K42"
              maxLength={10}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '14px',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                fontSize: '1.5rem',
                fontWeight: 800,
                textAlign: 'center',
                letterSpacing: '0.2em',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.4)',
            }}
          >
            Launch Diagnostics <ArrowRight size={18} />
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.8rem',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
        }}>
          <ShieldCheck size={16} color="#10b981" />
          <span>No installation required • Runs fully in browser</span>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticHome;
