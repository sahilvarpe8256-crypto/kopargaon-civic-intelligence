import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, AlertTriangle, Truck } from 'lucide-react';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { ReportService } from '../services/reportService';

export default function ReportStatusPage() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(paramId || '');
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = async (queryId) => {
    if (!queryId.trim()) return;
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await ReportService.getReportById(queryId.trim());
      if (res.success && res.data) {
        setReport(res.data);
      } else {
        throw new Error('Report not found');
      }
    } catch (err) {
      setError(`No complaint found with ID '${queryId}'. Please verify your tracking number.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (paramId) {
      fetchReport(paramId);
    }
  }, [paramId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/status/${searchInput.trim()}`);
    }
  };

  const ai = report?.aiAnalysis || {};

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--slate-900)', marginBottom: '0.4rem' }}>
          Track Complaint Status
        </h1>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
          Real-time municipal triage, AI verification, and crew dispatch status
        </p>
      </div>

      <form onSubmit={handleSearch} className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter Report ID (e.g. RPT-20260830-1234)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ fontSize: '1rem' }}
            required
          />
          <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ padding: '0 1.25rem' }}>
            <Search size={18} />
            <span>Search</span>
          </button>
        </div>
      </form>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--slate-500)' }}>
          <Sparkles className="animate-spin" size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--primary-600)' }} />
          <p>Fetching civic report records...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {report && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', display: 'block' }}>REPORT ID</span>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--slate-900)' }}>{report.reportId || report.id}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                Category: <strong>{report.category || 'waste_management'}</strong> • Zone: <strong>{report.zoneName} ({report.zoneId})</strong>
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
              <StatusBadge status={report.status} />
              <PriorityBadge score={report.priorityScore} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                CITIZEN EVIDENCE PHOTO
              </span>
              {report.imageUrl ? (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--slate-200)', background: '#000' }}>
                  <img
                    src={report.imageUrl}
                    alt="Evidence"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', color: 'var(--slate-500)' }}>
                  No photo attached
                </div>
              )}
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                INCIDENT LOCATION & REMARKS
              </span>
              <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', fontSize: '0.875rem' }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Description: </strong>{report.description || 'No description provided.'}
                </p>
                <p style={{ color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.35rem' }}>
                  <MapPin size={14} color="var(--primary-600)" />
                  <span>{report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)} ({report.location?.address || report.zoneName})</span>
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                  Submitted: {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--accent-50)', border: '1px solid #ccfbf1', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-600)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <Sparkles size={16} />
              <span>AI Visual Evidence Assessment</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>
              <div style={{ background: '#fff', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', display: 'block' }}>Severity</span>
                <strong>{report.severity ?? ai.severity ?? 50}/100</strong>
              </div>
              <div style={{ background: '#fff', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', display: 'block' }}>Health</span>
                <strong>{report.healthRisk ?? ai.healthRisk ?? 50}/100</strong>
              </div>
              <div style={{ background: '#fff', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', display: 'block' }}>Env. Risk</span>
                <strong>{report.environmentalRisk ?? ai.environmentalRisk ?? 50}/100</strong>
              </div>
              <div style={{ background: '#fff', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', display: 'block' }}>Obstruction</span>
                <strong>{report.obstruction ?? ai.obstruction ?? 50}/100</strong>
              </div>
              <div style={{ background: '#fff', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', display: 'block' }}>Confidence</span>
                <strong>{report.confidence ?? ai.confidence ?? 85}%</strong>
              </div>
            </div>

            {ai.notes && (
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-700)', fontStyle: 'italic' }}>
                "{ai.notes}"
              </p>
            )}
          </div>

          {report.assignedResources && (
            <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-800)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                <Truck size={16} />
                <span>Assigned Municipal Cleanup Resources</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                Vehicle: <strong>{report.assignedResources.vehicleType?.replace('_', ' ')}</strong> • Crew: <strong>{report.assignedResources.crewId} ({report.assignedResources.crewCount || 4} staff)</strong> • Est. Duration: <strong>{report.assignedResources.estimatedHours || 3}h</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}