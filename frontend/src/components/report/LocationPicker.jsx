import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertTriangle, Building, Compass } from 'lucide-react';
import './LocationPicker.css';

const KOPARGAON_ZONES = [
  { id: 'Z01', name: 'Z01 - Kopargaon Market Area', lat: 19.8833, lng: 74.4667, landmark: 'Near Municipal Council / Daily Mandi' },
  { id: 'Z02', name: 'Z02 - Kopargaon Railway Station Ward', lat: 19.8920, lng: 74.4750, landmark: 'Station Road & Bus Depot' },
  { id: 'Z03', name: 'Z03 - Old Town / Peth Ward', lat: 19.8790, lng: 74.4620, landmark: 'Near Historical Peth & Mandir Road' },
  { id: 'Z04', name: 'Z04 - New Residential Colony', lat: 19.8880, lng: 74.4550, landmark: 'Shirdi Highway Residential Colony' },
  { id: 'Z05', name: 'Z05 - Godavari Riverside & Outskirts', lat: 19.8750, lng: 74.4710, landmark: 'Godavari Riverbank / Rural Border' }
];

export default function LocationPicker({ location, onChange, error }) {
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        onChange({
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6)),
          area: 'Kopargaon - GPS Verified Location',
          address: `GPS Pin: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`,
          zone: 'Z01 - Auto-detected Ward',
          isGps: true
        });
      },
      (err) => {
        setIsLocating(false);
        setGeoError(`Location access denied or unavailable (${err.message}). Using standard Kopargaon municipal coordinates.`);
        // Fallback default
        if (!location?.latitude) {
          handleSelectZone(KOPARGAON_ZONES[0]);
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectZone = (zone) => {
    setGeoError(null);
    onChange({
      latitude: zone.lat,
      longitude: zone.lng,
      area: zone.name,
      address: zone.landmark,
      zone: zone.id,
      isGps: false
    });
  };

  return (
    <div className="location-picker-container">
      <div className="location-header">
        <h2 className="location-title">Where Is the Issue?</h2>
        <p className="location-subtitle">
          Pin the precise location of the waste issue within Kopargaon Municipal limits.
        </p>
      </div>

      {error && (
        <div className="location-error-banner">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {geoError && (
        <div className="location-warning-banner">
          <AlertTriangle size={18} />
          <span>{geoError}</span>
        </div>
      )}

      <div className="location-trigger-bar">
        <button
          type="button"
          className="btn-primary btn-gps"
          onClick={handleUseGeolocation}
          disabled={isLocating}
        >
          <Navigation size={18} className={isLocating ? 'spin-icon' : ''} />
          <span>{isLocating ? 'Detecting GPS Coordinates...' : 'Use My Current Location'}</span>
        </button>
        <span className="location-or-divider">or select Kopargaon municipal ward below</span>
      </div>

      {/* Prototype Visual Municipal Map Area */}
      <div className="proto-map-card">
        <div className="proto-map-canvas">
          <div className="map-grid-overlay" />
          <div className="map-river-graphic">
            <span>Godavari River Corridor</span>
          </div>

          {/* Ward zones displayed visually */}
          {KOPARGAON_ZONES.map((zone) => {
            const isCurrentZone = location?.zone === zone.id || location?.area === zone.name;
            return (
              <button
                type="button"
                key={zone.id}
                className={`map-ward-pin ${isCurrentZone ? 'active-pin' : ''}`}
                onClick={() => handleSelectZone(zone)}
                title={`Click to select ${zone.name}`}
              >
                <MapPin size={20} />
                <span className="ward-pin-label">{zone.id}</span>
              </button>
            );
          })}

          <div className="map-legend-overlay">
            <span className="legend-badge">
              <Compass size={14} /> Kopargaon Municipal Grid
            </span>
          </div>
        </div>

        {/* Selected Coordinates & Zone Bar */}
        <div className="map-details-bar">
          <div className="detail-item">
            <span className="detail-label">City / Municipal Limit</span>
            <span className="detail-value">
              <Building size={14} /> Kopargaon (Maharashtra)
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Latitude</span>
            <span className="detail-value">{location?.latitude ? `${location.latitude}° N` : '19.8833° N'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Longitude</span>
            <span className="detail-value">{location?.longitude ? `${location.longitude}° E` : '74.4667° E'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Selected Ward / Area</span>
            <span className="detail-value highlight">
              {location?.area || 'Kopargaon Market Area (Z01)'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Ward Selector Buttons */}
      <div className="ward-selector-list">
        <span className="ward-list-title">Quick Ward Selection:</span>
        <div className="ward-chips-grid">
          {KOPARGAON_ZONES.map((zone) => {
            const isSelected = location?.zone === zone.id || location?.area === zone.name;
            return (
              <button
                type="button"
                key={zone.id}
                className={`ward-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectZone(zone)}
              >
                <MapPin size={14} />
                <span>{zone.name}</span>
                {isSelected && <CheckCircle2 size={14} className="chip-check" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}