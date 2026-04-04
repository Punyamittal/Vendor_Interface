import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Store, ArrowRight, AlertCircle, LogOut, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './Login.css';

const VENDOR_LOGIN_NOTICE_KEY = 'vendor_login_notice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const { login, logout, user, shop, profile, loading, mustChangePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const notice = sessionStorage.getItem(VENDOR_LOGIN_NOTICE_KEY);
      if (notice) {
        setLocalError(notice);
        sessionStorage.removeItem(VENDOR_LOGIN_NOTICE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (user && profile) {
      if (mustChangePassword) return; // Stay on login to let ProtectedRoute show ChangePassword
      if (shop) {
        const from = location.state?.from?.pathname || '/live-orders';
        navigate(from, { replace: true });
      }
    }
  }, [user, profile, shop, mustChangePassword, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    const { error } = await login(email, password);
    if (error) setLocalError(error);
  };

  // Error state for Deactivated Account
  if (user && profile && !profile.is_active) {
    return (
      <div className="error-screen light">
        <div className="error-content">
          <div className="error-icon-box danger"><XCircle size={32} /></div>
          <h1>Account deactivated</h1>
          <p>Your vendor account has been deactivated. Contact the campus admin to reactivate.</p>
          <button className="auth-btn dark" onClick={logout}>Back to login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-split">
      {/* Left Panel - 40% */}
      <div className="login-side-dark">
        <div className="brand">
          <Store size={40} className="brand-icon" />
          <h1 className="brand-name">VendorPortal</h1>
          <p className="brand-tagline">Manage your stall, live</p>
        </div>
        
        <div className="decorative-orders">
          <div className="mock-card card-1"><div className="line l1"></div><div className="line l2"></div></div>
          <div className="mock-card card-2"><div className="line l1"></div><div className="line l2"></div></div>
          <div className="mock-card card-3"><div className="line l1"></div><div className="line l2"></div></div>
        </div>
      </div>

      {/* Right Panel - 60% */}
      <div className="login-side-light">
        <div className="login-form-container">
          <div className="form-header">
            <h2>Sign in to your stall</h2>
            <p>Access provided by campus administration</p>
          </div>

          {localError && (
            <div className="inline-error">
              <AlertCircle size={18} />
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-group">
              <label>Vendor email</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@vit.ac.in"
                  required
                />
              </div>
            </div>

            <div className="auth-group">
              <div className="label-row">
                <label>Password</label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>
              <div className="auth-input-wrapper">
                <Lock size={18} className="input-icon" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-options">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={keepSignedIn} 
                  onChange={e => setKeepSignedIn(e.target.checked)}
                />
                <span>Keep me signed in</span>
              </label>
            </div>

            <button type="submit" className="auth-btn dark" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="form-footer">
            <div className="divider"></div>
            <p className="footer-note">New vendor? Your login is sent by the campus admin.</p>
            <p className="footer-contact">Contact: <span>admin@vit.ac.in</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
