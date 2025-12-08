require('dotenv').config();
const express = require("express");
const path = require("path");
const { connectDB, sequelize } = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const app = express();
const PORT = config.port;

// Trust proxy for rate limiter behind nginx/ingress
app.set('trust proxy', 1);

// Connect to PostgreSQL
connectDB();

// Security Middlewares
app.use(helmet());
app.use(compression());

// Rate Limiting (skip health checks and static files)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later' },
    skip: (req) => {
        // Skip rate limiting for health checks and root
        return req.path === '/health' || req.path === '/' || req.path === '/api/landing';
    }
});
app.use(limiter);

// Login rate limiter (stricter)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 login attempts per windowMs
    message: { error: 'Too many login attempts, please try again later' }
});

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
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed'));
        }
    }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root Endpoint
app.get("/", (req, res) => {
    res.json({ message: "Hello from POS Server! (PostgreSQL)" });
});

// Health Check Endpoint
app.get("/health", async (req, res) => {
    try {
        await sequelize.authenticate();
        res.status(200).json({
            status: "healthy",
            database: "connected",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: "unhealthy",
            database: "disconnected",
            timestamp: new Date().toISOString()
        });
    }
});

// API Endpoints
app.use("/api/user", loginLimiter, require("./routes/userRoute"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/table", require("./routes/tableRoute"));
app.use("/api/payment", require("./routes/paymentRoute"));
app.use("/api/category", require("./routes/categoryRoute"));
app.use("/api/product", require("./routes/productRoute"));
app.use("/api/statistics", require("./routes/statisticsRoute"));

// Inventory Management (authenticated)
app.use("/api/inventory", require("./routes/inventoryRoute"));

// Floor Plan Management (authenticated)
app.use("/api/floor", require("./routes/floorRoute"));

// Landing Page (public - no auth)
app.use("/api/landing", require("./routes/landingRoute"));

// CMS Admin (authenticated)
app.use("/api/cms", require("./routes/cmsRoute"));

// Admin Panel Pro (admin only)
app.use("/api/admin", require("./routes/adminRoute"));

// Analytics & AI (authenticated)
app.use("/api/analytics", require("./routes/analyticsRoute"));

// Integrations (Payment, Printer, Notifications)
app.use("/api/integrations", require("./routes/integrationsRoute"));

// Upload API (image upload with resize)
app.use("/api/upload", require("./routes/uploadRoute"));

// Modifiers API (product modifiers/variants)
app.use("/api/modifiers", require("./routes/modifiersRoute"));

// Bill Splitting (hisobni bo'lish)
app.use("/api/bill-split", require("./routes/billSplitRoute"));

// Course Management (ovqat ketma-ketligi)
app.use("/api/courses", require("./routes/courseRoute"));

// Table Transfer (stolni ko'chirish)
app.use("/api/transfer", require("./routes/tableTransferRoute"));

// Kitchen Notes (oshxona izohlari)
app.use("/api/kitchen", require("./routes/kitchenNotesRoute"));

// Tips Management (choyxona)
app.use("/api/tips", require("./routes/tipsRoute"));

// Customer Loyalty (mijoz sadoqati)
app.use("/api/loyalty", require("./routes/loyaltyRoute"));

// Global Error Handler
app.use(globalErrorHandler);

// Server
app.listen(PORT, () => {
    console.log(`POS Server is listening on port ${PORT}`);
});
