import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import './SeveritySelector.css';

const SEVERITY_LEVELS = [
  { id: 'Low', label: 'Low', desc: 'Minor localized litter, non-urgent routine pickup', color: 'var(--status-pending)', icon: ShieldCheck },
  { id: 'Medium', label: 'Medium', desc: 'Noticeable waste pile, regular clearance required', color: 'var(--civic-accent)', icon: AlertCircle },
  { id: 'High', label: 'High', desc: 'Large dumping site, public hindrance or animal hazard', color: 'var(--status-review)', icon: AlertTriangle },
  { id: 'Critical', label: 'Critical', desc: 'Hazardous material, drain block, fire/toxic risk', color: 'var(--status-rejected)', icon: Flame }
];

export default function SeveritySelector({ selectedSeverity, onSelect }) {
  return (
    <div className="severity-selector-group">
      <div className="severity-header-box">
        <label className="section-field-label">
          Citizen-Assessed Severity <span className="req-star">*</span>
        </label>
        <span className="severity-hint">
          (Provides citizen context. The system &amp; officer will calculate final priority)
        </span>
      </div>

      <div className="severity-grid">
        {SEVERITY_LEVELS.map((level) => {
          const isSelected = selectedSeverity === level.id;
          const Icon = level.icon;

          return (
            <button
              type="button"
              key={level.id}
              className={`severity-card severity-${level.id.toLowerCase()} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(level.id)}
            >
              <div className="severity-badge-header">
                <Icon size={18} />
                <span className="severity-label">{level.label}</span>
              </div>
              <span className="severity-desc">{level.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}