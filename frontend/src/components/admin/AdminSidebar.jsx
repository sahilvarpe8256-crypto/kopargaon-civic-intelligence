import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  FileText, 
  Flame, 
  Layers, 
  Compass,
  UserCheck, 
  ExternalLink,
  ChevronRight,
  X,
  LogOut,
  Building2
} from 'lucide-react';
import './AdminSidebar.css';

export default function AdminSidebar({ activeSection, onSelectSection, isMobileOpen, onCloseMobile }) {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Reports', path: '/admin/reports', icon: FileText, badge: '12' },
    { id: 'map', label: 'Civic GIS Map', path: '/admin/map', icon: Compass, badge: 'GIS' },
    { id: 'priority', label: 'Priority Intelligence', path: '/admin/dashboard#priority', icon: Flame, badge: 'AI' },
    { id: 'duplicates', label: 'Duplicate Clusters', path: '/admin/dashboard#duplicates', icon: Layers, badge: '7' },
  ];

  const handleNav = (item) => {
    if (onSelectSection) onSelectSection(item.id);
    if (item.path) {
      if (item.path.includes('#')) {
        navigate('/admin/dashboard');
        setTimeout(() => {
          const hash = item.path.split('#')[1];
          const elem = document.getElementById(hash);
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        navigate(item.path);
      }
    }
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {isMobileOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}
      <aside className={`admin-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand" onClick={() => navigate('/admin/dashboard')} style={{ cursor: 'pointer' }}>
            <div className="sidebar-logo-badge">
              <Building2 size={22} />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-title">Kopargaon Civic</span>
              <span className="sidebar-subtitle">Intelligence Admin</span>
            </div>
            {isMobileOpen && (
              <button type="button" className="btn-close-mobile-nav" onClick={onCloseMobile}>
                <X size={20} />
              </button>
            )}
          </div>

          <nav className="sidebar-nav">
            <span className="nav-section-heading">Command Navigation</span>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNav(item)}
                >
                  <div className="nav-item-content">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`nav-badge ${item.badge.toLowerCase()}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight size={14} className="active-arrow" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="citizen-portal-link-box">
            <Link to="/" className="btn-to-citizen">
              <span>Citizen Portal</span>
              <ExternalLink size={14} />
            </Link>
          </div>

          <div className="sidebar-divider-line" />

          <div className="officer-profile-card">
            <div className="officer-avatar">
              <UserCheck size={18} />
            </div>
            <div className="officer-info">
              <span className="officer-name">Municipal Officer</span>
              <span className="officer-dept">Officer Profile (KMC)</span>
            </div>
            <Link to="/admin/login" className="btn-sidebar-logout" title="Officer Logout">
              <LogOut size={15} />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}