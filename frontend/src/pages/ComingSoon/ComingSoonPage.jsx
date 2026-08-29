import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';

export default function ComingSoonPage() {
  const { category } = useParams();
  const formattedTitle = category 
    ? category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')
    : 'Civic Service';

  return (
    <div className="container">
      <div className="shell-container" style={{ textAlign: 'center', maxWidth: '600px' }}>
        <div className="shell-icon-wrapper" style={{ margin: '0 auto 1.5rem', width: '64px', height: '64px' }}>
          <Clock size={32} />
        </div>
        <h1>{formattedTitle}</h1>
        <p className="shell-badge" style={{ marginBottom: '1.5rem' }}>Coming Soon • Future Municipal Scope</p>
        
        <p className="shell-description">
          The <strong>{formattedTitle}</strong> module is currently scheduled for upcoming expansion of the Kopargaon Municipal Intelligence Platform. 
          Currently, the <strong>Waste Management</strong> module is fully active.
        </p>

        <div className="shell-actions" style={{ justifyContent: 'center', marginTop: '2rem' }}>
          <Link to="/report/waste" className="btn-primary">
            Report Waste Issue
          </Link>
          <Link to="/" className="btn-secondary">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
