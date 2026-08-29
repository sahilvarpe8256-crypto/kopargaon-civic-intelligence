const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: [true, 'Location address is required'],
      trim: true
    },
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    }
  },
  { _id: false }
);

const wasteReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
      trim: true,
      minlength: [5, 'Description must be at least 5 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      required: [true, 'Report category is required'],
      enum: {
        values: [
          'overflowing_bin',
          'illegal_dumping',
          'missed_collection',
          'street_litter',
          'hazardous_waste',
          'dead_animal',
          'other'
        ],
        message: '{VALUE} is not a valid waste report category'
      }
    },
    severity: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid severity level'
      },
      default: 'low'
    },
    status: {
      type: String,
      enum: {
        values: [
          'reported',
          'under_review',
          'prioritized',
          'assigned',
          'in_progress',
          'resolved',
          'rejected'
        ],
        message: '{VALUE} is not a valid report status'
      },
      default: 'reported'
    },
    location: {
      type: locationSchema,
      required: [true, 'Location information is required']
    },
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      default: null
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter user reference is required']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const WasteReport = mongoose.model('WasteReport', wasteReportSchema);

module.exports = WasteReport;