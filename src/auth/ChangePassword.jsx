import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { Lock, CheckCircle2, XCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ChangePassword = () => {
  const { user, setMustChangePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const requirements = [
    { label: 'Min 8 characters', test: p => p.length >= 8 },
    { label: 'Include 1 number', test: p => /[0-9]/.test(p) },
    { label: 'Include 1 special char', test: p => /[^A-Za-z0-9]/.test(p) }
  ];

  const strength = requirements.filter(r => r.test(password)).length;
  const strengthColor = ['#ef4444', '#f59e0b', '#10b981'][strength - 1] || '#e2e8f0';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (strength < 3) {
      toast.error('Please meet all security requirements.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    
    if (authError) {
      toast.error(authError.message);
      setLoading(false);
      return;
    }

    // Update profile to mark password as changed
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ must_change_password: false })
      .eq('id', user.id);

    if (profileError) {
      toast.error('Failed to update profile. Contact admin.');
      setLoading(false);
      return;
    }

    setMustChangePassword(false);
    toast.success('Password updated successfully!');
  };

  return (
    <div className="change-pw-overlay">
      <Toaster />
      <div className="change-pw-card">
        <div className="pw-header">
          <div className="pw-icon-box">
            <Lock size={32} />
          </div>
          <h2>Set your password</h2>
          <p>For security, please set a new password before continuing.</p>
        </div>

        <form onSubmit={handleSubmit} className="pw-form">
          <div className="pw-group">
            <label>New Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <div className="strength-bar-container">
              <div 
                className="strength-bar" 
                style={{ width: `${(strength / 3) * 100}%`, backgroundColor: strengthColor }}
              ></div>
            </div>
            
            <div className="requirements-list">
              {requirements.map((r, i) => (
                <div key={i} className={`req-item ${r.test(password) ? 'valid' : ''}`}>
                  {r.test(password) ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  <span>{r.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pw-group">
            <label>Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          <button type="submit" className="pw-btn" disabled={loading}>
            {loading ? 'Setting password...' : 'Set password'}
          </button>
        </form>
      </div>

      <style>{`
        .change-pw-overlay { position: fixed; inset: 0; background: #fff; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .change-pw-card { border-radius: 24px; padding: 3rem; background: white; max-width: 480px; width: 100%; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border: 1px solid #f1f5f9; }
        .pw-header { text-align: center; margin-bottom: 2.5rem; }
        .pw-icon-box { background: #eff6ff; color: #2563eb; width: 64px; height: 64px; border-radius: 16px; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; }
        .pw-header h2 { color: #0f172a; margin-bottom: 0.5rem; font-size: 1.75rem; font-weight: 800; letter-spacing: -0.025em; }
        .pw-header p { color: #64748b; font-size: 0.95rem; line-height: 1.5; }
        .pw-group { margin-bottom: 1.5rem; }
        .pw-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #1e293b; margin-bottom: 0.5rem; }
        .pw-group input { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; }
        .strength-bar-container { height: 4px; background: #f1f5f9; margin-top: 0.5rem; border-radius: 2px; overflow: hidden; }
        .strength-bar { height: 100%; transition: all 0.3s ease; }
        .requirements-list { margin-top: 1rem; display: grid; grid-template-columns: 1fr; gap: 0.5rem; }
        .req-item { display: flex; align-items: center; gap: 0.5rem; color: #94a3b8; font-size: 0.85rem; }
        .req-item.valid { color: #10b981; }
        .pw-btn { width: 100%; padding: 0.875rem; background: #2563eb; color: white; border-radius: 12px; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); margin-top: 1rem; }
        .pw-btn:hover { background: #1d4ed8; }
        .pw-btn:disabled { background: #94a3b8; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default ChangePassword;
