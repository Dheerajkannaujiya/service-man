const Review = require('../models/Review');
const ReviewAnalysis = require('../models/ReviewAnalysis');
const Provider = require('../models/Provider');
const ProviderTrustScore = require('../models/ProviderTrustScore');
const { updateProviderTrustScoreAndBadge } = require('./trustService');

// Lexicon for positive sentiment words
const POSITIVE_WORDS = new Set([
  'great', 'excellent', 'amazing', 'punctual', 'professional', 'polite', 'clean', 'fast',
  'superb', 'best', 'honest', 'expert', 'reliable', 'friendly', 'skilled', 'recommend',
  'perfect', 'satisfied', 'neat', 'flawless', 'efficient', 'helpful', 'prompt', 'thorough',
  'courteous', 'knowledgeable', 'quick', 'reasonable', 'affordable', 'top'
]);

// Lexicon for negative sentiment words
const NEGATIVE_WORDS = new Set([
  'terrible', 'horrible', 'worst', 'late', 'rude', 'unprofessional', 'lazy', 'dirty',
  'scam', 'fraud', 'cheated', 'overcharged', 'damaged', 'broken', 'careless', 'shoddy',
  'arrogant', 'incompetent', 'slow', 'waste', 'disaster', 'useless', 'abusive', 'awful',
  'liar', 'robbery', 'ridiculous', 'poor', 'bad', 'mess'
]);

// Curated list of abusive / harassing terms
const ABUSIVE_WORDS = [
  'scamster', 'fraudster', 'bastard', 'bitch', 'idiot', 'moron', 'thief', 'asshole',
  'cheat', 'harass', 'stupid', 'abuse', 'slap', 'threat', 'kill', 'fucking'
];

// Spam / Bot triggers
const SPAM_TRIGGERS = [
  'whatsapp', 'telegram', 'click here', 'crypto', 'loan', 'earn money', 'call now at',
  'promo code', 'discount code', 'free gift', 'visit website'
];

/**
 * Perform Natural Language Processing & Fraud Analysis on a written review
 */
async function analyzeReview(review) {
  const text = (review.comment || '').toLowerCase();
  const words = text.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);

  let positiveHits = 0;
  let negativeHits = 0;

  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) positiveHits++;
    if (NEGATIVE_WORDS.has(w)) negativeHits++;
  }

  // Sentiment calculation: range -1.0 to +1.0
  const totalSentimentHits = positiveHits + negativeHits;
  let sentimentScore = 0;
  if (totalSentimentHits > 0) {
    sentimentScore = Number(((positiveHits - negativeHits) / totalSentimentHits).toFixed(2));
  } else {
    // Rely partially on star rating if text is neutral
    sentimentScore = Number(((review.rating - 3) / 2).toFixed(2));
  }

  let sentimentLabel = 'neutral';
  if (sentimentScore >= 0.25) sentimentLabel = 'positive';
  else if (sentimentScore <= -0.25) sentimentLabel = 'negative';

  // Abusive language detection
  const detectedAbuse = [];
  for (const abusive of ABUSIVE_WORDS) {
    if (text.includes(abusive)) {
      detectedAbuse.push(abusive);
    }
  }
  const abusiveLanguageDetected = detectedAbuse.length > 0;

  // Fraud / Fake Review Pattern Analysis
  let fraudScore = 0;
  const fraudReasons = [];
  let repeatedTextPattern = false;

  // 1. Check for spam/bot marketing words
  for (const spam of SPAM_TRIGGERS) {
    if (text.includes(spam)) {
      fraudScore += 40;
      fraudReasons.push(`Spam phrase detected: "${spam}"`);
    }
  }

  // 2. Check for extreme divergence between star rating and text sentiment
  // Example: 5-star rating with intensely negative words or 1-star with all glowing words
  if (review.rating === 5 && sentimentScore < -0.4) {
    fraudScore += 35;
    fraudReasons.push('Rating divergence: 5 stars given but sentiment is strongly negative');
  } else if (review.rating === 1 && sentimentScore > 0.6) {
    fraudScore += 35;
    fraudReasons.push('Rating divergence: 1 star given but sentiment is glowing/positive');
  }

  // 3. Repeated review pattern: query existing reviews for identical sentence snippets
  const identicalSnippetCount = await Review.countDocuments({
    _id: { $ne: review._id },
    comment: review.comment
  });

  if (identicalSnippetCount > 0) {
    repeatedTextPattern = true;
    fraudScore += 50;
    fraudReasons.push('Identical review comment found across multiple bookings (possible bot/copy-paste)');
  }

  // 4. Repeated rapid submissions from same author
  const recentAuthorReviews = await Review.countDocuments({
    authorId: review.authorId,
    createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // past 10 mins
  });
  if (recentAuthorReviews >= 4) {
    fraudScore += 25;
    fraudReasons.push('Velocity alert: Multiple reviews posted within 10 minutes');
  }

  fraudScore = Math.min(100, Math.max(0, fraudScore));
  const suspiciousPatternDetected = fraudScore >= 40 || abusiveLanguageDetected;

  // Review Quality Score (0-100)
  const lengthScore = Math.min(40, words.length * 2);
  const detailScore = words.length > 8 ? 40 : 20;
  const penalty = fraudScore * 0.5;
  const qualityScore = Math.max(10, Math.min(100, Math.round(lengthScore + detailScore - penalty)));

  // Calculate Trust Score Delta for the provider
  let trustScoreDelta = 0;
  if (!suspiciousPatternDetected) {
    if (review.rating === 5 && sentimentLabel === 'positive') trustScoreDelta = 2;
    else if (review.rating >= 4) trustScoreDelta = 1;
    else if (review.rating === 3) trustScoreDelta = 0;
    else if (review.rating === 2) trustScoreDelta = -2;
    else if (review.rating === 1) trustScoreDelta = -4;
  } else {
    // If fraud or abusive words detected
    trustScoreDelta = abusiveLanguageDetected ? -6 : -3;
  }

  // Create ReviewAnalysis document
  const analysis = await ReviewAnalysis.create({
    reviewId: review._id,
    providerId: review.recipientId,
    sentimentScore,
    sentimentLabel,
    abusiveLanguageDetected,
    abusiveKeywords: detectedAbuse,
    suspiciousPatternDetected,
    fraudScore,
    fraudReasons,
    repeatedTextPattern,
    qualityScore,
    trustScoreDelta,
    adminAction: suspiciousPatternDetected ? 'flagged' : 'none'
  });

  // Link analysis to review
  review.analysis = analysis._id;
  review.isFlagged = suspiciousPatternDetected;
  await review.save();

  // If review is for a provider, trigger real-time trust score recalculation
  if (review.authorRole === 'customer') {
    await updateProviderTrustScoreAndBadge(review.recipientId, trustScoreDelta, `Review from booking ${review.bookingId}`);
  }

  return analysis;
}

module.exports = {
  analyzeReview
};
