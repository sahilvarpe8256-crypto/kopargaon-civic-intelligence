import React from 'react';
import { X, Sparkles, CheckCircle2, AlertOctagon, TrendingUp } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import { DEFERRAL_REASONS } from '../utils/constants';

export default function PrioritizationModal({ isOpen, onClose, recommendation }) {
  if (!isOpen || !recommendation) return null;

  const { selectedComplaints = [], deferredComplaints = [], totalResourceUsage = {}, summary = {} } = recommendation;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles className="text-emerald-600" style={{ color: 'var(--primary-600)' }} />
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Automated Resource Prioritization Allocation</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                Greedy Knapsack matching under live municipal crew, fleet, and budget constraints
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Summary Stat Bar */}
          <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--primary-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-700)', fontWeight: 600, display: 'block' }}>
                Selected for Dispatch
              </span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--primary-800)' }}>
                {selectedComplaints.length}
              </strong>
            </div>

            <div style={{ background: 'var(--warning-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning-100)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--warning-700)', fontWeight: 600, display: 'block' }}>
                Resource Deferred
              </span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--warning-800)' }}>
                {deferredComplaints.length}
              </strong>
            </div>

            <div style={{ background: 'var(--slate-100)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-600)', fontWeight: 600, display: 'block' }}>
                Total Allocated Cost
              </span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--slate-900)' }}>
                ₹{totalResourceUsage?.estimatedCostINR?.toLocaleString() ?? 0}
              </strong>
            </div>
          </div>

          {/* Selected Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-800)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.6rem' }}>
              <CheckCircle2 size={16} />
              <span>Recommended Dispatches ({selectedComplaints.length})</span>
            </h4>

            {selectedComplaints.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>No active complaints allocated in this run.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedComplaints.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--primary-100)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong>{c.id || c.reportId}</strong>
                        <PriorityBadge score={c.priorityScore} />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                        Type: {c.aiAnalysis?.wasteType || 'mixed_solid_waste'}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                      <span style={{ display: 'block', fontWeight: 600, color: 'var(--primary-700)' }}>
                        🚛 {c.allocatedResources?.vehicle || c.allocatedResources?.vehicleType || 'mini_tipper'} • 👥 {c.allocatedResources?.crewCount || c.allocatedResources?.crewSize || 3} crew
                      </span>
                      <span style={{ color: 'var(--slate-500)' }}>
                        ⏱️ {c.allocatedResources?.estimatedHours || 3}h • ₹{c.allocatedResources?.estimatedCostINR || 1200}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deferred Section */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--danger-600)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.6rem' }}>
              <AlertOctagon size={16} />
              <span>Deferred Complaints ({deferredComplaints.length})</span>
            </h4>

            {deferredComplaints.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>All active complaints were accommodated within municipal constraints!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {deferredComplaints.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--danger-50)',
                      border: '1px solid #fecaca',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong>{c.id || c.reportId}</strong>
                        <PriorityBadge score={c.priorityScore} />
                      </div>
                      <span style={{ fontSize: '0.775rem', color: '#991b1b' }}>
                        Reason: {DEFERRAL_REASONS[c.deferralReason] || c.deferralReason || 'Capacity constraint'}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      {c.explanation || 'Queued for next available shift'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary">
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}