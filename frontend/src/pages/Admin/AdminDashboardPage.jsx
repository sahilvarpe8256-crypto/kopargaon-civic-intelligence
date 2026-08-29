import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  Flame, 
  Layers, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Sparkles, 
  Users, 
  MapPin, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  Play,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

import AdminSidebar from '../../components/admin/AdminSidebar';
import StatCard from '../../components/admin/StatCard';
import PriorityBadge from '../../components/admin/PriorityBadge';
import PriorityIntelligenceCard from '../../components/admin/PriorityIntelligenceCard';
import DuplicateGroup from '../../components/admin/DuplicateGroup';
import HotspotMap from '../../components/admin/HotspotMap';
import Toast from '../../components/common/Toast';

import { getReports, updateReportStatus, resetMockData } from '../../services/reportStorage';
import { calculatePriorityScore } from '../../utils/mockReports';
import './AdminDashboardPage.css';

const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['All', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

export default function AdminDashboardPage() {
  const [reports, setReports] = useState([]);
  const [statsData, setStatsData] = useState({
    totalReports: 128,
    totalReportsTrend: '↑ 12 this week',
    pendingReview: 34,
    highPriority: 12,
    inProgress: 27,
    resolved: 55
  });
  const [resourcesData, setResourcesData] = useState({
    workers: { available: 18, assigned: 12, total: 30 },
    vehicles: { available: 6, assigned: 4, total: 10 },
    budget: { allocated_inr: 30000, remaining_inr: 45000, total_inr: 75000 },
    utilizationRate: 58,
    activeTeams: [
      { name: 'Waste Management Team', status: 'Active', members: 6, vehicle: 'Large Compactor Truck #1', available: true },
      { name: 'Sanitation Team', status: 'Active', members: 4, vehicle: 'Mini Tipper Van #2', available: true },
      { name: 'Municipal Inspection Team', status: 'Active', members: 2, vehicle: 'Inspection Jeep #1', available: true },
      { name: 'Emergency Response Team', status: 'Standby', members: 6, vehicle: 'Hydraulic Backhoe Loader', available: true }
    ]
  });
  const [selectedLeadReport, setSelectedLeadReport] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const navigate = useNavigate();

  // Filters & Sorting for Queue
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('highest_priority');
  const [searchTerm, setSearchTerm] = useState('');

  const refreshReports = (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = getReports();
      setReports(data);
      if (data && data.length > 0) {
        setSelectedLeadReport(data[0]);
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshReports(true);
    // Real-time polling every 20 seconds
    const interval = setInterval(() => {
      refreshReports(false);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Filtered & Sorted Priority Queue
  const processedReports = useMemo(() => {
    return reports
      .filter((r) => {
        const scoreObj = calculatePriorityScore(r);

        if (priorityFilter !== 'All') {
          if (scoreObj.level.toUpperCase() !== priorityFilter.toUpperCase()) return false;
        }

        if (statusFilter !== 'All') {
          const st = String(r.status || 'PENDING').toUpperCase();
          if (st !== statusFilter.toUpperCase()) return false;
        }

        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const id = String(r.reportId || r.id || '').toLowerCase();
          const it = String(r.title || r.issue || r.wasteType || '').toLowerCase();
          const loc = String(r.location?.area || r.location?.address || '').toLowerCase();
          const cat = String(r.category || '').toLowerCase();
          if (!id.includes(q) && !it.includes(q) && !loc.includes(q) && !cat.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const scoreA = calculatePriorityScore(a).score;
        const scoreB = calculatePriorityScore(b).score;
        const repsA = a.similarReports || a.supportingReports || 1;
        const repsB = b.similarReports || b.supportingReports || 1;

        if (sortBy === 'highest_priority') return scoreB - scoreA;
        if (sortBy === 'newest') return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
        if (sortBy === 'oldest') return new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0);
        if (sortBy === 'most_reports') return repsB - repsA;
        return 0;
      });
  }, [reports, priorityFilter, statusFilter, sortBy, searchTerm]);

  // Top Priority issues for Priority Intelligence section
  const topPriorityList = useMemo(() => {
    return [...reports]
      .sort((a, b) => calculatePriorityScore(b).score - calculatePriorityScore(a).score)
      .slice(0, 6);
  }, [reports]);

  const leadIssue = selectedLeadReport || reports.find(r => r.reportId === 'KOP-1024' || r.id === 'KOP-1024') || reports[0];

  const handleResetData = () => {
    const fresh = resetMockData();
    setReports(fresh);
    setSelectedLeadReport(fresh[0]);
    setToastMessage('Prototype mock database refreshed to initial state.');
  };

  return (
    <div className="admin-page-layout">
      {/* Officer Navigation Sidebar */}
      <AdminSidebar
        activeSection="dashboard"
        onSelectSection={() => {}}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="admin-main-wrapper">
        {/* Command Center Top Header */}
        <header className="admin-command-header">
          <div className="command-header-left">
            <div className="council-small-tag">Kopargaon Municipal Council</div>
            <h1 className="command-header-title">Civic Intelligence Dashboard</h1>
            <p className="command-header-sub">
              Convert citizen complaints into prioritized, actionable municipal operations.
            </p>
          </div>

          <div className="command-header-right">
            <div className="live-data-indicator-pill" title="Auto-refreshing live dashboard data">
              <span className="live-pulse-dot" />
              <span>Live Data • {lastUpdated}</span>
            </div>
            <button 
              type="button" 
              className="btn-reset-proto" 
              onClick={() => refreshReports(true)}
              disabled={isLoading}
              title="Refresh municipal dashboard data"
            >
              <RefreshCw size={14} className={isLoading ? 'spinning' : ''} />
              <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <Link to="/admin/map" className="btn-all-reports-header" style={{ backgroundColor: '#0f766e', color: 'white' }}>
              <Compass size={15} />
              <span>Civic GIS Map</span>
            </Link>
            <Link to="/admin/reports" className="btn-all-reports-header">
              <FileText size={15} />
              <span>All Reports ({reports.length})</span>
            </Link>
          </div>
        </header>

        <main className="admin-content-body">
          <div className="dashboard-view-container">
            {/* 5 Summary Statistics Cards */}
            <div className="stat-cards-grid">
              <StatCard
                title="Total Reports"
                value={String(statsData.totalReports || 128)}
                subtitle="All Kopargaon municipal wards"
                icon={FileText}
                variant="primary"
                trend={statsData.totalReportsTrend || '↑ 12 this week'}
              />
              <StatCard
                title="Pending"
                value={String(statsData.pendingReview || 34)}
                subtitle="Pending Review"
                icon={Clock}
                variant="amber"
                trend="Awaiting action"
              />
              <StatCard
                title="High Priority"
                value={String(statsData.highPriority || 12)}
                subtitle="High Priority"
                icon={Flame}
                variant="crimson"
                trend="Score ≥ 60"
              />
              <StatCard
                title="In Progress"
                value={String(statsData.inProgress || 27)}
                subtitle="In Progress"
                icon={Play}
                variant="amber"
                trend="Field teams dispatched"
              />
              <StatCard
                title="Resolved"
                value={String(statsData.resolved || 55)}
                subtitle="Resolved"
                icon={CheckCircle2}
                variant="green"
                trend="Civic issues closed"
              />
            </div>

            {/* MUNICIPAL RESOURCE INTELLIGENCE PANEL */}
            <section className="municipal-resources-card">
              <div className="res-header-row">
                <div className="res-title-box">
                  <Building2 size={20} className="res-icon-teal" />
                  <div>
                    <h3 className="res-section-title">Municipal Resource Intelligence</h3>
                    <span className="res-section-sub">Operational capacity &amp; field crew allocation for Kopargaon Ward Operations</span>
                  </div>
                </div>
                <div className="res-util-pill">
                  <span>Capacity Utilization: <strong>{resourcesData.utilizationRate || 58}%</strong></span>
                </div>
              </div>

              <div className="res-kpi-grid">
                <div className="res-kpi-box">
                  <span className="kpi-label">Workers Deployment</span>
                  <div className="kpi-main-val">
                    <strong>{resourcesData.workers?.available || 18}</strong>
                    <span className="kpi-sub-val">/ {resourcesData.workers?.total || 30} Available</span>
                  </div>
                  <div className="kpi-bar-track">
                    <div className="kpi-bar-fill" style={{ width: `${Math.round(((resourcesData.workers?.assigned || 12) / (resourcesData.workers?.total || 30)) * 100)}%`, backgroundColor: '#0f766e' }} />
                  </div>
                  <span className="kpi-foot-note">{resourcesData.workers?.assigned || 12} assigned to active civic tasks</span>
                </div>

                <div className="res-kpi-box">
                  <span className="kpi-label">Fleet &amp; Heavy Vehicles</span>
                  <div className="kpi-main-val">
                    <strong>{resourcesData.vehicles?.available || 6}</strong>
                    <span className="kpi-sub-val">/ {resourcesData.vehicles?.total || 10} Available</span>
                  </div>
                  <div className="kpi-bar-track">
                    <div className="kpi-bar-fill" style={{ width: `${Math.round(((resourcesData.vehicles?.assigned || 4) / (resourcesData.vehicles?.total || 10)) * 100)}%`, backgroundColor: '#0284c7' }} />
                  </div>
                  <span className="kpi-foot-note">{resourcesData.vehicles?.assigned || 4} vehicles on field routes</span>
                </div>

                <div className="res-kpi-box">
                  <span className="kpi-label">Sanitation Operations Budget</span>
                  <div className="kpi-main-val">
                    <strong>₹{(resourcesData.budget?.remaining_inr || 45000).toLocaleString('en-IN')}</strong>
                    <span className="kpi-sub-val">Remaining</span>
                  </div>
                  <div className="kpi-bar-track">
                    <div className="kpi-bar-fill" style={{ width: `${Math.round(((resourcesData.budget?.allocated_inr || 30000) / (resourcesData.budget?.total_inr || 75000)) * 100)}%`, backgroundColor: '#16a34a' }} />
                  </div>
                  <span className="kpi-foot-note">₹{(resourcesData.budget?.allocated_inr || 30000).toLocaleString('en-IN')} allocated in current cycle</span>
                </div>
              </div>

              {/* Active Teams Status Row */}
              <div className="active-teams-status-bar">
                <span className="teams-lbl">Operational Field Units:</span>
                <div className="teams-chip-list">
                  {(resourcesData.activeTeams || []).map((t, idx) => (
                    <div key={idx} className="team-status-pill">
                      <span className={`team-dot ${t.status === 'Active' ? 'dot-active' : 'dot-standby'}`} />
                      <span className="team-name">{t.name}</span>
                      <span className="team-tag">({t.members} crew • {t.vehicle.split('#')[0]})</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* PRIORITY INTELLIGENCE SECTION */}
            <section className="priority-intelligence-section" id="priority">
              <div className="section-heading-strip">
                <div className="heading-left-box">
                  <div className="section-icon-crimson">
                    <Flame size={22} />
                  </div>
                  <div>
                    <h2 className="section-block-heading">Priority Intelligence</h2>
                    <p className="section-block-sub">
                      Issues requiring the most immediate municipal attention
                    </p>
                  </div>
                </div>
                <div className="priority-counter-pill">
                  <span>AI Ranked by Public Impact &amp; Severity</span>
                </div>
              </div>

              {/* Priority Cards Grid */}
              <div className="priority-cards-showcase-grid">
                {topPriorityList.map((item) => {
                  const scoreObj = calculatePriorityScore(item);
                  const count = item.similarReports || item.supportingReports || 1;
                  const isSelected = (leadIssue?.reportId || leadIssue?.id) === (item.reportId || item.id);

                  return (
                    <div 
                      key={item.reportId || item.id} 
                      className={`priority-intel-card card-level-${scoreObj.level.toLowerCase()} ${isSelected ? 'is-selected-lead' : ''}`}
                      onClick={() => setSelectedLeadReport(item)}
                    >
                      <div className="intel-card-top-row">
                        <span className={`priority-level-badge level-${scoreObj.level.toLowerCase()}`}>
                          {scoreObj.level}
                        </span>
                        <span className="intel-card-id">{item.reportId || item.id}</span>
                      </div>

                      <h3 className="intel-card-issue">{item.title || item.issue || item.wasteType}</h3>

                      <div className="intel-card-location">
                        <MapPin size={14} className="pin-icon" />
                        <span>{item.location?.area || 'Station Road, Kopargaon'}</span>
                      </div>

                      <div className="intel-card-metrics-grid">
                        <div className="metric-box">
                          <span className="metric-lbl">Priority Score</span>
                          <strong className="metric-val-score">{scoreObj.score} / 100</strong>
                        </div>
                        <div className="metric-box">
                          <span className="metric-lbl">Similar Reports</span>
                          <strong className="metric-val">{count}</strong>
                        </div>
                        <div className="metric-box">
                          <span className="metric-lbl">Pending</span>
                          <span className="metric-val-age">{item.age || '2 days'}</span>
                        </div>
                      </div>

                      <div className="intel-card-rec-box">
                        <span className="rec-lbl">Recommended Action:</span>
                        <span className="rec-val">
                          {item.aiAssessment?.recommendedResponse?.split('.')[0] || 'Immediate municipal inspection'}
                        </span>
                      </div>

                      <div className="intel-card-footer-action">
                        <button 
                          type="button" 
                          className="btn-inspect-intel"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/reports/${item.reportId || item.id}`);
                          }}
                        >
                          <span>Review Full Evidence</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* PRIORITY SCORE EXPLANATION BREAKDOWN */}
            <PriorityIntelligenceCard report={leadIssue} />

            {/* DUPLICATE REPORT INTELLIGENCE SECTION */}
            <DuplicateGroup
              masterReport={leadIssue}
              onViewDetails={(r) => navigate(`/admin/reports/${r.reportId || r.id}`)}
              onMergeSuccess={(msg) => setToastMessage(msg)}
            />

            {/* MUNICIPAL REPORTS QUEUE & SEARCH */}
            <section className="priority-queue-panel">
              <div className="pq-header-row">
                <div>
                  <div className="pq-title-group">
                    <h2 className="pq-heading">Municipal Reports Queue</h2>
                    <span className="pq-counter-badge">{processedReports.length} Filtered Issues</span>
                  </div>
                  <p className="pq-subheading">
                    Active citizen submissions prioritized for dispatch and municipal workflow triage.
                  </p>
                </div>
              </div>

              {/* Filter and Sorting Toolbar */}
              <div className="pq-toolbar">
                <div className="pq-search-wrapper">
                  <Search size={16} className="pq-search-icon" />
                  <input
                    type="text"
                    className="pq-search-input"
                    placeholder="Search by Report ID, issue title, category, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="pq-filters-row">
                  <div className="pq-select-group">
                    <label>Priority:</label>
                    <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="pq-select-group">
                    <label>Status:</label>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="pq-select-group">
                    <label>Sort:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="highest_priority">Highest Priority</option>
                      <option value="most_reports">Most Reports</option>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Queue Items List */}
              <div className="pq-items-list">
                {processedReports.map((report) => {
                  const scoreObj = calculatePriorityScore(report);
                  const count = report.similarReports || report.supportingReports || 1;
                  const repId = report.reportId || report.id;

                  return (
                    <div key={repId} className="pq-report-row-card">
                      <div className="pq-col-main">
                        <div className="pq-id-priority-row">
                          <span className="pq-report-id">{repId}</span>
                          <PriorityBadge level={scoreObj.level} score={scoreObj.score} />
                          <span className={`pq-status-badge status-${String(report.status || 'PENDING').toLowerCase()}`}>
                            {report.status || 'PENDING'}
                          </span>
                          <span className="pq-category-pill">{report.category || 'Waste'}</span>
                        </div>

                        <h3 className="pq-issue-name">{report.title || report.issue || report.wasteType}</h3>

                        <div className="pq-meta-row">
                          <div className="pq-meta-item">
                            <MapPin size={14} className="pq-meta-icon" />
                            <span>{report.location?.area || 'Station Road, Kopargaon'}</span>
                          </div>
                          <div className="pq-meta-item">
                            <Clock size={14} className="pq-meta-icon" />
                            <span>Age: {report.age || '2 days'}</span>
                          </div>
                          {count > 1 && (
                            <div className="pq-meta-item dup-highlight-pill">
                              <Users size={13} />
                              <span>{count} similar reports</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pq-col-score">
                        <div className="score-meter-card">
                          <span className="score-meter-lbl">Priority Score</span>
                          <span className="score-big-num">{scoreObj.score}<span className="score-out-of">/100</span></span>
                          <div className="score-mini-track">
                            <div 
                              className={`score-mini-fill ${scoreObj.level.toLowerCase()}`}
                              style={{ width: `${scoreObj.score}%` }} 
                            />
                          </div>
                        </div>

                        <button 
                          type="button" 
                          className="btn-view-details"
                          onClick={() => navigate(`/admin/reports/${repId}`)}
                        >
                          <Eye size={15} />
                          <span>View Report</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Civic Issue Hotspots Map */}
            <HotspotMap onSelectHotspot={(hotspot) => {
              const matching = reports.find(r => r.location?.area?.includes(hotspot.location) || r.issue?.includes(hotspot.issue)) || reports[0];
              if (matching) navigate(`/admin/reports/${matching.reportId || matching.id}`);
            }} />
          </div>
        </main>
      </div>

      {/* Officer Action Notification Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}