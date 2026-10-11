const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getMyNotifications);
router.put('/:notificationId/read', markAsRead);
router.put('/read-all', markAllAsRead);

module.exports = router;
