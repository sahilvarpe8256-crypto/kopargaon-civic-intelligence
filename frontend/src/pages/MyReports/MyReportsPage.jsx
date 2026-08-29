import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, MapPin, Calendar, ArrowRight, ShieldCheck, Camera, Sparkles, Filter } from 'lucide-react';
import { fetchMyReports } from '../../services/api';
import './MyReportsPage.css';

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function loadReports() {
      const list = await fetchMyReports();
      if (isMounted) setReports(list);
    }
    loadReports();
    return () => { isMounted = false; };
  }, []);

  const filteredReports = reports.filter((r) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'ACTIVE') return r.status !== 'RESOLVED';
    if (filterType === 'RESOLVED') return r.status === 'RESOLVED';
    return true;
  });

  const getPriorityBadgeClass = (level) => {
    const l = String(level).toUpperCase();
    if (l === 'CRITICAL') return 'badge-critical';
    if (l === 'HIGH') return 'badge-high';
    if (l === 'MEDIUM') return 'badge-medium';
    return 'badge-low';
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status).toUpperCase();
    if (s === 'RESOLVED' || s === 'APPROVED') return 'status-badge-green';
    if (s === 'UNDER_REVIEW' || s === 'AI_ANALYSIS') return 'status-badge-amber';
    return 'status-badge-slate';
  };

  return (
    <div className="container">
      <div className="my-reports-page-container">
        {/* Header Bar */}
        <div className="my-reports-header-card">
          <div className="header-title-box">
            <div className="header-icon-badge">
              <FileText size={26} />
            </div>
            <div>
              <h1 className="my-reports-title">My Submitted Reports</h1>
              <p className="my-reports-subtitle">
                Track status updates, priority score reviews, and field actions for your Kopargaon civic submissions.
              </p>
            </div>
          </div>

          <Link to="/report/waste" className="btn-primary btn-new-report">
            <PlusCircle size={16} />
            <span>Submit New Report</span>
          </Link>
        </div>

        {/* Filter Controls */}
        <div className="reports-filter-bar">
          <div className="filter-group">
            <Filter size={16} className="filter-icon" />
            <span className="filter-label">Filter Status:</span>
            <div className="filter-buttons">
              <button 
                type="button" 
                className={`filter-btn ${filterType === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterType('ALL')}
              >
                All ({reports.length})
              </button>
              <button 
                type="button" 
                className={`filter-btn ${filterType === 'ACTIVE' ? 'active' : ''}`}
                onClick={() => setFilterType('ACTIVE')}
              >
                In Progress ({reports.filter((r) => r.status !== 'RESOLVED').length})
              </button>
              <button 
                type="button" 
                className={`filter-btn ${filterType === 'RESOLVED' ? 'active' : ''}`}
                onClick={() => setFilterType('RESOLVED')}
              >
                Resolved ({reports.filter((r) => r.status === 'RESOLVED').length})
              </button>
            </div>
          </div>

          <span className="reports-counter-text">
            Showing {filteredReports.length} reports
          </span>
        </div>

        {/* Reports List / Empty State */}
        {filteredReports.length === 0 ? (
          <div className="empty-reports-card">
            <div className="empty-icon-circle">
              <FileText size={36} />
            </div>
            <h3 className="empty-title">No reports found</h3>
            <p className="empty-desc">
              You haven't submitted any civic waste reports yet. Report illegal dumping or overflowing bins in your ward.
            </p>
            <Link to="/report/waste" className="btn-primary" style={{ marginTop: '0.5rem' }}>
              <PlusCircle size={16} />
              <span>Submit Your First Report</span>
            </Link>
          </div>
        ) : (
          <div className="reports-grid">
            {filteredReports.map((report) => {
              const priorityLevel = report.aiAssessment?.level || report.severity || 'MEDIUM';
              const photoCount = report.photos?.length || 0;

              const repId = report.report_id || report.reportId || report.id;
              const issueName = report.title || report.issue || report.wasteType;
              const subDate = report.submitted_at || report.submittedAt || Date.now();

              return (
                <div 
                  key={repId} 
                  className="report-card"
                  onClick={() => navigate(`/track/${repId}`)}
                >
                  <div className="card-top-row">
                    <span className="card-report-id">{repId}</span>
                    <div className="badges-group">
                      <span className={`civic-priority-badge ${getPriorityBadgeClass(priorityLevel)}`}>
                        {priorityLevel}
                      </span>
                      <span className={`civic-status-badge ${getStatusBadgeClass(report.status)}`}>
                        {report.status || 'UNDER_REVIEW'}
                      </span>
                    </div>
                  </div>

                  <div className="card-main-content">
                    <h3 className="card-issue-type">{issueName}</h3>
                    {report.description && (
                      <p className="card-description-snippet">"{report.description}"</p>
                    )}
                  </div>

                  <div className="card-meta-list">
                    <div className="meta-row">
                      <MapPin size={14} className="meta-icon" />
                      <span className="meta-text">{report.location?.area || 'Kopargaon Zone'}</span>
                    </div>
                    <div className="meta-row">
                      <Calendar size={14} className="meta-icon" />
                      <span className="meta-text">{new Date(subDate).toLocaleDateString()}</span>
                    </div>
                    {photoCount > 0 && (
                      <div className="meta-row">
                        <Camera size={14} className="meta-icon" />
                        <span className="meta-text">{photoCount} Photo Evidence</span>
                      </div>
                    )}
                    {report.aiAssessment && (
                      <div className="meta-row ai-score-meta">
                        <Sparkles size={14} className="meta-icon-ai" />
                        <span className="meta-text">AI Score: <strong>{report.aiAssessment.score}/100</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="card-bottom-action">
                    <span className="track-link-text">Track Live Status</span>
                    <ArrowRight size={16} className="arrow-icon" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}