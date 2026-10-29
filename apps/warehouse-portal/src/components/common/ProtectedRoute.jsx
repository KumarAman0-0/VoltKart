import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_HOMES = {
  admin: '/admin',
  seller: '/seller',
  agent: '/agent',
  engineer: '/engineer',
  buyer: '/shop',
};

export const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, borderTopColor: 'var(--volt-primary)' }} />
      <span>Loading...</span>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOMES[user.role] || '/'} replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={ROLE_HOMES[user.role] || '/'} replace />;
  return children;
};
