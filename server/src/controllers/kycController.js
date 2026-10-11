const KycDocument = require('../models/KycDocument');
const Provider = require('../models/Provider');
const { submitKycDocument, reviewKycDocument } = require('../services/kycService');

/**
 * Upload a KYC document for provider
 */
exports.uploadDocument = async (req, res, next) => {
  try {
    const { documentType, documentNumber } = req.body;

    if (!documentType || !documentNumber) {
      return res.status(400).json({ success: false, message: 'Document type and document number are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a document file (PDF or image).' });
    }

    const fileUrl = `/uploads/kyc/${req.file.filename}`;

    const doc = await submitKycDocument(req.user._id, {
      documentType,
      documentNumber,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    res.status(201).json({
      success: true,
      message: 'KYC document uploaded successfully and submitted for admin review.',
      document: doc
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current provider's KYC documents
 */
exports.getMyDocuments = async (req, res, next) => {
  try {
    const docs = await KycDocument.find({ providerId: req.user._id }).sort({ createdAt: -1 });
    const provider = await Provider.findOne({ userId: req.user._id });

    res.json({
      success: true,
      kycStatus: provider?.kycStatus || 'pending',
      rejectionReason: provider?.kycRejectionReason || '',
      documents: docs
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all pending KYC documents
 */
exports.getPendingKycDocuments = async (req, res, next) => {
  try {
    const docs = await KycDocument.find()
      .populate('providerId', 'name email phone city avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: docs.length, documents: docs });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Review KYC document (approve or reject)
 */
exports.reviewDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be either "verified" or "rejected".' });
    }

    const result = await reviewKycDocument(documentId, req.user._id, status, rejectionReason);

    res.json({
      success: true,
      message: `Document marked as ${status}.`,
      result
    });
  } catch (err) {
    next(err);
  }
};
