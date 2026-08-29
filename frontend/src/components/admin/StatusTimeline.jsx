import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, UserCheck, Play, CheckCheck, Circle, Check } from 'lucide-react';
import './StatusTimeline.css';

const STAGES = [
  { id: 'submitted', label: 'Citizen Submitted', icon: Clock },
  { id: 'ai', label: 'AI Assessment', icon: CheckCircle2 },
  { id: 'review', label: 'Admin Review', icon: ShieldCheck },
  { id: 'assigned', label: 'Assigned', icon: UserCheck },
  { id: 'in_progress', label: 'In Progress', icon: Play },
  { id: 'resolved', label: 'Resolved', icon: CheckCheck },
];

export default function StatusTimeline({ currentStatus = 'PENDING' }) {
  const st = String(currentStatus).toUpperCase();

  const getStageState = (index) => {
    let activeIdx = 0;
    if (st === 'PENDING' || st === 'SUBMITTED') activeIdx = 0;
    else if (st === 'AI_ANALYSIS' || st === 'AI_ASSESSMENT') activeIdx = 1;
    else if (st === 'UNDER_REVIEW') activeIdx = 2;
    else if (st === 'APPROVED' || st === 'ASSIGNED') activeIdx = 3;
    else if (st === 'IN_PROGRESS') activeIdx = 4;
    else if (st === 'RESOLVED') activeIdx = 5;

    if (index < activeIdx) return 'completed';
    if (index === activeIdx) return 'active';
    return 'upcoming';
  };

  return (
    <div className="status-timeline-wrapper">
      <div className="timeline-header-row">
        <h4 className="timeline-section-title">Resolution Lifecycle Timeline</h4>
        <span className="current-state-badge">Status: {currentStatus}</span>
      </div>
      
      <div className="timeline-stages-bar">
        {STAGES.map((stage, idx) => {
          const state = getStageState(idx);
          const Icon = stage.icon;

          return (
            <div key={stage.id} className={`timeline-stage-step ${state}`}>
              <div className="stage-marker">
                {state === 'completed' && <Check size={14} className="marker-check" />}
                {state === 'active' && <div className="marker-dot-active" />}
                {state === 'upcoming' && <Circle size={10} className="marker-circle-empty" />}
              </div>
              <span className="stage-label">{stage.label}</span>
              {idx < STAGES.length - 1 && <div className={`stage-connector ${state === 'completed' ? 'conn-completed' : ''}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}