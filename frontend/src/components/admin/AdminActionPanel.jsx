import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Play, 
  UserPlus, 
  AlertTriangle, 
  FileSearch, 
  CheckCheck, 
  Ban,
  ShieldCheck,
  Flame,
  X,
  Users,
  Check
} from 'lucide-react';
import { updateReportStatusApi, assignReportTeamApi, updateReportPriorityApi } from '../../services/api';
import './AdminActionPanel.css';

const DEPARTMENTS = [
  'Waste Management Team',
  'Sanitation Team',
  'Municipal Inspection Team',
  'Emergency Response Team'
];

const PRIORITY_OPTIONS = [
  { level: 'Critical', desc: 'Immediate dispatch within 12h' },
  { level: 'High', desc: 'Clearance within 24-48h' },
  { level: 'Medium', desc: 'Scheduled routine clearance' },
  { level: 'Low', desc: 'Standard sanitation maintenance' }
];

export default function AdminActionPanel({ 
  reportId, 
  currentStatus, 
  assignedTeam, 
  currentPriority,
  onActionCompleted 
}) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(assignedTeam || DEPARTMENTS[0]);
  const [selectedPriority, setSelectedPriority] = useState(currentPriority || 'Critical');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusChange = async (status, label) => {
    setIsProcessing(true);
    try {
      await updateReportStatusApi(reportId, status, `Officer Decision: ${label}`);
      if (onActionCompleted) {
        onActionCompleted(status, `✓ Report ${reportId} moved to ${label}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAssign = async () => {
    setIsProcessing(true);
    try {
      await assignReportTeamApi(reportId, selectedTeam);
      setShowAssignModal(false);
      if (onActionCompleted) {
        onActionCompleted('ASSIGNED', `✓ Report ${reportId} assigned to ${selectedTeam}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPriority = async () => {
    setIsProcessing(true);
    try {
      await updateReportPriorityApi(reportId, selectedPriority);
      setShowPriorityModal(false);
      if (onActionCompleted) {
        onActionCompleted(currentStatus, `✓ Priority for ${reportId} updated to ${selectedPriority}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="admin-action-panel-card">
      <div className="panel-header">
        <div className="panel-title-left">
          <ShieldCheck size={20} className="panel-shield-icon" />
          <div>
            <h4 className="panel-heading">Municipal Officer Action Panel</h4>
            <span className="panel-sub-label">Authorized administrative triage &amp; dispatch controls</span>
          </div>
        </div>

        {assignedTeam && (
          <div className="assigned-team-badge">
            <Users size={14} />
            <span>Assigned to: <strong>{assignedTeam}</strong></span>
          </div>
        )}
      </div>

      <p className="panel-helper">
        Select an action below to update municipal workflow state, allocate field teams, or revise priority:
      </p>

      {/* Action Buttons Grid */}
      <div className="action-buttons-grid">
        <button 
          type="button" 
          className="btn-admin-act act-approve"
          onClick={() => handleStatusChange('APPROVED', 'Approved')}
        >
          <CheckCircle2 size={16} />
          <span>Approve</span>
        </button>

        <button 
          type="button" 
          className="btn-admin-act act-progress"
          onClick={() => handleStatusChange('IN_PROGRESS', 'In Progress')}
        >
          <Play size={16} />
          <span>Mark In Progress</span>
        </button>

        <button 
          type="button" 
          className="btn-admin-act act-assign"
          onClick={() => setShowAssignModal(true)}
        >
          <UserPlus size={16} />
          <span>Assign</span>
        </button>

        <button 
          type="button" 
          className="btn-admin-act act-priority"
          onClick={() => setShowPriorityModal(true)}
        >
          <Flame size={16} />
          <span>Change Priority</span>
        </button>

        <button 
          type="button" 
          className="btn-admin-act act-review"
          onClick={() => handleStatusChange('UNDER_REVIEW', 'Under Review')}
        >
          <FileSearch size={16} />
          <span>Manual Review</span>
        </button>

        <button 
          type="button" 
          className="btn-admin-act act-resolve"
          onClick={() => handleStatusChange('RESOLVED', 'Resolved')}
        >
          <CheckCheck size={16} />
          <span>Resolve</span>
        </button>

        <button 
          type="button" 
          className="btn-admin-act act-reject"
          onClick={() => handleStatusChange('REJECTED', 'Rejected')}
        >
          <Ban size={16} />
          <span>Reject</span>
        </button>
      </div>

      <div className="panel-disclaimer">
        * Actions executed here update the live municipal queue and synchronize with citizen status tracking at <code>/track/{reportId}</code>.
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="action-modal-overlay">
          <div className="action-modal-card">
            <div className="modal-top-row">
              <div className="modal-icon-badge badge-teal">
                <UserPlus size={22} />
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setShowAssignModal(false)}>
                <X size={18} />
              </button>
            </div>

            <h3 className="modal-title">Assign Department / Team</h3>
            <p className="modal-text">
              Select the municipal operational unit responsible for resolving report <strong>{reportId}</strong>:
            </p>

            <div className="departments-list">
              {DEPARTMENTS.map((dept) => (
                <label 
                  key={dept} 
                  className={`dept-option-label ${selectedTeam === dept ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="dept"
                    value={dept}
                    checked={selectedTeam === dept}
                    onChange={() => setSelectedTeam(dept)}
                  />
                  <span className="dept-name">{dept}</span>
                  {selectedTeam === dept && <Check size={16} className="dept-check" />}
                </label>
              ))}
            </div>

            <div className="modal-actions-row">
              <button type="button" className="btn-cancel-modal" onClick={() => setShowAssignModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-confirm-act-teal" onClick={handleConfirmAssign}>
                <UserPlus size={16} />
                <span>Confirm Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Priority Modal */}
      {showPriorityModal && (
        <div className="action-modal-overlay">
          <div className="action-modal-card">
            <div className="modal-top-row">
              <div className="modal-icon-badge badge-amber">
                <Flame size={22} />
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setShowPriorityModal(false)}>
                <X size={18} />
              </button>
            </div>

            <h3 className="modal-title">Change Priority Level</h3>
            <p className="modal-text">
              Override or update the priority classification for report <strong>{reportId}</strong>:
            </p>

            <div className="priorities-list">
              {PRIORITY_OPTIONS.map((item) => (
                <label 
                  key={item.level} 
                  className={`priority-option-label priority-${item.level.toLowerCase()} ${selectedPriority.toLowerCase() === item.level.toLowerCase() ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={item.level}
                    checked={selectedPriority.toLowerCase() === item.level.toLowerCase()}
                    onChange={() => setSelectedPriority(item.level)}
                  />
                  <div className="priority-info-box">
                    <span className="p-level-title">{item.level}</span>
                    <span className="p-level-desc">{item.desc}</span>
                  </div>
                  {selectedPriority.toLowerCase() === item.level.toLowerCase() && (
                    <Check size={16} className="priority-check" />
                  )}
                </label>
              ))}
            </div>

            <div className="modal-actions-row">
              <button type="button" className="btn-cancel-modal" onClick={() => setShowPriorityModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-confirm-act-amber" onClick={handleConfirmPriority}>
                <Flame size={16} />
                <span>Update Priority</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}