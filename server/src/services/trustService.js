const crypto = require('crypto');
const Provider = require('../models/Provider');
const User = require('../models/User');
const ProviderTrustScore = require('../models/ProviderTrustScore');
const Warning = require('../models/Warning');
const Suspension = require('../models/Suspension');
const Ban = require('../models/Ban');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

/**
 * Recalculate provider trust score, evaluate badge criteria, and persist snapshot
 */
async function updateProviderTrustScoreAndBadge(providerUserId, delta = 0, reason = 'General recalculation') {
  const provider = await Provider.findOne({ userId: providerUserId });
  const user = await User.findById(providerUserId);

  if (!provider || !user) return null;

  // Fetch or create trust score record
  let trustDoc = await ProviderTrustScore.findOne({ providerId: providerUserId });
  if (!trustDoc) {
    trustDoc = new ProviderTrustScore({
      providerId: providerUserId,
      currentScore: provider.trustScore || 75,
      factors: {
        kycScore: provider.kycStatus === 'verified' ? 25 : 5,
        ratingScore: Math.round((provider.ratingAverage / 5) * 40),
        completionScore: Math.min(20, provider.completedBookings * 2),
        sentimentBonus: 5,
        cancellationPenalty: provider.cancelledBookings * 3,
        complaintPenalty: user.warningCount * 10,
        fraudPenalty: 0
      }
    });
  }

  // Calculate new score clamped 0 - 100
  let newScore = Math.max(0, Math.min(100, (trustDoc.currentScore || 75) + delta));
  trustDoc.currentScore = newScore;
  trustDoc.history.push({
    score: newScore,
    reason,
    timestamp: new Date()
  });

  // Evaluate "Verified & Trusted" Badge criteria (Section 15)
  // Badge criteria: KYC verified, Trust score >= 80, Rating >= 4.2, No active suspension/ban, warningCount < 2
  const qualifiesForBadge =
    provider.kycStatus === 'verified' &&
    newScore >= 80 &&
    provider.ratingAverage >= 4.2 &&
    !user.isSuspended &&
    !user.isBanned &&
    user.warningCount < 2;

  trustDoc.hasTrustBadge = qualifiesForBadge;
  if (qualifiesForBadge && !provider.hasTrustBadge) {
    trustDoc.badgeGrantedAt = new Date();
  }
  await trustDoc.save();

  // Update Provider document
  provider.trustScore = newScore;
  provider.hasTrustBadge = qualifiesForBadge;
  await provider.save();

  return { currentScore: newScore, hasTrustBadge: qualifiesForBadge };
}

/**
 * Automated Quality Control / 3-Tier Penalty System
 * 1st verified issue: Official Warning
 * 2nd verified complaint: 30-Day Suspension
 * 3rd verified violation / fraud: Permanent Ban
 */
async function processPenaltyEscalation(providerUserId, complaintId, adminUserId, reason, severity = 'high') {
  const user = await User.findById(providerUserId);
  const provider = await Provider.findOne({ userId: providerUserId });

  if (!user || !provider) {
    throw new Error('Provider account not found for penalty escalation');
  }

  user.warningCount = (user.warningCount || 0) + 1;
  const count = user.warningCount;

  let actionType = '';
  let penaltyDetails = {};

  if (count === 1) {
    // 1st verified issue: Official Warning
    actionType = 'WARNING_ISSUED';
    const warning = await Warning.create({
      providerId: providerUserId,
      complaintId,
      reason,
      warningNumber: 1,
      issuedBy: adminUserId
    });

    await Notification.create({
      userId: providerUserId,
      title: 'Official Quality Warning Issued',
      message: `An official warning has been registered on your profile: "${reason}". Please review your service quality guidelines to avoid account suspension.`,
      type: 'warning',
      data: { warningId: warning._id, complaintId }
    });

    penaltyDetails = { action: 'warning', warningNumber: 1 };
  } else if (count === 2) {
    // 2nd verified complaint: 30-Day Temporary Suspension
    actionType = 'SUSPENSION_APPLIED';
    const startDate = new Date();
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    user.isSuspended = true;
    user.suspendedUntil = endDate;
    provider.isOnline = false;
    provider.isAvailable = false;
    provider.kycStatus = 'suspended';
    provider.hasTrustBadge = false;

    const suspension = await Suspension.create({
      providerId: providerUserId,
      complaintId,
      startDate,
      endDate,
      durationDays: 30,
      reason,
      suspensionNumber: 1,
      issuedBy: adminUserId,
      isActive: true
    });

    await Notification.create({
      userId: providerUserId,
      title: 'Account Suspended for 30 Days',
      message: `Your account has been temporarily suspended for 30 days due to a second verified violation: "${reason}". You cannot accept new bookings during this period.`,
      type: 'suspension',
      data: { suspensionId: suspension._id, endsAt: endDate }
    });

    penaltyDetails = { action: 'suspension', durationDays: 30, endsAt: endDate };
  } else {
    // 3rd verified violation / fraud: Permanent Ban
    actionType = 'PERMANENT_BAN_APPLIED';
    user.isBanned = true;
    user.bannedReason = reason;
    user.isActive = false;
    provider.isOnline = false;
    provider.isAvailable = false;
    provider.kycStatus = 'banned';
    provider.hasTrustBadge = false;

    // Generate or use identity hash to block future re-registration
    const rawIdentity = user.nationalIdHash || `${user.email}_${user.phone}`;
    const identityHash = crypto.createHash('sha256').update(rawIdentity).digest('hex');
    user.nationalIdHash = identityHash;

    const ban = await Ban.create({
      providerId: providerUserId,
      complaintId,
      identityHash,
      email: user.email,
      phone: user.phone,
      reason,
      bannedBy: adminUserId,
      isPermanent: true
    });

    await Notification.create({
      userId: providerUserId,
      title: 'Permanent Ban Applied',
      message: `Your ServiceMan provider account has been permanently banned: "${reason}". Access and future registration under this identity are permanently restricted.`,
      type: 'permanent_ban',
      data: { banId: ban._id }
    });

    penaltyDetails = { action: 'permanent_ban', identityHash };
  }

  await user.save();
  await provider.save();

  // Recalculate trust score after penalty
  await updateProviderTrustScoreAndBadge(providerUserId, -15, `Penalty applied: ${actionType}`);

  // Log to audit trail
  await AuditLog.create({
    actorId: adminUserId,
    actorRole: 'admin',
    action: actionType,
    entityType: 'Provider',
    entityId: providerUserId.toString(),
    details: { reason, count, penaltyDetails }
  });

  return { warningCount: count, actionType, penaltyDetails };
}

module.exports = {
  updateProviderTrustScoreAndBadge,
  processPenaltyEscalation
};
