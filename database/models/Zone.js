const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema(
  {
    zone_id: {
      type: String,
      required: [true, 'Zone ID is required.'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^Z\d{2,}$/, 'Zone ID must follow format like Z01, Z02, etc.']
    },
    zone_name: {
      type: String,
      required: [true, 'Zone name is required.'],
      trim: true
    },
    population: {
      type: Number,
      required: [true, 'Population is required (simulated prototype data).'],
      min: [0, 'Population cannot be negative.']
    },
    boundary: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true,
        default: 'Polygon'
      },
      coordinates: {
        type: [[[Number]]], // Array of rings, each ring an array of [lng, lat]
        required: [true, 'Polygon coordinates are required.'],
        validate: {
          validator: function (coords) {
            if (!Array.isArray(coords) || coords.length === 0) return false;
            for (const ring of coords) {
              if (!Array.isArray(ring) || ring.length < 4) return false;
              for (const pt of ring) {
                if (!Array.isArray(pt) || pt.length !== 2) return false;
                const [lng, lat] = pt;
                if (typeof lng !== 'number' || typeof lat !== 'number') return false;
                if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return false;
              }
              // First and last coordinate of each ring must match in GeoJSON Polygon
              const first = ring[0];
              const last = ring[ring.length - 1];
              if (first[0] !== last[0] || first[1] !== last[1]) return false;
            }
            return true;
          },
          message: 'Boundary must be a valid GeoJSON Polygon with [longitude, latitude] coordinates closed ring.'
        }
      }
    },
    is_active: {
      type: Boolean,
      default: true
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'zones'
  }
);

// Indexes
zoneSchema.index({ boundary: '2dsphere' });

const Zone = mongoose.models.Zone || mongoose.model('Zone', zoneSchema);

module.exports = Zone;
