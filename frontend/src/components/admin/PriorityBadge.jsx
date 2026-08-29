import React from 'react';
import './PriorityBadge.css';

export default function PriorityBadge({ level, score, showScore = true }) {
  const l = String(level || 'MEDIUM').toUpperCase();
  
  const getBadgeClass = () => {
    switch (l) {
      case 'CRITICAL': return 'priority-badge-critical';
      case 'HIGH': return 'priority-badge-high';
      case 'MEDIUM': return 'priority-badge-medium';
      default: return 'priority-badge-low';
    }
  };

  return (
    <span className={`civic-priority-pill ${getBadgeClass()}`}>
      <span className="priority-level-text">{l}</span>
      {showScore && score !== undefined && (
        <span className="priority-score-text">• {score}/100</span>
      )}
    </span>
  );
}