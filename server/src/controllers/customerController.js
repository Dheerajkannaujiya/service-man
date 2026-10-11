const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Customer = require('../models/Customer');
const { findMatchingProviders } = require('../services/matchingEngine');
const { sendNotification } = require('../services/notificationService');

let ioInstance = null;
exports.setSocket = (io) => { ioInstance = io; };

/**
 * Get all available active services
 */
exports.getServices = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const services = await Service.find(query).sort({ popular: -1, name: 1 });
    res.json({ success: true, count: services.length, services });
  } catch (err) {
    next(err);
  }
};

/**
 * Get nearby verified providers for map/browse preview
 */
exports.getNearbyProviders = async (req, res, next) => {
  try {
    const { category, lat, lng } = req.query;
    const customerLat = Number(lat) || 28.5355;
    const customerLng = Number(lng) || 77.3910;

    const query = {
      kycStatus: 'verified',
      isOnline: true,
      isAvailable: true
    };
    if (category) query.categories = category;

    const providers = await Provider.find(query)
      .populate({
        path: 'userId',
        match: { isBanned: false, isSuspended: false },
        select: 'name avatar phone city location'
      })
      .limit(20);

    const activeProviders = providers.filter(p => p.userId);

    res.json({
      success: true,
      count: activeProviders.length,
      providers: activeProviders.map(p => ({
        id: p.userId._id,
        name: p.userId.name,
        avatar: p.userId.avatar,
        categories: p.categories,
        rating: p.ratingAverage,
        reviewCount: p.ratingCount,
        trustScore: p.trustScore,
        hasTrustBadge: p.hasTrustBadge,
        hourlyRate: p.hourlyRate,
        location: p.currentLocation
      }))
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new service request & trigger AI matching engine
 */
exports.createServiceRequest = async (req, res, next) => {
  try {
    const {
      serviceId,
      specificSubService,
      problemDescription,
      address,
      city = 'Noida',
      coordinates,
      urgency = 'standard',
      preferredDateTime,
      images = []
    } = req.body;

    if (!serviceId || !problemDescription || !address) {
      return res.status(400).json({
        success: false,
        message: 'Service ID, problem description, and address are required.'
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Selected service does not exist.' });
    }

    const resolvedCoords = coordinates && Array.isArray(coordinates) && coordinates.length === 2
      ? coordinates
      : [77.3910, 28.5355];

    // Create Service Request record
    const serviceRequest = await ServiceRequest.create({
      customerId: req.user._id,
      serviceId,
      category: service.category,
      specificSubService: specificSubService || service.name,
      problemDescription,
      images,
      location: {
        type: 'Point',
        coordinates: resolvedCoords
      },
      address,
      city,
      urgency,
      preferredDateTime: preferredDateTime || new Date(),
      status: 'matching'
    });

    // Run AI Matching Engine
    const matchedProviders = await findMatchingProviders(serviceRequest);

    // Save candidates in request
    serviceRequest.candidateProviders = matchedProviders.map(mp => ({
      providerId: mp.providerId,
      matchScore: mp.matchScore,
      response: 'pending'
    }));
    await serviceRequest.save();

    // Notify top candidate providers in real time via Socket.io
    if (ioInstance && matchedProviders.length > 0) {
      matchedProviders.slice(0, 5).forEach(p => {
        ioInstance.to(`user_${p.providerId}`).emit('booking:dispatch', {
          serviceRequestId: serviceRequest._id,
          category: serviceRequest.category,
          subService: serviceRequest.specificSubService,
          problemDescription: serviceRequest.problemDescription,
          urgency: serviceRequest.urgency,
          address: serviceRequest.address,
          city: serviceRequest.city,
          distanceKm: p.distanceKm,
          etaMinutes: p.etaMinutes,
          matchScore: p.matchScore,
          expiresInSeconds: 60
        });

        sendNotification(p.providerId, {
          title: `New ${serviceRequest.urgency.toUpperCase()} Service Request`,
          message: `New job available for ${serviceRequest.category} in ${serviceRequest.city}. Match Score: ${p.matchScore}%`,
          type: 'booking_request',
          data: { serviceRequestId: serviceRequest._id }
        });
      });
    }

    res.status(201).json({
      success: true,
      message: 'Service request created. AI matching engine has notified suitable providers.',
      serviceRequest,
      matchedCount: matchedProviders.length,
      topMatches: matchedProviders.slice(0, 3)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get active booking for customer
 */
exports.getActiveBooking = async (req, res, next) => {
  try {
    const activeBooking = await Booking.findOne({
      customerId: req.user._id,
      status: {
        $in: [
          'REQUESTED',
          'MATCHING',
          'PROVIDER_NOTIFIED',
          'ACCEPTED',
          'PROVIDER_ON_THE_WAY',
          'ARRIVED',
          'SERVICE_STARTED',
          'SERVICE_COMPLETED'
        ]
      }
    })
      .populate('providerId', 'name phone avatar city location')
      .populate('serviceId', 'name category icon basePrice')
      .sort({ createdAt: -1 });

    if (!activeBooking) {
      return res.json({ success: true, hasActiveBooking: false, booking: null });
    }

    // Fetch provider profile for rating/badge
    const providerProfile = await Provider.findOne({ userId: activeBooking.providerId?._id });

    res.json({
      success: true,
      hasActiveBooking: true,
      booking: {
        ...activeBooking.toObject(),
        providerProfile: providerProfile ? {
          rating: providerProfile.ratingAverage,
          trustScore: providerProfile.trustScore,
          hasTrustBadge: providerProfile.hasTrustBadge,
          hourlyRate: providerProfile.hourlyRate
        } : null
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get booking history for customer
 */
exports.getBookingHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ customerId: req.user._id })
      .populate('providerId', 'name phone avatar')
      .populate('serviceId', 'name category icon')
      .populate('customerReview')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments({ customerId: req.user._id });

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      bookings
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel a booking
 */
exports.cancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { reason = 'Cancelled by user' } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (['SERVICE_STARTED', 'SERVICE_COMPLETED', 'CLOSED'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a booking that has already started or completed.'
      });
    }

    booking.status = 'CANCELLED_BY_CUSTOMER';
    booking.cancellationReason = reason;
    booking.cancelledBy = req.user._id;
    booking.cancelledAt = new Date();
    booking.timeline.push({ status: 'CANCELLED_BY_CUSTOMER', note: reason });
    await booking.save();

    // Release provider availability
    if (booking.providerId) {
      await Provider.findOneAndUpdate(
        { userId: booking.providerId },
        { isAvailable: true }
      );

      sendNotification(booking.providerId, {
        title: 'Booking Cancelled',
        message: `Booking #${booking.bookingNumber} was cancelled by the customer.`,
        type: 'booking_cancelled',
        data: { bookingId: booking._id }
      });

      if (ioInstance) {
        ioInstance.to(`booking_${booking._id}`).emit('booking:status_update', {
          bookingId: booking._id,
          status: 'CANCELLED_BY_CUSTOMER'
        });
      }
    }

    res.json({ success: true, message: 'Booking cancelled successfully.', booking });
  } catch (err) {
    next(err);
  }
};
