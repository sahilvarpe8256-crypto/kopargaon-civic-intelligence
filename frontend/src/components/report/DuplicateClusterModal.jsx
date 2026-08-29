import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Sparkles, 
  MapPin, 
  Clock, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  SplitSquareVertical,
  Info
} from 'lucide-react';
import { saveClusterDecision } from '../../services/reportStorage';
import './DuplicateClusterModal.css';

export default function DuplicateClusterModal({ cluster, onClose, onClusterUpdated }) {
  const [feedback, setFeedback] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(cluster?.status || 'POSSIBLE');

  if (!cluster) return null;

  const isConfirmed = currentStatus === 'CONFIRMED';
  const isSeparate = currentStatus === 'SEPARATE';

  const handleConfirm = () => {
    saveClusterDecision(cluster.clusterId, 'CONFIRMED', 'Officer confirmed duplicate cluster');
    setCurrentStatus('CONFIRMED');
    setFeedback({
      type: 'success',
      message: `Cluster confirmed! ${cluster.reports.length} citizen reports mapped to 1 unified municipal issue.`
    });
    if (onClusterUpdated) {
      onClusterUpdated(cluster.clusterId, 'CONFIRMED');
    }
  };

  const handleKeepSeparate = () => {
    saveClusterDecision(cluster.clusterId, 'SEPARATE', 'Officer kept reports separate');
    setCurrentStatus('SEPARATE');
    setFeedback({
      type: 'info',
      message: `Reports kept separate. Duplicate warnings dismissed.`
    });
    if (onClusterUpdated) {
      onClusterUpdated(cluster.clusterId, 'SEPARATE');
    }
  };

  const formattedEarliest = cluster.earliestTime && cluster.earliestTime !== Infinity
    ? new Date(cluster.earliestTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Recent';

  return (
    <div className="cluster-modal-backdrop" onClick={onClose}>
      <div className="cluster-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="cluster-modal-header">
          <div className="cluster-title-group">
            <div className="cluster-icon-badge">
              <Layers size={22} />
            </div>
            <div>
              <div className="cluster-headline-row">
                <h2 className="cluster-modal-title">
                  {isConfirmed ? 'Confirmed Duplicate Cluster' : 'Possible Duplicate Reports'}
                </h2>
                <span className={`cluster-status-pill ${isConfirmed ? 'confirmed' : isSeparate ? 'separate' : 'possible'}`}>
                  {isConfirmed ? 'CONFIRMED DUPLICATE' : isSeparate ? 'KEPT SEPARATE' : 'POSSIBLE DUPLICATE'}
                </span>
              </div>
              <p className="cluster-modal-subtitle">
                {isConfirmed 
                  ? `${cluster.reports.length} citizen reports linked into 1 municipal resolution issue.`
                  : 'System-detected correlation across multiple citizen waste submissions.'}
              </p>
            </div>
          </div>

          <button type="button" className="btn-cluster-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div className={`cluster-feedback-banner ${feedback.type}`}>
            <CheckCircle size={16} />
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="cluster-modal-body">
          {/* Top Metric Summary Cards */}
          <div className="cluster-summary-grid">
            <div className="cluster-summary-item">
              <span className="summary-item-val">{cluster.reports.length} Reports</span>
              <span className="summary-item-lbl">Linked Submissions</span>
            </div>
            <div className="cluster-summary-item">
              <span className="summary-item-val">{cluster.confidence}%</span>
              <span className="summary-item-lbl">Duplicate Confidence</span>
            </div>
            <div className="cluster-summary-item">
              <span className="summary-item-val">{cluster.commonCategory}</span>
              <span className="summary-item-lbl">Common Issue</span>
            </div>
            <div className="cluster-summary-item">
              <span className="summary-item-val">{formattedEarliest}</span>
              <span className="summary-item-lbl">First Reported</span>
            </div>
          </div>

          {/* Confirmed Banner (If confirmed) */}
          {isConfirmed && (
            <div className="confirmed-cluster-banner">
              <CheckCircle2 size={20} className="banner-check-icon" />
              <div>
                <strong>Confirmed Municipal Duplicate</strong>
                <p>{cluster.reports.length} citizen reports are now routed to a single municipal crew dispatch to prevent duplicate field work. Individual reports remain preserved for audit history.</p>
              </div>
            </div>
          )}

          {/* Linked Reports List */}
          <div className="linked-reports-section">
            <h3 className="section-subtitle">
              Linked Citizen Reports ({cluster.reports.length})
            </h3>

            <div className="linked-reports-list">
              {cluster.reports.map((report) => {
                const photoCount = report.photos?.length || 0;
                const score = report.aiAssessment?.score || 70;

                return (
                  <div key={report.reportId} className="linked-report-card">
                    <div className="l-card-top">
                      <span className="l-report-id">{report.reportId}</span>
                      <div className="l-card-badges">
                        <span className="l-priority-badge">AI Score: {score}/100</span>
                        <span className="l-status-badge">{report.status || 'UNDER_REVIEW'}</span>
                      </div>
                    </div>

                    <p className="l-description">
                      "{report.description || 'No citizen description provided.'}"
                    </p>

                    <div className="l-meta-row">
                      <div className="l-meta-item">
                        <MapPin size={13} />
                        <span>{report.location?.area || report.location?.address || 'Kopargaon Zone'}</span>
                      </div>
                      <div className="l-meta-item">
                        <Clock size={13} />
                        <span>{new Date(report.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {photoCount > 0 && (
                        <div className="l-meta-item">
                          <Camera size={13} />
                          <span>{photoCount} Photo Evidence</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Why Were These Reports Linked */}
          <div className="why-linked-section">
            <div className="why-linked-header">
              <Sparkles size={16} className="why-sparkle" />
              <h4>Why were these reports grouped?</h4>
            </div>
            <ul className="why-reasons-list">
              {cluster.reasons && cluster.reasons.length > 0 ? (
                cluster.reasons.map((reason, idx) => (
                  <li key={idx} className="why-reason-item">
                    <CheckCircle size={14} className="reason-check-icon" />
                    <span>{reason}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="why-reason-item">
                    <CheckCircle size={14} className="reason-check-icon" />
                    <span>Same civic category and municipal ward</span>
                  </li>
                  <li className="why-reason-item">
                    <CheckCircle size={14} className="reason-check-icon" />
                    <span>Close geographic proximity (~120m)</span>
                  </li>
                  <li className="why-reason-item">
                    <CheckCircle size={14} className="reason-check-icon" />
                    <span>Submitted in close succession</span>
                  </li>
                </>
              )}
            </ul>
            <div className="transparency-note">
              <Info size={13} />
              <span>System-generated similarity assessment. Municipal officers make the final operational decision.</span>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="cluster-modal-footer">
          <div className="footer-actions-left">
            <button 
              type="button" 
              className="btn-cluster-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <div className="footer-actions-right">
            <button 
              type="button" 
              className={`btn-keep-separate ${isSeparate ? 'active-separate' : ''}`}
              onClick={handleKeepSeparate}
            >
              <SplitSquareVertical size={16} />
              <span>Keep Reports Separate</span>
            </button>

            <button 
              type="button" 
              className={`btn-confirm-duplicate ${isConfirmed ? 'active-confirmed' : ''}`}
              onClick={handleConfirm}
            >
              <CheckCircle2 size={16} />
              <span>{isConfirmed ? 'Duplicate Confirmed' : 'Confirm Duplicate'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}