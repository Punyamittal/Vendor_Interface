import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Store, LogOut } from 'lucide-react';
import ChangePassword from './ChangePassword';

export function ProtectedRoute({ children }) {
  const { user, profile, shop, loading, logout, mustChangePassword } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="full-page-center">
        <LoadingSpinner />
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading your stall...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // FORCE Password Change on first login
  if (mustChangePassword) {
    return <ChangePassword />;
  }

  // Handle NO SHOP ASSIGNED case
  if (!shop) {
    return (
      <div className="full-page-center no-shop-screen">
        <div className="no-shop-card">
          <Store size={64} className="no-shop-icon" />
          <h2>No shop assigned yet</h2>
          <p>
            Your account is ready but no stall has been assigned to you. 
            Please contact the campus administrator.
          </p>
          <button className="signout-btn" onClick={logout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
        <style>{`
          .no-shop-screen { background: #f8fafc; height: 100vh; flex-direction: column; }
          .no-shop-card { text-align: center; max-width: 400px; padding: 2rem; }
          .no-shop-icon { color: #94a3b8; margin-bottom: 1.5rem; }
          .no-shop-card h2 { color: #0f172a; margin-bottom: 1rem; }
          .no-shop-card p { color: #64748b; margin-bottom: 2rem; line-height: 1.6; }
          .signout-btn { width: 100%; padding: 0.75rem; background: #0f172a; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        `}</style>
      </div>
    );
  }

  return children;
}
