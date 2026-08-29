import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, PlusCircle, Search, ShieldCheck, ArrowRight } from 'lucide-react';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found-page-container">
      <div className="not-found-card">
        <div className="not-found-badge-icon">
          <Compass size={40} />
        </div>

        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Civic Portal Page Not Found</h1>
        <p className="not-found-desc">
          The civic intelligence resource or municipal page you requested does not exist or has been relocated within the Kopargaon Civic jurisdiction.
        </p>

        <div className="not-found-actions-grid">
          <Link to="/" className="nf-btn nf-btn-primary">
            <Home size={16} />
            <span>Citizen Home</span>
          </Link>
          <Link to="/report/waste" className="nf-btn nf-btn-secondary">
            <PlusCircle size={16} />
            <span>Report Civic Issue</span>
          </Link>
          <Link to="/track" className="nf-btn nf-btn-secondary">
            <Search size={16} />
            <span>Track Issue Status</span>
          </Link>
          <Link to="/admin/login" className="nf-btn nf-btn-admin">
            <ShieldCheck size={16} />
            <span>Municipal Admin</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
