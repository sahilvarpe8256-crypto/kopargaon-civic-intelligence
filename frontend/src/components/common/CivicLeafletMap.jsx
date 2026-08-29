import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { MapPin, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import './CivicLeafletMap.css';

// Custom SVG Icons for Priority Levels
function createPriorityIcon(priority) {
  const p = String(priority || 'Medium').toUpperCase();
  let pinColor = '#3b82f6'; // Blue / Low
  if (p === 'CRITICAL') pinColor = '#dc2626'; // Red
  else if (p === 'HIGH') pinColor = '#ea580c'; // Orange
  else if (p === 'MEDIUM') pinColor = '#d97706'; // Amber
  else if (p === 'LOW') pinColor = '#16a34a'; // Green

  const svgHtml = `
    <div class="leaflet-custom-pin" style="background-color: ${pinColor};">
      <div class="pin-inner-dot"></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker-wrapper',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
}

export default function CivicLeafletMap({
  reports = [],
  singleReport = null,
  center = [19.8845, 74.4682], // Kopargaon center
  zoom = 14,
  height = '350px',
  onSelectReport
}) {
  const displayReports = singleReport ? [singleReport] : reports;

  const validCenter = singleReport?.location?.latitude && singleReport?.location?.longitude
    ? [singleReport.location.latitude, singleReport.location.longitude]
    : center;

  const validZoom = singleReport ? 16 : zoom;

  return (
    <div className="civic-leaflet-wrapper" style={{ height }}>
      <MapContainer
        center={validCenter}
        zoom={validZoom}
        scrollWheelZoom={false}
        className="civic-leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {displayReports.map((r) => {
          const lat = r.location?.latitude || (r.latitude ? parseFloat(r.latitude) : null);
          const lng = r.location?.longitude || (r.longitude ? parseFloat(r.longitude) : null);
          if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

          const repId = r.report_id || r.reportId || r.id;
          const priority = r.priority || r.aiAssessment?.level || r.severity || 'Medium';
          const icon = createPriorityIcon(priority);

          return (
            <Marker
              key={repId}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectReport && onSelectReport(r)
              }}
            >
              <Popup className="civic-leaflet-popup">
                <div className="map-popup-card">
                  <div className="popup-top">
                    <span className="popup-id">{repId}</span>
                    <span className={`popup-prio-badge prio-${String(priority).toLowerCase()}`}>
                      {priority}
                    </span>
                  </div>
                  <h4 className="popup-title">{r.title || r.issue || r.wasteType}</h4>
                  <p className="popup-area">
                    <MapPin size={12} className="inline-icon" /> {r.location?.area || 'Kopargaon Zone'}
                  </p>
                  <div className="popup-status-row">
                    <span className="popup-lbl">Status:</span>
                    <span className="popup-status">{r.status || 'PENDING'}</span>
                  </div>
                  <Link to={`/admin/reports/${repId}`} className="popup-view-btn">
                    <span>Inspect Report</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="leaflet-priority-legend">
        <span className="legend-title">Priority Legend:</span>
        <div className="legend-item"><span className="legend-dot dot-critical" /> Critical</div>
        <div className="legend-item"><span className="legend-dot dot-high" /> High</div>
        <div className="legend-item"><span className="legend-dot dot-medium" /> Medium</div>
        <div className="legend-item"><span className="legend-dot dot-low" /> Low</div>
      </div>
    </div>
  );
}
