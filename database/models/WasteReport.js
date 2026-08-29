const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    original_name: { type: String },
    mimetype: { type: String },
    size_bytes: { type: Number },
    uploaded_at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const aiAnalysisSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING'
    },
    waste_detected: { type: Boolean },
    waste_type: {
      type: String,
      enum: {
        values: [
          'mixed_solid_waste',
          'organic_waste',
          'plastic_waste',
          'construction_debris',
          'hazardous_waste',
          'liquid_waste',
          'bulk_waste',
          'unknown'
        ],
        message: '{VALUE} is not a recognized waste type.'
      }
    },
    waste_type_detail: { type: String },
    visible_severity: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid visible_severity level.'
      }
    },
    evidence_confidence: {
      type: Number,
      min: [0, 'Evidence confidence cannot be less than 0.0'],
      max: [1, 'Evidence confidence cannot exceed 1.0']
    },
    health_risk: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical']
    },
    environmental_risk: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical']
    },
    public_obstruction: { type: Boolean },
    estimated_scale: {
      type: String,
      enum: ['small', 'medium', 'large', 'massive']
    },
    requires_manual_verification: { type: Boolean, default: false },
    image_quality: {
      type: String,
      enum: ['good', 'acceptable', 'poor', 'unreadable']
    },
    rejection_reason: {
      type: String,
      enum: [
        'no_waste_detected',
        'irrelevant_image',
        'blurry_unreadable',
        'private_property',
        'duplicate_location',
        'possible_evidence_mismatch',
        null
      ],
      default: null
    },
    ai_notes: { type: String },
    raw_response: { type: String },
    analyzed_at: { type: Date }
  },
  { _id: false }
);

const priorityScoreSchema = new mongoose.Schema(
  {
    total: { type: Number, default: null },
    breakdown: {
      health_risk_score: { type: Number, default: 0 },
      population_score: { type: Number, default: 0 },
      waste_severity_score: { type: Number, default: 0 },
      obstruction_score: { type: Number, default: 0 },
      urgency_score: { type: Number, default: 0 },
      confidence_score: { type: Number, default: 0 }
    },
    calculated_at: { type: Date }
  },
  { _id: false }
);

const outcomeSchema = new mongoose.Schema(
  {
    status: { type: String },
    reason: { type: String },
    decided_at: { type: Date }
  },
  { _id: false }
);

const wasteReportSchema = new mongoose.Schema(
  {
    report_id: {
      type: String,
      required: [true, 'Report ID is required.'],
      unique: true,
      trim: true
    },
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Citizen reference is required.']
    },
    category: {
      type: String,
      default: 'waste_management',
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: [
          'PENDING',
          'AI_ANALYSIS',
          'UNDER_REVIEW',
          'APPROVED',
          'DEFERRED',
          'MANUAL_REVIEW',
          'REJECTED_NO_WASTE',
          'REJECTED_IRRELEVANT'
        ],
        message: '{VALUE} is not a valid report status.'
      },
      default: 'PENDING'
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters.'],
      default: '',
      trim: true
    },
    images: {
      type: [imageSchema],
      default: []
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude] in GeoJSON standard
        required: [true, 'Coordinates [longitude, latitude] are required.'],
        validate: {
          validator: function (coords) {
            if (!Array.isArray(coords) || coords.length !== 2) return false;
            const [lng, lat] = coords;
            if (typeof lng !== 'number' || typeof lat !== 'number') return false;
            return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
          },
          message: 'Coordinates must be [longitude, latitude] where -180 <= lng <= 180 and -90 <= lat <= 90.'
        }
      }
    },
    zone_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null
    },
    ai_analysis: {
      type: aiAnalysisSchema,
      default: () => ({ status: 'PENDING' })
    },
    priority_score: {
      type: priorityScoreSchema,
      default: () => ({ total: null })
    },
    decision_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Decision',
      default: null
    },
    outcome: {
      type: outcomeSchema,
      default: null
    },
    submitted_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'waste_reports',
    timestamps: {
      createdAt: false,
      updatedAt: 'updated_at'
    }
  }
);

// Indexes supporting Civic Heatmap, Queue, and Geographic Queries
wasteReportSchema.index({ location: '2dsphere' });
wasteReportSchema.index({ zone_id: 1 });
wasteReportSchema.index({ status: 1 });
wasteReportSchema.index({ citizen_id: 1 });
wasteReportSchema.index({ submitted_at: 1 });
wasteReportSchema.index({ 'priority_score.total': -1 });
wasteReportSchema.index({ status: 1, 'priority_score.total': -1 });

const WasteReport = mongoose.models.WasteReport || mongoose.model('WasteReport', wasteReportSchema);

module.exports = WasteReport;
