const forecastingService = require('./forecasting.service');
const { Order, Product, InventoryItem, Category } = require('../../../models/index');
const ApiResponse = require('../../shared/utils/apiResponse');
const { asyncHandler } = require('../../shared/middlewares/errorHandler');
const logger = require('../../shared/utils/logger');
const { Op } = require('sequelize');
const dayjs = require('dayjs');

/**
 * Get sales forecast
 */
const getSalesForecast = asyncHandler(async (req, res) => {
    const { days = 7 } = req.query;

    // Get historical sales data (last 90 days)
    const startDate = dayjs().subtract(90, 'day').toDate();
    const orders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: startDate },
            orderStatus: 'Completed'
        },
        attributes: ['id', 'createdAt', 'bills'],
        order: [['createdAt', 'ASC']]
    });

    // Aggregate daily sales
    const dailySales = {};
    orders.forEach(order => {
        const date = dayjs(order.createdAt).format('YYYY-MM-DD');
        if (!dailySales[date]) {
            dailySales[date] = 0;
        }
        dailySales[date] += parseFloat(order.bills?.totalWithTax || order.bills?.total || 0);
    });

    // Convert to array
    const salesData = Object.entries(dailySales)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, value]) => value);

    if (salesData.length < 7) {
        return ApiResponse.success(res, {
            message: 'Prognoz uchun yetarli ma\'lumot yo\'q',
            historicalDays: salesData.length,
            requiredDays: 7
        });
    }

    // Get forecast
    const forecast = await forecastingService.predictSales(salesData, parseInt(days));

    // Generate dates for predictions
    const forecastDates = [];
    for (let i = 1; i <= parseInt(days); i++) {
        forecastDates.push(dayjs().add(i, 'day').format('YYYY-MM-DD'));
    }

    ApiResponse.success(res, {
        historical: {
            days: salesData.length,
            lastWeekTotal: salesData.slice(-7).reduce((a, b) => a + b, 0),
            lastWeekAvg: Math.round(salesData.slice(-7).reduce((a, b) => a + b, 0) / 7)
        },
        forecast: {
            dates: forecastDates,
            predictions: forecast.predictions,
            total: forecast.predictions.reduce((a, b) => a + b, 0),
            dailyAvg: Math.round(forecast.predictions.reduce((a, b) => a + b, 0) / forecast.predictions.length)
        },
        confidence: forecast.confidence,
        method: forecast.method
    });
});

/**
 * Get inventory forecast
 */
const getInventoryForecast = asyncHandler(async (req, res) => {
    // Get inventory items with stock info
    const inventoryItems = await InventoryItem.findAll({
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price'] }]
    });

    // Get order items for consumption analysis (last 30 days)
    const startDate = dayjs().subtract(30, 'day').toDate();
    const orders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: startDate },
            orderStatus: 'Completed'
        },
        attributes: ['items']
    });

    // Calculate consumption per product
    const consumption = {};
    orders.forEach(order => {
        if (!order.items) return;
        order.items.forEach(item => {
            const productId = item.productId || item.id;
            if (!consumption[productId]) {
                consumption[productId] = [];
            }
            consumption[productId].push(item.quantity || 1);
        });
    });

    // Generate forecasts for each inventory item
    const forecasts = await Promise.all(inventoryItems.map(async (item) => {
        const productConsumption = consumption[item.productId] || [0];
        const dailyConsumption = productConsumption.reduce((a, b) => a + b, 0) / 30;

        const forecast = await forecastingService.predictInventoryNeeds(
            item.productId,
            productConsumption,
            item.currentStock || 0,
            item.minStock || 10
        );

        return {
            productId: item.productId,
            productName: item.product?.name || 'Unknown',
            ...forecast
        };
    }));

    // Sort by urgency
    const sortedForecasts = forecasts.sort((a, b) => {
        const urgencyOrder = { critical: 0, high: 1, normal: 2 };
        return (urgencyOrder[a.urgency] || 2) - (urgencyOrder[b.urgency] || 2);
    });

    ApiResponse.success(res, {
        totalItems: sortedForecasts.length,
        critical: sortedForecasts.filter(f => f.urgency === 'critical'),
        needsReorder: sortedForecasts.filter(f => f.needsReorder),
        forecasts: sortedForecasts
    });
});

