const User = require('../models/User');
const Provider = require('../models/Provider');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const KycDocument = require('../models/KycDocument');
const Complaint = require('../models/Complaint');
const Warning = require('../models/Warning');
const Suspension = require('../models/Suspension');
const Ban = require('../models/Ban');
const Review = require('../models/Review');
const ReviewAnalysis = require('../models/ReviewAnalysis');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const { processPenaltyEscalation } = require('../services/trustService');
const { logAudit } = require('../middleware/auditLogger');

/**
 * Get Executive Dashboard KPI Statistics
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalProviders,
      pendingKyc,
      verifiedProviders,
      activeBookings,
      completedBookings,
      cancelledBookings,
      suspendedProviders,
      bannedProviders,
      totalRevenueData,
      complaintsCount
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'provider' }),
      Provider.countDocuments({ kycStatus: 'pending' }),
      Provider.countDocuments({ kycStatus: 'verified' }),
      Booking.countDocuments({
        status: {
          $in: [
            'REQUESTED',
            'MATCHING',
            'PROVIDER_NOTIFIED',
            'ACCEPTED',
            'PROVIDER_ON_THE_WAY',
            'ARRIVED',
            'SERVICE_STARTED'
          ]
        }
      }),
      Booking.countDocuments({
        status: { $in: ['SERVICE_COMPLETED', 'CUSTOMER_REVIEWED', 'CLOSED'] }
      }),
      Booking.countDocuments({
        status: { $in: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_PROVIDER', 'REJECTED', 'EXPIRED'] }
      }),
      User.countDocuments({ role: 'provider', isSuspended: true }),
      User.countDocuments({ role: 'provider', isBanned: true }),
      Payment.aggregate([
        { $match: { status: 'captured' } },
        { $group: { _id: null, total: { $sum: '$amount' }, platformRevenue: { $sum: '$platformFee' } } }
      ]),
      Complaint.countDocuments({ status: 'open' })
    ]);

    const revenue = totalRevenueData[0] || { total: 0, platformRevenue: 0 };

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalProviders,
        pendingKyc,
        verifiedProviders,
        activeBookings,
        completedBookings,
        cancelledBookings,
        suspendedProviders,
        bannedProviders,
        openComplaints: complaintsCount,
        totalGrossVolume: revenue.total,
        platformRevenue: revenue.platformRevenue
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Providers with Filters & Search
 */
exports.getAllProviders = async (req, res, next) => {
  try {
    const { category, city, kycStatus, isSuspended, isBanned, search } = req.query;

    const userQuery = { role: 'provider' };
    if (city) userQuery.city = city;
    if (isSuspended !== undefined) userQuery.isSuspended = isSuspended === 'true';
    if (isBanned !== undefined) userQuery.isBanned = isBanned === 'true';
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const matchedUsers = await User.find(userQuery).select('-passwordHash');
    const userIds = matchedUsers.map(u => u._id);

    const providerQuery = { userId: { $in: userIds } };
    if (category) providerQuery.categories = category;
    if (kycStatus) providerQuery.kycStatus = kycStatus;

    const providers = await Provider.find(providerQuery).populate('userId', '-passwordHash');

    res.json({
      success: true,
      count: providers.length,
      providers
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Customers with Search
 */
exports.getAllCustomers = async (req, res, next) => {
  try {
    const { search, city } = req.query;
    const query = { role: 'customer' };
    if (city) query.city = city;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, customers });
  } catch (err) {
    next(err);
  }
};

/**
 * Get All Bookings with Filter
 */
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, city } = req.query;
    const query = {};
    if (status) query.status = status;
    if (city) query.city = city;

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email phone avatar')
      .populate('providerId', 'name email phone avatar')
      .populate('serviceId', 'name category icon')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Complaints & Disputes
 */
exports.getAllComplaints = async (req, res, next) => {
  try {
    const { status, severity } = req.query;
    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const complaints = await Complaint.find(query)
      .populate('complainantId', 'name email phone role')
      .populate('respondentId', 'name email phone role')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    next(err);
  }
};

/**
 * Resolve Complaint with Penalty Escalation
 */
exports.resolveComplaint = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { actionTaken, adminNotes, severity = 'high' } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    complaint.status = actionTaken === 'dismissed' ? 'dismissed' : 'resolved';
    complaint.actionTaken = actionTaken;
    complaint.adminNotes = adminNotes || '';
    complaint.resolvedBy = req.user._id;
    complaint.resolvedAt = new Date();
    await complaint.save();

    let penaltyResult = null;
    if (['warning_issued', 'suspended', 'permanently_banned'].includes(actionTaken)) {
      penaltyResult = await processPenaltyEscalation(
        complaint.respondentId,
        complaint._id,
        req.user._id,
        adminNotes || `Action taken on complaint: ${complaint.category}`,
        severity
      );
    }

    await logAudit(req, 'COMPLAINT_RESOLVED', 'Complaint', complaint._id, {
      actionTaken,
      respondentId: complaint.respondentId,
      penaltyResult
    });

    res.json({
      success: true,
      message: `Complaint resolved with action: ${actionTaken}.`,
      complaint,
      penaltyResult
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get All Warnings, Suspensions, and Permanent Bans
 */
exports.getPenaltiesSummary = async (req, res, next) => {
  try {
    const [warnings, suspensions, bans] = await Promise.all([
      Warning.find().populate('providerId', 'name email phone').populate('issuedBy', 'name').sort({ issuedAt: -1 }),
      Suspension.find().populate('providerId', 'name email phone').populate('issuedBy', 'name').sort({ startDate: -1 }),
      Ban.find().populate('providerId', 'name email phone').populate('bannedBy', 'name').sort({ bannedAt: -1 })
    ]);

    res.json({
      success: true,
      warnings,
      suspensions,
      bans
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get AI Review Analyzer Feed
 */
exports.getAiReviewFeed = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('authorId', 'name email avatar role')
      .populate('recipientId', 'name email avatar role')
      .populate('analysis')
      .sort({ createdAt: -1 })
      .limit(50);

    const flaggedCount = await Review.countDocuments({ isFlagged: true });

    res.json({
      success: true,
      flaggedCount,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Rich Analytics Dashboard Data
 */
exports.getAnalytics = async (req, res, next) => {
  try {
    // 1. Bookings by Category
    const bookingsByCategory = await Booking.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $unwind: '$service' },
      {
        $group: {
          _id: '$service.category',
          count: { $sum: 1 },
          revenue: { $sum: '$finalPrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 2. Users and Providers by City
    const usersByCity = await User.aggregate([
      {
        $group: {
          _id: '$city',
          customers: {
            $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] }
          },
          providers: {
            $sum: { $cond: [{ $eq: ['$role', 'provider'] }, 1, 0] }
          }
        }
      }
    ]);

    // 3. Trust Score Distribution
    const trustDistribution = await Provider.aggregate([
      {
        $bucket: {
          groupBy: '$trustScore',
          boundaries: [0, 50, 70, 85, 101],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgRating: { $avg: '$ratingAverage' }
          }
        }
      }
    ]);

    // 4. Monthly Bookings Growth Trend
    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalBookings: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $in: ['$status', ['SERVICE_COMPLETED', 'CUSTOMER_REVIEWED', 'CLOSED']] }, 1, 0]
            }
          },
          revenue: { $sum: '$finalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        bookingsByCategory,
        usersByCity,
        trustDistribution,
        monthlyBookings
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get System Audit Logs
 */
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityType } = req.query;
    const query = {};
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(100);

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
};
