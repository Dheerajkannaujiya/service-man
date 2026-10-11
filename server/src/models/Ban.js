const mongoose = require('mongoose');

const banSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  },
  identityHash: {
    type: String,
    required: true,
    index: true
  },
  email: String,
  phone: String,
  reason: {
    type: String,
    required: [true, 'Permanent ban reason is required']
  },
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPermanent: {
    type: Boolean,
    default: true
  },
  bannedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ban', banSchema);
