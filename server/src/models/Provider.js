const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  categories: [{
    type: String,
    required: true,
    enum: [
      'Mechanic',
      'Electrician',
      'Homemaker',
      'Doctor',
      'Caretaker',
      'Tutor',
      'Plumber',
      'Painter',
      'Appliance Repair',
      'Carpenter'
    ]
  }],
  bio: {
    type: String,
    default: 'Experienced professional dedicated to top-tier service.'
  },
  experienceYears: {
    type: Number,
    default: 2,
    min: 0
  },
  qualification: {
    type: String,
    default: 'Certified Service Professional'
  },
  hourlyRate: {
    type: Number,
    default: 299
  },
  serviceRadiusKm: {
    type: Number,
    default: 20,
    min: 1,
    max: 100
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [77.3910, 28.5355]
    }
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'suspended', 'banned'],
    default: 'pending'
  },
  kycRejectionReason: {
    type: String,
    default: ''
  },
  trustScore: {
    type: Number,
    default: 75,
    min: 0,
    max: 100
  },
  hasTrustBadge: {
    type: Boolean,
    default: false
  },
  ratingAverage: {
    type: Number,
    default: 4.8,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  completedBookings: {
    type: Number,
    default: 0
  },
  cancelledBookings: {
    type: Number,
    default: 0
  },
  acceptanceRate: {
    type: Number,
    default: 96
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  pendingPayout: {
    type: Number,
    default: 0
  },
  bankDetails: {
    accountHolderName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    bankName: { type: String, default: '' },
    upiId: { type: String, default: '' }
  },
  workingHours: {
    start: { type: String, default: '08:00' },
    end: { type: String, default: '20:00' },
    days: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
  }
}, {
  timestamps: true
});

providerSchema.index({ currentLocation: '2dsphere' });
providerSchema.index({ categories: 1, kycStatus: 1, isOnline: 1, isAvailable: 1 });

module.exports = mongoose.model('Provider', providerSchema);
