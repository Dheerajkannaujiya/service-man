const KycDocument = require('../models/KycDocument');
const Provider = require('../models/Provider');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { updateProviderTrustScoreAndBadge } = require('./trustService');

/**
 * Submit / Update KYC Document for Provider
 */
async function submitKycDocument(providerUserId, { documentType, documentNumber, fileUrl, fileName, fileSize }) {
  // Check if document of same type already exists
  let doc = await KycDocument.findOne({ providerId: providerUserId, documentType });

  if (doc) {
    doc.documentNumber = documentNumber;
    doc.fileUrl = fileUrl;
    doc.fileName = fileName || doc.fileName;
    doc.fileSize = fileSize || doc.fileSize;
    doc.status = 'pending';
    doc.rejectionReason = '';
    await doc.save();
  } else {
    doc = await KycDocument.create({
      providerId: providerUserId,
      documentType,
      documentNumber,
      fileUrl,
      fileName,
      fileSize,
      status: 'pending'
    });
  }

  // Update provider status to pending if not already verified
  const provider = await Provider.findOne({ userId: providerUserId });
  if (provider && provider.kycStatus !== 'verified') {
    provider.kycStatus = 'pending';
    await provider.save();
  }

  return doc;
}

/**
 * Admin Review KYC Document
 */
async function reviewKycDocument(documentId, adminUserId, status, rejectionReason = '') {
  const doc = await KycDocument.findById(documentId);
  if (!doc) throw new Error('Document not found');

  doc.status = status;
  doc.rejectionReason = rejectionReason;
  doc.reviewedBy = adminUserId;
  doc.reviewedAt = new Date();
  await doc.save();

  const provider = await Provider.findOne({ userId: doc.providerId });
  if (!provider) return doc;

  // Check if all provider docs are verified
  const allDocs = await KycDocument.find({ providerId: doc.providerId });
  const hasRejected = allDocs.some(d => d.status === 'rejected');
  const allVerified = allDocs.length >= 2 && allDocs.every(d => d.status === 'verified');

  if (hasRejected) {
    provider.kycStatus = 'rejected';
    provider.kycRejectionReason = rejectionReason || 'One or more required documents were rejected.';
  } else if (allVerified) {
    provider.kycStatus = 'verified';
    provider.kycRejectionReason = '';
  } else {
    provider.kycStatus = 'pending';
  }
  await provider.save();

  // Trigger trust score recalculation
  await updateProviderTrustScoreAndBadge(doc.providerId, status === 'verified' ? 10 : -5, `KYC Document ${doc.documentType} ${status}`);

  // Send in-app notification
  await Notification.create({
    userId: doc.providerId,
    title: status === 'verified' ? 'KYC Document Approved' : 'KYC Document Rejected',
    message: status === 'verified'
      ? `Your ${doc.documentType.toUpperCase()} has been successfully verified by our team.`
      : `Your ${doc.documentType.toUpperCase()} was rejected: "${rejectionReason}". Please upload a valid document.`,
    type: status === 'verified' ? 'kyc_approved' : 'kyc_rejected',
    data: { documentId: doc._id, status }
  });

  // Log to audit trail
  await AuditLog.create({
    actorId: adminUserId,
    actorRole: 'admin',
    action: `KYC_${status.toUpperCase()}`,
    entityType: 'KycDocument',
    entityId: doc._id.toString(),
    details: { documentType: doc.documentType, status, rejectionReason }
  });

  return { doc, overallStatus: provider.kycStatus };
}

module.exports = {
  submitKycDocument,
  reviewKycDocument
};
