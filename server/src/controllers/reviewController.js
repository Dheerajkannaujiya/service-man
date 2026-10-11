const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Customer = require('../models/Customer');
const { analyzeReview } = require('../services/aiReviewAnalyzer');
const { sendNotification } = require('../services/notificationService');

/**
 * Submit Rating and Written Review for a Booking
 */
exports.submitReview = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating (1-5) and feedback comment are required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (!['SERVICE_COMPLETED', 'CUSTOMER_REVIEWED', 'CLOSED'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted after the service has been completed.'
      });
    }

    const userIdStr = req.user._id.toString();
    const isCustomer = booking.customerId.toString() === userIdStr;
    const isProvider = booking.providerId.toString() === userIdStr;

    if (!isCustomer && !isProvider) {
      return res.status(403).json({ success: false, message: 'Only participants in this booking can leave a review.' });
    }

    const recipientId = isCustomer ? booking.providerId : booking.customerId;
    const authorRole = isCustomer ? 'customer' : 'provider';

    // Prevent duplicate reviews
    const existing = await Review.findOne({ bookingId, authorId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this booking.' });
    }

    const review = await Review.create({
      bookingId,
      authorId: req.user._id,
      recipientId,
      authorRole,
      rating: Number(rating),
      comment
    });

    // Run AI / NLP Review Analyzer
    const analysis = await analyzeReview(review);

    // Update recipient ratings
    if (isCustomer) {
      // Customer reviewed Provider
      booking.customerReview = review._id;
      booking.status = 'CUSTOMER_REVIEWED';
      await booking.save();

      // Recalculate provider average rating
      const allReviews = await Review.find({ recipientId, authorRole: 'customer' });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Provider.findOneAndUpdate(
        { userId: recipientId },
        {
          ratingAverage: Number(avg.toFixed(1)),
          ratingCount: allReviews.length
        }
      );

      sendNotification(recipientId, {
        title: 'New Review Received',
        message: `A customer has rated you ${rating} stars: "${comment.substring(0, 60)}..."`,
        type: 'review_submitted',
        data: { reviewId: review._id, bookingId }
      });
    } else {
      // Provider reviewed Customer
      booking.providerReview = review._id;
      await booking.save();

      const allCustReviews = await Review.find({ recipientId, authorRole: 'provider' });
      const avg = allCustReviews.reduce((sum, r) => sum + r.rating, 0) / allCustReviews.length;
      await Customer.findOneAndUpdate(
        { userId: recipientId },
        {
          ratingAverage: Number(avg.toFixed(1)),
          ratingCount: allCustReviews.length
        }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted and evaluated by AI Analyzer.',
      review,
      analysis
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Reviews for a User
 */
exports.getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ recipientId: userId })
      .populate('authorId', 'name avatar role')
      .populate('analysis')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
};
