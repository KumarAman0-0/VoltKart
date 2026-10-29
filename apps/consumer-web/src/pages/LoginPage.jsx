import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const ROLE_HOMES = { seller: '/seller', buyer: '/shop' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(ROLE_HOMES[user.role] || '/shop');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demos = {
      seller: { email: 'seller_test@voltkart.in', password: 'Seller@1234' },
      buyer: { email: 'buyer_test@voltkart.in', password: 'Buyer@1234' },
    };
    if (demos[role]) setForm(demos[role]);
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade">
        <div className="auth-logo">
          <Zap size={20} style={{ display: 'inline', marginRight: 6 }} />
          VoltKart
        </div>
        <p className="auth-subtitle">Sign in to VoltKart Customer Account</p>

        {/* Demo logins */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p className="form-label" style={{ marginBottom: '0.5rem' }}>One-Click Customer Access:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button onClick={() => fillDemo('buyer')} className="btn btn-ghost btn-sm">
              🛍️ Buyer Account
            </button>
            <button onClick={() => fillDemo('seller')} className="btn btn-ghost btn-sm">
              📦 Seller Account
            </button>
          </div>
        </div>

        <div className="divider-text">or login manually</div>

        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="login-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="login-password"
                type={show ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)' }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button id="login-submit" type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--volt-primary-light)', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
