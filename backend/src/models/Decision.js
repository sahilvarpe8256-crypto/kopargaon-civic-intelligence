const mongoose = require('mongoose');

const factorBreakdownSchema = new mongoose.Schema(
  {
    severity: {
      type: Number,
      min: [0, 'Factor score cannot be negative'],
      default: null
    },
    publicImpact: {
      type: Number,
      min: [0, 'Factor score cannot be negative'],
      default: null
    },
    healthRisk: {
      type: Number,
      min: [0, 'Factor score cannot be negative'],
      default: null
    },
    environmentalRisk: {
      type: Number,
      min: [0, 'Factor score cannot be negative'],
      default: null
    },
    reportAge: {
      type: Number,
      min: [0, 'Factor score cannot be negative'],
      default: null
    },
    resourceAvailability: {
      type: Number,
      min: [0, 'Factor score cannot be negative'],
      default: null
    },
    dataConfidence: {
      type: Number,
      min: [0, 'Confidence score cannot be negative'],
      max: [1, 'Confidence score cannot exceed 1.0'],
      default: null
    }
  },
  { _id: false }
);

const resourceAllocationSchema = new mongoose.Schema(
  {
    staff: {
      type: Number,
      min: [0, 'Allocated staff cannot be negative'],
      default: 0
    },
    vehicles: {
      type: Number,
      min: [0, 'Allocated vehicles cannot be negative'],
      default: 0
    },
    budget: {
      type: Number,
      min: [0, 'Allocated budget cannot be negative'],
      default: 0
    },
    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours cannot be negative'],
      default: 0
    }
  },
  { _id: false }
);

const decisionSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteReport',
      required: [true, 'Waste report reference is required']
    },
    decisionType: {
      type: String,
      required: [true, 'Decision type is required'],
      enum: {
        values: ['prioritize', 'defer', 'escalate', 'reject', 'allocate'],
        message: '{VALUE} is not a valid decision type'
      }
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'executed', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid decision status'
      },
      default: 'pending'
    },
    priorityRank: {
      type: Number,
      min: [1, 'Priority rank must be at least 1'],
      default: null
    },
    score: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      default: null
    },
    factors: {
      type: factorBreakdownSchema,
      default: () => ({})
    },
    explanation: {
      type: String,
      required: [true, 'Decision explanation is required'],
      trim: true,
      minlength: [5, 'Explanation must be at least 5 characters']
    },
    resourcesAllocated: {
      type: resourceAllocationSchema,
      default: () => ({})
    },
    decidedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Decision = mongoose.model('Decision', decisionSchema);

module.exports = Decision;