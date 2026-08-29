import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Search, ArrowRight, ShieldAlert, Clock, Droplets, Lightbulb, Construction, Trees, Flame, Dog } from 'lucide-react';

export default function HomePage() {
  const civicCategories = [
    { id: 'waste', name: 'Waste Management', desc: 'Report illegal dumping, overflowing bins, and public litter.', icon: Trash2, active: true, route: '/report/waste' },
    { id: 'water', name: 'Water & Leakage', desc: 'Water pipeline leaks and contamination.', icon: Droplets, active: false, route: '/report/water' },
    { id: 'lighting', name: 'Street Lighting', desc: 'Faulty streetlights and dark stretches.', icon: Lightbulb, active: false, route: '/report/lighting' },
    { id: 'roads', name: 'Roads & Potholes', desc: 'Potholes and broken road infrastructure.', icon: Construction, active: false, route: '/report/roads' },
    { id: 'spaces', name: 'Public Spaces', desc: 'Encroachment and park maintenance.', icon: Trees, active: false, route: '/report/spaces' },
    { id: 'hazards', name: 'Disaster / Hazards', desc: 'Open drainage, fire risks, and hazards.', icon: Flame, active: false, route: '/report/hazards' },
    { id: 'animals', name: 'Stray Animals', desc: 'Stray cattle and aggressive packs.', icon: Dog, active: false, route: '/report/animals' },
  ];

  return (
    <div className="container">
      <div className="shell-container" style={{ maxWidth: '1000px' }}>
        <div className="shell-header">
          <div className="shell-icon-wrapper">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1>Citizen Civic Intelligence</h1>
            <p className="shell-badge">Kopargaon Municipal Waste Management System</p>
          </div>
        </div>

        <p className="shell-description">
          Welcome to the Kopargaon Civic Intelligence Platform. Report civic waste issues with photo evidence and location data. 
          Our system uses AI visual assessment to provide structured evidence to Municipal Officers for transparent resource prioritization.
        </p>

        <div className="shell-info-box">
          <strong>Foundation State (Phase 1):</strong> This is the initial frontend foundation shell. Navigation and routes are active. 
          Select <strong>Waste Management</strong> below to preview the reporting flow shell.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          {civicCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div 
                key={cat.id} 
                style={{ 
                  border: cat.active ? '2px solid var(--civic-primary)' : '1px solid var(--border-subtle)',
                  background: cat.active ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: cat.active ? 1 : 0.75
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: 'var(--radius-sm)', 
                      background: cat.active ? 'var(--civic-primary-light)' : '#e2e8f0',
                      color: cat.active ? 'var(--civic-primary)' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={20} />
                    </div>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: cat.active ? 'var(--status-approved-bg)' : '#e2e8f0',
                      color: cat.active ? 'var(--status-approved)' : '#64748b'
                    }}>
                      {cat.active ? 'Active' : 'Coming Soon'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{cat.name}</h3>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>{cat.desc}</p>
                </div>
                {cat.active ? (
                  <Link to={cat.route} className="btn-primary" style={{ width: '100%', padding: '0.5rem' }}>
                    <span>Report Issue</span>
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <Link to={cat.route} className="btn-secondary" style={{ width: '100%', padding: '0.5rem', justifyContent: 'center', fontSize: '0.85rem' }}>
                    <span>View Details</span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <div className="shell-actions" style={{ marginTop: '2rem', justifyContent: 'center' }}>
          <Link to="/track" className="btn-secondary">
            <Search size={16} />
            <span>Track Existing Report</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
