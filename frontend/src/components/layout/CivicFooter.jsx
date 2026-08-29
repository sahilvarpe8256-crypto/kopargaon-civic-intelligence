import React from 'react';
import { ShieldCheck } from 'lucide-react';
import './CivicFooter.css';

export default function CivicFooter() {
  return (
    <footer className="civic-footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="footer-badge">
            <ShieldCheck size={18} />
            <span>Kopargaon Municipal Council</span>
          </div>
          <p className="footer-disclaimer">
            This platform is an AI-assisted civic waste management prototype built for demonstration.
            AI evidence assessment is used exclusively for structured witness analysis. Final decisions rest with Municipal Officers.
          </p>
        </div>
        <div className="footer-meta">
          <p className="footer-coords">Restricted to Kopargaon Zone • Lat: 19.8833° N, Lng: 74.4667° E</p>
          <p className="footer-copy">© 2026 Kopargaon Waste Intelligence Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
