const { Order, Product, Category, Table, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// ==================== SALES ANALYTICS ====================

// Get comprehensive sales analytics
const getSalesAnalytics = async (req, res, next) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const orders = await Order.findAll({
            where: {
                createdAt: { [Op.between]: [start, end] },
                orderStatus: 'Completed'
            },
            attributes: ['id', 'bills', 'items', 'createdAt', 'tableId'],
            order: [['createdAt', 'ASC']]
        });

        // Aggregate data
        const salesByPeriod = {};
        const hourlyDistribution = Array(24).fill(0);
        const weekdayDistribution = Array(7).fill(0);
        let totalRevenue = 0;
        let totalOrders = orders.length;
        let totalItems = 0;

        orders.forEach(order => {
            const date = order.createdAt;
            const periodKey = groupBy === 'month'
                ? date.toISOString().slice(0, 7)
                : groupBy === 'week'
                    ? getWeekNumber(date)
                    : date.toISOString().slice(0, 10);

            if (!salesByPeriod[periodKey]) {
                salesByPeriod[periodKey] = { period: periodKey, revenue: 0, orders: 0, items: 0 };
            }

            const revenue = order.bills?.totalWithTax || 0;
            const items = order.items?.length || 0;

            salesByPeriod[periodKey].revenue += revenue;
            salesByPeriod[periodKey].orders += 1;
            salesByPeriod[periodKey].items += items;

            totalRevenue += revenue;
            totalItems += items;

            // Hourly distribution
            hourlyDistribution[date.getHours()]++;
            // Weekday distribution (0 = Sunday)
            weekdayDistribution[date.getDay()]++;
        });

        // Calculate growth rate
        const periods = Object.values(salesByPeriod).sort((a, b) => a.period.localeCompare(b.period));
        let growthRate = 0;
        if (periods.length >= 2) {
            const lastPeriod = periods[periods.length - 1].revenue;
            const prevPeriod = periods[periods.length - 2].revenue;
            growthRate = prevPeriod > 0 ? ((lastPeriod - prevPeriod) / prevPeriod * 100) : 0;
        }

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    totalOrders,
                    totalItems,
                    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
                    growthRate: Math.round(growthRate * 100) / 100
                },
                salesByPeriod: periods,
                hourlyDistribution: hourlyDistribution.map((count, hour) => ({ hour, orders: count })),
                weekdayDistribution: weekdayDistribution.map((count, day) => ({
                    day: ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'][day],
                    orders: count
                })),
                period: { start, end }
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==================== SALES FORECASTING ====================

