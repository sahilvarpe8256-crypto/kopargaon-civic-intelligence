import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogIn, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { loginUser } from '../../services/api';
import './AuthPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('citizen@kopargaon.gov.in');
  const [password, setPassword] = useState('citizen123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginUser(email, password);
      if (res.success) {
        navigate('/my-reports');
      } else {
        setError(res.error?.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-page-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon-badge">
              <LogIn size={26} />
            </div>
            <div>
              <h1 className="auth-title">Citizen Login</h1>
              <p className="auth-subtitle">Kopargaon Civic Intelligence Portal</p>
            </div>
          </div>

          <p className="auth-desc">
            Sign in to track your submitted civic reports, receive real-time municipal updates, and view resolution history.
          </p>

          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="login-email">Registered Email</label>
              <div className="auth-input-box">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="login-password">Password</label>
              <div className="auth-input-box">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="login-password"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary btn-auth-submit" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In to Citizen Portal'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="auth-quick-hint">
            <ShieldCheck size={16} />
            <span>
              Demo Citizen Account: <code>citizen@kopargaon.gov.in</code> / <code>citizen123</code>
            </span>
          </div>

          <div className="auth-footer-links">
            <span>Don't have an account? <Link to="/auth/register">Create Citizen Account</Link></span>
            <span>Are you a municipal officer? <Link to="/admin/login">Officer Portal</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
}
