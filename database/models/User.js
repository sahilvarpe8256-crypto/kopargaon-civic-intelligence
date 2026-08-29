const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: {
        values: ['citizen', 'officer'],
        message: '{VALUE} is not a valid user role. Must be citizen or officer.'
      },
      required: [true, 'User role is required.']
    },
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters.']
    },
    email: {
      type: String,
      required: [true, 'Email address is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address.'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required.'],
      trim: true,
      validate: {
        validator: function (v) {
          // Validate 10-digit Indian mobile number
          return /^[6-9]\d{9}$/.test(v);
        },
        message: props => `${props.value} is not a valid 10-digit Indian mobile number (starts with 6-9).`
      }
    },
    password_hash: {
      type: String,
      required: [true, 'Password hash is required.'],
      select: false // Excluded from normal query results for security
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    collection: 'users',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Indexes
userSchema.index({ role: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
