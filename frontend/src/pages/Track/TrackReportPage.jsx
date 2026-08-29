import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  RefreshCw, 
  FileText,
  Users,
  Star,
  Check
} from 'lucide-react';
import { fetchReport, fetchAdminReports, submitReportFeedback } from '../../services/api';
import PriorityBreakdown from '../../components/admin/PriorityBreakdown';
import './TrackReportPage.css';

const TIMELINE_STEPS = [
  { id: 'submitted', title: 'Report Submitted', desc: 'Civic report registered with photo & location' },
  { id: 'ai', title: 'AI Assessment', desc: 'Visual verification & priority rule calculation' },
  { id: 'review', title: 'Municipal Review', desc: 'Officer evaluation & duplicate cross-reference' },
  { id: 'assigned', title: 'Assigned to Team', desc: 'Sanitation field crew & vehicle allocated' },
  { id: 'progress', title: 'Work in Progress', desc: 'Field team active on site resolution' },
  { id: 'resolved', title: 'Resolved', desc: 'Issue cleared & municipal verification complete' }
];

export default function TrackReportPage() {
  const { reportId: paramReportId } = useParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(paramReportId || '');
  const [currentReport, setCurrentReport] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Feedback State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const list = await fetchAdminReports();
      if (!isMounted) return;
      setAllReports(list);

      const targetId = paramReportId || (list.length > 0 ? (list[0].report_id || list[0].id) : 'KOP-1024');
      if (targetId) {
        const found = await fetchReport(targetId);
        if (isMounted && found) {
          setCurrentReport(found);
          if (paramReportId) setSearchInput(paramReportId);
        } else if (isMounted && list.length > 0) {
          setCurrentReport(list[0]);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [paramReportId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const found = await fetchReport(searchInput.trim());
      setIsSearching(false);
      if (found) {
        setCurrentReport(found);
        navigate(`/track/${found.report_id || found.id || searchInput.trim()}`, { replace: true });
      } else {
        setSearchError(`Report ID "${searchInput}" not found. Try searching for KOP-1024 or KOP-1077.`);
      }
    } catch {
      setIsSearching(false);
      setSearchError(`Report ID "${searchInput}" not found. Try searching for KOP-1024 or KOP-1077.`);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const repId = currentReport?.report_id || currentReport?.reportId || currentReport?.id;
    if (!repId) return;

    setIsSubmittingFeedback(true);
    try {
      const res = await submitReportFeedback(repId, rating, comment);
      setFeedbackSuccess(true);
      if (res.report) {
        setCurrentReport(res.report);
      }
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const getTimelineStepStatus = (stepIdx, currentStatus) => {
    const st = String(currentStatus || 'PENDING').toUpperCase();
    let activeIdx = 0;

    if (st === 'PENDING' || st === 'SUBMITTED') activeIdx = 0;
    else if (st === 'AI_ANALYSIS' || st === 'AI_ASSESSMENT') activeIdx = 1;
    else if (st === 'UNDER_REVIEW') activeIdx = 2;
    else if (st === 'APPROVED' || st === 'ASSIGNED') activeIdx = 3;
    else if (st === 'IN_PROGRESS') activeIdx = 4;
    else if (st === 'RESOLVED') activeIdx = 5;

    if (stepIdx < activeIdx) return 'completed';
    if (stepIdx === activeIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="container">
      <div className="track-page-container">
        {/* Track Header & Search Bar */}
        <div className="track-header-card">
          <div className="track-title-box">
            <Search size={28} className="track-header-icon" />
            <div>
              <h1 className="track-page-title">Citizen Report Tracker</h1>
              <p className="track-page-desc">
                Real-time tracking of civic waste reports in Kopargaon Municipal Council jurisdiction.
              </p>
            </div>
          </div>

          <form className="track-search-form" onSubmit={handleSearch}>
            <div className="track-search-input-wrapper">
              <Search size={18} className="search-input-icon" />
              <input
                type="text"
                className="track-search-input"
                placeholder="Enter Report ID (e.g. KOP-1024 or KOP-1038)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary btn-track-submit" disabled={isSearching}>
              {isSearching ? <RefreshCw size={16} className="spinning" /> : 'Search'}
            </button>
          </form>

          {searchError && (
            <div className="search-error-box" style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '0.5rem 0.85rem', borderRadius: '6px', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
              <AlertTriangle size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
              <span>{searchError}</span>
            </div>
          )}

          {/* Quick Demo Pickers */}
          <div className="demo-reports-quick-bar">
            <span className="quick-bar-label">Demo Submissions:</span>
            <div className="quick-chips-list">
              {allReports.slice(0, 5).map((r) => {
                const repId = r.reportId || r.id;
                const isSelected = (currentReport?.reportId || currentReport?.id) === repId;

                return (
                  <button
                    key={repId}
                    type="button"
                    className={`quick-id-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentReport(r);
                      setSearchInput(repId);
                      navigate(`/track/${repId}`, { replace: true });
                    }}
                  >
                    {repId} ({r.title || r.issue || r.wasteType})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Status Display Area */}
        {currentReport && (
          <div className="track-content-grid">
            {/* Left Column: Timeline Stepper */}
            <div className="timeline-card">
              <div className="card-section-header">
                <h3 className="section-title">Resolution Lifecycle</h3>
                <span className="live-status-pill">
                  Status: <strong>{currentReport.status || 'PENDING'}</strong>
                </span>
              </div>

              <div className="timeline-stepper">
                {TIMELINE_STEPS.map((step, idx) => {
                  const status = getTimelineStepStatus(idx, currentReport.status);

                  return (
                    <div key={step.id} className={`timeline-node ${status}`}>
                      <div className="node-marker-col">
                        <div className="node-marker">
                          {status === 'completed' && <CheckCircle2 size={16} />}
                          {status === 'active' && <div className="pulsing-dot" />}
                          {status === 'pending' && <span className="pending-circle" />}
                        </div>
                        {idx < TIMELINE_STEPS.length - 1 && <div className="node-connector" />}
                      </div>
                      <div className="node-content">
                        <div className="node-title-row">
                          <h4 className="node-title">{step.title}</h4>
                          {status === 'completed' && <span className="node-status-tag done">Done</span>}
                          {status === 'active' && <span className="node-status-tag current">Active</span>}
                        </div>
                        <p className="node-desc">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {(currentReport.similarReports > 1 || currentReport.supportingReports > 1) && (
                <div className="cluster-consolidation-notice">
                  <Users size={16} />
                  <span>
                    <strong>Duplicate Group:</strong> {currentReport.similarReports || currentReport.supportingReports} citizen reports consolidated into this single resolution track.
                  </span>
                </div>
              )}

              {currentReport.assignedTeam && (
                <div className="assigned-team-citizen-notice">
                  <ShieldCheck size={16} />
                  <span>
                    <strong>Assigned Field Unit:</strong> {currentReport.assignedTeam}
                  </span>
                </div>
              )}

              {/* CITIZEN RESOLUTION FEEDBACK SECTION */}
              {(currentReport.status === 'RESOLVED' || currentReport.feedback?.rating || feedbackSuccess) && (
                <div className="citizen-feedback-card">
                  <div className="feedback-card-header">
                    <CheckCircle2 size={20} className="feedback-icon-green" />
                    <div>
                      <h4 className="feedback-title">Was this issue resolved satisfactorily?</h4>
                      <span className="feedback-sub">Your ratings help Kopargaon Municipal Council improve civic response quality.</span>
                    </div>
                  </div>

                  {currentReport.feedback?.rating || feedbackSuccess ? (
                    <div className="feedback-submitted-success-box">
                      <div className="star-rating-display">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={`star-icon ${s <= (currentReport.feedback?.rating || rating) ? 'star-filled' : 'star-empty'}`}>★</span>
                        ))}
                        <strong className="star-rating-label">
                          {currentReport.feedback?.rating || rating} / 5 Stars Verified
                        </strong>
                      </div>
                      {(currentReport.feedback?.comment || comment) && (
                        <p className="feedback-quote-text">
                          "{currentReport.feedback?.comment || comment}"
                        </p>
                      )}
                      <span className="feedback-thankyou-tag">✓ Feedback recorded &amp; synced with Municipal Officer console.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                      <div className="star-select-row">
                        <span className="star-prompt-lbl">Rate Resolution:</span>
                        <div className="star-picker">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={`btn-star-select ${s <= rating ? 'selected' : ''}`}
                              onClick={() => setRating(s)}
                              title={`Rate ${s} star${s > 1 ? 's' : ''}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <span className="rating-num-label">{rating} Star{rating > 1 ? 's' : ''}</span>
                      </div>

                      <div className="feedback-input-group">
                        <textarea
                          className="feedback-textarea"
                          rows="2"
                          placeholder="Tell us about your experience (optional)..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          maxLength={500}
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="btn-primary btn-submit-feedback"
                        disabled={isSubmittingFeedback}
                      >
                        <Check size={16} />
                        <span>{isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div className="officer-notice-box">
                <ShieldCheck size={18} />
                <p>
                  <strong>Municipal Oversight:</strong> Reports are evaluated by Kopargaon Ward Officers alongside daily resource capacity (workers, trucks, and landfill quotas).
                </p>
              </div>
            </div>

            {/* Right Column: Report Specifics & AI Breakdown */}
            <div className="report-info-sidebar">
              {/* Report Header Card */}
              <div className="sidebar-card">
                <div className="sidebar-header">
                  <span className="report-id-badge">{currentReport.reportId || currentReport.id}</span>
                  <span className="priority-badge-box">
                    Priority: <strong>{currentReport.priority || currentReport.aiAssessment?.level || currentReport.severity || 'HIGH'}</strong>
                  </span>
                </div>

                <div className="sidebar-kv-list">
                  <div className="sidebar-kv">
                    <span className="kv-lbl">Issue Category</span>
                    <span className="kv-val">{currentReport.title || currentReport.issue || currentReport.wasteType}</span>
                  </div>
                  <div className="sidebar-kv">
                    <span className="kv-lbl">Reported Severity</span>
                    <span className="kv-val">{currentReport.severity}</span>
                  </div>
                  <div className="sidebar-kv">
                    <span className="kv-lbl">Municipal Location</span>
                    <span className="kv-val">
                      <MapPin size={14} className="inline-icon" />
                      {currentReport.location?.area || 'Kopargaon Zone'}
                    </span>
                  </div>
                  <div className="sidebar-kv">
                    <span className="kv-lbl">Submission Time</span>
                    <span className="kv-val">
                      <Calendar size={14} className="inline-icon" />
                      {new Date(currentReport.submittedAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                </div>

                {currentReport.description && (
                  <div className="sidebar-desc-box">
                    <span className="kv-lbl">Citizen Note:</span>
                    <p className="sidebar-desc-text">"{currentReport.description}"</p>
                  </div>
                )}
              </div>

              {/* Priority Score Breakdown */}
              <div className="sidebar-card">
                <PriorityBreakdown 
                  factors={currentReport.aiAssessment?.factors} 
                  totalScore={currentReport.priorityScore || currentReport.aiAssessment?.score || 92} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Footnotes */}
        <div className="track-footer-links">
          <Link to="/report/waste" className="btn-primary">
            Submit Another Report
          </Link>
          <Link to="/admin" className="btn-secondary">
            Open Municipal Admin Console
          </Link>
        </div>
      </div>
    </div>
  );
}