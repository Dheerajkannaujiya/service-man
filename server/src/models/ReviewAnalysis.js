const mongoose = require('mongoose');

const reviewAnalysisSchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true,
    unique: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentimentScore: {
    type: Number, // -1.0 to 1.0
    required: true
  },
  sentimentLabel: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    required: true
  },
  abusiveLanguageDetected: {
    type: Boolean,
    default: false
  },
  abusiveKeywords: [String],
  suspiciousPatternDetected: {
    type: Boolean,
    default: false
  },
  fraudScore: {
    type: Number, // 0 to 100
    default: 0
  },
  fraudReasons: [String],
  repeatedTextPattern: {
    type: Boolean,
    default: false
  },
  qualityScore: {
    type: Number, // 0 to 100
    default: 85
  },
  trustScoreDelta: {
    type: Number,
    default: 0
  },
  adminReviewed: {
    type: Boolean,
    default: false
  },
  adminAction: {
    type: String,
    enum: ['none', 'cleared', 'flagged', 'penalty_triggered'],
    default: 'none'
  }
}, {
  timestamps: true
});

reviewAnalysisSchema.index({ providerId: 1, fraudScore: -1 });

module.exports = mongoose.model('ReviewAnalysis', reviewAnalysisSchema);
