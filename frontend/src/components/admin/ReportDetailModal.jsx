import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Camera, 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  AlertOctagon, 
  Info
} from 'lucide-react';
import { updateReportStatus } from '../../services/reportStorage';
import './ReportDetailModal.css';

export default function ReportDetailModal({ report, onClose, onStatusUpdated }) {
  const [decisionFeedback, setDecisionFeedback] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(report?.photos?.[0]?.preview || null);

  if (!report) return null;

  const score = report.aiAssessment?.score || 65;
  const level = report.aiAssessment?.level || 'HIGH';
  const indicators = report.indicators || [];
  const reasoning = report.aiAssessment?.reasoning || [];
  const photos = report.photos || [];

  const handleDecision = (newStatus, label) => {
    updateReportStatus(report.reportId, newStatus, `Officer Action: ${label}`);
    setDecisionFeedback(`Report status updated to ${newStatus}`);
    if (onStatusUpdated) {
      onStatusUpdated({
        ...report,
        status: newStatus
      });
    }
    setTimeout(() => {
      setDecisionFeedback(null);
    }, 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="report-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-report-id">{report.reportId}</span>
            <span className="modal-priority-badge">{level} • {score}/100</span>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {decisionFeedback && (
          <div className="modal-feedback-banner">
            <CheckCircle size={16} />
            <span>{decisionFeedback}</span>
          </div>
        )}

        <div className="modal-scroll-body">
          <div className="modal-section-card">
            <div className="issue-headline-row">
              <h2 className="modal-issue-title">{report.wasteType}</h2>
              <span className="modal-status-badge">Status: {report.status || 'UNDER_REVIEW'}</span>
            </div>

            <div className="modal-kv-grid">
              <div className="m-kv">
                <span className="m-lbl">Citizen Severity</span>
                <span className="m-val">{report.severity}</span>
              </div>
              <div className="m-kv">
                <span className="m-lbl">Submitted At</span>
                <span className="m-val">{new Date(report.submittedAt).localeDateString()}</span>
              </div>
              <div className="m-kv">
                <span className="m-lbl">Municipal Area</span>
                <span className="m-val">{report.location?.area || 'Kopargaon Zone'}</span>
              </div>
              <div className="m-kv">
                <span className="m-lbl">GPS Pin</span>
                <span className="m-val">{report.location?.latitude}° N, {report.location?.longitude}° E</span>
              </div>
            </div>


            {report.description && (
              <div className="modal-description-box">
                <span className="m-lbl">Citizen Description:</span>
                <p className="m-desc-text">"{report.description}"</p>
              </div>
            )}

            {indicators.length > 0 && (
              <div className="modal-indicators-row">
                <span className="m-lbl">Reported Risk Indicators:</span>
                <div className="indicators-chip-list">
                  {indicators.map((ind, i) => (
                    <span key={i} className="ind-pill">{ind}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-section-card ai-assessment-highlight">
            <div className="section-title-row">
              <Sparkles size={18} className="sparkle-icon" />
              <h3 className="section-heading">AI Evidence Assessment & Priority Score</h3>
            </div>

            <div className="ai-modal-metrics">
              <div className="ai-metric-item">
                <span className="ai-metric-val">{score} / 100</span>
                <span className="ai-metric-lbl">Civic Urgency Score</span>
              </div>
              <div className="ai-metric-item">
                <span className="ai-metric-val">{report.aiAssessment?.confidence || 86}%</span>
                <span className="ai-metric-lbl">Confidence</span>
              </div>
              <div className="ai-metric-item">
                <span className="ai-metric-val">{level}</span>
                <span className="ai-metric-lbl">Priority Class</span>
              </div>
            </div>

            {report.aiAssessment?.recommendedResponse && (
              <div className="response-recommendation-box">
                <strong>Recommended Action:</strong> {report.aiAssessment.recommendedResponse}
              </div>
            )}

            {reasoning.length > 0 && (
              <div className="ai-reasoning-container">
                <span className="m-lbl">Contributing Algorithmic Factors:</span>
                <ul className="ai-modal-reasons">
                  {reasoning.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="ai-modal-disclaimer">
              <Info size={14} />
              <span>AI recommendations provide objective evidence scoring. Municipal officers retain ultimate authority.</span>
            </div>
          </div>

          {photos.length > 0 && (
            <div className="modal-section-card">
              <div className="section-title-row">
                <Camera size={18} />
                <h3 className="section-heading">Uploaded Photo Evidence ({photos.length})</h3>
              </div>

              {selectedPhoto && (
                <div className="modal-main-photo-view">
                  <img 
                    src={selectedPhoto} 
                    alt="Main evidence view" 
                    className="main-evidence-img"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 24 24" fill="none" stroke="%2364748b" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>';
                    }}
                  />
                </div>
              )}

              <div className="modal-photo-thumbnails">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`thumb-btn ${selectedPhoto === photo.preview ? "active-thumb" : ""}`}
                    onClick={() => setSelectedPhoto(photo.preview)}
                  >
                    <img 
                      src={photo.preview} 
                      alt={`Thumb ${i + 1}`}
                      className="thumb-img"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="%2364748b" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>';
                      }}
                    />
                    <span className="thumb-label">{photo.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="modal-section-card officer-decision-card">
            <div className="section-title-row">
              <ShieldCheck size={18} />
              <h3 className="section-heading">Officer Action & Resource Allocation</h3>
            </div>

            <p className="decision-helper-text">
              Select an action to update report state in the municipal queue:
            </p>

            <div className="decision-buttons-row">
              <button
                type="button"
                className="btn-action-accept"
                onClick={() => handleDecision('APPROVED', 'Accepted for Action')}
              >
                <CheckCircle size={16} />
                <span>Accept for Action</span>
              </button>


              <button
                type="button"
                className="btn-action-review"
                onClick={() => handleDecision('UNDER_REVIEW', 'Marked for Review')}
              >
                <Clock size={16} />
                <span>Mark for Review</span>
              </button>

              <button
                type="button"
                className="btn-action-defer"
                onClick={() => handleDecision('DEFERRED', 'Deferred')}
              >
                <AlertOctagon size={16} />
                <span>Defer Report</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
