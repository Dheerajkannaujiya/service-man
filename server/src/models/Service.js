const mongoose = require('mongoose');

const subServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  durationMinutes: { type: Number, default: 60 }
});

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Mechanic',
      'Electrician',
      'Homemaker',
      'Doctor',
      'Caretaker',
      'Tutor',
      'Plumber',
      'Painter',
      'Appliance Repair',
      'Carpenter'
    ]
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'Wrench'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerHour: {
    type: Number,
    default: 250
  },
  estimatedDurationMinutes: {
    type: Number,
    default: 60
  },
  subServices: [subServiceSchema],
  popular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
