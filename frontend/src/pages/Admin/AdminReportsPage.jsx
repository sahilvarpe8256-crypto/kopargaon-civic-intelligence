import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  Layers, 
  Clock, 
  ArrowRight, 
  Eye, 
  MapPin, 
  CheckCircle2,
  Calendar,
  Building2
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import PriorityBadge from '../../components/admin/PriorityBadge';
import { fetchAdminReports } from '../../services/api';
import { calculatePriorityScore } from '../../utils/mockReports';
import './AdminReportsPage.css';

const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['All', 'Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected'];
const CATEGORIES = ['All', 'Waste', 'Water', 'Roads', 'Lighting', 'Public Spaces', 'Hazards', 'Animals'];

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function loadReports() {
      setIsLoading(true);
      try {
        const list = await fetchAdminReports();
        if (isMounted) setReports(list);
      } catch (err) {
        console.warn('Admin reports fetch failed:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadReports();
    return () => { isMounted = false; };
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const scoreObj = calculatePriorityScore(r);

      // Priority Filter
      if (priorityFilter !== 'All') {
        if (scoreObj.level.toUpperCase() !== priorityFilter.toUpperCase()) return false;
      }

      // Status Filter
      if (statusFilter !== 'All') {
        const normalizedTarget = statusFilter.toUpperCase().replace(/\s+/g, '_');
        const rStatus = String(r.status || 'PENDING').toUpperCase();
        if (rStatus !== normalizedTarget && !rStatus.includes(normalizedTarget)) return false;
      }

      // Category Filter
      if (categoryFilter !== 'All') {
        const cat = String(r.category || '').toLowerCase();
        const target = categoryFilter.toLowerCase();
        if (!cat.includes(target) && !target.includes(cat)) return false;
      }

      // Search Term (ID, Issue, Location)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const id = String(r.reportId || r.id || '').toLowerCase();
        const issue = String(r.title || r.issue || r.wasteType || '').toLowerCase();
        const loc = String(r.location?.area || r.location?.address || '').toLowerCase();
        if (!id.includes(q) && !issue.includes(q) && !loc.includes(q)) return false;
      }

      return true;
    });
  }, [reports, priorityFilter, statusFilter, categoryFilter, searchTerm]);

  return (
    <div className="admin-page-layout">
      <AdminSidebar
        activeSection="reports"
        onSelectSection={(sec) => {
          if (sec === 'dashboard') navigate('/admin/dashboard');
        }}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="admin-main-wrapper">
        <AdminHeader onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} unreviewedCount={reports.length} />

        <main className="admin-content-body">
          <div className="reports-page-container">
            {/* Header Title */}
            <div className="reports-title-row">
              <div>
                <h1 className="reports-header-title">Civic Report Management</h1>
                <p className="reports-header-sub">
                  Master registry of citizen reports across Kopargaon Municipal Council jurisdiction.
                </p>
              </div>
              <span className="reports-count-pill">{filteredReports.length} Reports Found</span>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="reports-filter-panel">
              <div className="search-bar-col">
                <Search size={16} className="search-bar-icon" />
                <input
                  type="text"
                  className="search-bar-input"
                  placeholder="Search by Report ID, issue title, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="dropdowns-grid-row">
                <div className="select-unit">
                  <label>Priority:</label>
                  <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="select-unit">
                  <label>Status:</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="select-unit">
                  <label>Category:</label>
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Master Reports Table */}
            <div className="reports-table-card">
              <div className="table-responsive-wrapper">
                <table className="civic-reports-table">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Issue</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Similar Reports</th>
                      <th>Submitted Date</th>
                      <th className="th-action">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => {
                      const scoreObj = calculatePriorityScore(report);
                      const count = report.similarReports || report.supportingReports || 1;
                      const repId = report.reportId || report.id;

                      return (
                        <tr key={repId} onClick={() => navigate(`/admin/reports/${repId}`)}>
                          <td>
                            <span className="tbl-report-id">{repId}</span>
                          </td>
                          <td>
                            <span className="tbl-issue-title">{report.title || report.issue || report.wasteType}</span>
                          </td>
                          <td>
                            <span className="tbl-category-badge">{report.category || 'Waste'}</span>
                          </td>
                          <td>
                            <div className="tbl-loc-cell">
                              <MapPin size={13} className="loc-icon-sm" />
                              <span>{report.location?.area || 'Station Road, Kopargaon'}</span>
                            </div>
                          </td>
                          <td>
                            <PriorityBadge level={scoreObj.level} score={scoreObj.score} />
                          </td>
                          <td>
                            <span className={`tbl-status-pill status-${String(report.status || 'PENDING').toLowerCase()}`}>
                              {report.status || 'PENDING'}
                            </span>
                          </td>
                          <td>
                            {count > 1 ? (
                              <span className="tbl-dup-count-badge">
                                <Layers size={13} />
                                <span>{count} similar reports</span>
                              </span>
                            ) : (
                              <span className="tbl-single-report-text">1 report</span>
                            )}
                          </td>
                          <td>
                            <span className="tbl-date-text">
                              {new Date(report.submittedAt || Date.now()).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </td>
                          <td className="th-action">
                            <Link 
                              to={`/admin/reports/${repId}`} 
                              className="btn-tbl-view-action"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Eye size={14} />
                              <span>View</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}