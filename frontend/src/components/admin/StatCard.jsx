import React from 'react';
import './StatCard.css';

export default function StatCard({ title, value, subtitle, icon: Icon, variant = 'primary', trend }) {
  return (
    <div className={`stat-card stat-${variant}`}>
      <div className="stat-top-row">
        <span className="stat-title">{title}</span>
        <div className="stat-icon-wrapper">
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-number-row">
        <span className="stat-value">{value}</span>
        {trend && <span className="stat-trend-tag">{trend}</span>}
      </div>
      {subtitle && <span className="stat-subtitle">{subtitle}</span>}
    </div>
  );
}