const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ['large_truck', 'small_truck', 'tractor'],
        message: '{VALUE} is not a supported vehicle type.'
      },
      required: [true, 'Vehicle type is required.']
    },
    total: {
      type: Number,
      required: [true, 'Total count for vehicle is required.'],
      min: [0, 'Total vehicles cannot be negative.']
    },
    available: {
      type: Number,
      required: [true, 'Available count for vehicle is required.'],
      min: [0, 'Available vehicles cannot be negative.']
    },
    capacity_cubic_meters: {
      type: Number,
      min: [0, 'Vehicle capacity cannot be negative.']
    }
  },
  { _id: false }
);

// Vehicle level validation
vehicleSchema.pre('validate', function (next) {
  if (this.available > this.total) {
    this.invalidate('available', `Available vehicles (${this.available}) cannot exceed total vehicles (${this.total}).`);
  }
  next();
});

const resourceStateSchema = new mongoose.Schema(
  {
    snapshot_date: {
      type: Date,
      default: Date.now
    },
    is_current: {
      type: Boolean,
      default: true,
      index: true
    },
    vehicles: {
      type: [vehicleSchema],
      default: []
    },
    workers_total: {
      type: Number,
      required: [true, 'Total workers count is required.'],
      min: [0, 'Total workers cannot be negative.']
    },
    workers_available: {
      type: Number,
      required: [true, 'Available workers count is required.'],
      min: [0, 'Available workers cannot be negative.']
    },
    budget_total_inr: {
      type: Number,
      required: [true, 'Total budget in INR is required.'],
      min: [0, 'Total budget cannot be negative.']
    },
    budget_remaining_inr: {
      type: Number,
      required: [true, 'Remaining budget in INR is required.'],
      min: [0, 'Remaining budget cannot be negative.']
    },
    time_window_hours: {
      type: Number,
      required: [true, 'Operational time window in hours is required.'],
      min: [0, 'Time window cannot be negative.']
    },
    last_updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    collection: 'resource_states',
    timestamps: {
      createdAt: false,
      updatedAt: 'updated_at'
    }
  }
);

// Document level validation
resourceStateSchema.pre('validate', function (next) {
  if (this.workers_available > this.workers_total) {
    this.invalidate(
      'workers_available',
      `Available workers (${this.workers_available}) cannot exceed total workers (${this.workers_total}).`
    );
  }
  if (this.budget_remaining_inr > this.budget_total_inr) {
    this.invalidate(
      'budget_remaining_inr',
      `Remaining budget (${this.budget_remaining_inr}) cannot exceed total budget (${this.budget_total_inr}).`
    );
  }
  if (Array.isArray(this.vehicles)) {
    for (const v of this.vehicles) {
      if (v.available > v.total) {
        this.invalidate(
          'vehicles',
          `Available count (${v.available}) for ${v.type} cannot exceed total (${v.total}).`
        );
      }
    }
  }
  next();
});

const ResourceState = mongoose.models.ResourceState || mongoose.model('ResourceState', resourceStateSchema);

module.exports = ResourceState;
