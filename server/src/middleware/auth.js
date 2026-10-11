const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: `Account is permanently banned: ${user.bannedReason || 'Violation of terms'}. Login is restricted.`,
        isBanned: true
      });
    }

    if (user.isSuspended) {
      if (user.suspendedUntil && new Date() > new Date(user.suspendedUntil)) {
        // Suspension has lapsed
        user.isSuspended = false;
        user.suspendedUntil = null;
        await user.save();
      } else {
        return res.status(403).json({
          success: false,
          message: `Account is temporarily suspended until ${user.suspendedUntil ? new Date(user.suspendedUntil).toLocaleDateString() : 'admin review'}.`,
          isSuspended: true
        });
      }
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

module.exports = { protect };
