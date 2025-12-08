const rateLimit = require('express-rate-limit');
const { HTTP_STATUS } = require('../constants');

/**
 * General API rate limiter
 * 100 requests per minute per IP
 */
const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: {
        success: false,
        message: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Too many requests, please try again later'
        });
    }
});

/**
 * Auth rate limiter (stricter)
 * 30 login attempts per minute per IP
 */
const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: {
        success: false,
        message: 'Too many login attempts, please try again after a minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Too many login attempts, please try again after a minute'
        });
    }
});

/**
 * API rate limiter for sensitive operations
 * 20 requests per minute per IP
 */
const strictLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    message: {
        success: false,
        message: 'Rate limit exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Rate limit exceeded'
        });
    }
});

/**
 * Create custom rate limiter
 */
const createLimiter = (windowMs, max, message = 'Rate limit exceeded') => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
                success: false,
                message
            });
        }
    });
};

module.exports = {
    generalLimiter,
    authLimiter,
    strictLimiter,
    createLimiter
};
