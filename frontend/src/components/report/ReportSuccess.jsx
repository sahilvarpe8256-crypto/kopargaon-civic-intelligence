import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldAlert, ArrowRight, RotateCcw, Home, Copy, Check } from 'lucide-react';
import './ReportSuccess.css';

export default function ReportSuccess({ report, onReset }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (report?.reportId) {
      navigator.clipboard?.writeText(report.reportId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="report-success-card">
      <div className="success-icon-badge">
        <CheckCircle2 size={48} />
      </div>

      <h2 className="success-heading">Report Submitted Successfully</h2>
      <p className="success-subheading">
        Your civic waste report has been officially registered in the Kopargaon Civic Intelligence system.
      </p>

      {/* Report ID Presentation Card */}
      <div className="report-id-container">
        <span className="report-id-label">Official Report ID</span>
        <div className="report-id-box">
          <span className="report-id-value">{report?.reportId || 'KOP-WI-2026-4821'}</span>
          <button 
            type="button" 
            className="btn-copy-id"
            onClick={handleCopy}
            title="Copy Report ID"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <p className="report-id-hint">
          Keep this Report ID handy to track real-time inspection, priority scoring, and municipal dispatch.
        </p>
      </div>

      {/* Meta Grid */}
      <div className="success-meta-grid">
        <div className="meta-card">
          <span className="meta-label">Current Status</span>
          <span className="meta-val status-badge-pill">SUBMITTED</span>
        </div>
        <div className="meta-card">
          <span className="meta-label">Calculated Priority</span>
          <span className="meta-val priority-val">{report?.aiAssessment?.level || 'HIGH'}</span>
        </div>
        <div className="meta-card">
          <span className="meta-label">Municipal Ward</span>
          <span className="meta-val">{report?.location?.area || 'Kopargaon Zone Z01'}</span>
        </div>
        <div className="meta-card">
          <span className="meta-label">Expected Resolution</span>
          <span className="meta-val">24-48 Hours</span>
        </div>
      </div>

      {/* Next Steps CTA */}
      <div className="success-cta-actions">
        <Link 
          to={`/track/${report?.reportId}`} 
          className="btn-primary btn-cta-track"
        >
          <span>Track This Report</span>
          <ArrowRight size={18} />
        </Link>
        <button 
          type="button" 
          className="btn-secondary"
          onClick={onReset}
        >
          <RotateCcw size={16} />
          <span>Submit Another Report</span>
        </button>
        <Link to="/" className="btn-secondary">
          <Home size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}