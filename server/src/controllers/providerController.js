const Provider = require('../models/Provider');
const User = require('../models/User');
const Booking = require('../models/Booking');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const { lockAndAcceptRequest } = require('../services/matchingEngine');
const { sendNotification } = require('../services/notificationService');
const redisClient = require('../config/redis');

let ioInstance = null;
exports.setSocket = (io) => { ioInstance = io; };

/**
 * Get Provider Dashboard Profile & Metrics
 */
exports.getProviderProfile = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id }).populate('userId', 'name email phone avatar address city location isBanned isSuspended');
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    res.json({
      success: true,
      provider: {
        ...provider.toObject(),
        user: provider.userId
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle Online/Offline and Availability
 */
exports.toggleAvailability = async (req, res, next) => {
  try {
    const { isOnline, isAvailable } = req.body;
    const provider = await Provider.findOne({ userId: req.user._id });

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    if (provider.kycStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Cannot go online until your KYC documents are verified by an administrator.'
      });
    }

    if (isOnline !== undefined) provider.isOnline = isOnline;
    if (isAvailable !== undefined) provider.isAvailable = isAvailable;

    await provider.save();

    res.json({
      success: true,
      message: 'Availability updated.',
      isOnline: provider.isOnline,
      isAvailable: provider.isAvailable
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Provider Real-Time GPS Location
 */
exports.updateLiveLocation = async (req, res, next) => {
  try {
    const { coordinates } = req.body; // [lng, lat]
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: 'Coordinates [lng, lat] required.' });
    }

    const provider = await Provider.findOne({ userId: req.user._id });
    if (provider) {
      provider.currentLocation = {
        type: 'Point',
        coordinates
      };
      await provider.save();
    }

    // Cache in Redis
    await redisClient.setCoordinates(req.user._id.toString(), coordinates);

    // If there is an active booking, emit location update to customer
    const activeBooking = await Booking.findOne({
      providerId: req.user._id,
      status: { $in: ['PROVIDER_ON_THE_WAY', 'ARRIVED', 'SERVICE_STARTED'] }
    });

    if (activeBooking && ioInstance) {
      activeBooking.providerLiveLocation = {
        type: 'Point',
        coordinates
      };
      await activeBooking.save();

      ioInstance.to(`booking_${activeBooking._id}`).emit('booking:location_update', {
        bookingId: activeBooking._id,
        coordinates,
        timestamp: new Date()
      });
    }

    res.json({ success: true, coordinates });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Incoming Service Requests for Provider
 */
exports.getIncomingRequests = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider || provider.kycStatus !== 'verified') {
      return res.json({ success: true, requests: [] });
    }

    const requests = await ServiceRequest.find({
      category: { $in: provider.categories },
      status: 'matching',
      expiresAt: { $gt: new Date() }
    })
      .populate('customerId', 'name avatar phone')
      .populate('serviceId', 'name basePrice icon')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    next(err);
  }
};

/**
 * Accept Service Request (Concurrency-Safe via Redis Lock)
 */
exports.acceptServiceRequest = async (req, res, next) => {
  try {
    const { serviceRequestId } = req.params;

    const booking = await lockAndAcceptRequest(serviceRequestId, req.user._id);

    // Populate booking details for real-time notification
    const fullBooking = await Booking.findById(booking._id)
      .populate('providerId', 'name phone avatar')
      .populate('serviceId', 'name icon basePrice');

    // Notify customer in real time
    if (ioInstance) {
      ioInstance.to(`user_${booking.customerId}`).emit('booking:accepted', fullBooking);
      ioInstance.to(`booking_${booking._id}`).emit('booking:status_update', {
        bookingId: booking._id,
        status: 'ACCEPTED'
      });
    }

    sendNotification(booking.customerId, {
      title: 'Service Request Accepted!',
      message: `${req.user.name} has accepted your service request. You can now track their arrival.`,
      type: 'booking_accepted',
      data: { bookingId: booking._id }
    });

    res.json({
      success: true,
      message: 'Service request accepted successfully.',
      booking: fullBooking
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Get Active Booking for Provider
 */
exports.getActiveBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      providerId: req.user._id,
      status: {
        $in: [
          'ACCEPTED',
          'PROVIDER_ON_THE_WAY',
          'ARRIVED',
          'SERVICE_STARTED'
        ]
      }
    })
      .populate('customerId', 'name phone avatar address city')
      .populate('serviceId', 'name basePrice icon')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      hasActiveBooking: !!booking,
      booking
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Booking Lifecycle Status (Stepper)
 * ACCEPTED -> PROVIDER_ON_THE_WAY -> ARRIVED -> SERVICE_STARTED (with OTP) -> SERVICE_COMPLETED
 */
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { status, startOtp, finalPrice } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      providerId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // OTP verification required when transitioning to SERVICE_STARTED
    if (status === 'SERVICE_STARTED') {
      if (!startOtp || String(startOtp).trim() !== String(booking.startOtp).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid customer Start OTP. Please ask customer for their 4-digit verification code.'
        });
      }
      booking.startedAt = new Date();
    }

    if (status === 'SERVICE_COMPLETED') {
      booking.completedAt = new Date();
      if (finalPrice && Number(finalPrice) > 0) {
        booking.finalPrice = Number(finalPrice);
      }

      // Mark provider as available again
      await Provider.findOneAndUpdate(
        { userId: req.user._id },
        {
          isAvailable: true,
          $inc: { completedBookings: 1 }
        }
      );
    }

    booking.status = status;
    booking.timeline.push({
      status,
      timestamp: new Date(),
      note: `Status changed to ${status} by provider`
    });

    await booking.save();

    // Notify customer over Socket.io
    if (ioInstance) {
      ioInstance.to(`booking_${booking._id}`).emit('booking:status_update', {
        bookingId: booking._id,
        status,
        booking
      });
      ioInstance.to(`user_${booking.customerId}`).emit('booking:status_update', {
        bookingId: booking._id,
        status,
        booking
      });
    }

    sendNotification(booking.customerId, {
      title: `Booking Update: ${status.replace(/_/g, ' ')}`,
      message: `Your service professional is now: ${status.toLowerCase().replace(/_/g, ' ')}.`,
      type: status.toLowerCase(),
      data: { bookingId: booking._id }
    });

    res.json({
      success: true,
      message: `Booking status updated to ${status}.`,
      booking
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Provider Earnings and Financial Overview
 */
exports.getEarnings = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    const payments = await Payment.find({
      providerId: req.user._id,
      status: 'captured'
    }).sort({ createdAt: -1 }).limit(30);

    const completedBookings = await Booking.find({
      providerId: req.user._id,
      status: { $in: ['SERVICE_COMPLETED', 'CUSTOMER_REVIEWED', 'CLOSED'] }
    }).countDocuments();

    res.json({
      success: true,
      totalEarnings: provider?.totalEarnings || 0,
      pendingPayout: provider?.pendingPayout || 0,
      completedJobs: completedBookings,
      recentPayments: payments
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Provider Reviews and Trust Score Breakdown
 */
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      recipientId: req.user._id
    })
      .populate('authorId', 'name avatar')
      .populate('analysis')
      .sort({ createdAt: -1 });

    const provider = await Provider.findOne({ userId: req.user._id });

    res.json({
      success: true,
      count: reviews.length,
      ratingAverage: provider?.ratingAverage || 5,
      trustScore: provider?.trustScore || 75,
      hasTrustBadge: provider?.hasTrustBadge || false,
      reviews
    });
  } catch (err) {
    next(err);
  }
};
