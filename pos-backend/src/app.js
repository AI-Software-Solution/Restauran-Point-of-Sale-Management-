require('dotenv').config();
const express = require("express");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

// New modular imports
const { sequelize, testConnection, syncDatabase, validateConfig, appConfig } = require("./config");
const { createRedisClient, cache } = require("./config/redis");
const { initializeWebSocket, emit } = require("./config/websocket");
const { initializeQueues, jobs } = require("./config/queue");
const logger = require("./shared/utils/logger");
const { requestLogger } = require("./shared/utils/logger");
const { globalErrorHandler, notFoundHandler } = require("./shared/middlewares/errorHandler");
const { generalLimiter, authLimiter } = require("./shared/middlewares/rateLimiter");

// Validate configuration on startup
validateConfig();

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
const io = initializeWebSocket(server);

// Trust proxy for rate limiter behind nginx/ingress
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Request logging
app.use(requestLogger);

// Rate Limiting
app.use(generalLimiter);

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
}

app.use(cors({
    credentials: true,
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed'));
        }
    }
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root Endpoint
app.get("/", (req, res) => {
    res.json({
        message: "POS System API",
        version: "1.0.0",
        docs: "/api/v1/docs"
    });
});

// Health Check Endpoint
app.get("/health", async (req, res) => {
    try {
        await sequelize.authenticate();
        const redisStatus = cache.isConnected() ? 'connected' : 'disconnected';

        res.status(200).json({
            status: "healthy",
            database: "connected",
            redis: redisStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(503).json({
            status: "unhealthy",
            database: "disconnected",
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// API Version 1 Routes
const apiV1 = express.Router();

// Auth routes with stricter rate limiting
apiV1.use("/user", authLimiter, require("../routes/userRoute"));

// Core POS routes
apiV1.use("/order", require("../routes/orderRoute"));
apiV1.use("/table", require("../routes/tableRoute"));
apiV1.use("/payment", require("../routes/paymentRoute"));
apiV1.use("/category", require("../routes/categoryRoute"));
apiV1.use("/product", require("../routes/productRoute"));
apiV1.use("/statistics", require("../routes/statisticsRoute"));

// Inventory Management
apiV1.use("/inventory", require("../routes/inventoryRoute"));

// Floor Plan Management
apiV1.use("/floor", require("../routes/floorRoute"));

// Landing Page (public)
apiV1.use("/landing", require("../routes/landingRoute"));

// CMS Admin
apiV1.use("/cms", require("../routes/cmsRoute"));

// Admin Panel
apiV1.use("/admin", require("../routes/adminRoute"));

// Analytics
apiV1.use("/analytics", require("../routes/analyticsRoute"));

// Integrations
apiV1.use("/integrations", require("../routes/integrationsRoute"));

// AI & Machine Learning (TensorFlow.js powered)
apiV1.use("/ai", require("./modules/ai/ai.routes"));

// Kitchen Display System (KDS)
apiV1.use("/kitchen", require("./modules/kitchen/kitchen.routes"));

// Mount API v1
app.use("/api/v1", apiV1);

// Legacy API routes (for backward compatibility - will be deprecated)
app.use("/api/user", authLimiter, require("../routes/userRoute"));
app.use("/api/order", require("../routes/orderRoute"));
app.use("/api/table", require("../routes/tableRoute"));
app.use("/api/payment", require("../routes/paymentRoute"));
app.use("/api/category", require("../routes/categoryRoute"));
app.use("/api/product", require("../routes/productRoute"));
app.use("/api/statistics", require("../routes/statisticsRoute"));
app.use("/api/inventory", require("../routes/inventoryRoute"));
app.use("/api/floor", require("../routes/floorRoute"));
app.use("/api/landing", require("../routes/landingRoute"));
app.use("/api/cms", require("../routes/cmsRoute"));
app.use("/api/admin", require("../routes/adminRoute"));
app.use("/api/analytics", require("../routes/analyticsRoute"));
app.use("/api/integrations", require("../routes/integrationsRoute"));
app.use("/api/modifiers", require("../routes/modifiersRoute"));
app.use("/api/upload", require("../routes/uploadRoute"));

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(globalErrorHandler);

// Initialize services and start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            logger.error('Failed to connect to database');
            process.exit(1);
        }

        // Sync database (alter tables in dev)
        await syncDatabase();

        // Initialize Redis (optional - continues if fails)
        try {
            const redisClient = createRedisClient();
            await redisClient.connect();
            logger.info('Redis connected');
        } catch (redisError) {
            logger.warn('Redis connection failed, continuing without cache:', redisError.message);
        }

        // Initialize queues (optional - continues if fails)
        try {
            initializeQueues();
            logger.info('Job queues initialized');
        } catch (queueError) {
            logger.warn('Queue initialization failed:', queueError.message);
        }

        // Start server
        const PORT = appConfig.port;
        server.listen(PORT, () => {
            logger.info(`POS Server running on port ${PORT}`);
            logger.info(`Environment: ${appConfig.env}`);
            logger.info(`API v1: http://localhost:${PORT}/api/v1`);
        });

    } catch (error) {
        logger.error('Server startup failed:', error);
        process.exit(1);
    }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
        logger.info('HTTP server closed');

        try {
            await sequelize.close();
            logger.info('Database connection closed');
        } catch (error) {
            logger.error('Error closing database:', error.message);
        }

        process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', { reason, promise });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Start the server
startServer();

// Export for testing
module.exports = { app, server, io, emit };
