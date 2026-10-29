import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, LogOut, ShieldAlert, Cpu } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span style={{ color: '#38bdf8' }}>⚡ VoltKart</span>
        <span style={{ fontSize: '0.7rem', display: 'block', color: '#94a3b8', fontWeight: 500, letterSpacing: '0.05em' }}>
          WAREHOUSE HUB
        </span>
      </div>

      <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(56, 189, 248, 0.08)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Cpu size={12} /> Refurbishment Engineer
          </div>
        </div>
      </div>

      <div className="sidebar-section-title">Operations</div>

      <nav>
        <Link
          to="/engineer"
          className={`sidebar-link ${location.pathname === '/engineer' ? 'active' : ''}`}
        >
          <Wrench size={18} />
          Device Refurb Queue
        </Link>
      </nav>

      <div style={{ marginTop: 'auto', padding: '1.5rem 0 0', borderTop: '1px solid var(--border)' }}>
        <button className="sidebar-link" onClick={handleLogout} style={{ color: 'var(--volt-danger)' }}>
          <LogOut size={18} />
          Logout Terminal
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
