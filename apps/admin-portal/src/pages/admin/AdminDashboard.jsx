import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import { BarChart3, Package, ShoppingCart, Users, TrendingUp, CheckCircle, UserX } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(r => setStats(r.data.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="page-loader"><div className="spinner" /></div></DashboardLayout>;

  const cards = [
    { icon: '📦', label: 'Total Requests', value: stats?.totalRequests ?? 0, color: '#6c63ff' },
    { icon: '⏳', label: 'Pending', value: stats?.pendingRequests ?? 0, color: '#ffa500' },
    { icon: '📱', label: 'Live Devices', value: stats?.activeDevices ?? 0, color: '#00d4aa' },
    { icon: '🛒', label: 'Total Orders', value: stats?.totalOrders ?? 0, color: '#2ed573' },
    { icon: '💰', label: 'Revenue', value: `₹${(stats?.revenue ?? 0).toLocaleString('en-IN')}`, color: '#ff6b81' },
    { icon: '👥', label: 'Users', value: stats?.totalUsers ?? 0, color: '#a29bfe' },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Platform overview and management</p>
      </div>
      <div className="page-body">
        {/* Stats */}
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          {cards.map(c => (
            <div key={c.label} className="stat-card">
              <div className="stat-icon" style={{ background: `${c.color}20` }}>
                <span style={{ fontSize: '1.3rem' }}>{c.icon}</span>
              </div>
              <div className="stat-value" style={{ background: 'none', WebkitTextFillColor: c.color, fontSize: '1.75rem' }}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          <a href="/admin/requests" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ background: 'rgba(108,99,255,0.15)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <Package size={24} color="var(--volt-primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Sell Requests</div>
              <div className="text-muted text-sm">{stats?.pendingRequests} awaiting review</div>
            </div>
          </a>
          <a href="/admin/orders" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ background: 'rgba(0,212,170,0.15)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <ShoppingCart size={24} color="var(--volt-accent)" />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Orders</div>
              <div className="text-muted text-sm">Manage all orders</div>
            </div>
          </a>
        </div>

        {/* Recent Audit Log */}
        {stats?.recentLogs?.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.1rem' }}>Recent Activity</h2>
            </div>
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead><tr>
                  <th>Action</th><th>Actor</th><th>Role</th><th>Time</th>
                </tr></thead>
                <tbody>
                  {stats.recentLogs.map(log => (
                    <tr key={log._id}>
                      <td><span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{log.action}</span></td>
                      <td style={{ fontWeight: 600 }}>{log.actor?.name}</td>
                      <td><span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>{log.actorRole || log.actor?.role}</span></td>
                      <td className="text-muted text-sm">{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