/**
 * Get sales patterns analysis
 */
const getSalesPatterns = asyncHandler(async (req, res) => {
    const { period = 30 } = req.query;

    const startDate = dayjs().subtract(parseInt(period), 'day').toDate();
    const orders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: startDate },
            orderStatus: 'Completed'
        },
        attributes: ['id', 'createdAt', 'bills', 'items']
    });

    const patterns = forecastingService.analyzeSalesPatterns(orders);

    ApiResponse.success(res, {
        period: `${period} kun`,
        totalOrders: orders.length,
        ...patterns
    });
});

/**
 * Get menu performance analysis
 */
const getMenuPerformance = asyncHandler(async (req, res) => {
    const { period = 30 } = req.query;

    const startDate = dayjs().subtract(parseInt(period), 'day').toDate();
    const orders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: startDate },
            orderStatus: 'Completed'
        },
        attributes: ['items', 'bills']
    });

    const performance = forecastingService.analyzeMenuPerformance(orders);

    ApiResponse.success(res, {
        period: `${period} kun`,
        totalOrders: orders.length,
        ...performance
    });
});

/**
 * Get customer analytics
 */
const getCustomerAnalytics = asyncHandler(async (req, res) => {
    const { period = 90 } = req.query;

    const startDate = dayjs().subtract(parseInt(period), 'day').toDate();
    const orders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: startDate },
            orderStatus: 'Completed'
        },
        attributes: ['id', 'customerDetails', 'bills', 'createdAt']
    });

    const analytics = forecastingService.analyzeCustomerBehavior(orders);

    ApiResponse.success(res, {
        period: `${period} kun`,
        ...analytics
    });
});

/**
 * Get AI insights and recommendations
 */
const getAIInsights = asyncHandler(async (req, res) => {
    // Get recent orders
    const startDate = dayjs().subtract(60, 'day').toDate();
    const orders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: startDate },
            orderStatus: 'Completed'
        },
        attributes: ['id', 'createdAt', 'bills', 'items', 'customerDetails']
    });

    // Get inventory data
    const inventoryItems = await InventoryItem.findAll({
        include: [{ model: Product, as: 'product', attributes: ['name'] }]
    });

    const inventoryData = inventoryItems.map(item => ({
        name: item.product?.name,
        currentStock: item.currentStock,
        minStock: item.minStock
    }));

    const insights = await forecastingService.generateInsights(orders, inventoryData);

    // Add menu and customer insights
    const menuPerformance = forecastingService.analyzeMenuPerformance(orders);
    const customerAnalytics = forecastingService.analyzeCustomerBehavior(orders);

    // Add more insights based on analysis
    if (customerAnalytics.repeatRate < 20) {
        insights.insights.push({
            type: 'warning',
            category: 'customers',
            title: 'Qaytib keluvchi mijozlar kam',
            message: `Faqat ${customerAnalytics.repeatRate}% mijozlar qaytib kelmoqda`,
            icon: 'people',
            action: 'Loyalty dasturini ishga tushiring'
        });
    }

    if (menuPerformance.underperformers.length > 3) {
        insights.insights.push({
            type: 'info',
            category: 'menu',
            title: 'Menyu optimallashtirish',
            message: `${menuPerformance.underperformers.length} ta mahsulot kam sotilmoqda`,
            icon: 'restaurant_menu',
            action: 'Menyuni ko\'rib chiqing'
        });
    }

    ApiResponse.success(res, {
        ...insights,
        summary: {
            totalOrders: orders.length,
            totalCustomers: customerAnalytics.totalCustomers,
            topSeller: menuPerformance.topSellers[0]?.name || 'N/A',
            avgOrderValue: customerAnalytics.avgOrderValue
        }
    });
});

/**
 * Get comprehensive dashboard data
 */
