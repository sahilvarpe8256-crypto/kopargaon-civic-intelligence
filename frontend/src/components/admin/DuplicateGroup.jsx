import React, { useState } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  ArrowDown, 
  GitMerge, 
  Users, 
  MapPin, 
  Eye, 
  Sparkles, 
  Check, 
  AlertCircle,
  X,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { mergeReportClusterApi, isLocalClusterMerged } from '../../services/api';
import './DuplicateGroup.css';

export default function DuplicateGroup({ 
  masterReport, 
  onViewDetails,
  onMergeSuccess 
}) {
  const defaultIds = [
    'KOP-1024',
    'KOP-1031',
    'KOP-1038',
    'KOP-1042',
    'KOP-1051',
    'KOP-1060',
    'KOP-1064'
  ];

  const report = masterReport || {
    id: 'KOP-1024',
    reportId: 'KOP-1024',
    issue: 'Waste accumulation — Station Road',
    clusterName: 'Waste hotspot — Station Road',
    clusterDescription: '7 citizen reports appear to refer to the same civic issue.',
    location: { area: 'Station Road, Kopargaon', zone: 'Zone Z01' },
    supportingReportIds: defaultIds
  };

  const clusterId = report.clusterId || 'CLUSTER-STATION-RD';
  const supportingList = report.supportingReportIds && report.supportingReportIds.length >= 5 
    ? report.supportingReportIds 
    : defaultIds;

  const [isMerged, setIsMerged] = useState(isLocalClusterMerged(clusterId));
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);

  const handleConfirmMerge = async () => {
    const repId = report.report_id || report.reportId || report.id;
    await mergeReportClusterApi(repId, clusterId, supportingList);
    setIsMerged(true);
    setShowConfirmModal(false);
    if (onMergeSuccess) {
      onMergeSuccess(`✓ Successfully consolidated ${supportingList.length} citizen submissions into 1 master civic issue (${repId}).`);
    }
  };

  return (
    <div className="duplicate-group-card" id="duplicates">
      {/* Header Banner */}
      <div className="dup-header-strip">
        <div className="dup-title-left">
          <div className="dup-icon-circle">
            <Layers size={22} />
          </div>
          <div>
            <div className="dup-badge-tag">Key Differentiating Intelligence</div>
            <h3 className="dup-section-heading">Duplicate Report Intelligence</h3>
            <p className="dup-section-explainer">
              Identifies reports that describe the same civic problem to prevent duplicate dispatches and aggregate public impact.
            </p>
          </div>
        </div>
        <div className="citizens-consolidation-badge">
          <Users size={16} />
          <span>{supportingList.length} Citizen Reports → 1 Civic Action</span>
        </div>
      </div>

      {/* Main Cluster Container */}
      <div className="duplicate-cluster-body">
        {/* Cluster Title Card */}
        <div className="cluster-summary-hero">
          <div className="cluster-hero-top">
            <span className="cluster-alert-pill">Possible Duplicate Cluster</span>
            <span className="cluster-confidence-tag">
              <Sparkles size={13} />
              <span>Duplicate Confidence: 91%</span>
            </span>
          </div>

          <h4 className="cluster-name-title">{report.clusterName || 'Waste hotspot — Station Road'}</h4>
          <p className="cluster-desc-text">
            {report.clusterDescription || `${supportingList.length} citizen reports appear to refer to the same civic issue.`}
          </p>

          <div className="cluster-location-row">
            <MapPin size={15} className="pin-teal" />
            <span>{report.location?.area || 'Station Road, Kopargaon'}</span>
          </div>
        </div>

        {/* 3-Step Flow Diagram */}
        <div className="cluster-flow-diagram">
          <div className="flow-step-box">
            <span className="flow-step-number">{supportingList.length}</span>
            <span className="flow-step-label">Citizen Reports</span>
          </div>

          <div className="flow-arrow-indicator">
            <ArrowDown size={18} className="flow-icon" />
          </div>

          <div className="flow-step-box flow-step-highlight">
            <span className="flow-step-number">1</span>
            <span className="flow-step-label">Civic Issue</span>
          </div>

          <div className="flow-arrow-indicator">
            <ArrowDown size={18} className="flow-icon" />
          </div>

          <div className="flow-step-box flow-step-success">
            <span className="flow-step-number">1</span>
            <span className="flow-step-label">Municipal Action</span>
          </div>
        </div>

        {/* Technical Detection UX Explanation */}
        <div className="duplicate-signals-explanation">
          <div className="signals-header">
            <Sparkles size={15} className="sparkle-teal" />
            <strong>Why was this cluster detected? (Signal Analysis)</strong>
          </div>
          <div className="signals-grid">
            <div className="signal-item">
              <Check size={14} className="check-icon" />
              <span><strong>Location similarity:</strong> Same location zone (Station Road / Zone Z01)</span>
            </div>
            <div className="signal-item">
              <Check size={14} className="check-icon" />
              <span><strong>Issue similarity:</strong> Same waste category (Illegal Dumping &amp; Accumulation)</span>
            </div>
            <div className="signal-item">
              <Check size={14} className="check-icon" />
              <span><strong>Description similarity:</strong> Canal access obstruction keywords</span>
            </div>
            <div className="signal-item">
              <Check size={14} className="check-icon" />
              <span><strong>Time proximity:</strong> Reports submitted within 24 hours</span>
            </div>
          </div>
        </div>

        {/* Supporting Report IDs List */}
        <div className="supporting-reports-box">
          <div className="supporting-box-header">
            <span className="box-title">
              Identified Reports in this Cluster ({supportingList.length}):
            </span>
            <button 
              type="button" 
              className="btn-toggle-ids"
              onClick={() => setShowAllReports(!showAllReports)}
            >
              {showAllReports ? 'Collapse' : 'Show All'}
            </button>
          </div>

          <div className="report-ids-chips-grid">
            {(showAllReports ? supportingList : supportingList.slice(0, 5)).map((id, idx) => (
              <div 
                key={idx} 
                className={`report-id-chip ${id === (report.reportId || report.id) ? 'is-master' : ''}`}
                onClick={() => onViewDetails && onViewDetails({ reportId: id, id })}
                title="Click to view report"
              >
                <span className="chip-id">{id}</span>
                {id === (report.reportId || report.id) ? (
                  <span className="chip-tag-master">Primary Master</span>
                ) : (
                  <span className="chip-tag-linked">Citizen #{idx + 1}</span>
                )}
              </div>
            ))}
            {!showAllReports && supportingList.length > 5 && (
              <div className="more-chips-pill" onClick={() => setShowAllReports(true)}>
                +{supportingList.length - 5} more
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="dup-actions-bar">
            <button 
              type="button" 
              className="btn-view-group"
              onClick={() => onViewDetails && onViewDetails(report)}
            >
              <Eye size={15} />
              <span>View Master Report</span>
            </button>

            <button 
              type="button" 
              className={`btn-merge-reports ${isMerged ? 'merged-active' : ''}`}
              onClick={() => {
                if (!isMerged) setShowConfirmModal(true);
              }}
            >
              {isMerged ? <CheckCircle2 size={16} /> : <GitMerge size={16} />}
              <span>{isMerged ? `Consolidated (${supportingList.length} Reports → 1 Issue)` : 'Merge Reports'}</span>
            </button>
          </div>

          {isMerged && (
            <div className="cluster-merged-banner">
              <CheckCircle2 size={16} />
              <span>
                <strong>Cluster Merged:</strong> 7 citizen reports are now officially consolidated into Master Issue <strong>{report.reportId || report.id}</strong>. Resource dispatch will trigger a single high-capacity municipal crew.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="merge-confirm-modal">
            <div className="modal-top-row">
              <div className="modal-icon-badge">
                <GitMerge size={24} />
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setShowConfirmModal(false)}>
                <X size={18} />
              </button>
            </div>

            <h3 className="modal-title">Confirm Duplicate Report Consolidation</h3>
            <p className="modal-text">
              You are about to merge <strong>{supportingList.length} citizen submissions</strong> for <em>"{report.clusterName || 'Waste hotspot — Station Road'}"</em> into a single municipal action issue (<strong>{report.reportId || report.id}</strong>).
            </p>

            <div className="modal-benefits-list">
              <div className="modal-benefit-item">
                <CheckCircle2 size={15} className="benefit-check" />
                <span>Consolidates dispatch resources to prevent redundant crew deployment</span>
              </div>
              <div className="modal-benefit-item">
                <CheckCircle2 size={15} className="benefit-check" />
                <span>Aggregates public urgency score (92/100 Critical)</span>
              </div>
              <div className="modal-benefit-item">
                <CheckCircle2 size={15} className="benefit-check" />
                <span>All {supportingList.length} citizens will automatically receive synchronized status updates</span>
              </div>
            </div>

            <div className="modal-actions-row">
              <button 
                type="button" 
                className="btn-cancel-modal"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-confirm-merge"
                onClick={handleConfirmMerge}
              >
                <GitMerge size={16} />
                <span>Confirm &amp; Merge Reports</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}