const database = require('./database');
const redis = require('./redis');
const websocket = require('./websocket');
const queue = require('./queue');

// Application configuration
const appConfig = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 4000,
    apiPrefix: '/api/v1',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
    corsOrigin: process.env.CORS_ORIGIN || '*',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
};

// Validate required environment variables
const validateConfig = () => {
    const requiredEnvVars = ['JWT_SECRET'];
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missing.length > 0) {
        console.error(`FATAL ERROR: Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }

    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        console.error('FATAL ERROR: JWT_SECRET must be at least 32 characters long');
        process.exit(1);
    }
};

module.exports = {
    ...database,
    ...redis,
    ...websocket,
    ...queue,
    appConfig,
    validateConfig
};
