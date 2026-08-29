import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, MapPin, Calendar, ArrowRight, ShieldCheck, Camera, Sparkles, Filter, Search } from 'lucide-react';
import { getReports } from '../../services/reportStorage';
import './MyReportsPage.css';

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const list = getReports();
    setReports(list);
  }, []);

  const filteredReports = reports.filter((r) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'ACTIVE') return r.status !== 'RESOLVED';
    if (filterType === 'RESOLVED') return r.status === 'RESOLVED';
    return true;
  });

  const getPriorityBadgeClass = (level) => {
    const l = String(level || 'MEDIUM').toUpperCase();
    if (l === 'CRITICAL') return 'badge-critical';
    if (l === 'HIGH') return 'badge-high';
    if (l === 'MEDIUM') return 'badge-medium';
    return 'badge-low';
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status || 'PENDING').toUpperCase();
    if (s === 'RESOLVED' || s === 'APPROVED') return 'status-badge-green';
    if (s === 'UNDER_REVIEW' || s === 'AI_ANALYSIS') return 'status-badge-amber';
    if (s === 'ASSIGNED' || s === 'IN_PROGRESS') return 'status-badge-blue';
    return 'status-badge-gray';
  };

  return (
    <div className="container">
      <div className="my-reports-page-shell">
        {/* Header Title Banner */}
        <div className="my-reports-header">
          <div className="header-text-block">
            <div className="title-with-icon">
              <FileText size={28} className="header-icon" />
              <h1>My Civic Waste Reports</h1>
            </div>
            <p className="header-subtitle">
              View and track all citizen issues reported from your browser across Kopargaon municipal wards.
            </p>
          </div>

          <div className="header-action-block">
            <Link to="/report/waste" className="btn-primary btn-new-report">
              <PlusCircle size={18} />
              <span>Report New Issue</span>
            </Link>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="reports-filter-bar">
          <div className="filter-pill-group">
            <button 
              type="button" 
              className={`filter-pill ${filterType === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterType('ALL')}
            >
              All Reports ({reports.length})
            </button>
            <button 
              type="button" 
              className={`filter-pill ${filterType === 'ACTIVE' ? 'active' : ''}`}
              onClick={() => setFilterType('ACTIVE')}
            >
              Active ({reports.filter((r) => r.status !== 'RESOLVED').length})
            </button>
            <button 
              type="button" 
              className={`filter-pill ${filterType === 'RESOLVED' ? 'active' : ''}`}
              onClick={() => setFilterType('RESOLVED')}
            >
              Resolved ({reports.filter((r) => r.status === 'RESOLVED').length})
            </button>
          </div>
        </div>

        {/* Reports Listing Grid */}
        {filteredReports.length === 0 ? (
          <div className="empty-reports-card">
            <FileText size={48} className="empty-icon" />
            <h3>No reports found</h3>
            <p>You haven't submitted any civic waste reports under this filter category yet.</p>
            <Link to="/report/waste" className="btn-primary" style={{ marginTop: '1rem' }}>
              <PlusCircle size={16} />
              <span>Submit Your First Report</span>
            </Link>
          </div>
        ) : (
          <div className="reports-card-grid">
            {filteredReports.map((report) => {
              const id = report.id || report.reportId;
              const photoCount = report.photos?.length || 0;

              return (
                <div key={id} className="citizen-report-item-card">
                  <div className="card-top-header">
                    <div className="id-date-group">
                      <span className="report-id-chip">{id}</span>
                      <span className="report-date-text">
                        <Calendar size={13} />
                        {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div className="badge-group">
                      <span className={`priority-mini-pill ${getPriorityBadgeClass(report.priority || report.severity)}`}>
                        {report.priority || report.severity || 'Medium'}
                      </span>
                      <span className={`status-mini-pill ${getStatusBadgeClass(report.status)}`}>
                        {report.status || 'PENDING'}
                      </span>
                    </div>
                  </div>

                  <h3 className="card-issue-title">
                    {report.issue || report.wasteType || 'Civic Waste Issue'}
                  </h3>

                  <p className="card-desc-snippet">
                    "{report.description || 'Civic report registered with photo and location evidence.'}"
                  </p>

                  <div className="card-footer-meta">
                    <div className="meta-left">
                      <span className="location-meta-item">
                        <MapPin size={14} />
                        <span>{report.location?.area || report.location?.zone || 'Kopargaon'}</span>
                      </span>
                      {photoCount > 0 && (
                        <span className="photo-meta-item">
                          <Camera size={14} />
                          <span>{photoCount} Photo</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn-track-action"
                      onClick={() => navigate(`/track/${id}`)}
                    >
                      <span>Track Status</span>
                      <ArrowRight size={14} />
                    </button>
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