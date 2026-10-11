const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'booking_request',
      'booking_accepted',
      'booking_rejected',
      'provider_arriving',
      'provider_arrived',
      'service_started',
      'service_completed',
      'new_message',
      'booking_cancelled',
      'review_submitted',
      'kyc_approved',
      'kyc_rejected',
      'warning',
      'suspension',
      'permanent_ban',
      'system'
    ],
    default: 'system'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
