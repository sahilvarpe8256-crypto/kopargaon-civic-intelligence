import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, Building2, AlertCircle } from 'lucide-react';
import { loginUser } from '../../services/api';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const [officerId, setOfficerId] = useState('officer.kopargaon@gov.in');
  const [password, setPassword] = useState('demo-municipal-2026');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await loginUser(officerId, password);
      if (res.success) {
        navigate('/admin/dashboard');
      } else {
        setError(res.error?.message || 'Authentication failed.');
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setOfficerId('officer.kopargaon@gov.in');
    setPassword('demo-municipal-2026');
    setIsLoading(true);
    setError(null);
    try {
      await loginUser('officer.kopargaon@gov.in', 'demo-municipal-2026');
      navigate('/admin/dashboard');
    } catch {
      navigate('/admin/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-backdrop-decor" />
      <div className="admin-login-card">
        {/* Top Brand Area */}
        <div className="login-header-box">
          <div className="login-brand-badge">
            <Building2 size={30} />
          </div>
          <div className="council-badge-pill">Kopargaon Municipal Council</div>
          <h1 className="login-title">Municipal Officer Portal</h1>
          <span className="login-sub-portal">Civic Intelligence &amp; Operations Command</span>
        </div>

        <div className="official-notice-strip">
          <ShieldCheck size={16} />
          <span>Restricted Portal • Authorized Municipal Personnel Only</span>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-field-group">
            <label className="field-lbl">Officer ID / Official Email</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                className="login-input"
                placeholder="e.g. officer.ward1@kopargaon.gov.in"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field-group">
            <label className="field-lbl">Security Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="login-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary btn-submit-login" disabled={isLoading}>
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Officer Portal'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Fast-Login Option */}
        <div className="demo-login-box">
          <div className="divider-line">
            <span>or use prototype access</span>
          </div>
          <button type="button" className="btn-demo-quick-login" onClick={handleDemoLogin} disabled={isLoading}>
            <CheckCircle2 size={16} className="check-green" />
            <span>1-Click Demo Officer Login</span>
          </button>
        </div>

        {/* Return link */}
        <div className="login-footer-row">
          <Link to="/" className="return-citizen-link">
            ← Return to Citizen Portal
          </Link>
        </div>
      </div>
    </div>
  );
}