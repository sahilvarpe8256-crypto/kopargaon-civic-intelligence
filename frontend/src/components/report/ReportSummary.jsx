import React from 'react';
import { Camera, AlertTriangle, MapPin, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import './ReportSummary.css';

export default function ReportSummary({ reportData, isConfirmed, onToggleConfirm }) {
  const { photos, wasteType, severity, description, indicators, location, aiAssessment, linkedDuplicates } = reportData;

  return (
    <div className="report-summary-container">
      <div className="summary-header">
        <h2 className="summary-title">Review Your Report</h2>
        <p className="summary-subtitle">
          Please verify the information below before submitting to the Kopargaon Municipal Council.
        </p>
      </div>

      <div className="summary-grid">
        {/* Evidence Section */}
        <div className="summary-section-card">
          <div className="section-card-title">
            <Camera size={18} />
            <span>Photo Evidence ({photos.length} photos)</span>
          </div>
          <div className="summary-photo-strip">
            {photos.map((photo, i) => (
              <div key={i} className="summary-thumb-box">
                <img 
                  src={photo.preview} 
                  alt={`Evidence ${i + 1}`} 
                  className="summary-thumb-img"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="%2364748b" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>';
                  }}
                />
                <span className="thumb-caption">{photo.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Issue Details Section */}
        <div className="summary-section-card">
          <div className="section-card-title">
            <AlertTriangle size={18} />
            <span>Issue Details</span>
          </div>
          <div className="summary-key-values">
            <div className="kv-row">
              <span className="kv-key">Waste Category:</span>
              <span className="kv-val highlight">{wasteType}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Reported Severity:</span>
              <span className="kv-val">{severity}</span>
            </div>
            {description && (
              <div className="kv-desc-box">
                <span className="kv-key">Description:</span>
                <p className="kv-desc-text">"{description}"</p>
              </div>
            )}
            {indicators.length > 0 && (
              <div className="kv-indicators-box">
                <span className="kv-key">Reported Indicators:</span>
                <div className="summary-indicator-tags">
                  {indicators.map((ind, i) => (
                    <span key={i} className="summary-tag">{ind}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Section */}
        <div className="summary-section-card">
          <div className="section-card-title">
            <MapPin size={18} />
            <span>Location &amp; Municipal Ward</span>
          </div>
          <div className="summary-key-values">
            <div className="kv-row">
              <span className="kv-key">Area / Ward:</span>
              <span className="kv-val highlight">{location.area}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">GPS Pin:</span>
              <span className="kv-val">{location.latitude}° N, {location.longitude}° E</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Jurisdiction:</span>
              <span className="kv-val">Kopargaon Municipal Council</span>
            </div>
          </div>
        </div>

        {/* AI Assessment Summary */}
        {aiAssessment && (
          <div className="summary-section-card ai-summary-highlight">
            <div className="section-card-title">
              <Sparkles size={18} />
              <span>AI Evidence Assessment</span>
            </div>
            <div className="summary-key-values">
              <div className="kv-row">
                <span className="kv-key">Calculated Priority:</span>
                <span className="kv-val ai-score-tag">{aiAssessment.score} / 100 ({aiAssessment.level})</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Verification Confidence:</span>
                <span className="kv-val">{aiAssessment.confidence}%</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Recommended Action:</span>
                <span className="kv-val">{aiAssessment.recommendedResponse}</span>
              </div>
              {linkedDuplicates && linkedDuplicates.length > 0 && (
                <div className="kv-row">
                  <span className="kv-key">Linked Cluster Reports:</span>
                  <span className="kv-val">{linkedDuplicates.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Citizen Declaration Checkbox */}
      <div className="confirmation-box">
        <label className="checkbox-container">
          <input 
            type="checkbox" 
            checked={isConfirmed}
            onChange={(e) => onToggleConfirm(e.target.checked)}
          />
          <span className="checkbox-text">
            I confirm that the photographic evidence and location provided are accurate and reflect an active civic waste issue in Kopargaon to the best of my knowledge.
          </span>
        </label>
      </div>
    </div>
  );
}