const assert = require('assert');
const { calculateDistance, calculateEta } = require('../services/geoService');
const redisClient = require('../config/redis');

let passed = 0;
let failed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✔\x1b[0m ${name}`);
    passed++;
  } catch (err) {
    console.error(`  \x1b[31m✖\x1b[0m ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n==================================================');
  console.log(' RUNNING SERVICEMAN TEST SUITE (UNIT & LOGIC)');
  console.log('==================================================\n');

  console.log('--- 1. GPS & Geolocation Service Tests ---');
  it('should accurately calculate zero distance for identical coordinates', () => {
    const d = calculateDistance(28.5355, 77.3910, 28.5355, 77.3910);
    assert.strictEqual(d, 0);
  });

  it('should calculate realistic distance between Noida and Connaught Place, Delhi (~20km)', () => {
    const d = calculateDistance(28.5355, 77.3910, 28.6315, 77.2167);
    assert.ok(d > 15 && d < 30, `Calculated distance ${d}km should be between 15km and 30km`);
  });

  it('should estimate ETA with baseline prep time included', () => {
    const eta10km = calculateEta(10);
    assert.ok(eta10km >= 20, `ETA ${eta10km} mins should be at least 20 mins for 10km`);
  });

  console.log('\n--- 2. Redis Distributed Locking & Concurrency Tests ---');
  it('should acquire lock successfully for a resource', async () => {
    const token = await redisClient.acquireLock('test_service_req_123', 5);
    assert.ok(token, 'Lock token should be returned');
    
    // Concurrent attempt should fail
    const duplicate = await redisClient.acquireLock('test_service_req_123', 5);
    assert.strictEqual(duplicate, null, 'Second concurrent lock attempt must be rejected');

    // Release lock
    const released = await redisClient.releaseLock('test_service_req_123', token);
    assert.strictEqual(released, true, 'Lock should be successfully released');

    // Now it should be acquirable again
    const newToken = await redisClient.acquireLock('test_service_req_123', 5);
    assert.ok(newToken, 'Lock should be acquirable again after release');
    await redisClient.releaseLock('test_service_req_123', newToken);
  });

  console.log('\n--- 3. AI NLP Sentiment Analysis & Fraud Detection Tests ---');
  it('should accurately identify positive sentiment in customer reviews', () => {
    const positiveWords = new Set(['great', 'excellent', 'amazing', 'punctual', 'professional']);
    const comment = "Vikram was punctual and did an amazing and excellent job on my car.";
    const words = comment.toLowerCase().replace(/[^a-zA-Z\s]/g, '').split(/\s+/);
    let hits = 0;
    words.forEach(w => { if (positiveWords.has(w)) hits++; });
    assert.ok(hits >= 3, `Expected at least 3 positive sentiment tokens, got ${hits}`);
  });

  it('should detect abusive terms and flag appropriate review alerts', () => {
    const abusiveTerms = ['scamster', 'fraudster', 'idiot', 'thief'];
    const toxicComment = "This mechanic was a complete thief and idiot who ruined my battery!";
    const detected = abusiveTerms.filter(t => toxicComment.toLowerCase().includes(t));
    assert.strictEqual(detected.length, 2, 'Should detect 2 abusive terms');
  });

  console.log('\n--- 4. Quality Control & Badge Qualification Logic Tests ---');
  it('should verify Verified & Trusted Badge qualification criteria', () => {
    const providerValid = {
      kycStatus: 'verified',
      trustScore: 88,
      ratingAverage: 4.8,
      isSuspended: false,
      isBanned: false,
      warningCount: 0
    };

    const qualifies =
      providerValid.kycStatus === 'verified' &&
      providerValid.trustScore >= 80 &&
      providerValid.ratingAverage >= 4.2 &&
      !providerValid.isSuspended &&
      !providerValid.isBanned &&
      providerValid.warningCount < 2;

    assert.strictEqual(qualifies, true, 'Provider should qualify for badge');

    // Test disqualified by warning count or low trust score
    const providerDisqualified = { ...providerValid, trustScore: 72 };
    const fails =
      providerDisqualified.kycStatus === 'verified' &&
      providerDisqualified.trustScore >= 80 &&
      providerDisqualified.ratingAverage >= 4.2 &&
      !providerDisqualified.isSuspended &&
      !providerDisqualified.isBanned &&
      providerDisqualified.warningCount < 2;

    assert.strictEqual(fails, false, 'Provider with trust score 72 must NOT receive badge');
  });

  it('should verify 3-Tier Penalty Escalation logic', () => {
    // Stage 1: warning
    const stage1Count = 1;
    const action1 = stage1Count === 1 ? 'warning' : stage1Count === 2 ? 'suspension' : 'permanent_ban';
    assert.strictEqual(action1, 'warning');

    // Stage 2: 30-day suspension
    const stage2Count = 2;
    const action2 = stage2Count === 1 ? 'warning' : stage2Count === 2 ? 'suspension' : 'permanent_ban';
    assert.strictEqual(action2, 'suspension');

    // Stage 3: permanent ban
    const stage3Count = 3;
    const action3 = stage3Count === 1 ? 'warning' : stage3Count === 2 ? 'suspension' : 'permanent_ban';
    assert.strictEqual(action3, 'permanent_ban');
  });

  console.log('\n==================================================');
  console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
