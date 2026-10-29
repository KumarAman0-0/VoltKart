import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, ShieldCheck, ArrowRight, Eye, EyeOff, Cpu, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const WarehouseLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: 'engineer1@voltkart.in',
    password: 'Engineer@1234',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter Engineer Email and Password');
      return;
    }

    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      if (res.user.role !== 'engineer') {
        toast.error('Access restricted to Warehouse Engineers only.');
        return;
      }
      toast.success(`Access granted: ${res.user.name}`);
      const from = location.state?.from?.pathname || '/engineer';
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'radial-gradient(circle at 50% 20%, #0369a1 0%, #030712 100%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4)',
            marginBottom: '1rem',
          }}>
            <Wrench size={32} color="#ffffff" />
          </div>
          <div style={{
            display: 'inline-block',
            padding: '0.2rem 0.75rem',
            borderRadius: '9999px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}>
            Internal Operations Portal
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
            Warehouse Terminal
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            Device Receiving, 4-Faisla Decisions, OS Flashing & Final QA
          </p>
        </div>

        {/* Demo Fast-fill banner */}
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px dashed rgba(56, 189, 248, 0.35)',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          fontSize: '0.825rem',
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>Technician:</span> engineer1@voltkart.in
          </div>
          <button
            type="button"
            onClick={() => setForm({ email: 'engineer1@voltkart.in', password: 'Engineer@1234' })}
            style={{
              background: '#0284c7',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.75rem',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Auto-fill
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Engineer Work Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="engineer@voltkart.in"
              required
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 2.8rem 0.85rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.95rem 1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.4)',
            }}
          >
            {loading ? 'Authenticating Technician...' : (
              <>
                Unlock Refurb Station <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
        }}>
          <ShieldCheck size={14} color="#38bdf8" />
          <span>Warehouse Intranet Access Only • Audited Session</span>
        </div>
      </div>
    </div>
  );
};

export default WarehouseLoginPage;
