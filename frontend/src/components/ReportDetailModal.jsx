import React, { useState } from 'react';
import { X, Sparkles, MapPin, AlertTriangle, ShieldCheck, Clock, User, CheckCircle } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import { STATUS_LABELS, DEFERRAL_REASONS } from '../utils/constants';

export default function ReportDetailModal({ report, isOpen, onClose, onUpdateStatus }) {
  if (!isOpen || !report) return null;

  const [status, setStatus] = useState(report.status || 'UNDER_REVIEW');
  const [crewId, setCrewId] = useState(report.assignedResources?.crewId || 'CREW-01');
  const [crewCount, setCrewCount] = useState(report.assignedResources?.crewCount || 4);
  const [vehicleType, setVehicleType] = useState(report.assignedResources?.vehicleType || 'compactor_truck');
  const [estimatedHours, setEstimatedHours] = useState(report.assignedResources?.estimatedHours || 3);
  const [estimatedCostINR, setEstimatedCostINR] = useState(report.assignedResources?.estimatedCostINR || 1500);
  const [deferralReason, setDeferralReason] = useState(report.deferralReason || '');
  const [officerNotes, setOfficerNotes] = useState(report.officerNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const updatePayload = {
      status,
      officerNotes: officerNotes.trim() || undefined
    };

    if (status === 'APPROVED' || status === 'IN_PROGRESS') {
      updatePayload.assignedResources = {
        crewId,
        crewCount: Number(crewCount),
        vehicleType,
        estimatedHours: Number(estimatedHours),
        estimatedCostINR: Number(estimatedCostINR)
      };
      updatePayload.deferralReason = null;
    } else if (status === 'DEFERRED') {
      updatePayload.deferralReason = deferralReason || 'LOWER_PRIORITY';
    }

    try {
      await onUpdateStatus(report.reportId || report.id, updatePayload);
      setFeedback({ type: 'success', message: `Report updated to '${status}' successfully!` });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update status.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ai = report.aiAnalysis || {};
  const reasons = report.priorityReasons || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>{report.reportId || report.id}</h3>
              <PriorityBadge score={report.priorityScore} />
              <StatusBadge status={report.status} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              Zone: <strong>{report.zoneId} ({report.zoneName})</strong> • Reported:{' '}
              {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Recent'}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {feedback && (
            <div className={`alert alert-${feedback.type}`}>
              {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Evidence photo & description */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                PHOTO EVIDENCE
              </span>
              {report.imageUrl ? (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--slate-300)', maxHeight: '200px', background: '#000' }}>
                  <img
                    src={report.imageUrl.startsWith('http') ? report.imageUrl : report.imageUrl}
                    alt="Evidence"
                    style={{ width: '100%', height: '180px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--slate-100)', borderRadius: 'var(--radius-md)', color: 'var(--slate-500)' }}>
                  No photo attached
                </div>
              )}
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                CITIZEN REMARKS & LOCATION
              </span>
              <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', fontSize: '0.875rem' }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Description:</strong> {report.description || 'No specific citizen comment.'}
                </p>
                <p style={{ color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} color="var(--primary-600)" />
                  <span>{report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)} ({report.location?.address || report.zoneName})</span>
                </p>
                <p style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                  Zone Pop Exposure: <strong>{report.estimatedPopulationExposure || 50}/100</strong>
                </p>
              </div>
            </div>
          </div>

          {/* AI Evidence Assessment Breakdown */}
          <div style={{ background: 'var(--accent-50)', border: '1px solid #ccfbf1', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-600)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <Sparkles size={16} />
              <span>Gemini Vision AI Observation (Evidence Observer Only)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '0.75rem' }}>
              <div style={{ background: '#fff', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', display: 'block' }}>Severity</span>
                <strong style={{ fontSize: '1rem', color: 'var(--slate-800)' }}>{report.severity ?? ai.severity ?? 50}</strong>
              </div>
              <div style={{ background: '#fff', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', display: 'block' }}>Health</span>
                <strong style={{ fontSize: '1rem', color: 'var(--slate-800)' }}>{report.healthRisk ?? ai.healthRisk ?? 50}</strong>
              </div>
              <div style={{ background: '#fff', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', display: 'block' }}>Env. Risk</span>
                <strong style={{ fontSize: '1rem', color: 'var(--slate-800)' }}>{report.environmentalRisk ?? ai.environmentalRisk ?? 50}</strong>
              </div>
              <div style={{ background: '#fff', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', display: 'block' }}>Obstruction</span>
                <strong style={{ fontSize: '1rem', color: 'var(--slate-800)' }}>{report.obstruction ?? ai.obstruction ?? 50}</strong>
              </div>
              <div style={{ background: '#fff', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', display: 'block' }}>Confidence</span>
                <strong style={{ fontSize: '1rem', color: 'var(--slate-800)' }}>{report.confidence ?? ai.confidence ?? 85}%</strong>
              </div>
            </div>

            {ai.detectedElements && ai.detectedElements.length > 0 && (
              <div style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                <strong>Detected Elements: </strong>
                {ai.detectedElements.map((el, i) => (
                  <span key={i} style={{ background: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', marginRight: '0.35rem', display: 'inline-block', marginTop: '0.2rem' }}>
                    {el}
                  </span>
                ))}
              </div>
            )}

            {ai.notes && (
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-700)', fontStyle: 'italic' }}>
                "{ai.notes}"
              </p>
            )}

            {ai.requiresManualVerification && (
              <div style={{ marginTop: '0.5rem', background: '#fdf2f8', color: '#9d174d', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.775rem', fontWeight: 600 }}>
                ⚠️ Low confidence observation: Manual supervisor inspection required before dispatch.
              </div>
            )}
          </div>

          {/* Priority Explanation Summary */}
          {reasons.summary && (
            <div style={{ background: 'var(--slate-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.825rem' }}>
              <strong>Priority Engine Rationale: </strong>
              <span style={{ color: 'var(--slate-700)' }}>{reasons.summary}</span>
            </div>
          )}

          {/* Officer Status Action Form */}
          <form onSubmit={handleSubmit} style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Supervisor Action & Resource Dispatch</h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label className="form-label">Update Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              {(status === 'APPROVED' || status === 'IN_PROGRESS') && (
                <>
                  <div>
                    <label className="form-label">Assign Vehicle Type</label>
                    <select
                      className="form-select"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                    >
                      <option value="compactor_truck">Compactor Truck (Heavy)</option>
                      <option value="mini_tipper">Mini Tipper (Standard)</option>
                      <option value="tractor_trailer">Tractor Trailer (Debris)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Crew Size & Shift Hours</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="form-input"
                        placeholder="Crews"
                        value={crewCount}
                        onChange={(e) => setCrewCount(e.target.value)}
                        title="Crew Members"
                      />
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        className="form-input"
                        placeholder="Hours"
                        value={estimatedHours}
                        onChange={(e) => setEstimatedHours(e.target.value)}
                        title="Estimated Hours"
                      />
                    </div>
                  </div>
                </>
              )}

              {status === 'DEFERRED' && (
                <div>
                  <label className="form-label">Deferral Reason Code</label>
                  <select
                    className="form-select"
                    value={deferralReason}
                    onChange={(e) => setDeferralReason(e.target.value)}
                  >
                    {Object.entries(DEFERRAL_REASONS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Supervisor Notes</label>
              <textarea
                rows="2"
                className="form-textarea"
                placeholder="Add operational notes or dispatch instructions..."
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                {isSubmitting ? 'Updating...' : 'Save Decision'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}