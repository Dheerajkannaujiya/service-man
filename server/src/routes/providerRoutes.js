const express = require('express');
const router = express.Router();
const {
  getProviderProfile,
  toggleAvailability,
  updateLiveLocation,
  getIncomingRequests,
  acceptServiceRequest,
  getActiveBooking,
  updateBookingStatus,
  getEarnings,
  getReviews
} = require('../controllers/providerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);
router.use(authorize('provider', 'admin'));

router.get('/profile', getProviderProfile);
router.put('/availability', toggleAvailability);
router.put('/location', updateLiveLocation);
router.get('/requests', getIncomingRequests);
router.post('/requests/:serviceRequestId/accept', acceptServiceRequest);
router.get('/active-booking', getActiveBooking);
router.put('/bookings/:bookingId/status', updateBookingStatus);
router.get('/earnings', getEarnings);
router.get('/reviews', getReviews);

module.exports = router;
