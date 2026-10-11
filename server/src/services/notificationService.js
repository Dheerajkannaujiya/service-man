const Notification = require('../models/Notification');

let ioInstance = null;

function setSocketInstance(io) {
  ioInstance = io;
}

/**
 * Send real-time notification to a specific user
 */
async function sendNotification(userId, { title, message, type = 'system', data = {} }) {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      data
    });

    if (ioInstance) {
      ioInstance.to(`user_${userId}`).emit('notification:new', notification);
    }

    return notification;
  } catch (error) {
    console.error('[Notification Error]', error.message);
    return null;
  }
}

/**
 * Broadcast notification to all users in a specific role or room
 */
async function broadcastNotification(room, { title, message, type = 'system', data = {} }) {
  if (ioInstance) {
    ioInstance.to(room).emit('notification:broadcast', { title, message, type, data, createdAt: new Date() });
  }
}

module.exports = {
  setSocketInstance,
  sendNotification,
  broadcastNotification
};
