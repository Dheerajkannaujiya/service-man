const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, entityType, entityId = '', details = {}) => {
  try {
    const actorId = req.user?._id || null;
    const actorEmail = req.user?.email || 'unauthenticated';
    const actorRole = req.user?.role || 'guest';
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await AuditLog.create({
      actorId,
      actorEmail,
      actorRole,
      action,
      entityType,
      entityId: entityId ? entityId.toString() : '',
      details,
      ipAddress,
      userAgent
    });
  } catch (err) {
    console.warn('[AuditLog] Failed to record audit entry:', err.message);
  }
};

module.exports = { logAudit };
