const express = require('express');
const router = express.Router();
const {
  getServices,
  getNearbyProviders,
  createServiceRequest,
  getActiveBooking,
  getBookingHistory,
  getBookingById,
  cancelBooking
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Public browse routes
router.get('/services', getServices);
router.get('/nearby-providers', getNearbyProviders);

// Customer protected routes
router.use(protect);
router.use(authorize('customer', 'admin'));

router.post('/request-service', createServiceRequest);
router.get('/active-booking', getActiveBooking);
router.get('/bookings', getBookingHistory);
router.get('/bookings/:bookingId', getBookingById);
router.put('/bookings/:bookingId/cancel', cancelBooking);

module.exports = router;
