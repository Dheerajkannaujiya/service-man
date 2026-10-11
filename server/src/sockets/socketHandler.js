const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { setSocketInstance } = require('../services/notificationService');
const customerController = require('../controllers/customerController');
const providerController = require('../controllers/providerController');
const chatController = require('../controllers/chatController');

function initSocket(io) {
  // Share io instance with services and controllers
  setSocketInstance(io);
  customerController.setSocket(io);
  providerController.setSocket(io);
  chatController.setSocket(io);

  // Authenticate socket connections using JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      const decoded = jwt.verify(cleanToken, config.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`[Socket Connected] User ${user.name} (${user.role}) connected: ${socket.id}`);

    // Join personal user room
    socket.join(`user_${user._id}`);

    // If admin, join admin telemetry feed
    if (user.role === 'admin') {
      socket.join('admin_feed');
    }

    // Join active booking room
    socket.on('booking:join', ({ bookingId }) => {
      if (bookingId) {
        socket.join(`booking_${bookingId}`);
        console.log(`[Socket Room] User ${user.name} joined room booking_${bookingId}`);
      }
    });

    socket.on('booking:leave', ({ bookingId }) => {
      if (bookingId) {
        socket.leave(`booking_${bookingId}`);
      }
    });

    // Provider live location broadcast
    socket.on('provider:location', async ({ bookingId, coordinates }) => {
      if (bookingId && coordinates && user.role === 'provider') {
        io.to(`booking_${bookingId}`).emit('booking:location_update', {
          bookingId,
          coordinates, // [lng, lat]
          timestamp: new Date()
        });

        // Update booking document
        await Booking.findByIdAndUpdate(bookingId, {
          providerLiveLocation: { type: 'Point', coordinates }
        });
      }
    });

    // Typing indicators for chat
    socket.on('chat:typing', ({ bookingId, isTyping }) => {
      socket.to(`booking_${bookingId}`).emit('chat:user_typing', {
        userId: user._id,
        userName: user.name,
        isTyping
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected] User ${user.name} disconnected`);
    });
  });
}

module.exports = initSocket;
