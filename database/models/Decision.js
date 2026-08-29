const mongoose = require('mongoose');

const allocatedResourcesSchema = new mongoose.Schema(
  {
    vehicle: { type: String },
    vehicle_type: { type: String },
    workers: { type: Number },
    crew_size: { type: Number },
    estimated_hours: { type: Number },
    estimated_cost_inr: { type: Number }
  },
  { _id: false }
);

const selectedReportItemSchema = new mongoose.Schema(
  {
    report_id: { type: String, required: true },
    priority_score: { type: Number },
    allocated_resources: { type: allocatedResourcesSchema }
  },
  { _id: false }
);

const deferredReportItemSchema = new mongoose.Schema(
  {
    report_id: { type: String, required: true },
    priority_score: { type: Number },
    deferral_reason: {
      type: String,
      enum: [
        'NO_VEHICLE',
        'INSUFFICIENT_WORKERS',
        'INSUFFICIENT_CREW',
        'BUDGET_EXCEEDED',
        'TIME_EXCEEDED',
        'SHIFT_TIME_EXCEEDED',
        'LOWER_PRIORITY',
        'OTHER'
      ]
    },
    deferral_reason_detail: { type: String }
  },
  { _id: false }
);

const engineRecommendationSchema = new mongoose.Schema(
  {
    engine_version: { type: String, default: '1.0' },
    generated_at: { type: Date, default: Date.now },
    selected_reports: { type: [selectedReportItemSchema], default: [] },
    deferred_reports: { type: [deferredReportItemSchema], default: [] },
    total_cost_estimate_inr: { type: Number, default: 0 },
    total_time_estimate_hours: { type: Number, default: 0 }
  },
  { _id: false }
);

const officerDecisionSchema = new mongoose.Schema(
  {
    selected_reports: { type: [selectedReportItemSchema], default: [] },
    deferred_reports: { type: [deferredReportItemSchema], default: [] },
    override_reason: { type: String, default: null, trim: true }
  },
  { _id: false }
);

const decisionSchema = new mongoose.Schema(
  {
    officer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Officer reference is required.']
    },
    decision_type: {
      type: String,
      enum: {
        values: ['APPROVED', 'OVERRIDDEN'],
        message: '{VALUE} is not a valid decision type. Must be APPROVED or OVERRIDDEN.'
      },
      required: [true, 'Decision type is required.']
    },
    engine_recommendation: {
      type: engineRecommendationSchema,
      required: [true, 'Engine recommendation snapshot is required.']
    },
    officer_decision: {
      type: officerDecisionSchema,
      required: [true, 'Officer decision record is required.']
    },
    resource_state_before: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResourceState'
    },
    resource_state_after: {
      type: mongoose.Schema.Types.Mixed
    },
    reports_affected: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WasteReport'
      }
    ],
    decided_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'decisions'
  }
);

// Validation: Ensure override_reason is provided whenever decision_type is OVERRIDDEN
decisionSchema.pre('validate', function (next) {
  if (this.decision_type === 'OVERRIDDEN') {
    const reason = this.officer_decision && this.officer_decision.override_reason;
    if (!reason || reason.trim().length === 0) {
      this.invalidate(
        'officer_decision.override_reason',
        'Override reason is strictly required when decision_type is OVERRIDDEN.'
      );
    }
  }
  next();
});

// Indexes for audit and fast querying
decisionSchema.index({ officer_id: 1 });
decisionSchema.index({ decided_at: 1 });
decisionSchema.index({ reports_affected: 1 });

const Decision = mongoose.models.Decision || mongoose.model('Decision', decisionSchema);

module.exports = Decision;
