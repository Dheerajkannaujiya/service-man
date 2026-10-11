const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  platformFee: {
    type: Number,
    default: function() { return Math.round(this.amount * 0.15); } // 15% platform commission
  },
  providerEarnings: {
    type: Number,
    default: function() { return Math.round(this.amount * 0.85); }
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
    default: 'created'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay_card', 'razorpay_upi', 'razorpay_netbanking', 'cash'],
    default: 'razorpay_upi'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  refundId: String,
  paidAt: Date
}, {
  timestamps: true
});

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ customerId: 1, status: 1 });
paymentSchema.index({ providerId: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
