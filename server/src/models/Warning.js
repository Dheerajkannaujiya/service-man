const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  },
  reason: {
    type: String,
    required: [true, 'Warning reason is required']
  },
  warningNumber: {
    type: Number,
    required: true,
    default: 1
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  acknowledgedByProvider: {
    type: Boolean,
    default: false
  },
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Warning', warningSchema);
