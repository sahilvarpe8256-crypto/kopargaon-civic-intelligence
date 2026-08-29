import mongoose from 'mongoose';

const wasteReportSchema = new mongoose.Schema({
  report_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  id: {
    type: String,
    trim: true
  },
  alias_id: {
    type: String,
    trim: true
  },
  citizen_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  citizen_name: {
    type: String,
    default: 'Citizen (Kopargaon Resident)'
  },
  citizen_phone: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'Waste',
    trim: true
  },
  issue: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  wasteType: {
    type: String,
    default: 'Illegal Dumping'
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'Medium'
  },
  priorityScore: {
    type: Number,
    default: 50
  },
  status: {
    type: String,
    enum: [
      'PENDING',
      'SUBMITTED',
      'AI_ANALYSIS',
      'UNDER_REVIEW',
      'APPROVED',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'REJECTED',
      'DEFERRED'
    ],
    default: 'PENDING',
    index: true
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  location: {
    area: { type: String, default: 'Station Road, Kopargaon' },
    address: { type: String, default: '' },
    zone: { type: String, default: 'Zone Z01' },
    latitude: { type: Number, default: 19.8845 },
    longitude: { type: Number, default: 74.4682 },
    isGps: { type: Boolean, default: false }
  },
  indicators: [{
    type: String
  }],
  photos: [{
    name: String,
    original_name: String,
    url: String,
    mimetype: String,
    size: Number,
    uploaded_at: { type: Date, default: Date.now }
  }],
  evidence: [{
    name: String,
    description: String,
    time: String
  }],
  ai_analysis: {
    status: { type: String, default: 'COMPLETED' },
    waste_detected: { type: Boolean, default: true },
    waste_type: { type: String, default: 'mixed_solid_waste' },
    visible_severity: { type: String, default: 'high' },
    evidence_confidence: { type: Number, default: 0.91 },
    health_risk: { type: String, default: 'high' },
    environmental_risk: { type: String, default: 'medium' },
    public_obstruction: { type: Boolean, default: true },
    estimated_scale: { type: String, default: 'large' },
    ai_notes: { type: String, default: 'Evidence verified.' },
    analyzed_at: { type: Date, default: Date.now }
  },
  aiAssessment: {
    score: { type: Number, default: 92 },
    level: { type: String, default: 'CRITICAL' },
    confidence: { type: Number, default: 91 },
    severityLabel: { type: String, default: 'High' },
    wasteType: { type: String, default: 'Mixed municipal waste' },
    estimatedUrgency: { type: String, default: 'Immediate attention' },
    recommendedResponse: { type: String, default: 'Immediate municipal inspection recommended.' },
    reasoning: [{ type: String }],
    factors: {
      severity: { type: Number, default: 35 },
      publicImpact: { type: Number, default: 24 },
      supportingReports: { type: Number, default: 20 },
      safetyRisk: { type: Number, default: 13 },
      reportAge: { type: Number, default: 5 },
      total: { type: Number, default: 92 },
      severityPercent: { type: Number, default: 95 },
      citizenReportsPercent: { type: Number, default: 82 },
      evidenceConfidencePercent: { type: Number, default: 91 },
      timePendingPercent: { type: Number, default: 80 }
    }
  },
  aiConfidence: {
    type: Number,
    default: 91
  },
  clusterId: {
    type: String,
    default: null
  },
  clusterName: {
    type: String,
    default: null
  },
  clusterDescription: {
    type: String,
    default: null
  },
  isClusterMaster: {
    type: Boolean,
    default: false
  },
  similarReports: {
    type: Number,
    default: 1
  },
  supportingReports: {
    type: Number,
    default: 1
  },
  supportingReportIds: [{
    type: String
  }],
  assignedTeam: {
    type: String,
    default: null
  },
  decisionNote: {
    type: String,
    default: ''
  },
  age: {
    type: String,
    default: 'Just now'
  },
  timeline: [{
    stage: String,
    title: String,
    description: String,
    timestamp: { type: Date, default: Date.now },
    actor: String
  }],
  feedback: {
    rating: { type: Number, min: 1, max: 5, default: null },
    comment: { type: String, maxlength: 500, default: '' },
    submittedAt: { type: Date, default: null },
    citizenName: { type: String, default: 'Citizen' }
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  decidedAt: {
    type: Date,
    default: null
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Middleware to sync report_id with id and ensure submittedAt
wasteReportSchema.pre('save', function (next) {
  if (!this.id && this.report_id) {
    this.id = this.report_id;
  }
  if (!this.report_id && this.id) {
    this.report_id = this.id;
  }
  if (!this.submittedAt && this.submitted_at) {
    this.submittedAt = this.submitted_at;
  }
  this.updated_at = new Date();
  next();
});

const WasteReport = mongoose.model('WasteReport', wasteReportSchema);
export default WasteReport;
