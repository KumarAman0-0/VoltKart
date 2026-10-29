import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart3, ClipboardList, Package, ShoppingCart, Users, Tag, LogOut, ShieldAlert
} from 'lucide-react';

const ADMIN_LINKS = [
  { icon: BarChart3,     label: 'Control Tower', path: '/admin' },
  { icon: ClipboardList, label: 'Sell Requests', path: '/admin/requests' },
  { icon: Package,       label: 'Device Inventory', path: '/admin/devices' },
  { icon: ShoppingCart,  label: 'Customer Orders', path: '/admin/orders' },
  { icon: Users,         label: 'User Directory', path: '/admin/users' },
  { icon: Tag,           label: 'Price Tables',  path: '/admin/price-tables' },
];

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
        <span style={{ color: '#818cf8' }}>⚡ VoltKart</span>
        <span style={{ fontSize: '0.7rem', display: 'block', color: '#94a3b8', fontWeight: 500, letterSpacing: '0.05em' }}>
          CONTROL TOWER
        </span>
      </div>

      <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(99, 102, 241, 0.08)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#818cf8', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ShieldAlert size={12} /> Super Administrator
          </div>
        </div>
      </div>

      <div className="sidebar-section-title">Administration</div>

      <nav>
        {ADMIN_LINKS.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`sidebar-link ${location.pathname === path ? 'active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '1.5rem 0 0', borderTop: '1px solid var(--border)' }}>
        <button className="sidebar-link" onClick={handleLogout} style={{ color: 'var(--volt-danger)' }}>
          <LogOut size={18} />
          Logout Tower
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
