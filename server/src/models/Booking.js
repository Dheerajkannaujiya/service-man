const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  serviceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest'
  },
  status: {
    type: String,
    enum: [
      'REQUESTED',
      'MATCHING',
      'PROVIDER_NOTIFIED',
      'ACCEPTED',
      'PROVIDER_ON_THE_WAY',
      'ARRIVED',
      'SERVICE_STARTED',
      'SERVICE_COMPLETED',
      'CUSTOMER_REVIEWED',
      'CLOSED',
      'CANCELLED_BY_CUSTOMER',
      'CANCELLED_BY_PROVIDER',
      'EXPIRED',
      'REJECTED'
    ],
    default: 'ACCEPTED'
  },
  urgency: {
    type: String,
    enum: ['standard', 'urgent', 'emergency'],
    default: 'standard'
  },
  problemDescription: {
    type: String,
    default: ''
  },
  problemImages: [String],
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    default: 'Noida'
  },
  customerLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number]
  },
  providerLiveLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number]
  },
  startOtp: {
    type: String,
    default: () => Math.floor(1000 + Math.random() * 9000).toString()
  },
  estimatedPrice: {
    type: Number,
    required: true
  },
  finalPrice: {
    type: Number,
    default: function() { return this.estimatedPrice; }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cash', 'wallet'],
    default: 'razorpay'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerReview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  providerReview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  acceptedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date
}, {
  timestamps: true
});

bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ customerLocation: '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);
