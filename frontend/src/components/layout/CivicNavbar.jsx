import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, PlusCircle, Search, FileText, User, LayoutDashboard } from 'lucide-react';
import './CivicNavbar.css';

export default function CivicNavbar() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="civic-header">
      <div className="civic-header-banner">
        <div className="container banner-content">
          <span>Official Civic Waste Intelligence Portal • Kopargaon Municipal Council</span>
          <span className="prototype-tag">Hackathon Prototype</span>
        </div>
      </div>
      <nav className="civic-navbar">
        <div className="container nav-container">
          <Link to="/" className="nav-brand">
            <div className="brand-logo-badge">
              <ShieldAlert size={24} />
            </div>
            <div className="brand-text">
              <span className="brand-title">Kopargaon Waste Intelligence</span>
              <span className="brand-subtitle">Civic Resource Platform</span>
            </div>
          </Link>

          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
            <Link to="/report/waste" className={`nav-link ${isActive('/report/waste') ? 'active' : ''}`}>
              <PlusCircle size={16} />
              Report Issue
            </Link>
            <Link to="/track" className={`nav-link ${isActive('/track') ? 'active' : ''}`}>
              <Search size={16} />
              Track Status
            </Link>
            <Link to="/my-reports" className={`nav-link ${isActive('/my-reports') ? 'active' : ''}`}>
              <FileText size={16} />
              My Reports
            </Link>
          </div>

          <div className="nav-actions">
            <Link to="/admin" className="btn-admin-nav" title="Municipal Operations Console">
              <LayoutDashboard size={15} />
              <span>Admin Console</span>
            </Link>
            <Link to="/report/waste" className="btn-primary btn-report-nav">
              <PlusCircle size={16} />
              <span>New Report</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}