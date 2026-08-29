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
import { getReport, getReports, updateReportStatus } from '../../services/reportStorage';
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
  const [feedbackError, setFeedbackError] = useState(null);

  useEffect(() => {
    const reports = getReports();
    setAllReports(reports);
    if (paramReportId) {
      handleLookup(paramReportId);
    } else if (reports.length > 0) {
      setCurrentReport(reports[0]);
    }
  }, [paramReportId]);

  const handleLookup = (idToSearch) => {
    const query = (idToSearch || searchInput).trim();
    if (!query) {
      setSearchError('Please enter a valid Report ID');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    const found = getReport(query);
    if (found) {
      setCurrentReport(found);
      setSearchError(null);
    } else {
      setSearchError(`No report found with ID "${query}". Please check the ID and try again.`);
      setCurrentReport(null);
    }
    setIsSearching(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/track/${searchInput.trim()}`);
      handleLookup(searchInput.trim());
    }
  };

  const getActiveStepIndex = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'SUBMITTED':
      case 'PENDING':
        return 1;
      case 'UNDER_REVIEW':
      case 'AI_ANALYSIS':
        return 2;
      case 'APPROVED':
      case 'ASSIGNED':
        return 3;
      case 'IN_PROGRESS':
        return 4;
      case 'RESOLVED':
        return 5;
      default:
        return 1;
    }
  };

  const activeStep = currentReport ? getActiveStepIndex(currentReport.status) : 1;

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!currentReport) return;
    setIsSubmittingFeedback(true);
    setFeedbackError(null);

    try {
      const reportId = currentReport.reportId || currentReport.id;
      updateReportStatus(reportId, currentReport.status, `Citizen Feedback (${rating}★): ${comment}`);
      setFeedbackSuccess(true);
      if (currentReport) {
        currentReport.feedback = {
          rating,
          comment,
          submittedAt: new Date().toISOString()
        };
      }
    } catch (err) {
      setFeedbackError('Failed to record feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="container">
      <div className="track-page-shell">
        {/* Search Header */}
        <div className="track-header-box">
          <div className="track-header-text">
            <h1 className="track-title">Track Civic Report Status</h1>
            <p className="track-subtitle">
              Enter your unique citizen tracking ID (e.g., KOP-1024) to monitor real-time municipal response.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="track-search-bar">
            <div className="search-input-wrap">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Enter Report ID (e.g. KOP-1024, KOP-1038)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary btn-search-track" disabled={isSearching}>
              {isSearching ? <RefreshCw size={16} className="spin" /> : <span>Search Report</span>}
            </button>
          </form>

          {searchError && (
            <div className="track-search-error">
              <AlertTriangle size={16} />
              <span>{searchError}</span>
            </div>
          )}

          {/* Quick Select demo chips */}
          <div className="quick-select-chips">
            <span className="chips-label">Sample Reports:</span>
            {allReports.slice(0, 4).map((r) => (
              <button
                key={r.id || r.reportId}
                type="button"
                className="chip-btn"
                onClick={() => {
                  const id = r.id || r.reportId;
                  setSearchInput(id);
                  navigate(`/track/${id}`);
                  handleLookup(id);
                }}
              >
                {r.id || r.reportId}
              </button>
            ))}
          </div>
        </div>

        {/* Report Content View */}
        {currentReport && (
          <div className="track-content-grid">
            {/* Left Column: Progress Timeline */}
            <div className="track-timeline-card">
              <div className="timeline-card-header">
                <div className="t-badge-group">
                  <span className="t-report-id">{currentReport.id || currentReport.reportId}</span>
                  <span className={`t-status-pill status-${String(currentReport.status).toLowerCase()}`}>
                    {currentReport.status}
                  </span>
                </div>
                <span className="t-submitted-date">
                  <Calendar size={14} />
                  {currentReport.submittedAt ? new Date(currentReport.submittedAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>

              <div className="tracking-timeline-stepper">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isDone = activeStep >= idx;
                  const isCurrent = activeStep === idx;

                  return (
                    <div key={step.id} className={`timeline-step-item ${isDone ? 'step-done' : ''} ${isCurrent ? 'step-current' : ''}`}>
                      <div className="step-marker-col">
                        <div className="step-node">
                          {isDone ? <CheckCircle2 size={16} /> : <div className="dot-node" />}
                        </div>
                        {idx < TIMELINE_STEPS.length - 1 && <div className={`step-connector ${activeStep > idx ? 'connector-done' : ''}`} />}
                      </div>
                      <div className="step-info-col">
                        <h4 className="step-title">{step.title}</h4>
                        <p className="step-desc">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {currentReport.assignedTeam && (
                <div className="assigned-team-box">
                  <Users size={18} />
                  <div>
                    <span className="team-lbl">Assigned Field Unit</span>
                    <strong>{currentReport.assignedTeam}</strong>
                  </div>
                </div>
              )}

              {/* Citizen Resolution Feedback (When Resolved) */}
              {currentReport.status === 'RESOLVED' && (
                <div className="citizen-feedback-section">
                  <div className="feedback-section-header">
                    <Star size={18} className="star-header-icon" />
                    <h4>Rate Resolution Satisfaction</h4>
                  </div>

                  {feedbackSuccess || currentReport.feedback ? (
                    <div className="feedback-recorded-banner">
                      <CheckCircle2 size={20} className="check-success-icon" />
                      <div>
                        <strong>Thank You for Your Feedback!</strong>
                        <p>Rating: {currentReport.feedback?.rating || rating} ★ / 5 ★ recorded.</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                      <p className="feedback-prompt">How satisfied are you with the municipal response and issue clearance?</p>
                      
                      <div className="star-rating-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`star-btn ${rating >= star ? 'star-active' : ''}`}
                            onClick={() => setRating(star)}
                            title={`${star} Stars`}
                          >
                            ★
                          </button>
                        ))}
                        <span className="rating-label">{rating} of 5 Stars</span>
                      </div>

                      <div className="feedback-comment-group">
                        <textarea
                          className="civic-textarea feedback-textarea"
                          placeholder="Optional comments regarding the cleanup quality..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={2}
                        />
                      </div>

                      {feedbackError && <p className="feedback-error-text">{feedbackError}</p>}

                      <button
                        type="submit"
                        className="btn-primary btn-submit-feedback"
                        disabled={isSubmittingFeedback}
                      >
                        {isSubmittingFeedback ? 'Saving Feedback...' : 'Submit Citizen Rating'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Report Details */}
            <div className="track-details-col">
              <div className="details-card-panel">
                <div className="details-header-row">
                  <h3 className="issue-headline">{currentReport.issue || currentReport.wasteType || 'Civic Waste Issue'}</h3>
                  <span className={`priority-tag-pill priority-${String(currentReport.priority || currentReport.severity).toLowerCase()}`}>
                    {currentReport.priority || currentReport.severity} Priority
                  </span>
                </div>

                <p className="issue-desc-text">
                  "{currentReport.description || 'Citizen report registered with photographic evidence.'}"
                </p>

                <div className="meta-info-grid">
                  <div className="meta-box">
                    <span className="meta-box-label">Category</span>
                    <strong>{currentReport.category || 'Waste'}</strong>
                  </div>
                  <div className="meta-box">
                    <span className="meta-box-label">Waste Type</span>
                    <strong>{currentReport.wasteType || 'Mixed Waste'}</strong>
                  </div>
                  <div className="meta-box">
                    <span className="meta-box-label">Ward / Zone</span>
                    <strong>{currentReport.location?.zone || currentReport.location?.area || 'Kopargaon'}</strong>
                  </div>
                  <div className="meta-box">
                    <span className="meta-box-label">Coordinates</span>
                    <strong>{currentReport.location?.latitude || '19.88'}, {currentReport.location?.longitude || '74.46'}</strong>
                  </div>
                </div>

                {currentReport.indicators && currentReport.indicators.length > 0 && (
                  <div className="indicators-tags-wrap">
                    <span className="tags-title">Verified Indicators:</span>
                    <div className="tags-flex">
                      {currentReport.indicators.map((ind, i) => (
                        <span key={i} className="civic-tag">{ind}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence Photos */}
                {currentReport.photos && currentReport.photos.length > 0 && (
                  <div className="evidence-photos-box">
                    <h4 className="photos-title">Submitted Photo Evidence</h4>
                    <div className="photos-strip">
                      {currentReport.photos.map((p, i) => (
                        <div key={i} className="photo-thumb">
                          <img 
                            src={p.preview || `https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=300`} 
                            alt={p.name || `Photo ${i + 1}`}
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="%2364748b" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>';
                            }}
                          />
                          <span>{p.name || `Evidence ${i + 1}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}