const Provider = require('../models/Provider');
const User = require('../models/User');
const Booking = require('../models/Booking');
const ServiceRequest = require('../models/ServiceRequest');
const { calculateDistance, calculateEta } = require('./geoService');
const redisClient = require('../config/redis');

/**
 * AI Matching Engine
 * Ranks eligible, KYC-verified providers based on multi-factor scoring formula:
 * MATCH SCORE = Distance (40%) + Trust (25%) + Rating (20%) + Experience (10%) + Response (5%)
 */
async function findMatchingProviders(serviceRequest) {
  const [custLng, custLat] = serviceRequest.location.coordinates;
  const category = serviceRequest.category;

  // 1. Fetch eligible providers: must be online, available, KYC verified, not banned/suspended
  const candidateProviders = await Provider.find({
    categories: category,
    kycStatus: 'verified',
    isOnline: true,
    isAvailable: true
  }).populate({
    path: 'userId',
    match: { isBanned: false, isSuspended: false, isActive: true },
    select: 'name email phone avatar address city location'
  });

  // Filter out any where populate returned null (i.e. banned/suspended users)
  const activeProviders = candidateProviders.filter(p => p.userId);

  const scoredProviders = [];

  for (const prov of activeProviders) {
    const provCoords = prov.currentLocation?.coordinates || prov.userId.location?.coordinates || [77.3910, 28.5355];
    const [provLng, provLat] = provCoords;

    const distanceKm = calculateDistance(custLat, custLng, provLat, provLng);

    // Hard constraint: provider must be within their configured service radius
    if (distanceKm > prov.serviceRadiusKm) {
      continue;
    }

    // A. Distance score (max 40 pts): closer = higher
    const maxRadius = Math.max(prov.serviceRadiusKm, 25);
    const distanceScore = Math.max(0, 40 * (1 - (distanceKm / maxRadius)));

    // B. Trust score (max 25 pts)
    const trustScore = Math.min(25, (prov.trustScore / 100) * 25);

    // C. Rating score (max 20 pts)
    const ratingScore = Math.min(20, (prov.ratingAverage / 5) * 20);

    // D. Experience score (max 10 pts)
    const experienceScore = Math.min(10, prov.experienceYears * 1.5);

    // E. Response & acceptance score (max 5 pts)
    const responseScore = Math.min(5, (prov.acceptanceRate / 100) * 5);

    const totalMatchScore = Number(
      (distanceScore + trustScore + ratingScore + experienceScore + responseScore).toFixed(1)
    );

    const etaMinutes = calculateEta(distanceKm);

    scoredProviders.push({
      providerId: prov.userId._id,
      providerProfileId: prov._id,
      name: prov.userId.name,
      avatar: prov.userId.avatar,
      phone: prov.userId.phone,
      rating: prov.ratingAverage,
      reviewCount: prov.ratingCount,
      trustScore: prov.trustScore,
      hasTrustBadge: prov.hasTrustBadge,
      experienceYears: prov.experienceYears,
      distanceKm,
      etaMinutes,
      hourlyRate: prov.hourlyRate,
      scoresBreakdown: {
        distanceScore: Number(distanceScore.toFixed(1)),
        trustScore: Number(trustScore.toFixed(1)),
        ratingScore: Number(ratingScore.toFixed(1)),
        experienceScore: Number(experienceScore.toFixed(1)),
        responseScore: Number(responseScore.toFixed(1))
      },
      matchScore: totalMatchScore
    });
  }

  // Sort descending by highest match score
  scoredProviders.sort((a, b) => b.matchScore - a.matchScore);

  return scoredProviders;
}

/**
 * Concurrency Safe Booking Acceptance via Redis Lock
 * Prevents multiple providers from claiming or accepting the same request simultaneously
 */
async function lockAndAcceptRequest(serviceRequestId, providerUserId) {
  const lockKey = `request_${serviceRequestId}`;
  const lockToken = await redisClient.acquireLock(lockKey, 20);

  if (!lockToken) {
    throw new Error('This service request is currently being processed by another provider.');
  }

  try {
    const serviceRequest = await ServiceRequest.findById(serviceRequestId).populate('serviceId');
    if (!serviceRequest) {
      throw new Error('Service request not found.');
    }

    if (serviceRequest.status === 'accepted' || serviceRequest.status === 'cancelled') {
      throw new Error(`This request has already been ${serviceRequest.status}.`);
    }

    const providerProfile = await Provider.findOne({ userId: providerUserId });
    if (!providerProfile) {
      throw new Error('Service provider profile not found.');
    }

    if (providerProfile.kycStatus !== 'verified') {
      throw new Error('Provider must have verified KYC to accept service requests.');
    }

    // Update service request status
    serviceRequest.status = 'accepted';
    serviceRequest.matchedProviderId = providerUserId;
    await serviceRequest.save();

    // Mark provider as currently busy
    providerProfile.isAvailable = false;
    await providerProfile.save();

    // Generate unique booking number: SM-YEAR-RANDOM
    const bookingNumber = `SM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Calculate initial estimated price
    const basePrice = serviceRequest.serviceId?.basePrice || 299;
    const urgencyMultiplier = serviceRequest.urgency === 'emergency' ? 1.5 : serviceRequest.urgency === 'urgent' ? 1.25 : 1.0;
    const estimatedPrice = Math.round(basePrice * urgencyMultiplier);

    // Create the confirmed Booking record
    const booking = await Booking.create({
      bookingNumber,
      customerId: serviceRequest.customerId,
      providerId: providerUserId,
      serviceId: serviceRequest.serviceId?._id || serviceRequest.serviceId,
      serviceRequestId: serviceRequest._id,
      status: 'ACCEPTED',
      urgency: serviceRequest.urgency,
      problemDescription: serviceRequest.problemDescription,
      problemImages: serviceRequest.images,
      address: serviceRequest.address,
      city: serviceRequest.city,
      customerLocation: serviceRequest.location,
      providerLiveLocation: providerProfile.currentLocation,
      estimatedPrice,
      finalPrice: estimatedPrice,
      timeline: [
        { status: 'REQUESTED', note: 'Customer initiated service request' },
        { status: 'ACCEPTED', note: `Provider ${providerUserId} accepted service request` }
      ],
      acceptedAt: new Date()
    });

    return booking;
  } finally {
    await redisClient.releaseLock(lockKey, lockToken);
  }
}

module.exports = {
  findMatchingProviders,
  lockAndAcceptRequest
};
