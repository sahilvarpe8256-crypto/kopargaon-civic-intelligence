import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Filter, 
  Layers, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Compass, 
  RefreshCw,
  Eye,
  Building2,
  Users
} from 'lucide-react';

import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import CivicLeafletMap from '../../components/common/CivicLeafletMap';
import PriorityBadge from '../../components/admin/PriorityBadge';
import { getReports } from '../../services/reportStorage';
import './AdminMapPage.css';

const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['All', 'PENDING', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED'];

export default function AdminMapPage() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const navigate = useNavigate();

  const loadReports = () => {
    setIsLoading(true);
    try {
      const list = getReports();
      setReports(list);
      setLastUpdated(new Date().toLocaleTimeString());
      if (list.length > 0 && !selectedReport) {
        setSelectedReport(list[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // Auto-refresh polling every 20 seconds
    const interval = setInterval(loadReports, 20000);
    return () => clearInterval(interval);
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const p = String(r.priority || r.aiAssessment?.level || r.severity || 'Medium').toUpperCase();
      if (priorityFilter !== 'All' && p !== priorityFilter.toUpperCase()) return false;

      const st = String(r.status || 'PENDING').toUpperCase();
      if (statusFilter !== 'All' && st !== statusFilter.toUpperCase()) return false;

      const cat = String(r.category || '').toLowerCase();
      if (categoryFilter !== 'All' && !cat.includes(categoryFilter.toLowerCase())) return false;

      return true;
    });
  }, [reports, priorityFilter, statusFilter, categoryFilter]);

  return (
    <div className="admin-page-layout">
      <AdminSidebar
        activeSection="map"
        onSelectSection={(sec) => {
          if (sec === 'dashboard') navigate('/admin/dashboard');
          if (sec === 'reports') navigate('/admin/reports');
          if (sec === 'map') navigate('/admin/map');
        }}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="admin-main-wrapper">
        <AdminHeader onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="admin-content-body">
          <div className="admin-map-page-container">
            {/* Header Strip */}
            <div className="map-page-header-card">
              <div className="map-header-left">
                <div className="map-icon-badge">
                  <Compass size={24} />
                </div>
                <div>
                  <div className="map-title-row">
                    <h1 className="map-page-title">Kopargaon Civic GIS Intelligence Map</h1>
                    <div className="live-pulse-badge">
                      <span className="live-pulse-dot" />
                      <span>Live GIS • Updated {lastUpdated}</span>
                    </div>
                  </div>
                  <p className="map-page-subtitle">
                    Spatial hotspot distribution and real-time municipal ward triage across Kopargaon Municipal Council jurisdiction.
                  </p>
                </div>
              </div>

              <button type="button" className="btn-refresh-map" onClick={loadReports} disabled={isLoading}>
                <RefreshCw size={15} className={isLoading ? 'spinning' : ''} />
                <span>{isLoading ? 'Refreshing...' : 'Refresh Map'}</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="map-filters-bar">
              <div className="filter-item-group">
                <span className="filter-lbl">Priority:</span>
                <div className="filter-chips">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`f-chip ${priorityFilter === p ? 'active' : ''}`}
                      onClick={() => setPriorityFilter(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-item-group">
                <span className="filter-lbl">Status:</span>
                <select 
                  className="map-select-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <span className="map-reports-count">
                Showing <strong>{filteredReports.length}</strong> active geo-located reports
              </span>
            </div>

            {/* Main Map + Drawer Grid */}
            <div className="map-interactive-layout-grid">
              {/* Left Main Map */}
              <div className="map-main-canvas-box">
                <CivicLeafletMap
                  reports={filteredReports}
                  height="580px"
                  onSelectReport={(r) => setSelectedReport(r)}
                />
              </div>

              {/* Right Side Inspector Drawer */}
              <div className="map-side-inspector-card">
                {selectedReport ? (
                  <div className="inspector-content">
                    <div className="insp-top-row">
                      <span className="insp-report-id">{selectedReport.report_id || selectedReport.id}</span>
                      <PriorityBadge 
                        priority={selectedReport.priority || selectedReport.aiAssessment?.level || selectedReport.severity || 'Medium'} 
                        score={selectedReport.priorityScore || selectedReport.aiAssessment?.score || 75} 
                      />
                    </div>

                    <h3 className="insp-issue-title">
                      {selectedReport.title || selectedReport.issue || selectedReport.wasteType}
                    </h3>

                    <div className="insp-kv-list">
                      <div className="insp-kv">
                        <span className="kv-k">Category:</span>
                        <span className="kv-v">{selectedReport.category || 'Waste'}</span>
                      </div>
                      <div className="insp-kv">
                        <span className="kv-k">Status:</span>
                        <span className="kv-v status-highlight">{selectedReport.status || 'PENDING'}</span>
                      </div>
                      <div className="insp-kv">
                        <span className="kv-k">Location:</span>
                        <span className="kv-v">{selectedReport.location?.area || 'Kopargaon Zone'}</span>
                      </div>
                      <div className="insp-kv">
                        <span className="kv-k">Coordinates:</span>
                        <span className="kv-v font-mono">
                          {selectedReport.location?.latitude || 19.8845}° N, {selectedReport.location?.longitude || 74.4682}° E
                        </span>
                      </div>
                      <div className="insp-kv">
                        <span className="kv-k">Reported Severity:</span>
                        <span className="kv-v">{selectedReport.severity || 'Medium'}</span>
                      </div>
                      <div className="insp-kv">
                        <span className="kv-k">AI Confidence:</span>
                        <span className="kv-v text-teal">{selectedReport.aiAssessment?.confidence || selectedReport.aiConfidence || 91}%</span>
                      </div>
                    </div>

                    {selectedReport.description && (
                      <div className="insp-desc-box">
                        <span className="insp-desc-lbl">Observation:</span>
                        <p>"{selectedReport.description}"</p>
                      </div>
                    )}

                    <div className="insp-action-box">
                      <Link 
                        to={`/admin/reports/${selectedReport.report_id || selectedReport.id}`}
                        className="btn-primary btn-insp-open"
                      >
                        <span>Open Report Triage</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="insp-empty-placeholder">
                    <MapPin size={32} className="insp-empty-icon" />
                    <p>Click any map marker to view quick issue insights and triage dispatch.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
