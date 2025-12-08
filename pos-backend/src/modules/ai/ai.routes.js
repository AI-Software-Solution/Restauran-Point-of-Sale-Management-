const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const { isVerifiedUser, isAdminOrOwner } = require('../../../middlewares/tokenVerification');

// All routes require authentication
router.use(isVerifiedUser);

/**
 * @route   GET /api/v1/ai/dashboard
 * @desc    Get comprehensive dashboard data with forecasts
 * @access  Private (Manager, Owner, Admin)
 */
router.get('/dashboard', aiController.getDashboardData);

/**
 * @route   GET /api/v1/ai/forecast/sales
 * @desc    Get sales forecast for next N days
 * @query   days - Number of days to forecast (default: 7)
 * @access  Private
 */
router.get('/forecast/sales', aiController.getSalesForecast);

/**
 * @route   GET /api/v1/ai/forecast/inventory
 * @desc    Get inventory needs forecast
 * @access  Private
 */
router.get('/forecast/inventory', aiController.getInventoryForecast);

/**
 * @route   GET /api/v1/ai/patterns
 * @desc    Get sales patterns (hourly, daily, weekly)
 * @query   period - Analysis period in days (default: 30)
 * @access  Private
 */
router.get('/patterns', aiController.getSalesPatterns);

/**
 * @route   GET /api/v1/ai/menu-performance
 * @desc    Get menu items performance analysis
 * @query   period - Analysis period in days (default: 30)
 * @access  Private
 */
router.get('/menu-performance', aiController.getMenuPerformance);

/**
 * @route   GET /api/v1/ai/customers
 * @desc    Get customer behavior analytics
 * @query   period - Analysis period in days (default: 90)
 * @access  Private
 */
router.get('/customers', aiController.getCustomerAnalytics);

/**
 * @route   GET /api/v1/ai/customers/segments
 * @desc    Get customer segments (VIP, Power User, Loyal, Regular, Casual, New, Inactive)
 * @query   period - Analysis period in days (default: 180)
 * @access  Private
 */
router.get('/customers/segments', aiController.getCustomerSegments);

/**
 * @route   GET /api/v1/ai/customers/churn-risk
 * @desc    Get churn risk analysis with at-risk customers
 * @query   period - Analysis period in days (default: 180)
 * @access  Private
 */
router.get('/customers/churn-risk', aiController.getChurnRisk);

/**
 * @route   GET /api/v1/ai/customers/retention-strategies
 * @desc    Get AI-powered retention strategies for each segment
 * @query   period - Analysis period in days (default: 180)
 * @access  Private
 */
router.get('/customers/retention-strategies', aiController.getRetentionStrategies);

/**
 * @route   GET /api/v1/ai/forecast/sales/confidence
 * @desc    Get sales forecast with confidence intervals (85-115%)
 * @query   days - Number of days to forecast (default: 7)
 * @access  Private
 */
router.get('/forecast/sales/confidence', aiController.getSalesForecastWithConfidence);

/**
 * @route   GET /api/v1/ai/insights
 * @desc    Get AI-generated insights and recommendations
 * @access  Private
 */
router.get('/insights', aiController.getAIInsights);

/**
 * @route   POST /api/v1/ai/train
 * @desc    Manually train AI models (Admin only)
 * @access  Private (Admin only)
 */
router.post('/train', isAdminOrOwner, aiController.trainModels);

module.exports = router;
