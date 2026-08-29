import React, { useState } from 'react';
import { MapPin, AlertTriangle, Layers, Info, Navigation, Sparkles } from 'lucide-react';
import { MOCK_HOTSPOTS } from '../../utils/mockReports';
import './HotspotMap.css';

export default function HotspotMap({ onSelectHotspot }) {
  const [selectedPin, setSelectedPin] = useState(MOCK_HOTSPOTS[0]);

  const getPinClass = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'pin-critical';
      case 'HIGH': return 'pin-high';
      case 'MEDIUM': return 'pin-medium';
      default: return 'pin-low';
    }
  };

  return (
    <div className="hotspot-map-card">
      <div className="hotspot-header">
        <div>
          <div className="hotspot-title-row">
            <Navigation size={18} className="hotspot-nav-icon" />
            <h3 className="hotspot-section-title">Civic Issue Hotspots</h3>
          </div>
          <p className="hotspot-subtitle">
            Spatial distribution of active citizen complaints across Kopargaon Municipal Council zones.
          </p>
        </div>

        <div className="hotspot-legend">
          <span className="legend-item"><span className="legend-dot critical" /> Critical (≥80)</span>
          <span className="legend-item"><span className="legend-dot high" /> High (60-79)</span>
          <span className="legend-item"><span className="legend-dot medium" /> Medium (40-59)</span>
          <span className="legend-item"><span className="legend-dot low" /> Low (&lt;40)</span>
        </div>
      </div>

      <div className="hotspot-grid-layout">
        {/* Stylized Municipal Map Canvas */}
        <div className="stylized-map-canvas">
          {/* Godavari River Visual Corridor */}
          <div className="river-corridor">
            <span className="river-label">Godavari River Natural Corridor</span>
          </div>

          {/* Ward Boundary Overlays */}
          <div className="ward-box z01"><span className="ward-tag">Zone Z01 (Riverside)</span></div>
          <div className="ward-box z02"><span className="ward-tag">Zone Z02 (Market &amp; Station)</span></div>
          <div className="ward-box z03"><span className="ward-tag">Zone Z03 (Shirdi Corridor)</span></div>
          <div className="ward-box z04"><span className="ward-tag">Zone Z04 (South Residential)</span></div>

          {/* Interactive Hotspot Pins */}
          {MOCK_HOTSPOTS.map((spot) => {
            const isSelected = selectedPin?.id === spot.id;
            return (
              <button
                key={spot.id}
                type="button"
                className={`map-hotspot-pin ${getPinClass(spot.priority)} ${isSelected ? 'active-pin' : ''}`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                onClick={() => setSelectedPin(spot)}
                title={`${spot.location} - ${spot.issue} (${spot.priority})`}
                aria-label={`Hotspot ${spot.location}`}
              >
                <div className="pin-pulse" />
                <MapPin size={16} className="pin-icon" />
                <span className="pin-counter-pill">{spot.reportsCount}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Hotspot Detail Panel */}
        <div className="hotspot-info-panel">
          {selectedPin ? (
            <div className="spot-details-box">
              <div className="spot-top-bar">
                <span className="spot-zone-tag">{selectedPin.zone}</span>
                <span className={`spot-priority-badge ${getPinClass(selectedPin.priority)}`}>
                  {selectedPin.priority} • {selectedPin.score}/100
                </span>
              </div>

              <h4 className="spot-issue-title">{selectedPin.issue}</h4>

              <div className="spot-meta-list">
                <div className="spot-meta-row">
                  <MapPin size={14} className="s-meta-icon" />
                  <span>{selectedPin.location}</span>
                </div>
                <div className="spot-meta-row">
                  <Layers size={14} className="s-meta-icon" />
                  <span><strong>{selectedPin.reportsCount}</strong> Citizen Reports Logged</span>
                </div>
                <div className="spot-meta-row">
                  <Sparkles size={14} className="s-meta-icon" />
                  <span>GPS: {selectedPin.lat}° N, {selectedPin.lng}° E</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-inspect-hotspot"
                onClick={() => onSelectHotspot && onSelectHotspot(selectedPin)}
              >
                Inspect Issue in Queue
              </button>
            </div>
          ) : (
            <div className="no-spot-selected">
              <Info size={24} />
              <p>Click any map hotspot pin to inspect ward complaint concentration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}