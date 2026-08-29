import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, AlertCircle, Clock, CheckCircle2, Award, Info } from 'lucide-react';
import './AiAssessmentCard.css';

const PROCESSING_STAGES = [
  'Analyzing photo evidence...',
  'Checking issue indicators...',
  'Comparing nearby reports...',
  'Calculating civic priority...'
];

export default function AiAssessmentCard({ aiAssessment, isProcessing }) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % PROCESSING_STAGES.length);
    }, 300);
    return () => clearInterval(interval);
  }, [isProcessing]);

  if (isProcessing || !aiAssessment) {
    return (
      <div className="ai-processing-card">
        <div className="ai-processing-spinner-box">
          <Sparkles size={36} className="ai-sparkle-anim" />
        </div>
        <h3 className="ai-processing-title">AI Evidence Assessment</h3>
        <p className="ai-processing-stage">{PROCESSING_STAGES[stageIndex]}</p>
        <p className="ai-processing-disclaimer">
          Running visual analysis and deterministic civic rule weighting...
        </p>
      </div>
    );
  }

  const { score, level, confidence, recommendedResponse, reasoning } = aiAssessment;

  const getPriorityBadgeClass = (lvl) => {
    switch (lvl) {
      case 'CRITICAL': return 'priority-critical';
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      default: return 'priority-low';
    }
  };

  return (
    <div className="ai-assessment-card">
      <div className="ai-card-header">
        <div className="ai-badge-group">
          <div className="ai-icon-badge">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="ai-title">AI Evidence Assessment</h3>
            <span className="ai-meta">Automated Verification &amp; Priority Estimation</span>
          </div>
        </div>
        <div className="ai-confidence-badge">
          <Award size={16} />
          <span>{confidence}% Confidence</span>
        </div>
      </div>

      <div className="ai-score-banner">
        <div className="score-meter-box">
          <span className="score-number">{score}</span>
          <span className="score-denominator">/ 100</span>
        </div>
        <div className="score-classification">
          <span className="score-label">Suggested Priority</span>
          <div className={`priority-tag ${getPriorityBadgeClass(level)}`}>
            {level}
          </div>
        </div>
        <div className="score-response-box">
          <span className="response-label">Recommended Response</span>
          <p className="response-value">{recommendedResponse}</p>
        </div>
      </div>

      <div className="ai-reasoning-section">
        <h4 className="reasoning-title">
          <Info size={16} /> Key Assessment Factors:
        </h4>
        <ul className="reasoning-list">
          {reasoning.map((item, i) => (
            <li key={i} className="reasoning-item">
              <CheckCircle2 size={15} className="reasoning-check" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="ai-disclaimer-box">
        <ShieldCheck size={16} />
        <span>
          <strong>AI-assisted recommendation:</strong> Final operational priority, vehicle dispatch, and resource allocation are determined by Municipal Officers.
        </span>
      </div>
    </div>
  );
}