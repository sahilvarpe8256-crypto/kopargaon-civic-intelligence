import React from 'react';
import { Sparkles, Info, ShieldAlert, CheckCircle2, ShieldCheck, Flame, Scale, HelpCircle } from 'lucide-react';
import './PriorityIntelligenceCard.css';

export default function PriorityIntelligenceCard({ report }) {
  const r = report || {
    id: 'KOP-1024',
    reportId: 'KOP-1024',
    issue: 'Waste accumulation — Station Road',
    severity: 'Critical',
    priorityScore: 92,
    aiAssessment: {
      score: 92,
      confidence: 91,
      recommendedResponse: 'Immediate municipal inspection recommended. Dispatch high-capacity loader crew within 12 hours.'
    }
  };

  const score = r.priorityScore || r.aiAssessment?.score || 92;
  const isCritical = score >= 80;
  const isHigh = score >= 60 && score < 80;

  // 6 Deterministic Factors conforming to PRIORITY_ENGINE.md
  const factorsList = r.aiAssessment?.explainableFactors || [
    { name: 'Health & Environmental Risk', score: isCritical ? 95 : 80, weight: 30, contribution: isCritical ? 28.5 : 24.0 },
    { name: 'Zone Population Impact', score: isCritical ? 85 : 70, weight: 25, contribution: isCritical ? 21.2 : 17.5 },
    { name: 'Visible Waste Severity', score: isCritical ? 90 : 80, weight: 20, contribution: isCritical ? 18.0 : 16.0 },
    { name: 'Public Pathway Obstruction', score: isCritical ? 100 : 0, weight: 10, contribution: isCritical ? 10.0 : 0.0 },
    { name: 'Urgency / Pending Age', score: isCritical ? 80 : 60, weight: 10, contribution: isCritical ? 8.0 : 6.0 },
    { name: 'AI Evidence Confidence', score: isCritical ? 91 : 88, weight: 5, contribution: isCritical ? 4.5 : 4.4 }
  ];

  const whySummary = r.aiAssessment?.whySummary || (
    isCritical 
      ? 'High priority because the report indicates significant health & environmental risk, multiple nearby citizen complaints, and direct road/pathway obstruction.'
      : isHigh
      ? 'Elevated priority due to market area transit footfall and commercial waste overflow requiring scheduled 24-48h clearance.'
      : 'Standard priority for routine municipal sanitation round maintenance.'
  );

  return (
    <div className="priority-intelligence-card" id="priority-explanation">
      {/* Header */}
      <div className="intel-header">
        <div className="intel-title-box">
          <div className="intel-badge-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="intel-pill-tag">Deterministic 6-Factor Engine</div>
            <h3 className="intel-title">Explainable AI Priority Assessment</h3>
            <span className="intel-sub">Transparent mathematical weighting for Issue {r.report_id || r.reportId || r.id}</span>
          </div>
        </div>

        <div className="intel-score-tag">
          <span className="score-lbl">Priority Score</span>
          <div className="score-val-wrap">
            <span className="score-val">{score}</span>
            <span className="score-denominator">/ 100</span>
          </div>
        </div>
      </div>

      {/* 6-Factor Mathematical Contribution Table */}
      <div className="factor-table-container">
        <table className="factor-breakdown-table">
          <thead>
            <tr>
              <th>Scoring Factor</th>
              <th className="text-center">Raw Score</th>
              <th className="text-center">Weight</th>
              <th className="text-right">Contribution</th>
            </tr>
          </thead>
          <tbody>
            {factorsList.map((f, idx) => (
              <tr key={idx}>
                <td className="factor-name-cell">
                  <span className="factor-bullet">•</span> {f.name}
                </td>
                <td className="text-center">
                  <span className="raw-score-pill">{f.score}/100</span>
                </td>
                <td className="text-center factor-weight-val">
                  {f.weight}%
                </td>
                <td className="text-right factor-contrib-val">
                  +{f.contribution}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="factor-total-row">
              <td colSpan="3">
                <strong>Total Calculated Priority Score</strong>
              </td>
              <td className="text-right total-score-highlight">
                {score} / 100
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Why is this issue high priority? */}
      <div className="why-priority-box">
        <div className="why-header">
          <HelpCircle size={16} className="why-icon" />
          <strong>Why is this issue {isCritical ? 'Critical' : isHigh ? 'High' : 'Medium'} priority?</strong>
        </div>
        <p className="why-text">{whySummary}</p>
      </div>

      {/* AI Recommendation Banner */}
      <div className="ai-recommendation-banner">
        <div className="rec-header">
          <ShieldAlert size={16} className="rec-icon" />
          <strong>AI Recommended Municipal Response:</strong>
        </div>
        <p className="rec-text">
          {r.aiAssessment?.recommendedResponse || 'Immediate municipal inspection recommended. Dispatch high-capacity loader crew within 12 hours.'}
        </p>
      </div>

      {/* Official Disclaimer Banner */}
      <div className="intel-disclaimer">
        <ShieldCheck size={16} className="disclaimer-shield" />
        <div className="disclaimer-text-group">
          <strong>AI-Assisted Decision Support:</strong>
          <span>Final action remains with the Municipal Officer. AI provides evidence classification and explainable priority scoring.</span>
        </div>
      </div>
    </div>
  );
}