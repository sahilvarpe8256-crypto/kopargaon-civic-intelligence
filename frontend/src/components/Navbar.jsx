import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, FilePlus, ClipboardList, LayoutDashboard, LogIn, LogOut, User } from 'lucide-react';
import { AuthService } from '../services/authService';

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    if (onLogout) onLogout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="civic-top-bar">
        <span>🏛️ Kopargaon Municipal Council (KMC) • Department of Solid Waste & Civic Health</span>
        <span>Helpline: 02423-222333 • 24x7 Citizen Monitoring</span>
      </div>
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <Shield className="w-6 h-6 text-emerald-600" style={{ color: 'var(--primary-600)' }} />
          <span>Kopargaon Civic Intelligence</span>
          <span className="nav-brand-badge">PROTOTYPE</span>
        </Link>

        <nav className="nav-links">
          <Link
            to="/report"
            className={`nav-link ${location.pathname === '/report' || location.pathname === '/' ? 'active' : ''}`}
          >
            <FilePlus size={18} />
            <span>Report Waste</span>
          </Link>
          <Link
            to="/status"
            className={`nav-link ${location.pathname.startsWith('/status') ? 'active' : ''}`}
          >
            <ClipboardList size={18} />
            <span>Track Complaint</span>
          </Link>
          <Link
            to="/dashboard"
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Municipal Dashboard</span>
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <User size={15} />
                <strong>{user.name}</strong> ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                title="Logout"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.875rem' }}>
              <LogIn size={16} />
              <span>Officer Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}