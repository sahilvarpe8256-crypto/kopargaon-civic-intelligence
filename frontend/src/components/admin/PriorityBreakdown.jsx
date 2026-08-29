import React from 'react';
import { Sparkles, Info } from 'lucide-react';
import './PriorityBreakdown.css';

export default function PriorityBreakdown({ factors, totalScore = 92 }) {
  const f = factors || {
    severity: 30,
    publicImpact: 24,
    supportingReports: 20,
    safetyRisk: 13,
    reportAge: 5,
    total: totalScore
  };

  const factorItems = [
    { label: 'Severity', value: f.severity || 30, max: 35, color: '#dc2626' },
    { label: 'Public Impact', value: f.publicImpact || 24, max: 25, color: '#d97706' },
    { label: 'Supporting Reports', value: f.supportingReports || 20, max: 20, color: '#0f766e' },
    { label: 'Environmental/Safety Risk', value: f.safetyRisk || 13, max: 15, color: '#0284c7' },
    { label: 'Report Age', value: f.reportAge || 5, max: 5, color: '#475569' },
  ];

  return (
    <div className="priority-breakdown-card">
      <div className="breakdown-header">
        <div className="breakdown-title-row">
          <Sparkles size={18} className="breakdown-sparkle" />
          <h4 className="breakdown-title">Why this issue is prioritized</h4>
        </div>
        <div className="breakdown-total-badge">
          <span className="total-label">Total Score</span>
          <span className="total-score-val">{f.total || totalScore} / 100</span>
        </div>
      </div>

      <div className="breakdown-bars-list">
        {factorItems.map((item, idx) => {
          const percent = Math.round((item.value / item.max) * 100);
          return (
            <div key={idx} className="factor-bar-item">
              <div className="factor-bar-labels">
                <span className="factor-name">{item.label}</span>
                <span className="factor-fraction">{item.value} / {item.max}</span>
              </div>
              <div className="factor-track">
                <div 
                  className="factor-fill" 
                  style={{ width: `${percent}%`, backgroundColor: item.color }} 
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="breakdown-disclaimer-note">
        <Info size={14} className="disclaimer-info-icon" />
        <span>
          AI-assisted prioritization provides decision support. Final municipal decisions remain with authorized officers.
        </span>
      </div>
    </div>
  );
}