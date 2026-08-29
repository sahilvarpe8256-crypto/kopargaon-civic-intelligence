import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, UserPlus, Lock, Mail, Phone, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { registerUser } from '../../services/api';
import './AuthPage.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await registerUser(name, email, phone, password);
      if (res.success) {
        navigate('/my-reports');
      } else {
        setError(res.error?.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
              <UserPlus size={26} />
            </div>
            <div>
              <h1 className="auth-title">Create Citizen Account</h1>
              <p className="auth-subtitle">Kopargaon Civic Intelligence Portal</p>
            </div>
          </div>

          <p className="auth-desc">
            Register to submit verified civic reports, track resolution progress, and receive official municipal notifications.
          </p>

          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="reg-name">Full Name *</label>
              <div className="auth-input-box">
                <User size={16} className="auth-input-icon" />
                <input
                  id="reg-name"
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Rahul Patil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="reg-email">Email Address *</label>
              <div className="auth-input-box">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="reg-email"
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
              <label htmlFor="reg-phone">Mobile Number (Optional)</label>
              <div className="auth-input-box">
                <Phone size={16} className="auth-input-icon" />
                <input
                  id="reg-phone"
                  type="tel"
                  className="auth-input"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="reg-password">Password *</label>
              <div className="auth-input-box">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="reg-password"
                  type="password"
                  className="auth-input"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary btn-auth-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register Citizen Account'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="auth-footer-links">
            <span>Already have an account? <Link to="/auth/login">Sign In</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
}
