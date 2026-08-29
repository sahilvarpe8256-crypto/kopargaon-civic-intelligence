import React from 'react';
import { Shield, Sparkles, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#fff', fontWeight: 700 }}>
            <Shield size={20} style={{ color: 'var(--primary-500)' }} />
            <span>Kopargaon Civic Intelligence Platform</span>
          </div>
          <p style={{ lineHeight: 1.6, color: 'var(--slate-400)', fontSize: '0.85rem' }}>
            Empowering citizens and municipal sanitation supervisors with Google Gemini Vision AI observation,
            instant hazard assessment, and deterministic resource allocation for a cleaner Kopargaon.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.75rem' }}>Prototype Coverage Zones</h4>
          <ul style={{ listStyle: 'none', color: 'var(--slate-400)', fontSize: '0.825rem', lineHeight: 1.8 }}>
            <li>📍 Z01: Kopargaon Market Area (Pop: 12,000)</li>
            <li>📍 Z02: Station Road Belt (Pop: 9,500)</li>
            <li>📍 Z03: Godavari Ghat & Temple Belt (Pop: 15,000)</li>
            <li>📍 Z04: Residential Colony & Schools (Pop: 8,000)</li>
            <li>📍 Z05: Industrial & Highway Zone (Pop: 4,500)</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.75rem' }}>System Intelligence</h4>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.825rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
            <Sparkles size={14} style={{ color: 'var(--accent-500)', display: 'inline', marginRight: '4px' }} />
            Gemini 2.0 Flash Vision analysis with strict 0–100 risk normalization and offline deterministic fallback.
          </p>
          <div style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
            ● Engine Status: Operational
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Kopargaon Municipal Council. All rights reserved.</span>
        <span>Autonomous Civic Waste Intelligence Hackathon Delivery</span>
      </div>
    </footer>
  );
}