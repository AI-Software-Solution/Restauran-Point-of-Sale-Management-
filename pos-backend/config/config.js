require("dotenv").config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables');
    process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
    console.error('FATAL ERROR: JWT_SECRET must be at least 32 characters long');
    process.exit(1);
}

const config = Object.freeze({
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || "development",
    accessTokenSecret: process.env.JWT_SECRET,

    // PostgreSQL configuration
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        name: process.env.DB_NAME || 'pos_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',

        // Connection pool settings
        pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 10,
            min: parseInt(process.env.DB_POOL_MIN) || 2,
            acquire: 30000,
            idle: 10000
        }
    },

    // Razorpay Payment Gateway configuration
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
    razorpaySecretKey: process.env.RAZORPAY_KEY_SECRET || null,
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || null,

    // Tax configuration
    taxRate: parseFloat(process.env.TAX_RATE) || 12,

    // Business settings
    monthlyTarget: parseInt(process.env.MONTHLY_TARGET) || 50000000,
    currency: process.env.CURRENCY || 'UZS'
});

module.exports = config;
