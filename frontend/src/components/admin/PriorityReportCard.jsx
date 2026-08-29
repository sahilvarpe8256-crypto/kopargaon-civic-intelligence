import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Layers,
  ArrowUpRight,
  SplitSquareVertical,
  CheckCircle
} from 'lucide-react';
import './PriorityReportCard.css';

export default function PriorityReportCard({ report, cluster, onReview, onViewCluster }) {
  const score = report.aiAssessment?.score || (report.severity === 'Critical' ? 85 : report.severity === 'High' ? 65 : 40);
  const priorityLevel = report.aiAssessment?.level || (score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 35 ? 'MEDIUM' : 'LOW');
  const photoCount = report.photos?.length || 0;
  const reasoning = report.aiAssessment?.reasoning || [
    `${report.severity} reported severity`,
    report.wasteType
  ];

  const getPriorityClass = (lvl) => {
    switch (lvl) {
      case 'CRITICAL': return 'priority-critical';
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      default: return 'priority-low';
    }
  };

  const getStatusClass = (st) => {
    switch (st) {
      case 'APPROVED': return 'status-approved';
      case 'UNDER_REVIEW': return 'status-review';
      case 'AI_ANALYSIS': return 'status-ai';
      case 'RESOLVED': return 'status-resolved';
      case 'DEFERRED': return 'status-deferred';
      default: return 'status-submitted';
    }
  };

  const hasCluster = cluster && cluster.reports?.length > 1;
  const isPossibleDuplicate = hasCluster && cluster.status === 'POSSIBLE';
  const isConfirmedDuplicate = hasCluster && cluster.status === 'CONFIRMED';

  return (
    <div className={`priority-report-card ${getPriorityClass(priorityLevel)}`}>
      {/* Top Header Row */}
      <div className="card-header-row">
        <div className="report-id-group">
          <span className="card-id-text">{report.reportId}</span>
          <span className={`priority-pill ${getPriorityClass(priorityLevel)}`}>
            {priorityLevel} • {score}/100
          </span>
        </div>

        <div className="card-header-tags">
          <span className={`status-pill ${getStatusClass(report.status)}`}>
            {report.status || 'UNDER_REVIEW'}
          </span>
        </div>
      </div>

      {/* Duplicate Cluster Intelligence Banner */}
      {isPossibleDuplicate && (
        <div className="duplicate-alert-strip possible">
          <div className="dup-strip-left">
            <Layers size={15} className="dup-strip-icon possible" />
            <div className="dup-text-group">
              <span className="dup-badge-label">POSSIBLE DUPLICATE</span>
              <span className="dup-info-text">
                {cluster.reports.length} citizen reports linked • {cluster.confidence}% confidence
              </span>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-view-cluster"
            onClick={() => onViewCluster && onViewCluster(cluster)}
          >
            <span>View Cluster</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {isConfirmedDuplicate && (
        <div className="duplicate-alert-strip confirmed">
          <div className="dup-strip-left">
            <CheckCircle2 size={15} className="dup-strip-icon confirmed" />
            <div className="dup-text-group">
              <span className="dup-badge-label confirmed">CONFIRMED DUPLICATE</span>
              <span className="dup-info-text">
                {cluster.reports.length} citizen reports → 1 municipal resolution issue
              </span>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-view-cluster confirmed"
            onClick={() => onViewCluster && onViewCluster(cluster)}
          >
            <span>Cluster Details</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Main Core Body */}
      <div className="card-body-grid">
        <div className="card-left-col">
          <div className="issue-primary-row">
            <h3 className="issue-title">{report.wasteType}</h3>
            <span className="severity-text-tag">Citizen Severity: {report.severity}</span>
          </div>

          <div className="location-row">
            <MapPin size={15} className="location-icon" />
            <span className="location-name">{report.location?.area || 'Kopargaon Zone'}</span>
          </div>

          {report.description && (
            <p className="description-quote">"{report.description}"</p>
          )}

          {/* AI Reasoning Points */}
          <div className="ai-factors-box">
            <div className="factors-header">
              <Sparkles size={14} className="sparkle-factor-icon" />
              <span>AI Assessment Factors:</span>
            </div>
            <ul className="factors-list">
              {reasoning.slice(0, 3).map((reason, idx) => (
                <li key={idx} className="factor-item">
                  <CheckCircle2 size={13} className="factor-check" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Info Column: Score Meter & Evidence */}
        <div className="card-right-col">
          <div className="score-meter-widget">
            <span className="score-meter-title">Urgency Score</span>
            <div className="score-number-display">
              <span className="score-big">{score}</span>
              <span className="score-hundred">/100</span>
            </div>
            <div className="score-progress-bar-track">
              <div 
                className={`score-progress-bar-fill ${getPriorityClass(priorityLevel)}`}
                style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
              />
            </div>
          </div>

          <div className="evidence-summary-badge">
            <Camera size={14} />
            <span>{photoCount} {photoCount === 1 ? 'Photo Attached' : 'Photos Attached'}</span>
          </div>

          <button 
            type="button" 
            className="btn-review-report"
            onClick={() => onReview(report)}
          >
            <span>Review Report</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}