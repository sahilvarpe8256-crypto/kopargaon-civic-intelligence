import React from 'react';
import { Camera, FileText, MapPin, CheckCircle2 } from 'lucide-react';
import './ReportProgress.css';

const STEPS = [
  { number: 1, label: 'Evidence', icon: Camera },
  { number: 2, label: 'Details', icon: FileText },
  { number: 3, label: 'Location', icon: MapPin },
  { number: 4, label: 'Review', icon: CheckCircle2 }
];

export default function ReportProgress({ currentStep, onStepClick }) {
  return (
    <div className="report-progress-container">
      <div className="progress-track">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isClickable = isCompleted && onStepClick;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.number}>
              <div 
                className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isClickable ? 'clickable' : ''}`}
                onClick={() => isClickable && onStepClick(step.number)}
              >
                <div className="step-circle">
                  {isCompleted ? (
                    <CheckCircle2 size={18} className="completed-check" />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>
                <div className="step-label-group">
                  <span className="step-count">0{step.number}</span>
                  <span className="step-name">{step.label}</span>
                </div>
              </div>

              {idx < STEPS.length - 1 && (
                <div className={`progress-line ${currentStep > idx + 1 ? 'filled' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}