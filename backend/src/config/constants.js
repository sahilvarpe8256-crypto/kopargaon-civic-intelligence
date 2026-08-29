/**
 * Kopargaon Civic Intelligence Platform — System Constants
 */

module.exports = {
  SERVICE_NAME: 'Kopargaon Civic Intelligence Backend',
  DEFAULT_PORT: 5000,
  DEFAULT_ALLOWED_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],

  // Lead Category for MVP
  LEAD_CATEGORY: 'waste_management',
  ALL_CATEGORIES: [
    'waste_management',
    'water_leakage',
    'street_lighting',
    'roads_infrastructure',
    'public_spaces',
    'disaster_hazards',
    'stray_animals'
  ],

  // Report Status Lifecycle
  STATUSES: {
    PENDING: 'PENDING',
    AI_ANALYSIS: 'AI_ANALYSIS',
    UNDER_REVIEW: 'UNDER_REVIEW',
    APPROVED: 'APPROVED',
    DEFERRED: 'DEFERRED',
    MANUAL_REVIEW: 'MANUAL_REVIEW',
    IN_PROGRESS: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
    REJECTED: 'REJECTED'
  },

  // Priority Engine Weights (Total = 1.00 / 100%) - Strictly Hardcoded on Backend
  PRIORITY_WEIGHTS: {
    SEVERITY: 0.30,
    POPULATION_EXPOSURE: 0.25,
    HEALTH_RISK: 0.20,
    ENVIRONMENTAL_RISK: 0.15,
    OBSTRUCTION: 0.10
  },

  // Deferral Reason Codes
  DEFERRAL_REASONS: {
    NO_VEHICLE: 'NO_VEHICLE',
    INSUFFICIENT_CREW: 'INSUFFICIENT_CREW',
    BUDGET_EXCEEDED: 'BUDGET_EXCEEDED',
    SHIFT_TIME_EXCEEDED: 'SHIFT_TIME_EXCEEDED',
    LOWER_PRIORITY: 'LOWER_PRIORITY'
  },

  // Kopargaon Geographic Boundaries
  KOPARGAON_BOUNDS: {
    MIN_LAT: 19.80,
    MAX_LAT: 19.98,
    MIN_LNG: 74.40,
    MAX_LNG: 74.55,
    CENTER: { lat: 19.8833, lng: 74.4667 }
  }
};
