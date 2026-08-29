export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const KOPARGAON_ZONES = [
  { zoneId: 'Z01', name: 'Market Area', population: 12000, lat: 19.8845, lng: 74.4671 },
  { zoneId: 'Z02', name: 'Station Road', population: 9500, lat: 19.8920, lng: 74.4750 },
  { zoneId: 'Z03', name: 'Godavari Ghat & Temple Belt', population: 15000, lat: 19.8800, lng: 74.4620 },
  { zoneId: 'Z04', name: 'Residential Colony & Schools', population: 8000, lat: 19.8750, lng: 74.4800 },
  { zoneId: 'Z05', name: 'Industrial & Highway Zone', population: 4500, lat: 19.9050, lng: 74.4550 }
];

export const CATEGORIES = [
  { value: 'waste_management', label: 'Mixed Solid Waste' },
  { value: 'drainage', label: 'Blocked Open Drainage / Gutter' },
  { value: 'illegal_dumping', label: 'Illegal Roadside Dumping' },
  { value: 'dead_animal', label: 'Dead Animal / Biohazard' },
  { value: 'construction_waste', label: 'Construction & Demolition Debris' }
];

export const STATUS_LABELS = {
  PENDING: { label: 'Pending Assessment', badgeClass: 'badge-status-pending' },
  AI_ANALYSIS: { label: 'AI Ingestion', badgeClass: 'badge-status-pending' },
  UNDER_REVIEW: { label: 'Under Review', badgeClass: 'badge-status-review' },
  MANUAL_REVIEW: { label: 'Manual Verification Required', badgeClass: 'badge-status-manual' },
  APPROVED: { label: 'Dispatch Approved', badgeClass: 'badge-status-approved' },
  DEFERRED: { label: 'Resource Deferred', badgeClass: 'badge-status-deferred' },
  IN_PROGRESS: { label: 'Cleanup In Progress', badgeClass: 'badge-status-progress' },
  RESOLVED: { label: 'Resolved / Verified', badgeClass: 'badge-status-resolved' }
};

export const DEFERRAL_REASONS = {
  NO_VEHICLE: 'Required Vehicle Type Unavailable',
  INSUFFICIENT_CREW: 'All Field Crews Dispatched / Unavailable',
  BUDGET_EXCEEDED: 'Daily Operational Budget Limit Reached',
  SHIFT_HOURS_EXCEEDED: 'Remaining Shift Hours Exceeded',
  LOWER_PRIORITY: 'Deferred for Higher Priority Hazards'
};