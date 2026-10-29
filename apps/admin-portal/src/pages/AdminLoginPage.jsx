import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, Eye, EyeOff, Lock, Command } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: 'admin@voltkart.in',
    password: 'Admin@1234',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter Administrator Email and Password');
      return;
    }

    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      if (res.user.role !== 'admin') {
        toast.error('Access restricted to Super Administrators only.');
        return;
      }
      toast.success(`Access authorized: Commander ${res.user.name}`);
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Admin authentication failed.');
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
      background: 'radial-gradient(circle at 50% 15%, #312e81 0%, #030712 100%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
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
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
            marginBottom: '1rem',
          }}>
            <Command size={32} color="#ffffff" />
          </div>
          <div style={{
            display: 'inline-block',
            padding: '0.2rem 0.75rem',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#a5b4fc',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}>
            Tier-1 Security Clearance
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
            Control Tower
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            Executive oversight, price tables, requests & logistics
          </p>
        </div>

        {/* Demo Fast-fill banner */}
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px dashed rgba(99, 102, 241, 0.35)',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          fontSize: '0.825rem',
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ color: '#a5b4fc', fontWeight: 700 }}>Super Admin:</span> admin@voltkart.in
          </div>
          <button
            type="button"
            onClick={() => setForm({ email: 'admin@voltkart.in', password: 'Admin@1234' })}
            style={{
              background: '#6366f1',
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
              Admin Identifier
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@voltkart.in"
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
              Master Security Key
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
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.5)',
            }}
          >
            {loading ? 'Authorizing Access...' : (
              <>
                Initialize Command Center <ArrowRight size={18} />
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
          <ShieldCheck size={14} color="#6366f1" />
          <span>VoltKart Enterprise HQ • 256-bit Hardware Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
