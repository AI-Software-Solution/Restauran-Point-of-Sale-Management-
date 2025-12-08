const express = require('express');
const router = express.Router();
const { isVerifiedUser, isAdminOrOwner } = require('../middlewares/tokenVerification');
const {
    getSalesAnalytics,
    getSalesForecast,
    getDemandAnalysis,
    getProductRecommendations,
    getCustomerInsights,
    getRealTimeAnalytics
} = require('../controllers/analytics.ctr');

// All routes require authentication
router.use(isVerifiedUser);

// Sales Analytics
router.get('/sales', getSalesAnalytics);

// Sales Forecast (AI-powered predictions)
router.get('/forecast', getSalesForecast);

// Demand Analysis
router.get('/demand', getDemandAnalysis);

// Product Recommendations
router.get('/recommendations', getProductRecommendations);

// Customer Insights
router.get('/customers', getCustomerInsights);

// Real-time Analytics Dashboard
router.get('/realtime', getRealTimeAnalytics);

module.exports = router;
