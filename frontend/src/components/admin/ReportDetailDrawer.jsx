import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  Sparkles, 
  Camera, 
  Layers, 
  CheckCircle2, 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Play, 
  CheckCheck, 
  Ban,
  FileText
} from 'lucide-react';
import PriorityBreakdown from './PriorityBreakdown';
import PriorityBadge from './PriorityBadge';
import { updateReportStatus } from '../../services/reportStorage';
import './ReportDetailDrawer.css';

export default function ReportDetailDrawer({ report, onClose, onActionExecuted }) {
  const [selectedPhoto, setSelectedPhoto] = useState(report?.photos?.[0]?.preview || null);

  if (!report) return null;

  const score = report.aiAssessment?.score || (report.severity === 'Critical' ? 92 : 75);
  const level = report.aiAssessment?.level || 'CRITICAL';
  const supportingList = report.supportingReportIds || [report.reportId];
  const supportingCount = report.supportingReports || supportingList.length;

  const handleAction = (newStatus, actionLabel) => {
    updateReportStatus(report.reportId, newStatus, `Officer Action: ${actionLabel}`);
    if (onActionExecuted) {
      onActionExecuted(newStatus, report.reportId, `Report ${report.reportId} marked as ${actionLabel}.`);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="report-detail-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-header-info">
            <div className="drawer-id-row">
              <span className="drawer-report-id">{report.reportId}</span>
              <PriorityBadge level={level} score={score} />
            </div>
            <span className="drawer-issue-title">{report.issue || report.wasteType || 'Civic Waste Issue'}</span>
          </div>

          <button type="button" className="btn-close-drawer" onClick={onClose} aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="drawer-scroll-body">
          {/* Status & Citizen Consolidation Bar */}
          <div className="drawer-status-banner">
            <div className="drawer-status-current">
              <span className="banner-lbl">Current Status:</span>
              <span className="banner-status-pill">{report.status || 'PENDING'}</span>
            </div>
            <div className="drawer-citizens-pill">
              <Users size={15} />
              <span>{supportingCount} citizens → 1 civic issue</span>
            </div>
          </div>

          {/* Core Info Details Grid */}
          <div className="drawer-section">
            <h4 className="drawer-section-title">Report Information</h4>
            <div className="info-kv-grid">
              <div className="i-kv">
                <span className="i-lbl">Location / Area</span>
                <span className="i-val">{report.location?.area || 'Station Road, Kopargaon'}</span>
              </div>
              <div className="i-kv">
                <span className="i-lbl">Municipal Ward</span>
                <span className="i-val">{report.location?.zone || 'Zone Z01 (Riverside)'}</span>
              </div>
              <div className="i-kv">
                <span className="i-lbl">Report Age / Submitted</span>
                <span className="i-val">{report.age || '2h ago'} ({new Date(report.submittedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
              </div>
              <div className="i-kv">
                <span className="i-lbl">Citizen Severity</span>
                <span className="i-val">{report.severity || 'Critical'}</span>
              </div>
            </div>

            {report.description && (
              <div className="drawer-description-box">
                <span className="i-lbl">Citizen Description:</span>
                <p className="i-desc-text">"{report.description}"</p>
              </div>
            )}
          </div>

          {/* Citizen Evidence Photo Section */}
          <div className="drawer-section">
            <div className="section-title-with-icon">
              <Camera size={16} />
              <h4 className="drawer-section-title">Citizen Evidence Photo</h4>
            </div>

            <div className="evidence-placeholder-canvas">
              {selectedPhoto ? (
                <img src={selectedPhoto} alt="Evidence" className="evidence-real-img" />
              ) : (
                <div className="evidence-mock-panel">
                  <div className="evidence-cam-badge">
                    <Camera size={28} />
                  </div>
                  <div className="evidence-panel-text">
                    <strong>Citizen Evidence Photo Verified</strong>
                    <span>Attached to Master Report {report.reportId} • GPS &amp; Timestamp tagged</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Evidence Assessment */}
          <div className="drawer-section ai-assessment-section">
            <div className="section-title-with-icon">
              <Sparkles size={16} className="sparkle-color" />
              <h4 className="drawer-section-title">AI Evidence Assessment</h4>
            </div>

            <div className="ai-checklist-box">
              <div className="ai-confidence-strip">
                <span>Confidence Assessment:</span>
                <strong className="conf-score">{report.aiAssessment?.confidence || 91}%</strong>
              </div>
              <ul className="ai-points-list">
                <li><CheckCircle2 size={14} className="ai-point-check" /> Waste accumulation &amp; public blockage detected</li>
                <li><CheckCircle2 size={14} className="ai-point-check" /> Public transit &amp; pedestrian area affected</li>
                <li><CheckCircle2 size={14} className="ai-point-check" /> Potential environmental &amp; waterway concern</li>
                <li><CheckCircle2 size={14} className="ai-point-check" /> Proximity match with {supportingCount} related complaints</li>
              </ul>
              <span className="mock-ai-tag">* Prototype AI assessment simulation for municipal triage</span>
            </div>
          </div>

          {/* Priority Score Explanation */}
          <div className="drawer-section">
            <PriorityBreakdown 
              factors={report.aiAssessment?.factors} 
              totalScore={score} 
            />
          </div>

          {/* Duplicate Group: Supporting Reports */}
          <div className="drawer-section duplicate-reports-section">
            <div className="section-title-with-icon">
              <Layers size={16} />
              <h4 className="drawer-section-title">Duplicate Group ({supportingCount} Supporting Reports)</h4>
            </div>

            <p className="dup-drawer-desc">
              All 7 citizen submissions refer to the same physical dumping site on Station Road and are linked to this master issue:
            </p>

            <div className="supporting-chips-wrapper">
              {supportingList.map((id, idx) => (
                <span key={idx} className={`drawer-id-pill ${id === report.reportId ? 'is-primary' : ''}`}>
                  {id} {id === report.reportId ? '(Master)' : `(#${idx + 1})`}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Officer Action Workflow Footer */}
        <div className="drawer-actions-footer">
          <span className="actions-header-label">Officer Municipal Decision Workflow:</span>
          <div className="officer-actions-grid">
            <button 
              type="button" 
              className="btn-action-flow btn-approve"
              onClick={() => handleAction('APPROVED', 'Approved for Action')}
            >
              <CheckCircle2 size={15} />
              <span>Approve</span>
            </button>

            <button 
              type="button" 
              className="btn-action-flow btn-assign"
              onClick={() => handleAction('ASSIGNED', 'Assigned to Team')}
            >
              <UserPlus size={15} />
              <span>Assign Team</span>
            </button>

            <button 
              type="button" 
              className="btn-action-flow btn-progress"
              onClick={() => handleAction('IN_PROGRESS', 'In Progress')}
            >
              <Play size={15} />
              <span>Mark In Progress</span>
            </button>

            <button 
              type="button" 
              className="btn-action-flow btn-resolve"
              onClick={() => handleAction('RESOLVED', 'Resolved')}
            >
              <CheckCheck size={15} />
              <span>Resolve</span>
            </button>

            <button 
              type="button" 
              className="btn-action-flow btn-reject"
              onClick={() => handleAction('REJECTED', 'Rejected')}
            >
              <Ban size={15} />
              <span>Reject</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}