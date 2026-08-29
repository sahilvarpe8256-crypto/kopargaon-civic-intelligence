import React from 'react';
import { Layers, Link2, Check, AlertCircle } from 'lucide-react';
import './DuplicateReportCard.css';

export default function DuplicateReportCard({ duplicates = [], linkedReports = [], onToggleLink }) {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className="duplicate-reports-card">
      <div className="duplicate-header">
        <div className="duplicate-title-group">
          <Layers size={18} className="duplicate-icon" />
          <h4 className="duplicate-title">Nearby Similar Reports</h4>
        </div>
        <span className="duplicate-count-badge">
          {duplicates.length} Potential Matches
        </span>
      </div>

      <div className="duplicate-alert-banner">
        <AlertCircle size={16} />
        <span>
          <strong>Possible duplicate cluster detected:</strong> Multiple citizens have reported waste issues within 200m of this location.
        </span>
      </div>

      <div className="duplicate-list">
        {duplicates.map((dup) => {
          const isLinked = linkedReports.includes(dup.reportId);

          return (
            <div key={dup.reportId} className={`duplicate-item ${isLinked ? 'linked' : ''}`}>
              <div className="duplicate-item-info">
                <div className="duplicate-id-row">
                  <span className="dup-id">{dup.reportId}</span>
                  <span className="dup-match-tag">{dup.matchProbability}</span>
                </div>
                <span className="dup-type">{dup.issueType}</span>
                <span className="dup-distance-time">
                  📍 {dup.distance} • Reported {dup.reportedAgo}
                </span>
              </div>

              <button
                type="button"
                className={`btn-link-dup ${isLinked ? 'is-linked' : ''}`}
                onClick={() => onToggleLink(dup.reportId)}
              >
                {isLinked ? (
                  <>
                    <Check size={14} />
                    <span>Linked as Related</span>
                  </>
                ) : (
                  <>
                    <Link2 size={14} />
                    <span>Link as Related</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="duplicate-footer-note">
        Linking helps municipal officers merge work orders and dispatch larger equipment to clean clusters together.
      </p>
    </div>
  );
}