const getDashboardData = asyncHandler(async (req, res) => {
    const today = dayjs().startOf('day').toDate();
    const weekAgo = dayjs().subtract(7, 'day').toDate();
    const monthAgo = dayjs().subtract(30, 'day').toDate();

    // Today's stats
    const todayOrders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: today },
            orderStatus: 'Completed'
        }
    });

    const todayRevenue = todayOrders.reduce((sum, o) => sum + parseFloat(o.bills?.totalWithTax || 0), 0);

    // Weekly stats
    const weeklyOrders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: weekAgo },
            orderStatus: 'Completed'
        }
    });

    const weeklyRevenue = weeklyOrders.reduce((sum, o) => sum + parseFloat(o.bills?.totalWithTax || 0), 0);

    // Previous week for comparison
    const prevWeekStart = dayjs().subtract(14, 'day').toDate();
    const prevWeekOrders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: prevWeekStart, [Op.lt]: weekAgo },
            orderStatus: 'Completed'
        }
    });

    const prevWeekRevenue = prevWeekOrders.reduce((sum, o) => sum + parseFloat(o.bills?.totalWithTax || 0), 0);

    // Calculate growth
    const revenueGrowth = prevWeekRevenue > 0
        ? (((weeklyRevenue - prevWeekRevenue) / prevWeekRevenue) * 100).toFixed(1)
        : 0;

    // Get forecast
    const monthlyOrders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: monthAgo },
            orderStatus: 'Completed'
        },
        order: [['createdAt', 'ASC']]
    });

    const dailySales = {};
    monthlyOrders.forEach(order => {
        const date = dayjs(order.createdAt).format('YYYY-MM-DD');
        if (!dailySales[date]) dailySales[date] = 0;
        dailySales[date] += parseFloat(order.bills?.totalWithTax || 0);
    });

    const salesData = Object.values(dailySales);
    const forecast = salesData.length >= 7
        ? await forecastingService.predictSales(salesData, 7)
        : { predictions: [], confidence: 0 };

    // Get patterns
    const patterns = forecastingService.analyzeSalesPatterns(monthlyOrders);

    // Low stock items
    const lowStockItems = await InventoryItem.findAll({
        where: {
            currentStock: { [Op.lte]: require('sequelize').col('min_stock') }
        },
        include: [{ model: Product, as: 'product', attributes: ['name'] }],
        limit: 5
    });

    ApiResponse.success(res, {
        today: {
            orders: todayOrders.length,
            revenue: Math.round(todayRevenue),
            avgOrderValue: todayOrders.length > 0 ? Math.round(todayRevenue / todayOrders.length) : 0
        },
        weekly: {
            orders: weeklyOrders.length,
            revenue: Math.round(weeklyRevenue),
            avgOrderValue: weeklyOrders.length > 0 ? Math.round(weeklyRevenue / weeklyOrders.length) : 0,
            growth: parseFloat(revenueGrowth)
        },
        forecast: {
            nextWeekRevenue: forecast.predictions.reduce((a, b) => a + b, 0),
            confidence: forecast.confidence,
            dailyPredictions: forecast.predictions
        },
        patterns: {
            peakHours: patterns.peakHours,
            peakDays: patterns.peakDays.slice(0, 3)
        },
        alerts: {
            lowStock: lowStockItems.map(item => ({
                name: item.product?.name,
                currentStock: item.currentStock,
                minStock: item.minStock
            }))
        },
        charts: {
            dailyRevenue: Object.entries(dailySales).map(([date, value]) => ({
                date,
                revenue: Math.round(value)
            })),
            hourlyDistribution: patterns.hourlyDistribution
        }
    });
});

/**
 * Train AI models manually (admin only)
 */
const trainModels = asyncHandler(async (req, res) => {
    const startDate = dayjs().subtract(90, 'day').toDate();
    const orders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: startDate },
            orderStatus: 'Completed'
        },
        attributes: ['createdAt', 'bills'],
        order: [['createdAt', 'ASC']]
    });

    // Aggregate daily sales
    const dailySales = {};
    orders.forEach(order => {
        const date = dayjs(order.createdAt).format('YYYY-MM-DD');
        if (!dailySales[date]) dailySales[date] = 0;
        dailySales[date] += parseFloat(order.bills?.totalWithTax || 0);
    });

    const salesData = Object.values(dailySales);

    if (salesData.length < 30) {
        return ApiResponse.badRequest(res, 'Modelni o\'rgatish uchun kamida 30 kunlik ma\'lumot kerak');
    }

    // Train the model
    const result = await forecastingService.trainSalesModel(salesData, 100);

    if (result) {
        ApiResponse.success(res, {
            message: 'Model muvaffaqiyatli o\'rgatildi',
            dataPoints: salesData.length,
            epochs: 100
        });
    } else {
        ApiResponse.error(res, 'Modelni o\'rgatishda xatolik', 500);
    }
});

