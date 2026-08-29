import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, RefreshCw, Eye } from 'lucide-react';
import ResourceCards from '../components/ResourceCards';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import ReportDetailModal from '../components/ReportDetailModal';
import PrioritizationModal from '../components/PrioritizationModal';
import { DashboardService } from '../services/dashboardService';
import { ReportService } from '../services/reportService';
import { KOPARGAON_ZONES, STATUS_LABELS } from '../utils/constants';

export default function MunicipalDashboardPage() {
  const navigate = useNavigate();
  const [resourceState, setResourceState] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting
  const [statusFilter, setStatusFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [sortBy, setSortBy] = useState('priorityScore');
  const [order, setOrder] = useState('desc');

  // Modals
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [prioritizationResult, setPrioritizationResult] = useState(null);
  const [isPrioritizationOpen, setIsPrioritizationOpen] = useState(false);
  const [isPrioritizing, setIsPrioritizing] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [resResources, resReports] = await Promise.all([
        DashboardService.getResources(),
        ReportService.getReports({
          status: statusFilter || undefined,
          zoneId: zoneFilter || undefined,
          sortBy,
          order
        })
      ]);

      if (resResources.success) setResourceState(resResources.data);
      if (resReports.success) setReports(resReports.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, zoneFilter, sortBy, order]);

  const handleRunPrioritize = async () => {
    setIsPrioritizing(true);
    try {
      const res = await DashboardService.runPrioritization();
      if (res.success && res.data) {
        setPrioritizationResult(res.data);
        setIsPrioritizationOpen(true);
        loadData(); // Refresh queue after prioritization run
      }
    } catch (err) {
      alert(`Prioritization run failed: ${err.message}`);
    } finally {
      setIsPrioritizing(false);
    }
  };

  const handleInspectReport = (report) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  const handleStatusUpdate = async (id, updatePayload) => {
    await ReportService.updateStatus(id, updatePayload);
    loadData(); // refresh table
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--slate-900)' }}>
            Municipal Operations Dashboard
          </h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
            Real-time Civic Hazard Triage, Resource Constraints & Automated Dispatch
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="btn btn-secondary"
            title="Refresh records"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleRunPrioritize}
            disabled={isPrioritizing}
            className="btn btn-primary"
            style={{ boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)' }}
          >
            <Sparkles size={16} className={isPrioritizing ? 'animate-spin' : ''} />
            <span>{isPrioritizing ? 'Optimizing...' : 'Run Prioritization Engine'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Live Resource State Gauges */}
      <ResourceCards resourceState={resourceState} />

      {/* Priority Queue Container */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 className="card-title">Priority Incident Queue ({reports.length})</h3>
            <p className="card-subtitle">
              Ranked objectively by Severity, Population Density, Health Hazard, Environmental Risk & Obstruction
            </p>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
            >
              <option value="">All Kopargaon Zones</option>
              {KOPARGAON_ZONES.map((z) => (
                <option key={z.zoneId} value={z.zoneId}>{z.zoneId}: {z.name}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord);
              }}
            >
              <option value="priorityScore-desc">Highest Priority First</option>
              <option value="priorityScore-asc">Lowest Priority First</option>
              <option value="createdAt-desc">Newest Reports First</option>
              <option value="createdAt-asc">Oldest Reports First</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        {isLoading && reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 0.5rem' }} />
            <p>Loading complaints queue...</p>
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-700)' }}>No complaints found matching selected filters.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Try clearing status or zone filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--slate-200)', color: 'var(--slate-600)', fontSize: '0.775rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Report ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Priority Score</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Zone</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Visual Risk Breakdown</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Reported</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr
                    key={r.reportId || r._id || r.id}
                    style={{ borderBottom: '1px solid var(--slate-100)', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--slate-50)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {r.reportId || r.id}
                    </td>

                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <PriorityBadge score={r.priorityScore} />
                    </td>

                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{r.zoneId}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block' }}>{r.zoneName}</span>
                    </td>

                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <StatusBadge status={r.status} />
                    </td>

                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', fontSize: '0.75rem' }}>
                        <span title="Severity" style={{ background: 'var(--slate-100)', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
                          S: <strong>{r.severity ?? 50}</strong>
                        </span>
                        <span title="Health Hazard" style={{ background: 'var(--slate-100)', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
                          H: <strong>{r.healthRisk ?? 50}</strong>
                        </span>
                        <span title="Obstruction" style={{ background: 'var(--slate-100)', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
                          O: <strong>{r.obstruction ?? 50}</strong>
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--slate-500)', fontSize: '0.8rem' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                    </td>

                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleInspectReport(r)}
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem', gap: '0.3rem' }}
                      >
                        <Eye size={14} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReportDetailModal
        report={selectedReport}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdateStatus={handleStatusUpdate}
      />

      <PrioritizationModal
        recommendation={prioritizationResult}
        isOpen={isPrioritizationOpen}
        onClose={() => setIsPrioritizationOpen(false)}
      />
    </div>
  );
}