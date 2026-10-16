import { Navigate } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext.jsx';

export default function ProtectedRoute({ allowedRole, children }) {
  const { role, user } = useAuth();
  if (!user?.accessToken || !role || (allowedRole && role !== allowedRole)) return <Navigate to="/login" replace />;
  return children;
}
