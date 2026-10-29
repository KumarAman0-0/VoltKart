import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Users, LogOut,
  Truck, Wrench, BarChart3, ClipboardList, Store, ShoppingBag,
  UserCheck, Tag,
} from 'lucide-react';

const NAV_CONFIG = {
  admin: [
    { icon: BarChart3,     label: 'Dashboard',    path: '/admin' },
    { icon: ClipboardList, label: 'Sell Requests', path: '/admin/requests' },
    { icon: Package,       label: 'Devices',       path: '/admin/devices' },
    { icon: ShoppingCart,  label: 'Orders',        path: '/admin/orders' },
    { icon: Users,         label: 'Users',         path: '/admin/users' },
    { icon: Tag,           label: 'Price Tables',  path: '/admin/price-tables' },
  ],
  seller: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/seller' },
    { icon: ClipboardList, label: 'My Requests', path: '/seller/requests' },
    { icon: UserCheck, label: 'My Profile', path: '/seller/profile' },
  ],
  agent: [
    { icon: Truck, label: 'My Pickups', path: '/agent' },
  ],
  engineer: [
    { icon: Wrench, label: 'Warehouse', path: '/engineer' },
  ],
  buyer: [
    { icon: Store, label: 'Shop', path: '/shop' },
    { icon: ShoppingBag, label: 'My Orders', path: '/buyer/orders' },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const links = NAV_CONFIG[user.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">⚡ VoltKart</div>

      <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{
          padding: '0.75rem 1rem',
          background: 'var(--bg-glass)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem' }}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="sidebar-section-title">Navigation</div>

      <nav>
        {links.map(({ icon: Icon, label, path }) => (
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
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
