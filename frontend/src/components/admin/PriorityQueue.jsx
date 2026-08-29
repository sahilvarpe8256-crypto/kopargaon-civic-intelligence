import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ListOrdered, 
  Filter, 
  ArrowUpDown, 
  Sparkles, 
  Search, 
  HelpCircle, 
  FileQuestion,
  ExternalLink,
  Layers,
  CheckCircle2
} from 'lucide-react';
import PriorityReportCard from './PriorityReportCard';
import DuplicateClusterModal from '../report/DuplicateClusterModal';
import { detectDuplicateClusters } from '../../utils/duplicateDetection';
import './PriorityQueue.css';

const ZONES = ['All', 'Z01', 'Z02', 'Z03', 'Z04', 'Z05'];
const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['All', 'SUBMITTED', 'UNDER_REVIEW', 'AI_ANALYSIS', 'APPROVED', 'RESOLVED', 'DEFERRED'];
const DUP_FILTERS = ['All', 'Possible Duplicates', 'Confirmed Duplicates', 'Single Reports'];

export default function PriorityQueue({ 
  reports = [], 
  clusterDecisions = {},
  onReviewReport, 
  onClusterDecisionUpdated 
}) {
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [duplicateFilter, setDuplicateFilter] = useState('All');
  const [sortBy, setSortBy] = useState('highest_priority');
  const [searchTerm, setSearchTerm] = useState('');
  const [showWhyPanel, setShowWhyPanel] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState(null);

  // Compute duplicate clusters across all reports
  const { clusters, reportClusterMap } = useMemo(() => {
    return detectDuplicateClusters(reports, clusterDecisions);
  }, [reports, clusterDecisions]);

  // Helper to get numeric score for sorting
  const getScore = (report) => {
    return report.aiAssessment?.score || (report.severity === 'Critical' ? 85 : report.severity === 'High' ? 65 : 40);
  };

  const getLevel = (report) => {
    const s = getScore(report);
    return report.aiAssessment?.level || (s >= 80 ? 'CRITICAL' : s >= 60 ? 'HIGH' : s >= 35 ? 'MEDIUM' : 'LOW');
  };

  // Filtered and sorted reports
  const processedReports = useMemo(() => {
    return reports
      .filter((r) => {
        // Priority Filter
        if (priorityFilter !== 'All') {
          const lvl = getLevel(r);
          if (lvl.toUpperCase() !== priorityFilter.toUpperCase()) return false;
        }

        // Status Filter
        if (statusFilter !== 'All') {
          const st = (r.status || 'UNDER_REVIEW').toUpperCase();
          if (st !== statusFilter.toUpperCase()) return false;
        }

        // Zone Filter
        if (zoneFilter !== 'All') {
          const zoneId = r.location?.zone || '';
          const area = r.location?.area || '';
          if (!zoneId.includes(zoneFilter) && !area.includes(zoneFilter)) return false;
        }

        // Duplicate Filter
        if (duplicateFilter !== 'All') {
          const cluster = reportClusterMap.get(r.reportId);
          if (duplicateFilter === 'Possible Duplicates') {
            if (!cluster || cluster.status !== 'POSSIBLE') return false;
          } else if (duplicateFilter === 'Confirmed Duplicates') {
            if (!cluster || cluster.status !== 'CONFIRMED') return false;
          } else if (duplicateFilter === 'Single Reports') {
            if (cluster && cluster.status !== 'SEPARATE') return false;
          }
        }

        // Search Filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const id = (r.reportId || '').toLowerCase();
          const type = (r.wasteType || '').toLowerCase();
          const area = (r.location?.area || '').toLowerCase();
          const desc = (r.description || '').toLowerCase();
          if (!id.includes(q) && !type.includes(q) && !area.includes(q) && !desc.includes(q)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'highest_priority') {
          return getScore(b) - getScore(a);
        }
        if (sortBy === 'lowest_priority') {
          return getScore(a) - getScore(b);
        }
        if (sortBy === 'newest') {
          return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0);
        }
        return 0;
      });
  }, [reports, priorityFilter, statusFilter, zoneFilter, duplicateFilter, sortBy, searchTerm, reportClusterMap]);

  const possibleDupCount = clusters.filter((c) => c.status === 'POSSIBLE').length;

  return (
    <div className="priority-queue-section">
      {/* Section Header */}
      <div className="queue-header-row">
        <div>
          <div className="queue-title-badge-group">
            <h2 className="queue-section-title">AI Priority Queue</h2>
            <span className="queue-live-count">{processedReports.length} Reports</span>
            {possibleDupCount > 0 && (
              <span className="queue-dup-indicator">
                <Layers size={13} />
                <span>{possibleDupCount} Duplicate {possibleDupCount === 1 ? 'Cluster' : 'Clusters'}</span>
              </span>
            )}
          </div>
          <p className="queue-section-sub">
            Reports ranked by urgency with AI duplicate cluster detection to optimize municipal field response.
          </p>
        </div>

        <button 
          type="button" 
          className="btn-why-order"
          onClick={() => setShowWhyPanel(!showWhyPanel)}
        >
          <Sparkles size={15} />
          <span>Why this order?</span>
        </button>
      </div>

      {/* Explanatory Banner: "Why this order?" */}
      {showWhyPanel && (
        <div className="why-order-panel">
          <div className="why-order-content">
            <Sparkles size={18} className="why-icon" />
            <div>
              <strong>Algorithmic Prioritization &amp; Duplicate Logic:</strong> Reports are prioritized by evidence severity, proximity to public waterways, and risk indicators. Multi-submission correlation links reports by geographic radius (&lt;150m), time window (&lt;60m), and problem category without deleting audit records.
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls Toolbar */}
      <div className="queue-toolbar">
        {/* Search Input */}
        <div className="toolbar-search-box">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="toolbar-search-input"
            placeholder="Search report ID, type, or ward..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter dropdowns & sorting */}
        <div className="toolbar-controls-row">
          {/* Duplicate Intelligence Filter */}
          <div className="filter-select-group">
            <label className="filter-select-label">Clusters:</label>
            <select
              className="toolbar-select dup-highlight-select"
              value={duplicateFilter}
              onChange={(e) => setDuplicateFilter(e.target.value)}
            >
              {DUP_FILTERS.map((df) => (
                <option key={df} value={df}>{df}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="filter-select-group">
            <label className="filter-select-label">Priority:</label>
            <select
              className="toolbar-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-select-group">
            <label className="filter-select-label">Status:</label>
            <select
              className="toolbar-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Zone Filter */}
          <div className="filter-select-group">
            <label className="filter-select-label">Zone:</label>
            <select
              className="toolbar-select"
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
            >
              {ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-select-group">
            <label className="filter-select-label">Sort:</label>
            <select
              className="toolbar-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="highest_priority">Highest Priority</option>
              <option value="lowest_priority">Lowest Priority</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue Report List */}
      {processedReports.length === 0 ? (
        <div className="empty-queue-card">
          <div className="empty-icon-circle">
            <FileQuestion size={36} />
          </div>
          <h3 className="empty-queue-title">No civic reports available</h3>
          <p className="empty-queue-desc">
            No reports match the selected filters or search terms. Citizen reports will appear here automatically once submitted.
          </p>
          <div className="empty-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => {
                setPriorityFilter('All');
                setStatusFilter('All');
                setZoneFilter('All');
                setDuplicateFilter('All');
                setSearchTerm('');
              }}
            >
              Reset Filters
            </button>
            <Link to="/" className="btn-primary">
              <span>View Citizen Portal</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="queue-cards-list">
          {processedReports.map((report) => (
            <PriorityReportCard
              key={report.reportId}
              report={report}
              cluster={reportClusterMap.get(report.reportId)}
              onReview={onReviewReport}
              onViewCluster={(cl) => setSelectedCluster(cl)}
            />
          ))}
        </div>
      )}

      {/* Duplicate Cluster Modal */}
      {selectedCluster && (
        <DuplicateClusterModal
          cluster={selectedCluster}
          onClose={() => setSelectedCluster(null)}
          onClusterUpdated={(clusterId, status) => {
            if (onClusterDecisionUpdated) {
              onClusterDecisionUpdated(clusterId, status);
            }
          }}
        />
      )}
    </div>
  );
}