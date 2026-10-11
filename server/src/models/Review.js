const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorRole: {
    type: String,
    enum: ['customer', 'provider'],
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating (1-5) is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Review feedback is required'],
    trim: true,
    maxlength: 2000
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  isVerifiedBooking: {
    type: Boolean,
    default: true
  },
  analysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReviewAnalysis'
  }
}, {
  timestamps: true
});

// Enforce single review per user per booking
reviewSchema.index({ bookingId: 1, authorId: 1 }, { unique: true });
reviewSchema.index({ recipientId: 1, rating: -1 });

module.exports = mongoose.model('Review', reviewSchema);
