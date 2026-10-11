const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  specificSubService: {
    type: String,
    default: 'General Diagnostic'
  },
  problemDescription: {
    type: String,
    required: [true, 'Please describe your service issue'],
    maxlength: 1000
  },
  images: [{
    type: String
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  address: {
    type: String,
    required: [true, 'Service address is required']
  },
  city: {
    type: String,
    default: 'Noida'
  },
  urgency: {
    type: String,
    enum: ['standard', 'urgent', 'emergency'],
    default: 'standard'
  },
  preferredDateTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'matching', 'accepted', 'expired', 'cancelled'],
    default: 'matching'
  },
  candidateProviders: [{
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    matchScore: Number,
    notifiedAt: { type: Date, default: Date.now },
    response: { type: String, enum: ['pending', 'accepted', 'rejected', 'timed_out'], default: 'pending' }
  }],
  matchedProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 mins expiry
  }
}, {
  timestamps: true
});

serviceRequestSchema.index({ location: '2dsphere' });
serviceRequestSchema.index({ status: 1, customerId: 1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
