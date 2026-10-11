const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  complainantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  respondentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  complainantRole: {
    type: String,
    enum: ['customer', 'provider'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'poor_service',
      'unprofessional_behavior',
      'overcharging',
      'no_show',
      'fraud_attempt',
      'harassment',
      'property_damage',
      'abusive_language',
      'other'
    ],
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please explain the issue'],
    maxlength: 2000
  },
  evidenceUrls: [String],
  status: {
    type: String,
    enum: ['open', 'investigating', 'verified', 'dismissed', 'resolved'],
    default: 'open'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  actionTaken: {
    type: String,
    enum: ['none', 'warning_issued', 'suspended', 'permanently_banned', 'dismissed'],
    default: 'none'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date
}, {
  timestamps: true
});

complaintSchema.index({ respondentId: 1, status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
