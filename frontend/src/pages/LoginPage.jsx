import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle } from 'lucide-react';
import { AuthService } from '../services/authService';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await AuthService.login(email.trim(), password);
      if (onLoginSuccess) onLoginSuccess(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid officer credentials. Please check email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoAccount = (role) => {
    if (role === 'supervisor') {
      setEmail('supervisor@kopargaon.gov.in');
      setPassword('password123');
    } else {
      setEmail('admin@kopargaon.gov.in');
      setPassword('password123');
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              background: 'var(--primary-50)',
              color: 'var(--primary-600)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem'
            }}
          >
            <Shield size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--slate-900)' }}>Municipal Officer Sign-In</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Kopargaon Civic Intelligence Operations Portal
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Official Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="officer@kopargaon.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Operations Console'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.775rem', color: 'var(--slate-500)', display: 'block', marginBottom: '0.5rem', textAlign: 'center' }}>
            ⚡ Quick Demo Accounts:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setDemoAccount('supervisor')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem' }}
            >
              Supervisor Demo
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('admin')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem' }}
            >
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}