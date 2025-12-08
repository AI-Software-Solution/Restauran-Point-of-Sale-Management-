const Redis = require('ioredis');
const logger = require('../shared/utils/logger');

let redisClient = null;
let isConnected = false;

const REDIS_CONFIG = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true
};

const createRedisClient = () => {
    if (redisClient) {
        return redisClient;
    }

    redisClient = new Redis(REDIS_CONFIG);

    redisClient.on('connect', () => {
        isConnected = true;
        logger.info('Redis connected successfully');
    });

    redisClient.on('error', (err) => {
        isConnected = false;
        logger.error('Redis connection error:', err.message);
    });

    redisClient.on('close', () => {
        isConnected = false;
        logger.warn('Redis connection closed');
    });

    return redisClient;
};

// Cache helper functions
const cache = {
    async get(key) {
        if (!isConnected) return null;
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error('Redis GET error:', error.message);
            return null;
        }
    },

    async set(key, value, ttlSeconds = 3600) {
        if (!isConnected) return false;
        try {
            await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
            return true;
        } catch (error) {
            logger.error('Redis SET error:', error.message);
            return false;
        }
    },

    async del(key) {
        if (!isConnected) return false;
        try {
            await redisClient.del(key);
            return true;
        } catch (error) {
            logger.error('Redis DEL error:', error.message);
            return false;
        }
    },

    async delPattern(pattern) {
        if (!isConnected) return false;
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
            return true;
        } catch (error) {
            logger.error('Redis DEL pattern error:', error.message);
            return false;
        }
    },

    async flush() {
        if (!isConnected) return false;
        try {
            await redisClient.flushdb();
            return true;
        } catch (error) {
            logger.error('Redis FLUSH error:', error.message);
            return false;
        }
    },

    isConnected() {
        return isConnected;
    }
};

// Cache keys constants
const CACHE_KEYS = {
    PRODUCTS: 'products',
    PRODUCT: (id) => `product:${id}`,
    CATEGORIES: 'categories',
    CATEGORY: (id) => `category:${id}`,
    TABLES: 'tables',
    TABLE: (id) => `table:${id}`,
    FLOORS: 'floors',
    ORDERS_ACTIVE: 'orders:active',
    ORDER: (id) => `order:${id}`,
    STATS_TODAY: 'stats:today',
    STATS_WEEKLY: 'stats:weekly',
    USER: (id) => `user:${id}`,
    SESSION: (token) => `session:${token}`
};

// Cache TTL in seconds
const CACHE_TTL = {
    SHORT: 60,           // 1 minute
    MEDIUM: 300,         // 5 minutes
    LONG: 3600,          // 1 hour
    VERY_LONG: 86400     // 24 hours
};

module.exports = {
    createRedisClient,
    getRedisClient: () => redisClient,
    cache,
    CACHE_KEYS,
    CACHE_TTL
};
