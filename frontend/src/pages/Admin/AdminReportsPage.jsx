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
import { getReports } from '../../services/reportStorage';
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
  const navigate = useNavigate();

  useEffect(() => {
    const list = getReports();
    setReports(list);
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // 1. Search filter
      const term = searchTerm.toLowerCase();
      const rId = String(r.id || r.reportId || '').toLowerCase();
      const issue = String(r.issue || r.wasteType || '').toLowerCase();
      const loc = String(r.location?.area || r.location?.address || '').toLowerCase();
      const matchesSearch = !term || rId.includes(term) || issue.includes(term) || loc.includes(term);

      // 2. Priority filter
      const rPriority = String(r.priority || r.severity || 'Medium').toLowerCase();
      const matchesPriority = priorityFilter === 'All' || rPriority === priorityFilter.toLowerCase();

      // 3. Status filter
      const rStatus = String(r.status || 'PENDING').toLowerCase().replace('_', ' ');
      const matchesStatus = statusFilter === 'All' || rStatus === statusFilter.toLowerCase();

      // 4. Category filter
      const rCat = String(r.category || 'Waste').toLowerCase();
      const matchesCategory = categoryFilter === 'All' || rCat === categoryFilter.toLowerCase();

      return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
    });
  }, [reports, searchTerm, priorityFilter, statusFilter, categoryFilter]);

  return (
    <div className="admin-layout-root">
      <AdminSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      <div className="admin-main-viewport">
        <AdminHeader 
          title="All Municipal Citizen Reports"
          subtitle="Comprehensive list of citizen issues, priority scoring, and municipal dispatch status across Kopargaon."
          onMenuToggle={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        <div className="admin-content-container">
          {/* Controls and Search Bar */}
          <div className="reports-controls-card">
            <div className="controls-search-row">
              <div className="admin-search-wrapper">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  className="admin-search-input"
                  placeholder="Search by Report ID (e.g. KOP-1024), keywords, or municipal ward..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="controls-filters-row">
              {/* Priority Filter */}
              <div className="filter-group-inline">
                <span className="filter-group-label">Priority:</span>
                <div className="filter-chips-flex">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`filter-chip-admin ${priorityFilter === p ? 'active' : ''}`}
                      onClick={() => setPriorityFilter(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="filter-group-inline">
                <span className="filter-group-label">Status:</span>
                <select 
                  className="filter-select-dropdown"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="filter-group-inline">
                <span className="filter-group-label">Category:</span>
                <select 
                  className="filter-select-dropdown"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reports Table & List */}
          <div className="reports-table-card">
            <div className="table-header-info">
              <span className="results-count">
                Showing <strong>{filteredReports.length}</strong> of {reports.length} total municipal reports
              </span>
            </div>

            {filteredReports.length === 0 ? (
              <div className="no-reports-found-box">
                <FileText size={42} className="no-reports-icon" />
                <h4>No reports match your filters</h4>
                <p>Try resetting the search terms or clearing priority and status filters.</p>
              </div>
            ) : (
              <div className="table-responsive-wrapper">
                <table className="admin-reports-table">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Category &amp; Issue</th>
                      <th>Location / Ward</th>
                      <th>Priority Score</th>
                      <th>Status</th>
                      <th>Reported</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => {
                      const id = report.id || report.reportId;
                      const score = report.priorityScore || report.aiAssessment?.score || calculatePriorityScore(report);
                      const priority = report.priority || report.severity || 'Medium';

                      return (
                        <tr key={id} className="report-table-row">
                          <td className="report-id-cell">
                            <span className="id-code">{id}</span>
                          </td>
                          <td className="issue-cell">
                            <div className="issue-main-text">{report.issue || report.wasteType || 'Civic Issue'}</div>
                            <span className="issue-sub-category">{report.category || 'Waste'}</span>
                          </td>
                          <td className="location-cell">
                            <div className="location-name">
                              <MapPin size={13} className="loc-icon" />
                              <span>{report.location?.area || report.location?.zone || 'Kopargaon Zone'}</span>
                            </div>
                          </td>
                          <td className="priority-cell">
                            <PriorityBadge priority={priority} score={score} />
                          </td>
                          <td className="status-cell">
                            <span className={`status-pill-admin status-${String(report.status || 'PENDING').toLowerCase()}`}>
                              {report.status || 'PENDING'}
                            </span>
                          </td>
                          <td className="date-cell">
                            <span className="date-text">
                              <Calendar size={13} />
                              {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : 'Recent'}
                            </span>
                          </td>
                          <td className="action-cell text-right">
                            <button
                              type="button"
                              className="btn-table-inspect"
                              onClick={() => navigate(`/admin/reports/${id}`)}
                            >
                              <span>Inspect</span>
                              <ArrowRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}