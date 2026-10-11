const express = require('express');
const router = express.Router();
const { submitReview, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/user/:userId', getUserReviews);
router.post('/booking/:bookingId', protect, submitReview);

module.exports = router;
