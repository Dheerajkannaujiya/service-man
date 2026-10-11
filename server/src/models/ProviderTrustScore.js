const mongoose = require('mongoose');

const providerTrustScoreSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentScore: {
    type: Number,
    required: true,
    default: 75,
    min: 0,
    max: 100
  },
  factors: {
    kycScore: { type: Number, default: 25 }, // max 25
    ratingScore: { type: Number, default: 35 }, // max 40
    completionScore: { type: Number, default: 20 }, // max 20
    sentimentBonus: { type: Number, default: 5 }, // max 10
    cancellationPenalty: { type: Number, default: 0 },
    complaintPenalty: { type: Number, default: 0 },
    fraudPenalty: { type: Number, default: 0 }
  },
  hasTrustBadge: {
    type: Boolean,
    default: false
  },
  badgeGrantedAt: Date,
  history: [{
    score: Number,
    reason: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('ProviderTrustScore', providerTrustScoreSchema);
