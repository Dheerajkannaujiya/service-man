const Message = require('../models/Message');
const Booking = require('../models/Booking');

let ioInstance = null;
exports.setSocket = (io) => { ioInstance = io; };

/**
 * Get Messages for a Booking
 */
exports.getMessages = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Verify user is either the customer or the provider
    const userIdStr = req.user._id.toString();
    if (booking.customerId.toString() !== userIdStr && booking.providerId.toString() !== userIdStr) {
      return res.status(403).json({ success: false, message: 'Unauthorized chat access.' });
    }

    const messages = await Message.find({ bookingId })
      .populate('senderId', 'name avatar role')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      { bookingId, receiverId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    next(err);
  }
};

/**
 * Send a Message in Booking Room
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { content, attachmentUrl, attachmentType = 'none' } = req.body;

    if (!content && !attachmentUrl) {
      return res.status(400).json({ success: false, message: 'Message content or attachment required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const userIdStr = req.user._id.toString();
    const isCustomer = booking.customerId.toString() === userIdStr;
    const isProvider = booking.providerId.toString() === userIdStr;

    if (!isCustomer && !isProvider) {
      return res.status(403).json({ success: false, message: 'Unauthorized chat access.' });
    }

    const receiverId = isCustomer ? booking.providerId : booking.customerId;

    const message = await Message.create({
      bookingId,
      senderId: req.user._id,
      receiverId,
      content: content || 'Sent an attachment',
      attachmentUrl: attachmentUrl || '',
      attachmentType
    });

    const populated = await Message.findById(message._id).populate('senderId', 'name avatar role');

    // Emit over Socket.io
    if (ioInstance) {
      ioInstance.to(`booking_${bookingId}`).emit('chat:new_message', populated);
      ioInstance.to(`user_${receiverId}`).emit('chat:new_message', populated);
    }

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    next(err);
  }
};
