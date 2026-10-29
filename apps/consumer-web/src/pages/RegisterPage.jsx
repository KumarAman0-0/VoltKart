import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap } from 'lucide-react';

const ROLES = [
  { value: 'buyer', label: 'Buyer — Buy privacy phones' },
  { value: 'seller', label: 'Seller — Sell your old device' },
];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [loading, setLoading] = useState(false);

  const ROLE_HOMES = { seller: '/seller', buyer: '/shop' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created successfully!');
      navigate(ROLE_HOMES[user.role] || '/shop');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade">
        <div className="auth-logo"><Zap size={20} style={{ display: 'inline', marginRight: 6 }} />VoltKart</div>
        <p className="auth-subtitle">Create your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="reg-name" type="text" className="form-input" placeholder="Rahul Sharma"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="reg-password" type="password" className="form-input" placeholder="Min 8 characters"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>

          <div className="form-group">
            <label className="form-label">I want to</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {ROLES.map(r => (
                <label key={r.value} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                  background: form.role === r.value ? 'rgba(108,99,255,0.1)' : 'var(--bg-glass)',
                  border: `1px solid ${form.role === r.value ? 'rgba(108,99,255,0.4)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition-fast)',
                }}>
                  <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ accentColor: 'var(--volt-primary)' }} />
                  <span style={{ fontSize: '0.9rem' }}>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button id="reg-submit" type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--volt-primary-light)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
