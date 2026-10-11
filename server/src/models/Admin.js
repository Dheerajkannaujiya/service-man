const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  department: {
    type: String,
    default: 'SuperAdmin'
  },
  permissions: {
    type: [String],
    default: ['manage_users', 'verify_kyc', 'manage_providers', 'resolve_complaints', 'manage_bans', 'view_analytics']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Admin', adminSchema);
