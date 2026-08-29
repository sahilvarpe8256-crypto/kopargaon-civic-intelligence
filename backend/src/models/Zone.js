const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Zone name is required'],
      trim: true,
      minlength: [2, 'Zone name must be at least 2 characters'],
      maxlength: [100, 'Zone name cannot exceed 100 characters']
    },
    code: {
      type: String,
      required: [true, 'Zone code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [2, 'Zone code must be at least 2 characters'],
      maxlength: [20, 'Zone code cannot exceed 20 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive'],
        message: '{VALUE} is not a valid zone status'
      },
      default: 'active'
    },
    populationEstimate: {
      type: Number,
      min: [0, 'Population estimate cannot be negative'],
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Zone = mongoose.model('Zone', zoneSchema);

module.exports = Zone;