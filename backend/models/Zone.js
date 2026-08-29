import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema({
  zone_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  zone_name: {
    type: String,
    required: true,
    trim: true
  },
  population: {
    type: Number,
    required: true,
    default: 10000
  },
  priority_weight: {
    type: Number,
    default: 1.0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Zone = mongoose.model('Zone', zoneSchema);
export default Zone;
