const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' }
  },
  savedAddresses: [{
    label: { type: String, default: 'Home' },
    address: { type: String, required: true },
    city: { type: String, default: 'Noida' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number]
    }
  }],
  totalBookings: {
    type: Number,
    default: 0
  },
  ratingAverage: {
    type: Number,
    default: 5.0
  },
  ratingCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