// Simple forecasting based on historical trends
const getSalesForecast = async (req, res, next) => {
    try {
        const { days = 7 } = req.query;
        const forecastDays = Math.min(parseInt(days), 30);

        // Get historical data (last 60 days)
        const historicalStart = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        const orders = await Order.findAll({
            where: {
                createdAt: { [Op.gte]: historicalStart },
                orderStatus: 'Completed'
            },
            attributes: ['bills', 'createdAt']
        });

        // Group by date
        const dailySales = {};
        orders.forEach(order => {
            const date = order.createdAt.toISOString().slice(0, 10);
            if (!dailySales[date]) {
                dailySales[date] = { revenue: 0, orders: 0 };
            }
            dailySales[date].revenue += order.bills?.totalWithTax || 0;
            dailySales[date].orders += 1;
        });

        // Calculate weekday averages for forecasting
        const weekdayAverages = Array(7).fill(null).map(() => ({ revenue: 0, orders: 0, count: 0 }));
        Object.entries(dailySales).forEach(([date, data]) => {
            const weekday = new Date(date).getDay();
            weekdayAverages[weekday].revenue += data.revenue;
            weekdayAverages[weekday].orders += data.orders;
            weekdayAverages[weekday].count += 1;
        });

        weekdayAverages.forEach(avg => {
            if (avg.count > 0) {
                avg.avgRevenue = avg.revenue / avg.count;
                avg.avgOrders = avg.orders / avg.count;
            } else {
                avg.avgRevenue = 0;
                avg.avgOrders = 0;
            }
        });

        // Calculate overall trend (simple linear regression)
        const dates = Object.keys(dailySales).sort();
        const trend = calculateTrend(dates.map((_, i) => i), dates.map(d => dailySales[d].revenue));

        // Generate forecast
        const forecast = [];
        const today = new Date();
        for (let i = 1; i <= forecastDays; i++) {
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + i);
            const weekday = futureDate.getDay();

            // Base prediction from weekday average + trend adjustment
            const baseRevenue = weekdayAverages[weekday].avgRevenue;
            const trendAdjustment = trend.slope * (dates.length + i);

            forecast.push({
                date: futureDate.toISOString().slice(0, 10),
                weekday: ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'][weekday],
                predictedRevenue: Math.max(0, Math.round(baseRevenue + trendAdjustment)),
                predictedOrders: Math.round(weekdayAverages[weekday].avgOrders),
                confidence: calculateConfidence(weekdayAverages[weekday].count)
            });
        }

        res.status(200).json({
            success: true,
            data: {
                forecast,
                weekdayPatterns: weekdayAverages.map((avg, i) => ({
                    weekday: ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'][i],
                    avgRevenue: Math.round(avg.avgRevenue),
                    avgOrders: Math.round(avg.avgOrders * 10) / 10,
                    sampleSize: avg.count
                })),
                trendInfo: {
                    direction: trend.slope > 0 ? 'yuqoriga' : trend.slope < 0 ? 'pastga' : 'barqaror',
                    strength: Math.abs(trend.slope) > 10000 ? 'kuchli' : Math.abs(trend.slope) > 1000 ? "o'rtacha" : 'zaif'
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==================== DEMAND ANALYSIS ====================

// Analyze product demand patterns
const getDemandAnalysis = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const orders = await Order.findAll({
            where: {
                createdAt: { [Op.between]: [start, end] },
                orderStatus: 'Completed'
            },
            attributes: ['items', 'createdAt']
        });

        // Analyze product demand
        const productDemand = {};
        const hourlyDemand = {};
        const categoryDemand = {};

        orders.forEach(order => {
            const hour = order.createdAt.getHours();

            (order.items || []).forEach(item => {
                const productKey = item.name || item.productId;
                const category = item.category || 'Boshqa';
                const quantity = item.quantity || 1;

                // Product demand
                if (!productDemand[productKey]) {
                    productDemand[productKey] = {
                        name: productKey,
                        category,
                        totalQuantity: 0,
                        totalRevenue: 0,
                        orderCount: 0,
                        hourlyPattern: Array(24).fill(0)
                    };
                }
                productDemand[productKey].totalQuantity += quantity;
                productDemand[productKey].totalRevenue += (item.price || 0) * quantity;
                productDemand[productKey].orderCount += 1;
                productDemand[productKey].hourlyPattern[hour] += quantity;

                // Category demand
                if (!categoryDemand[category]) {
                    categoryDemand[category] = { name: category, totalQuantity: 0, totalRevenue: 0 };
                }
                categoryDemand[category].totalQuantity += quantity;
                categoryDemand[category].totalRevenue += (item.price || 0) * quantity;

                // Hourly demand
                if (!hourlyDemand[hour]) {
                    hourlyDemand[hour] = { hour, totalItems: 0, totalOrders: 0 };
                }
                hourlyDemand[hour].totalItems += quantity;
            });

            // Count orders per hour
            if (hourlyDemand[hour]) {
                hourlyDemand[hour].totalOrders += 1;
            }
        });

        // Calculate peak hours
        const hourlyArray = Object.values(hourlyDemand).sort((a, b) => b.totalItems - a.totalItems);
        const peakHours = hourlyArray.slice(0, 3).map(h => ({
            hour: `${h.hour}:00 - ${h.hour + 1}:00`,
            demand: h.totalItems
        }));

        // Top products by demand
        const topProducts = Object.values(productDemand)
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, 10)
            .map(p => ({
                name: p.name,
                category: p.category,
                quantity: p.totalQuantity,
                revenue: p.totalRevenue,
                peakHour: p.hourlyPattern.indexOf(Math.max(...p.hourlyPattern))
            }));

        // Low demand products (potential for removal)
        const lowDemandProducts = Object.values(productDemand)
            .filter(p => p.totalQuantity < 5)
            .map(p => ({ name: p.name, quantity: p.totalQuantity }));

        res.status(200).json({
            success: true,
            data: {
                peakHours,
                topProducts,
                lowDemandProducts,
                categoryBreakdown: Object.values(categoryDemand).sort((a, b) => b.totalRevenue - a.totalRevenue),
                hourlyDistribution: Array(24).fill(0).map((_, h) => ({
                    hour: h,
                    items: hourlyDemand[h]?.totalItems || 0,
                    orders: hourlyDemand[h]?.totalOrders || 0
                })),
                insights: generateDemandInsights(peakHours, topProducts, lowDemandProducts)
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==================== PRODUCT RECOMMENDATIONS ====================

// Get product recommendations (frequently bought together)
const getProductRecommendations = async (req, res, next) => {
    try {
        const { productId, limit = 5 } = req.query;

        const orders = await Order.findAll({
            where: { orderStatus: 'Completed' },
            attributes: ['items'],
            limit: 500,
            order: [['createdAt', 'DESC']]
        });

        // Build co-occurrence matrix
        const coOccurrence = {};
        const productFrequency = {};

        orders.forEach(order => {
            const items = order.items || [];
            const productNames = items.map(i => i.name || i.productId);

            // Count individual product frequency
            productNames.forEach(name => {
                productFrequency[name] = (productFrequency[name] || 0) + 1;
            });

            // Count co-occurrences
            for (let i = 0; i < productNames.length; i++) {
                for (let j = i + 1; j < productNames.length; j++) {
                    const key1 = `${productNames[i]}|||${productNames[j]}`;
                    const key2 = `${productNames[j]}|||${productNames[i]}`;
                    coOccurrence[key1] = (coOccurrence[key1] || 0) + 1;
                    coOccurrence[key2] = (coOccurrence[key2] || 0) + 1;
                }
            }
        });

        // Generate recommendations
        let recommendations = [];

        if (productId) {
            // Recommendations for specific product
            const relatedProducts = [];
            Object.entries(coOccurrence).forEach(([key, count]) => {
                const [prod1, prod2] = key.split('|||');
                if (prod1 === productId) {
                    relatedProducts.push({
                        product: prod2,
                        coOccurrenceCount: count,
                        confidence: (count / (productFrequency[productId] || 1)) * 100
                    });
                }
            });
            recommendations = relatedProducts
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, parseInt(limit));
        } else {
            // Popular combinations (market basket analysis)
            const combinations = Object.entries(coOccurrence)
                .map(([key, count]) => {
                    const [prod1, prod2] = key.split('|||');
                    return {
                        products: [prod1, prod2],
                        count,
                        support: (count / orders.length) * 100
                    };
                })
                .filter(c => c.products[0] < c.products[1]) // Remove duplicates
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            recommendations = combinations;
        }

        // Best sellers
        const bestSellers = Object.entries(productFrequency)
            .map(([name, count]) => ({ name, orderCount: count }))
            .sort((a, b) => b.orderCount - a.orderCount)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            data: {
                recommendations,
                bestSellers,
                totalOrdersAnalyzed: orders.length
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==================== CUSTOMER INSIGHTS ====================

// Analyze customer behavior patterns
const getCustomerInsights = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        // Get orders with table info
        const orders = await Order.findAll({
            where: {
                createdAt: { [Op.between]: [start, end] },
                orderStatus: 'Completed'
            },
            attributes: ['bills', 'items', 'tableId', 'createdAt'],
            include: [{
                model: Table,
                as: 'table',
                attributes: ['tableNo', 'seats']
            }]
        });

        // Analyze patterns
        const tableUsage = {};
        const orderSizeDistribution = { small: 0, medium: 0, large: 0 };
        let totalOrderValue = 0;
        const orderValues = [];

        orders.forEach(order => {
            const value = order.bills?.totalWithTax || 0;
            const itemCount = order.items?.length || 0;
            totalOrderValue += value;
            orderValues.push(value);

            // Table usage
            if (order.tableId) {
                const tableKey = order.table?.tableNo || order.tableId;
                if (!tableUsage[tableKey]) {
                    tableUsage[tableKey] = { table: tableKey, seats: order.table?.seats || 0, orderCount: 0, totalRevenue: 0 };
                }
                tableUsage[tableKey].orderCount += 1;
                tableUsage[tableKey].totalRevenue += value;
            }

            // Order size distribution
            if (itemCount <= 2) orderSizeDistribution.small++;
            else if (itemCount <= 5) orderSizeDistribution.medium++;
            else orderSizeDistribution.large++;
        });

        // Calculate statistics
        orderValues.sort((a, b) => a - b);
        const medianValue = orderValues.length > 0
            ? orderValues[Math.floor(orderValues.length / 2)]
            : 0;

        // Top tables
        const topTables = Object.values(tableUsage)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalOrders: orders.length,
                    totalRevenue: totalOrderValue,
                    averageOrderValue: orders.length > 0 ? totalOrderValue / orders.length : 0,
                    medianOrderValue: medianValue
                },
                orderSizeDistribution: {
                    small: { label: "Kichik (1-2 ta)", count: orderSizeDistribution.small, percentage: (orderSizeDistribution.small / orders.length * 100) || 0 },
                    medium: { label: "O'rtacha (3-5 ta)", count: orderSizeDistribution.medium, percentage: (orderSizeDistribution.medium / orders.length * 100) || 0 },
                    large: { label: "Katta (6+ ta)", count: orderSizeDistribution.large, percentage: (orderSizeDistribution.large / orders.length * 100) || 0 }
                },
                topTables,
                period: { start, end }
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==================== REAL-TIME DASHBOARD ====================

// Get real-time analytics data
const getRealTimeAnalytics = async (req, res, next) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const yesterday = new Date(todayStart);
        yesterday.setDate(yesterday.getDate() - 1);

        const [todayOrders, yesterdayOrders, activeOrders, activeTables] = await Promise.all([
            Order.findAll({
                where: {
                    createdAt: { [Op.gte]: todayStart },
                    orderStatus: 'Completed'
                },
                attributes: ['bills', 'items', 'createdAt']
            }),
            Order.findAll({
                where: {
                    createdAt: { [Op.between]: [yesterday, todayStart] },
                    orderStatus: 'Completed'
                },
                attributes: ['bills']
            }),
            Order.count({
                where: { orderStatus: { [Op.in]: ['In Progress', 'Ready'] } }
            }),
            Table.count({
                where: { status: 'Booked' }
            })
        ]);

        // Calculate today's metrics
        let todayRevenue = 0;
        let todayItems = 0;
        const hourlyToday = Array(24).fill(0);

        todayOrders.forEach(order => {
            todayRevenue += order.bills?.totalWithTax || 0;
            todayItems += order.items?.length || 0;
            hourlyToday[order.createdAt.getHours()]++;
        });

        // Yesterday's revenue for comparison
        let yesterdayRevenue = 0;
        yesterdayOrders.forEach(order => {
            yesterdayRevenue += order.bills?.totalWithTax || 0;
        });

        // Calculate change
        const revenueChange = yesterdayRevenue > 0
            ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                realTime: {
                    todayRevenue,
                    todayOrders: todayOrders.length,
                    todayItems,
                    activeOrders,
                    activeTables,
                    averageOrderValue: todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0
                },
                comparison: {
                    yesterdayRevenue,
                    yesterdayOrders: yesterdayOrders.length,
                    revenueChange: Math.round(revenueChange * 100) / 100,
                    ordersChange: yesterdayOrders.length > 0
                        ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length * 100)
                        : 0
                },
                hourlyToday: hourlyToday.map((count, hour) => ({ hour, orders: count })),
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==================== HELPER FUNCTIONS ====================

function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

function calculateTrend(x, y) {
    const n = x.length;
    if (n < 2) return { slope: 0, intercept: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumXX += x[i] * x[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope: isNaN(slope) ? 0 : slope, intercept: isNaN(intercept) ? 0 : intercept };
}

function calculateConfidence(sampleSize) {
    if (sampleSize >= 8) return 'yuqori';
    if (sampleSize >= 4) return "o'rtacha";
    return 'past';
}

function generateDemandInsights(peakHours, topProducts, lowDemandProducts) {
    const insights = [];

    if (peakHours.length > 0) {
        insights.push({
            type: 'peak_hours',
            message: `Eng band soat: ${peakHours[0].hour}. Bu vaqtda ko'proq xodim kerak bo'lishi mumkin.`,
            priority: 'high'
        });
    }

    if (topProducts.length > 0) {
        insights.push({
            type: 'top_product',
            message: `"${topProducts[0].name}" eng ko'p talab qilinadigan mahsulot. Zaxirani ta'minlab turing.`,
            priority: 'medium'
        });
    }

    if (lowDemandProducts.length > 3) {
        insights.push({
            type: 'low_demand',
            message: `${lowDemandProducts.length} ta mahsulot past talab. Menyudan olib tashlashni ko'rib chiqing.`,
            priority: 'low'
        });
    }

    return insights;
}

module.exports = {
    getSalesAnalytics,
    getSalesForecast,
    getDemandAnalysis,
    getProductRecommendations,
    getCustomerInsights,
    getRealTimeAnalytics
};
