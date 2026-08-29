import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Sparkles, CheckCircle, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import GeoLocationPicker from '../components/GeoLocationPicker';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { ReportService } from '../services/reportService';
import { CATEGORIES } from '../utils/constants';

export default function CitizenReportPage() {
  const [file, setFile] = useState(null);
  const [latitude, setLatitude] = useState(19.8845);
  const [longitude, setLongitude] = useState(74.4671);
  const [category, setCategory] = useState('waste_management');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successReport, setSuccessReport] = useState(null);

  const handleLocationChange = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please attach a photo of the waste or garbage accumulation.');
      return;
    }

    if (!latitude || !longitude) {
      setError('Please provide valid location coordinates or select a zone.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('category', category);
      if (title.trim()) formData.append('title', title.trim());
      if (description.trim()) formData.append('description', description.trim());

      const res = await ReportService.submitReport(formData);

      if (res.success && res.data) {
        setSuccessReport(res.data);
      } else {
        throw new Error(res.message || 'Submission failed.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while submitting your civic complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setError(null);
    setSuccessReport(null);
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
          Report Public Waste Accumulation
        </h1>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
          Kopargaon Municipal Council • AI-Powered Instant Verification & Priority Dispatch
        </p>
      </div>

      {successReport ? (
        <div className="card" style={{ padding: '2rem', border: '2px solid var(--primary-500)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                background: 'var(--primary-50)',
                color: 'var(--primary-600)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}
            >
              <CheckCircle size={36} />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--slate-900)' }}>Complaint Successfully Registered!</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Your report has been analyzed by Gemini Vision and placed in the municipal priority dispatch queue.
            </p>
          </div>

          <div
            style={{
              background: 'var(--slate-50)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              border: '1px solid var(--slate-200)',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block' }}>REPORT TRACKING ID</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--primary-700)' }}>{successReport.reportId || successReport.id}</strong>
              </div>
              <StatusBadge status={successReport.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Assigned Zone</span>
                <p style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                  {successReport.zoneName} ({successReport.zoneId})
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Assigned Priority</span>
                <div style={{ marginTop: '0.2rem' }}>
                  <PriorityBadge score={successReport.priorityScore} />
                </div>
              </div>
            </div>

            {successReport.aiAnalysis && (
              <div style={{ background: '#fff', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-700)', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <Sparkles size={14} />
                  <span>Gemini Vision Assessment</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ background: 'var(--slate-50)', padding: '0.3rem', borderRadius: '4px' }}>
                    Severity: <strong>{successReport.aiAnalysis.severity}/100</strong>
                  </div>
                  <div style={{ background: 'var(--slate-50)', padding: '0.3rem', borderRadius: '4px' }}>
                    Health Risk: <strong>{successReport.aiAnalysis.healthRisk}/100</strong>
                  </div>
                  <div style={{ background: 'var(--slate-50)', padding: '0.3rem', borderRadius: '4px' }}>
                    Obstruction: <strong>{successReport.aiAnalysis.obstruction}/100</strong>
                  </div>
                  <div style={{ background: 'var(--slate-50)', padding: '0.3rem', borderRadius: '4px' }}>
                    Confidence: <strong>{successReport.aiAnalysis.confidence}%</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={handleReset} className="btn btn-secondary">
              <RefreshCw size={16} />
              <span>Submit Another Report</span>
            </button>
            <Link to={`/status/${successReport.reportId || successReport.id}`} className="btn btn-primary">
              <span>Track Live Status</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <ImageUploader
            file={file}
            onFileChange={setFile}
            error={null}
          />

          <GeoLocationPicker
            latitude={latitude}
            longitude={longitude}
            onLocationChange={handleLocationChange}
          />

          <div className="form-group">
            <label className="form-label">Waste / Hazard Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Location Landmark / Short Title (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Near Shirdi Corner Veg Market"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Remarks (Optional)</label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="Describe any urgent danger, blocked open gutter, or decaying bio-waste..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles className="animate-spin" size={18} />
                Analyzing Photo with Gemini AI & Prioritizing...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={18} />
                Submit Civic Waste Complaint
              </span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}