import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Camera, 
  Sparkles, 
  Layers, 
  Users, 
  ShieldCheck, 
  CheckCircle2,
  FileText,
  GitMerge,
  Eye,
  AlertTriangle,
  Compass,
  Check,
  Building2,
  Tag
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import PriorityBadge from '../../components/admin/PriorityBadge';
import PriorityIntelligenceCard from '../../components/admin/PriorityIntelligenceCard';
import StatusTimeline from '../../components/admin/StatusTimeline';
import AdminActionPanel from '../../components/admin/AdminActionPanel';
import { getReport, getReports, saveClusterDecision, isClusterMerged } from '../../services/reportStorage';
import { calculatePriorityScore } from '../../utils/mockReports';
import './AdminReportDetailPage.css';

export default function AdminReportDetailPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMergedState, setIsMergedState] = useState(false);

  const loadReport = () => {
    try {
      const found = getReport(reportId);
      if (found) {
        setReport(found);
        const clusterId = found.clusterId || 'CLUSTER-STATION-RD';
        setIsMergedState(isClusterMerged(clusterId));
      } else {
        const all = getReports();
        if (all.length > 0) {
          setReport(all[0]);
          const clusterId = all[0].clusterId || 'CLUSTER-STATION-RD';
          setIsMergedState(isClusterMerged(clusterId));
        }
      }
    } catch (err) {
      console.warn('Error loading report detail:', err);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportId]);

  if (!report) {
    return (
      <div className="admin-loading-screen">
        <div className="spin-loader" />
        <p>Loading municipal report details...</p>
      </div>
    );
  }

  const score = report.priorityScore || report.aiAssessment?.score || calculatePriorityScore(report);
  const priority = report.priority || report.severity || 'Critical';
  const clusterId = report.clusterId || 'CLUSTER-STATION-RD';

  const handleMergeCluster = () => {
    saveClusterDecision(clusterId, 'CONFIRMED', 'Officer confirmed cluster merge');
    setIsMergedState(true);
    setToastMsg(`✓ Linked 3 reports into unified municipal resolution item.`);
    setTimeout(() => setToastMsg(null), 4500);
  };

  return (
    <div className="admin-layout-root">
      <AdminSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      <div className="admin-main-viewport">
        <AdminHeader 
          title={`Report Inspection — ${report.report_id || report.reportId || report.id}`}
          subtitle="Detailed citizen evidence, explainable AI priority factors, and municipal action controls."
          onMenuToggle={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        <div className="admin-content-container">
          {/* Back Button Navigation */}
          <div className="detail-top-nav">
            <Link to="/admin/dashboard" className="btn-back-dashboard">
              <ArrowLeft size={16} />
              <span>Back to Admin Dashboard</span>
            </Link>

            <div className="report-quick-meta">
              <span className="meta-ward-tag">{report.location?.zone || 'Zone Z01 — Market Area'}</span>
              <span className={`status-pill-admin status-${String(report.status || 'PENDING').toLowerCase()}`}>
                {report.status || 'PENDING'}
              </span>
            </div>
          </div>

          {/* Toast feedback banner */}
          {toastMsg && (
            <div className="admin-toast-banner">
              <CheckCircle2 size={18} />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Main Inspection Header Card */}
          <div className="report-detail-hero-card">
            <div className="hero-left-col">
              <div className="hero-badge-row">
                <span className="hero-category-chip">{report.category || 'Waste Management'}</span>
                <PriorityBadge priority={priority} score={score} />
                <span className="hero-time-ago">
                  <Clock size={13} />
                  <span>Reported {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : 'Recently'}</span>
                </span>
              </div>

              <h1 className="hero-issue-title">{report.issue || report.wasteType || 'Civic Issue'}</h1>

              <div className="hero-location-line">
                <MapPin size={15} className="hero-loc-icon" />
                <span>{report.location?.address || report.location?.area || 'Station Road near Godavari Canal Bridge, Kopargaon'}</span>
              </div>
            </div>

            <div className="hero-right-col">
              <div className="priority-gauge-box">
                <span className="gauge-label">Priority Index</span>
                <div className="gauge-score-display">
                  <span className="gauge-score-number">{score}</span>
                  <span className="gauge-score-denom">/100</span>
                </div>
                <span className={`gauge-priority-name priority-${String(priority).toLowerCase()}`}>
                  {priority} Priority
                </span>
              </div>
            </div>
          </div>

          {/* Duplicate Cluster Warning Banner */}
          {(report.duplicateCount > 1 || report.linkedDuplicates?.length > 0 || clusterId) && (
            <div className={`duplicate-cluster-alert ${isMergedState ? 'merged-state' : ''}`}>
              <div className="dup-alert-left">
                <div className="dup-icon-badge">
                  <Layers size={22} />
                </div>
                <div>
                  <div className="dup-headline-row">
                    <h3 className="dup-alert-title">
                      {isMergedState ? 'Confirmed Municipal Issue Cluster' : 'Potential Duplicate Reports Detected (3 nearby reports)'}
                    </h3>
                    <span className={`dup-cluster-pill ${isMergedState ? 'confirmed-pill' : 'alert-pill'}`}>
                      {isMergedState ? 'MERGED TO SINGLE WORK ORDER' : 'POSSIBLE DUPLICATE'}
                    </span>
                  </div>
                  <p className="dup-alert-desc">
                    {isMergedState 
                      ? '3 citizen complaints within 150m have been unified into 1 operational work order to prevent duplicate crew dispatches.'
                      : 'Similar complaints were submitted in this 150m perimeter within 48h. Merge into one dispatch to save crew hours.'}
                  </p>
                </div>
              </div>

              {!isMergedState && (
                <button 
                  type="button" 
                  className="btn-merge-cluster-action"
                  onClick={handleMergeCluster}
                >
                  <GitMerge size={16} />
                  <span>Merge into 1 Dispatch Order</span>
                </button>
              )}
            </div>
          )}

          {/* 2-Column Detail Grid */}
          <div className="detail-grid-columns">
            {/* Left Column */}
            <div className="detail-col-left">
              {/* Citizen Problem Description */}
              <div className="detail-content-card">
                <div className="card-title-row">
                  <FileText size={16} className="card-icon-teal" />
                  <h3 className="card-block-title">Citizen Description</h3>
                </div>
                <p className="detail-desc-quote">
                  "{report.description || 'No description provided.'}"
                </p>
                {report.indicators && report.indicators.length > 0 && (
                  <div className="indicators-chip-bar">
                    <span className="ind-lbl">Reported Conditions:</span>
                    {report.indicators.map((ind, i) => (
                      <span key={i} className="ind-tag">{ind}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Assessment Card */}
              <div className="detail-content-card ai-assessment-highlight-card">
                <div className="card-title-row">
                  <Sparkles size={16} className="sparkle-teal" />
                  <h3 className="card-block-title">AI-Assisted Assessment</h3>
                  <span className="ai-assisted-pill">Decision Support</span>
                </div>

                <div className="ai-assessment-metrics-grid">
                  <div className="ai-metric-item">
                    <span className="ai-m-label">Severity</span>
                    <strong className="ai-m-val text-crimson">{report.aiAssessment?.severityLabel || report.severity || 'High'}</strong>
                  </div>
                  <div className="ai-metric-item">
                    <span className="ai-m-label">Waste Type</span>
                    <strong className="ai-m-val">{report.aiAssessment?.wasteType || report.wasteType || 'Mixed municipal waste'}</strong>
                  </div>
                  <div className="ai-metric-item">
                    <span className="ai-m-label">Estimated Urgency</span>
                    <strong className="ai-m-val text-amber">{report.aiAssessment?.estimatedUrgency || 'Immediate attention'}</strong>
                  </div>
                  <div className="ai-metric-item">
                    <span className="ai-m-label">AI Confidence</span>
                    <strong className="ai-m-val text-teal">{report.aiAssessment?.confidence || report.aiConfidence || 91}%</strong>
                  </div>
                </div>

                <div className="ai-reasoning-box">
                  <strong>AI Recommendation:</strong>
                  <p>{report.aiAssessment?.recommendedResponse || 'Immediate municipal inspection recommended. Dispatch high-capacity loader crew within 12 hours.'}</p>
                </div>

                <div className="ai-disclaimer-sub">
                  * AI-assisted assessment for decision support. Final action remains with the Municipal Officer.
                </div>
              </div>

              {/* Priority Intelligence Breakdown Factor Bars */}
              <PriorityIntelligenceCard report={report} />

              {/* Location & Ward Card */}
              <div className="detail-content-card">
                <div className="card-title-row">
                  <MapPin size={16} className="card-icon-teal" />
                  <h3 className="card-block-title">Location &amp; Municipal Ward</h3>
                </div>

                <div className="location-details-box">
                  <div className="location-text-row">
                    <strong>Location Name:</strong>
                    <span>{report.location?.address || report.location?.area || 'Station Road near Godavari Canal Bridge, Kopargaon'}</span>
                  </div>
                  <div className="coordinates-tags-row">
                    <span className="coord-pill">
                      <Compass size={13} />
                      <span>Latitude: <strong>{report.location?.latitude || 19.8845}° N</strong></span>
                    </span>
                    <span className="coord-pill">
                      <Compass size={13} />
                      <span>Longitude: <strong>{report.location?.longitude || 74.4682}° E</strong></span>
                    </span>
                    <span className="coord-pill zone-pill">
                      <span>Zone: <strong>{report.location?.zone || 'Zone Z01'}</strong></span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Citizen Resolution Feedback (if available) */}
              {report.feedback && report.feedback.rating && (
                <div className="detail-content-card citizen-feedback-highlight-card" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <div className="card-title-row">
                    <ShieldCheck size={18} style={{ color: '#16a34a' }} />
                    <h3 className="card-block-title" style={{ color: '#166534' }}>Citizen Resolution Feedback</h3>
                    <span className="ai-assisted-pill" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>Verified Citizen</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: '#eab308' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>{star <= report.feedback.rating ? '★' : '☆'}</span>
                    ))}
                    <strong style={{ fontSize: '0.9375rem', color: '#166534', marginLeft: '0.5rem' }}>
                      {report.feedback.rating} out of 5 Stars
                    </strong>
                  </div>

                  {report.feedback.comment && (
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#14532d', fontStyle: 'italic', background: 'white', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                      "{report.feedback.comment}"
                    </p>
                  )}

                  <div style={{ fontSize: '0.75rem', color: '#15803d' }}>
                    Submitted on {report.feedback.submittedAt ? new Date(report.feedback.submittedAt).toLocaleDateString() : 'recently'}
                  </div>
                </div>
              )}

              {/* Citizen Evidence Photos */}
              <div className="detail-content-card">
                <div className="card-title-row">
                  <Camera size={16} className="card-icon-teal" />
                  <h3 className="card-block-title">Citizen Evidence Photos ({report.photos?.length || 2})</h3>
                  <span className="evidence-conf-tag">
                    <CheckCircle2 size={13} />
                    <span>Evidence confidence: {report.aiAssessment?.confidence || report.aiConfidence || 91}%</span>
                  </span>
                </div>

                <div className="evidence-grid-row">
                  {(report.photos || [
                    { name: 'evidence_canal_01.jpg', preview: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=400' },
                    { name: 'evidence_pavement_02.jpg', preview: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400' }
                  ]).map((ev, idx) => (
                    <div key={idx} className="evidence-card">
                      <img 
                        src={ev.preview || `https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=400`} 
                        alt={ev.name || `Evidence ${idx + 1}`} 
                        className="evidence-img"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="%2364748b" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>';
                        }}
                      />
                      <span className="ev-label">{ev.name || `Photo ${idx + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Actions & Workflow Status */}
            <div className="detail-col-right">
              {/* Officer Triage Action Panel */}
              <AdminActionPanel
                reportId={report.report_id || report.reportId || report.id}
                currentStatus={report.status}
                assignedTeam={report.assignedTeam}
                currentPriority={priority}
                onActionCompleted={(newStatus, msg) => {
                  setReport((prev) => ({
                    ...prev,
                    status: newStatus
                  }));
                  setToastMsg(msg);
                  setTimeout(() => setToastMsg(null), 4500);
                }}
              />

              {/* Status Timeline */}
              <StatusTimeline report={report} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}