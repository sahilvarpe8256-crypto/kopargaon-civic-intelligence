const mongoose = require('mongoose');
const { STATUSES, LEAD_CATEGORY, ALL_CATEGORIES } = require('../config/constants');

const complaintSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
      index: true
    },
    title: {
      type: String,
      trim: true,
      default: 'Civic Waste Report'
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    category: {
      type: String,
      enum: ALL_CATEGORIES,
      default: LEAD_CATEGORY
    },
    imageUrl: {
      type: String,
      default: ''
    },
    images: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        path: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    latitude: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required']
    },
    location: {
      address: { type: String, default: 'Kopargaon, Maharashtra' },
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [74.4667, 19.8833]
      }
    },
    zoneId: {
      type: String,
      default: 'Z01',
      index: true
    },
    zoneName: {
      type: String,
      default: 'Kopargaon Market Area'
    },
    zonePopulation: {
      type: Number,
      default: 12000
    },
    estimatedPopulationExposure: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    aiAnalysis: {
      wasteType: { type: String, default: 'mixed_solid_waste' },
      detectedElements: [{ type: String }],
      requiresManualVerification: { type: Boolean, default: false },
      confidence: { type: Number, default: 0.85 },
      notes: { type: String, default: '' },
      analyzedAt: { type: Date }
    },
    severity: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    healthRisk: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    environmentalRisk: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    obstruction: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.85
    },
    priorityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
      index: true
    },
    priorityReasons: {
      severityContribution: Number,
      exposureContribution: Number,
      healthRiskContribution: Number,
      environmentalContribution: Number,
      obstructionContribution: Number,
      summary: String
    },
    status: {
      type: String,
      enum: Object.values(STATUSES),
      default: STATUSES.PENDING,
      index: true
    },
    assignedResources: {
      crewId: String,
      crewCount: Number,
      vehicleType: String,
      estimatedHours: Number,
      estimatedCostINR: Number,
      assignedAt: Date
    },
    deferralReason: {
      type: String,
      default: null
    },
    officerNotes: {
      type: String,
      default: null
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for alias `id`
complaintSchema.virtual('id').get(function () {
  return this.reportId || this._id.toHexString();
});

// Geospatial 2dsphere index for location queries
complaintSchema.index({ 'location.coordinates': '2dsphere' });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;