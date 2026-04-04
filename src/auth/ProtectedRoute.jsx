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
        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Loading your stall...</p>
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
          .no-shop-screen { background: #060a12; height: 100vh; flex-direction: column; }
          .no-shop-card {
            text-align: center; max-width: 420px; padding: 2.5rem;
            border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);
            background: linear-gradient(165deg, rgba(255,255,255,0.08) 0%, rgba(22,30,48,0.6) 100%);
            backdrop-filter: blur(20px);
            box-shadow: 0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1);
          }
          .no-shop-icon { color: #fb923c; margin-bottom: 1.5rem; filter: drop-shadow(0 8px 20px rgba(249,115,22,0.3)); }
          .no-shop-card h2 { color: #f8fafc; margin-bottom: 1rem; font-family: Outfit, system-ui, sans-serif; }
          .no-shop-card p { color: #94a3b8; margin-bottom: 2rem; line-height: 1.6; }
          .signout-btn { width: 100%; padding: 0.85rem; background: linear-gradient(135deg, #f97316, #ea580c); color: white; border-radius: 14px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 600; box-shadow: 0 8px 28px rgba(249,115,22,0.35); }
        `}</style>
      </div>
    );
  }

  return children;
}
