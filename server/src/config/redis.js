const config = require('./env');

class MemoryRedisStore {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
    console.log('[Redis] Running in High-Performance In-Memory Cache Mode (Zero External Dependency)');
  }

  async get(key) {
    if (this.ttls.has(key) && Date.now() > this.ttls.get(key)) {
      this.store.delete(key);
      this.ttls.delete(key);
      return null;
    }
    const val = this.store.get(key);
    return val !== undefined ? val : null;
  }

  async set(key, value, ...args) {
    this.store.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    
    // Support EX seconds syntax: set(key, val, 'EX', 60)
    if (args.length >= 2 && String(args[0]).toUpperCase() === 'EX') {
      const seconds = parseInt(args[1], 10);
      if (!isNaN(seconds)) {
        this.ttls.set(key, Date.now() + seconds * 1000);
      }
    }
    return 'OK';
  }

  async del(key) {
    this.ttls.delete(key);
    return this.store.delete(key) ? 1 : 0;
  }

  async acquireLock(resource, ttlSeconds = 30) {
    const lockKey = `lock:${resource}`;
    const existing = await this.get(lockKey);
    if (existing) {
      return null; // Lock already held
    }
    const lockToken = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.set(lockKey, lockToken, 'EX', ttlSeconds);
    return lockToken;
  }

  async releaseLock(resource, lockToken) {
    const lockKey = `lock:${resource}`;
    const existing = await this.get(lockKey);
    if (existing === lockToken) {
      await this.del(lockKey);
      return true;
    }
    return false;
  }

  async setCoordinates(id, coords) {
    return this.set(`geo:provider:${id}`, JSON.stringify(coords), 'EX', 3600);
  }

  async getCoordinates(id) {
    const data = await this.get(`geo:provider:${id}`);
    return data ? JSON.parse(data) : null;
  }
}

// Singleton instance
const redisClient = new MemoryRedisStore();

module.exports = redisClient;
