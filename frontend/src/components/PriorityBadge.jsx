import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Flame } from 'lucide-react';

export default function PriorityBadge({ score }) {
  if (score === null || score === undefined) {
    return <span className="badge badge-priority-low">Unscored</span>;
  }

  const num = Number(score);

  if (num >= 80) {
    return (
      <span className="badge badge-priority-critical" title="Priority Score ≥ 80: Urgent Municipal Dispatch">
        <Flame size={12} />
        Critical {num.toFixed(1)}
      </span>
    );
  }

  if (num >= 60) {
    return (
      <span className="badge badge-priority-high" title="Priority Score 60-79: High Priority Action">
        <AlertTriangle size={12} />
        High {num.toFixed(1)}
      </span>
    );
  }

  if (num >= 40) {
    return (
      <span className="badge badge-priority-medium" title="Priority Score 40-59: Moderate Priority">
        <AlertCircle size={12} />
        Medium {num.toFixed(1)}
      </span>
    );
  }

  return (
    <span className="badge badge-priority-low" title="Priority Score < 40: Standard Queue">
      <CheckCircle size={12} />
      Low {num.toFixed(1)}
    </span>
  );
}