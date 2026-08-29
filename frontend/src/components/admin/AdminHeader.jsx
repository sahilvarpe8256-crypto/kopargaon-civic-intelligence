import React, { useState } from 'react';
import { Menu, Bell, ShieldCheck, Activity, CheckCircle2 } from 'lucide-react';
import './AdminHeader.css';

export default function AdminHeader({ onOpenMobileSidebar, unreviewedCount = 0 }) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="admin-header">
      <div className="header-left">
        <button 
          type="button" 
          className="btn-mobile-menu"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-title-group">
          <div className="header-headline-row">
            <h1 className="admin-header-title">Municipal Intelligence Dashboard</h1>
            <span className="system-live-pill">
              <span className="live-pulse-dot" />
              <span>System Operational</span>
            </span>
          </div>
          <span className="admin-header-sub">
            Kopargaon Municipal Council • Waste Management Command
          </span>
        </div>
      </div>

      <div className="header-right">
        {/* Notification Bell */}
        <div className="notification-wrapper">
          <button 
            type="button" 
            className="btn-header-icon"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreviewedCount > 0 && (
              <span className="notification-count-dot">{unreviewedCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notif-dropdown-header">
                <span className="notif-title">Officer Alerts</span>
                <span className="notif-sub">{unreviewedCount} reports need action</span>
              </div>
              <div className="notif-list">
                <div className="notif-item">
                  <Activity size={14} className="notif-icon" />
                  <div className="notif-item-text">
                    <strong>AI Priority Engine active</strong>
                    <span>Scoring incoming citizen waste submissions.</span>
                  </div>
                </div>
                <div className="notif-item">
                  <CheckCircle2 size={14} className="notif-icon green" />
                  <div className="notif-item-text">
                    <strong>Zone Z01 &amp; Z02 Sync</strong>
                    <span>GPS boundary polygon checks passing.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Officer Status Badge */}
        <div className="officer-status-badge">
          <ShieldCheck size={16} className="officer-badge-icon" />
          <span className="officer-badge-text">Officer Mode (Authorized)</span>
        </div>
      </div>
    </header>
  );
}