const mongoose = require('mongoose');

const suspensionSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  durationDays: {
    type: Number,
    default: 30
  },
  reason: {
    type: String,
    required: [true, 'Suspension reason is required']
  },
  suspensionNumber: {
    type: Number,
    default: 1
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Suspension', suspensionSchema);
