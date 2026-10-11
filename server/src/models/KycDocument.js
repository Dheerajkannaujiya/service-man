const mongoose = require('mongoose');

const kycDocumentSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    enum: ['aadhaar', 'pan', 'passport', 'voter_id', 'trade_license', 'degree_certificate'],
    required: [true, 'Document type is required']
  },
  documentNumber: {
    type: String,
    required: [true, 'Document number/ID is required'],
    trim: true
  },
  fileUrl: {
    type: String,
    required: [true, 'Document file upload is required']
  },
  fileName: {
    type: String,
    default: 'kyc_document.pdf'
  },
  fileSize: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date
}, {
  timestamps: true
});

kycDocumentSchema.index({ providerId: 1, documentType: 1 });

module.exports = mongoose.model('KycDocument', kycDocumentSchema);
