import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { agentAPI } from '../../api';
import { useNavigate } from 'react-router-dom';
import { MapPin, Truck, CheckCircle, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    agentAPI.getPickups()
      .then(r => setPickups(r.data.data))
      .catch(() => toast.error('Failed to load pickups'))
      .finally(() => setLoading(false));
  }, []);
  const pending = pickups.filter(p => ['agent_assigned', 'on_the_way'].includes(p.status));
  const done = pickups.filter(p => ['picked_up', 'rejected_at_pickup', 'inspected', 'declined'].includes(p.status));

  const statusLabel = (status) => {
    if (status === 'on_the_way') return 'On the Way';
    if (status === 'inspected') return 'Inspected';
    return status.replace(/_/g, ' ');
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>My Pickups</h1>
        <p>{pending.length} pending · {done.length} completed</p>
      </div>
      <div className="page-body">
        {loading ? <div className="page-loader"><div className="spinner" /></div> : (
          <>
            {/* Pending */}
            {pending.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--volt-warning)' }}>
                  Pending Pickups ({pending.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pending.map(p => (
                    <div key={p._id} className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{p.model}</h3>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                            <span className="text-muted text-sm"><MapPin size={12} style={{ display: 'inline' }} /> {p.address?.city}, {p.address?.state}</span>
                            <StatusBadge status={p.status} />
                          </div>
                        </div>
                        <button className="btn btn-primary" onClick={() => navigate(`/agent/inspect/${p._id}`)}>
                          <ClipboardList size={16} /> Start Inspection
                        </button>
                      </div>
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} style={{ flexShrink: 0 }} /> {p.address?.street}, {p.address?.city}, {p.address?.state} — {p.address?.pincode}
                      </div>
                      {p.estimatedMax && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Estimated: <strong style={{ color: 'var(--volt-accent)' }}>₹{p.estimatedMax?.toLocaleString('en-IN')} tak</strong>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {done.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Completed</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {done.map(p => (
                    <div key={p._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{p.model}</span>
                        <span className="text-muted text-sm" style={{ marginLeft: '0.75rem' }}>{p.address?.city}</span>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pickups.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><Truck size={48} /></div>
                <h3>No pickups assigned</h3>
                <p>Admin will assign pickups to you when devices are approved</p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
