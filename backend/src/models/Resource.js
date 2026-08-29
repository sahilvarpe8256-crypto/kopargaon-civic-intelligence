const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      default: () => new Date().toISOString().split('T')[0]
    },
    crews: {
      total: { type: Number, default: 6, min: 0 },
      available: { type: Number, default: 4, min: 0 },
      dispatched: { type: Number, default: 2, min: 0 }
    },
    vehicles: [
      {
        type: { type: String, required: true },
        total: { type: Number, default: 2, min: 0 },
        available: { type: Number, default: 1, min: 0 },
        dispatched: { type: Number, default: 1, min: 0 }
      }
    ],
    workingHoursRemainingToday: {
      type: Number,
      default: 6.5,
      min: 0
    },
    dailyBudgetINR: {
      allocated: { type: Number, default: 25000, min: 0 },
      spent: { type: Number, default: 8500, min: 0 },
      remaining: { type: Number, default: 16500, min: 0 }
    },
    isCurrent: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;