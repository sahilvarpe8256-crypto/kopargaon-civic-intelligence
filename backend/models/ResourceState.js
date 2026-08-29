import mongoose from 'mongoose';

const resourceStateSchema = new mongoose.Schema({
  snapshot_date: {
    type: Date,
    default: Date.now
  },
  is_current: {
    type: Boolean,
    default: true
  },
  vehicles: [
    {
      type: {
        type: String,
        enum: ['large_truck', 'small_truck', 'tractor', 'loader', 'sweeper']
      },
      name: String,
      total: { type: Number, default: 2 },
      available: { type: Number, default: 2 }
    }
  ],
  workers_total: {
    type: Number,
    default: 15
  },
  workers_available: {
    type: Number,
    default: 12
  },
  budget_total_inr: {
    type: Number,
    default: 50000
  },
  budget_remaining_inr: {
    type: Number,
    default: 25000
  },
  time_window_hours: {
    type: Number,
    default: 8
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const ResourceState = mongoose.model('ResourceState', resourceStateSchema);
export default ResourceState;
