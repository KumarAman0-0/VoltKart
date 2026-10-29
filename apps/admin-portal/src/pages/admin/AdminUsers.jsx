import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import { UserX, UserCheck } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const fetch = () => {
    setLoading(true);
    adminAPI.getUsers(roleFilter ? { role: roleFilter } : {})
      .then(r => setUsers(r.data.data))
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [roleFilter]);

  const toggleBlock = async (userId, isBlocked) => {
    try {
      await adminAPI.toggleBlock(userId);
      toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'}`);
      setUsers(u => u.map(x => x._id === userId ? { ...x, isBlocked: !x.isBlocked } : x));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const ROLES = ['buyer','seller','agent','engineer','admin'];
  const ROLE_COLOR = { buyer: 'badge-primary', seller: 'badge-accent', agent: 'badge-warning', engineer: 'badge-muted', admin: 'badge-danger' };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>User Management</h1>
        <p>View and manage all platform users</p>
      </div>
      <div className="page-body">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['', ...ROLES].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`btn ${roleFilter === r ? 'btn-primary' : 'btn-ghost'} btn-sm`} style={{ textTransform: 'capitalize' }}>
              {r || 'All'}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          {loading ? <div className="page-loader" style={{ minHeight: 200 }}><div className="spinner" /></div> : (
            <table>
              <thead><tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td className="text-muted">{u.email}</td>
                    <td><span className={`badge ${ROLE_COLOR[u.role] || 'badge-muted'}`}>{u.role}</span></td>
                    <td>{u.isBlocked ? <span className="badge badge-danger">Blocked</span> : <span className="badge badge-success">Active</span>}</td>
                    <td className="text-muted text-sm">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          className={`btn ${u.isBlocked ? 'btn-success' : 'btn-danger'} btn-sm`}
                          onClick={() => toggleBlock(u._id, u.isBlocked)}
                        >
                          {u.isBlocked ? <><UserCheck size={14} /> Unblock</> : <><UserX size={14} /> Block</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