/**
 * Get customer segments (7 categories)
 * VIP, Power User, Loyal, Regular, Casual, New, Inactive
 */
const getCustomerSegments = asyncHandler(async (req, res) => {
    const { period = 180 } = req.query;

    const startDate = dayjs().subtract(parseInt(period), 'day').toDate();
    const orders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: startDate },
            orderStatus: 'Completed'
        },
        attributes: ['id', 'customerDetails', 'bills', 'createdAt']
    });

    const segments = forecastingService.analyzeCustomerSegments(orders);

    ApiResponse.success(res, {
        period: `${period} kun`,
        ...segments
    });
});

/**
 * Get churn risk analysis
 * Identifies at-risk customers and potential revenue loss
 */
const getChurnRisk = asyncHandler(async (req, res) => {
    const { period = 180 } = req.query;

    const startDate = dayjs().subtract(parseInt(period), 'day').toDate();
    const orders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: startDate },
            orderStatus: 'Completed'
        },
        attributes: ['id', 'customerDetails', 'bills', 'createdAt']
    });

    const churnAnalysis = forecastingService.analyzeChurnRisk(orders);

    ApiResponse.success(res, {
        period: `${period} kun`,
        ...churnAnalysis
    });
});

/**
 * Get retention strategies
 * AI-powered recommendations for customer retention
 */
const getRetentionStrategies = asyncHandler(async (req, res) => {
    const { period = 180 } = req.query;

    const startDate = dayjs().subtract(parseInt(period), 'day').toDate();
    const orders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: startDate },
            orderStatus: 'Completed'
        },
        attributes: ['id', 'customerDetails', 'bills', 'createdAt']
    });

    const strategies = forecastingService.generateRetentionStrategies(orders);

    ApiResponse.success(res, {
        period: `${period} kun`,
        ...strategies
    });
});

/**
 * Get sales forecast with confidence intervals
 */
const getSalesForecastWithConfidence = asyncHandler(async (req, res) => {
    const { days = 7 } = req.query;

    const startDate = dayjs().subtract(90, 'day').toDate();
    const orders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: startDate },
            orderStatus: 'Completed'
        },
        attributes: ['id', 'createdAt', 'bills'],
        order: [['createdAt', 'ASC']]
    });

    // Aggregate daily sales
    const dailySales = {};
    orders.forEach(order => {
        const date = dayjs(order.createdAt).format('YYYY-MM-DD');
        if (!dailySales[date]) dailySales[date] = 0;
        dailySales[date] += parseFloat(order.bills?.totalWithTax || order.bills?.total || 0);
    });

    const salesData = Object.entries(dailySales)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, value]) => value);

    if (salesData.length < 7) {
        return ApiResponse.success(res, {
            message: 'Prognoz uchun yetarli ma\'lumot yo\'q',
            historicalDays: salesData.length,
            requiredDays: 7
        });
    }

    const forecast = await forecastingService.predictSalesWithConfidence(salesData, parseInt(days));

    // Generate dates
    const forecastDates = [];
    for (let i = 1; i <= parseInt(days); i++) {
        forecastDates.push(dayjs().add(i, 'day').format('YYYY-MM-DD'));
    }

    ApiResponse.success(res, {
        historical: {
            days: salesData.length,
            lastWeekTotal: salesData.slice(-7).reduce((a, b) => a + b, 0),
            lastWeekAvg: Math.round(salesData.slice(-7).reduce((a, b) => a + b, 0) / 7)
        },
        forecast: {
            dates: forecastDates,
            predictions: forecast.predictions,
            totalPredicted: forecast.totalPredicted,
            confidenceRange: {
                low: forecast.totalLow,
                high: forecast.totalHigh
            }
        },
        confidence: forecast.avgConfidence,
        method: forecast.method
    });
});

module.exports = {
    getSalesForecast,
    getInventoryForecast,
    getSalesPatterns,
    getMenuPerformance,
    getCustomerAnalytics,
    getAIInsights,
    getDashboardData,
    trainModels,
    getCustomerSegments,
    getChurnRisk,
    getRetentionStrategies,
    getSalesForecastWithConfidence
};
