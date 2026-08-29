const mongoose = require('mongoose');

const resourceStateSchema = new mongoose.Schema(
  {
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: [true, 'Zone reference is required'],
      unique: true
    },
    availableStaff: {
      type: Number,
      required: [true, 'Available staff count is required'],
      min: [0, 'Available staff cannot be negative'],
      default: 0
    },
    availableVehicles: {
      type: Number,
      required: [true, 'Available vehicles count is required'],
      min: [0, 'Available vehicles cannot be negative'],
      default: 0
    },
    availableBudget: {
      type: Number,
      required: [true, 'Available budget is required'],
      min: [0, 'Available budget cannot be negative'],
      default: 0
    },
    dailyCapacity: {
      type: Number,
      required: [true, 'Daily capacity is required'],
      min: [0, 'Daily capacity cannot be negative'],
      default: 0
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'limited', 'depleted'],
        message: '{VALUE} is not a valid resource state status'
      },
      default: 'available'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const ResourceState = mongoose.model('ResourceState', resourceStateSchema);

module.exports = ResourceState;