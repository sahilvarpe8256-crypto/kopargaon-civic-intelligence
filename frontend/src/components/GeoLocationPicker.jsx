import React, { useState } from 'react';
import { MapPin, Navigation, Check, AlertCircle } from 'lucide-react';
import { KOPARGAON_ZONES } from '../utils/constants';

export default function GeoLocationPicker({ latitude, longitude, onLocationChange, error }) {
  const [isLocating, setIsLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState(null);

  const fetchBrowserLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice({ type: 'error', message: 'Geolocation is not supported by your browser.' });
      return;
    }

    setIsLocating(true);
    setGeoNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        onLocationChange(lat, lng);
        setGeoNotice({
          type: 'success',
          message: `GPS Captured! Accuracy: ±${Math.round(pos.coords.accuracy)}m (${lat}, ${lng})`
        });
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Unable to capture GPS location.';
        if (err.code === 1) msg = 'Location permission denied. Please select a Kopargaon zone below.';
        if (err.code === 2) msg = 'Location unavailable. Please select a Kopargaon zone below.';
        if (err.code === 3) msg = 'Location request timed out.';
        setGeoNotice({ type: 'error', message: msg });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleZoneSelect = (zone) => {
    onLocationChange(zone.lat, zone.lng);
    setGeoNotice({
      type: 'info',
      message: `Selected ${zone.name} (${zone.zoneId}) coordinates: ${zone.lat}, ${zone.lng}`
    });
  };

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <label className="form-label" style={{ margin: 0 }}>
          Location Coordinates *
        </label>
        <button
          type="button"
          onClick={fetchBrowserLocation}
          disabled={isLocating}
          className="btn btn-secondary"
          style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
        >
          <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
          <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.6rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--slate-600)', display: 'block', marginBottom: '0.2rem' }}>
            Latitude (e.g. 19.8845)
          </label>
          <input
            type="number"
            step="0.0001"
            placeholder="19.8845"
            className="form-input"
            value={latitude || ''}
            onChange={(e) => onLocationChange(parseFloat(e.target.value) || '', longitude)}
            required
          />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--slate-600)', display: 'block', marginBottom: '0.2rem' }}>
            Longitude (e.g. 74.4671)
          </label>
          <input
            type="number"
            step="0.0001"
            placeholder="74.4671"
            className="form-input"
            value={longitude || ''}
            onChange={(e) => onLocationChange(latitude, parseFloat(e.target.value) || '')}
            required
          />
        </div>
      </div>

      {/* Quick Zone Chips */}
      <div>
        <span style={{ fontSize: '0.775rem', color: 'var(--slate-500)', display: 'block', marginBottom: '0.35rem' }}>
          📍 Or select a standard Kopargaon prototype zone:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {KOPARGAON_ZONES.map((zone) => {
            const isSelected =
              Math.abs(latitude - zone.lat) < 0.001 && Math.abs(longitude - zone.lng) < 0.001;
            return (
              <button
                key={zone.zoneId}
                type="button"
                onClick={() => handleZoneSelect(zone)}
                className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  borderRadius: '9999px'
                }}
              >
                <MapPin size={12} />
                <span>{zone.zoneId}: {zone.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {geoNotice && (
        <div
          className={`alert alert-${geoNotice.type}`}
          style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', fontSize: '0.825rem' }}
        >
          {geoNotice.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
          <span>{geoNotice.message}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', fontSize: '0.825rem' }}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}