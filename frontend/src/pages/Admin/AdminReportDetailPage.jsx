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
import CivicLeafletMap from '../../components/common/CivicLeafletMap';
import { fetchAdminReportDetail, fetchAdminReports, mergeReportClusterApi, isLocalClusterMerged } from '../../services/api';
import { calculatePriorityScore } from '../../utils/mockReports';
import './AdminReportDetailPage.css';

export default function AdminReportDetailPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMergedState, setIsMergedState] = useState(false);

  const loadReport = async () => {
    try {
      const found = await fetchAdminReportDetail(reportId);
      if (found) {
        setReport(found);
        const clusterId = found.clusterId || 'CLUSTER-STATION-RD';
        setIsMergedState(isLocalClusterMerged(clusterId));
      } else {
        const all = await fetchAdminReports();
        if (all.length > 0) {
          setReport(all[0]);
          const clusterId = all[0].clusterId || 'CLUSTER-STATION-RD';
          setIsMergedState(isLocalClusterMerged(clusterId));
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
      <div className="admin-page-layout">
        <div style={{ padding: '2rem' }}>Loading report details...</div>
      </div>
    );
  }

  const scoreObj = calculatePriorityScore(report);
  const repId = report.reportId || report.id;
  const supportingList = report.supportingReportIds && report.supportingReportIds.length > 0 
    ? report.supportingReportIds 
    : [repId];
  const supportingCount = report.similarReports || report.supportingReports || supportingList.length;

  const handleActionCompleted = (newStatus, msg) => {
    loadReport();
    setToastMsg(msg || `✓ Report ${repId} status updated to "${newStatus}". Synchronized with citizen tracking.`);
  };

  const handleMergeCluster = async () => {
    const clusterId = report.clusterId || 'CLUSTER-STATION-RD';
    await mergeReportClusterApi(repId, clusterId, supportingList);
    setIsMergedState(true);
    setToastMsg(`✓ Consolidated ${supportingList.length} citizen reports into 1 master civic issue.`);
  };

  return (
    <div className="admin-page-layout">
      <AdminSidebar
        activeSection="reports"
        onSelectSection={(sec) => {
          if (sec === 'dashboard') navigate('/admin/dashboard');
          if (sec === 'reports') navigate('/admin/reports');
        }}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="admin-main-wrapper">
        <AdminHeader onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="admin-content-body">
          <div className="report-detail-page-container">
            {/* Top Navigation Strip */}
            <div className="detail-top-nav-bar">
              <Link to="/admin/reports" className="btn-back-reports">
                <ArrowLeft size={16} />
                <span>Back to All Reports</span>
              </Link>

              <div className="detail-header-tags">
                <Link to={`/track/${repId}`} className="track-sync-pill" title="View Citizen Tracker">
                  <CheckCircle2 size={13} />
                  <span>Citizen Sync Live: /track/{repId}</span>
                </Link>
              </div>
            </div>

            {/* Main Header Banner */}
            <div className="detail-main-header-card">
              <div className="detail-header-left">
                <div className="id-priority-wrap">
                  <span className="detail-report-id">{repId}</span>
                  <PriorityBadge level={scoreObj.level} score={scoreObj.score} />
                  <span className={`detail-status-pill status-${String(report.status || 'pending').toLowerCase()}`}>
                    {report.status || 'PENDING'}
                  </span>
                  <span className="detail-category-pill">
                    <Tag size={12} />
                    <span>{report.category || 'Waste'}</span>
                  </span>
                </div>
                
                <h1 className="detail-issue-title">{report.title || report.issue || report.wasteType}</h1>
                
                <div className="detail-loc-time-row">
                  <span className="meta-unit">
                    <MapPin size={14} className="meta-icon-teal" />
                    {report.location?.area || 'Station Road, Kopargaon'} ({report.location?.zone || 'Zone Z01'})
                  </span>
                  <span className="meta-unit">
                    <Calendar size={14} className="meta-icon-teal" />
                    Submitted: {new Date(report.submittedAt || Date.now()).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="meta-unit">
                    <Clock size={14} className="meta-icon-teal" />
                    Age: {report.age || '2 days'}
                  </span>
                </div>
              </div>

              {supportingCount > 1 && (
                <div className="cluster-consolidation-hero-badge">
                  <div className="hero-cluster-left">
                    <Users size={22} className="cluster-users-icon" />
                    <div className="hero-cluster-text">
                      <strong>{supportingCount} Citizen Reports Linked</strong>
                      <span>{isMergedState ? 'Consolidated into 1 Action' : 'Potential Duplicate Cluster'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lifecycle Status Timeline */}
            <StatusTimeline currentStatus={report.status || 'PENDING'} />

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

                {/* Location & Map Placeholder */}
                <div className="detail-content-card">
                  <div className="card-title-row">
                    <MapPin size={16} className="card-icon-teal" />
                    <h3 className="card-block-title">Location &amp; Coordinates</h3>
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

                    {/* Real Interactive Leaflet Civic Map */}
                    <CivicLeafletMap singleReport={report} height="220px" />
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
                      Submitted by {report.feedback.citizenName || 'Citizen'} on {report.feedback.submittedAt ? new Date(report.feedback.submittedAt).toLocaleDateString() : 'recently'}
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
                    {(report.evidence || [
                      { name: 'evidence_canal_01.jpg', description: 'Canal access garbage accumulation', time: '2 days ago' },
                      { name: 'evidence_pavement_02.jpg', description: 'Pedestrian walkway overflow', time: '1 day ago' }
                    ]).map((ev, idx) => (
                      <div key={idx} className="evidence-card">
                        <div className="evidence-photo-sim">
                          <Camera size={26} className="ev-icon" />
                          <span className="ev-filename">{ev.name}</span>
                          <span className="ev-meta-tag">Timestamp &amp; GPS Verified</span>
                        </div>
                        <div className="evidence-caption">
                          <span className="ev-desc">{ev.description || 'Verified citizen photo attachment'}</span>
                          <span className="ev-time">{ev.time || 'Attached at submission'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Action Panel & Related Reports */}
              <div className="detail-col-right">
                {/* Municipal Officer Action Panel */}
                <AdminActionPanel
                  reportId={repId}
                  currentStatus={report.status}
                  assignedTeam={report.assignedTeam}
                  currentPriority={report.priority || scoreObj.level}
                  onActionCompleted={handleActionCompleted}
                />

                {/* Related / Duplicate Reports Section */}
                <div className="detail-content-card related-reports-card">
                  <div className="card-title-row">
                    <Layers size={16} className="layers-amber" />
                    <h3 className="card-block-title">Related / Duplicate Reports</h3>
                  </div>

                  <div className="related-reports-count-banner">
                    <Users size={16} />
                    <span><strong>{supportingCount} similar reports</strong> found within 150m radius</span>
                  </div>

                  <p className="related-reports-explainer">
                    The platform's AI cross-referenced geographic proximity, timestamp proximity, and issue similarity to group these citizen reports.
                  </p>

                  <div className="related-ids-container">
                    <span className="related-ids-title">Related Citizen Report IDs:</span>
                    <div className="related-ids-chips">
                      {supportingList.map((id, idx) => (
                        <div 
                          key={idx} 
                          className={`related-chip ${id === repId ? 'is-active-rep' : ''}`}
                          onClick={() => navigate(`/admin/reports/${id}`)}
                          title="View this report"
                        >
                          <span className="r-id">{id}</span>
                          {id === repId ? (
                            <span className="r-tag-curr">Viewing</span>
                          ) : (
                            <span className="r-tag-link">Report #{idx + 1}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions: View Cluster & Merge Reports */}
                  <div className="related-actions-row">
                    <button 
                      type="button" 
                      className="btn-view-cluster-action"
                      onClick={() => navigate('/admin/dashboard#duplicates')}
                    >
                      <Eye size={15} />
                      <span>View Cluster in Dashboard</span>
                    </button>

                    <button 
                      type="button" 
                      className={`btn-merge-cluster-action ${isMergedState ? 'is-merged' : ''}`}
                      onClick={handleMergeCluster}
                    >
                      {isMergedState ? <CheckCircle2 size={15} /> : <GitMerge size={15} />}
                      <span>{isMergedState ? 'Merged into 1 Action' : 'Merge Reports'}</span>
                    </button>
                  </div>

                  {isMergedState && (
                    <div className="merged-confirmation-subnote">
                      <CheckCircle2 size={14} />
                      <span>7 Citizen reports consolidated. Resource dispatched once for entire cluster.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {toastMsg && (
        <Toast message={toastMsg} type="success" onClose={() => setToastMsg(null)} />
      )}
    </div>
  );
}