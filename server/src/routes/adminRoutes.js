const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllProviders,
  getAllCustomers,
  getAllBookings,
  getAllComplaints,
  resolveComplaint,
  getPenaltiesSummary,
  getAiReviewFeed,
  getAnalytics,
  getAuditLogs
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/providers', getAllProviders);
router.get('/customers', getAllCustomers);
router.get('/bookings', getAllBookings);
router.get('/complaints', getAllComplaints);
router.put('/complaints/:complaintId/resolve', resolveComplaint);
router.get('/penalties', getPenaltiesSummary);
router.get('/reviews-ai', getAiReviewFeed);
router.get('/analytics', getAnalytics);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
