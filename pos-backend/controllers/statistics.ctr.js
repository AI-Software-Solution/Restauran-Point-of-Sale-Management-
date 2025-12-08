const { Product, Category, Table, Order, User } = require("../models");
const { Op } = require('sequelize');

const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);

// Maximum orders to process for statistics (to prevent memory issues)
const MAX_ORDERS_FOR_STATS = 10000;

const statistics = async (req, res, next) => {
    try {
        const now = dayjs();
        const startOfYear = now.startOf('year');

        // Get counts only (not full data) for overview stats
        const [
            categoriesCount,
            productsCount,
            tablesCount,
            usersCount,
            totalOrdersCount,
            inProgressCount,
            categories,
            products
        ] = await Promise.all([
            Category.count(),
            Product.count(),
            Table.count(),
            User.count(),
            Order.count(),
            Order.count({ where: { orderStatus: 'In Progress' } }),
            Category.findAll({ attributes: ['id', 'name'] }),
            Product.findAll({ attributes: ['id', 'name', 'price', 'categoryId'] })
        ]);

        // Only fetch orders from the current year for revenue calculations (with limit)
        const orders = await Order.findAll({
            where: {
                createdAt: { [Op.gte]: startOfYear.toDate() }
            },
            attributes: ['id', 'createdAt', 'orderStatus', 'items', 'bills'],
            order: [['createdAt', 'DESC']],
            limit: MAX_ORDERS_FOR_STATS
        });

        const startOfToday = now.startOf('day');
        const startOfWeek = now.startOf('week');
        const startOfMonth = now.startOf('month');

        let totalRevenue = 0;
        let dailyRevenue = 0;
        let weeklyRevenue = 0;
        let monthlyRevenue = 0;
        let yearlyRevenue = 0;

        const dailyRevenueHistory = Array(6).fill(0);    // 4-hour chunks
        const weeklyRevenueHistory = Array(7).fill(0);   // per day (Sun to Sat)
        const monthlyRevenueHistory = Array(4).fill(0);  // 4 weeks
        const yearlyRevenueHistory = Array(12).fill(0);  // Jan to Dec

        // Product sales tracking
        const productSales = {}; // { productId: { name, quantity, revenue, categoryId } }
        const categorySales = {}; // { categoryId: { name, revenue, orderCount } }

        // Initialize category sales
        categories.forEach(cat => {
            categorySales[cat.id] = {
                name: cat.name,
                revenue: 0,
                orderCount: 0
            };
        });

        // Initialize product sales
        products.forEach(product => {
            productSales[product.id] = {
                name: product.name,
                quantity: 0,
                revenue: 0,
                categoryId: product.categoryId,
                price: parseFloat(product.price) || 0
            };
        });

        for (const order of orders) {
            const orderDate = dayjs(order.createdAt);
            // Fallback qo'shish - eski orderlar uchun turli formatlarni qo'llab-quvvatlash
            const amount = order.bills?.totalWithTax
                || order.bills?.total
                || order.totalAmount
                || (order.items || []).reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
                || 0;

            totalRevenue += amount;

            // Process order items for product/category stats
            const items = order.items || [];
            const itemCategoriesInOrder = new Set();

            items.forEach(item => {
                const productId = item.id || item.productId;
                const quantity = item.quantity || 1;
                const itemPrice = item.price || 0;
                const itemRevenue = itemPrice * quantity;

                if (productSales[productId]) {
                    productSales[productId].quantity += quantity;
                    productSales[productId].revenue += itemRevenue;

                    const categoryId = productSales[productId].categoryId;
                    if (categoryId && categorySales[categoryId]) {
                        categorySales[categoryId].revenue += itemRevenue;
                        itemCategoriesInOrder.add(categoryId);
                    }
                }
            });

            // Count orders per category (one order can have multiple categories)
            itemCategoriesInOrder.forEach(catId => {
                if (categorySales[catId]) {
                    categorySales[catId].orderCount += 1;
                }
            });

            // Time comparisons
            if (orderDate.isSameOrAfter(startOfToday)) {
                dailyRevenue += amount;

                const hour = orderDate.hour();
                const partIndex = Math.floor(hour / 4); // 0 to 5
                dailyRevenueHistory[partIndex] += amount;
            }

            if (orderDate.isSameOrAfter(startOfWeek)) {
                weeklyRevenue += amount;

                const weekday = orderDate.day(); // 0 = Sunday
                weeklyRevenueHistory[weekday] += amount;
            }

            if (orderDate.isSameOrAfter(startOfMonth)) {
                monthlyRevenue += amount;

                const dayOfMonth = orderDate.date(); // 1-based
                const weekIndex = Math.floor((dayOfMonth - 1) / 7); // 0 to 3
                monthlyRevenueHistory[Math.min(weekIndex, 3)] += amount;
            }

            if (orderDate.isSameOrAfter(startOfYear)) {
                yearlyRevenue += amount;

                const monthIndex = orderDate.month(); // 0 = January
                yearlyRevenueHistory[monthIndex] += amount;
            }
        }

        // Get top products (sorted by quantity sold)
        const topProducts = Object.values(productSales)
            .filter(p => p.quantity > 0)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5)
            .map(p => ({
                name: p.name,
                quantity: p.quantity,
                revenue: p.revenue
            }));

        // Get category stats (sorted by revenue)
        const categoryStats = Object.values(categorySales)
            .filter(c => c.revenue > 0)
            .sort((a, b) => b.revenue - a.revenue)
            .map(c => ({
                name: c.name,
                revenue: c.revenue,
                orderCount: c.orderCount
            }));

        return res.status(200).json({
            totalCategories: categoriesCount,
            totalProducts: productsCount,
            totalTable: tablesCount,
            totalUsers: usersCount,
            totalOrders: totalOrdersCount,
            activeOrders: inProgressCount,
            totalRevenue,

            dailyRevenue,
            dailyRevenueHistory,
            dailyRevenueLabels: [
                "00:00–04:00", "04:00–08:00", "08:00–12:00",
                "12:00–16:00", "16:00–20:00", "20:00–00:00"
            ],

            weeklyRevenue,
            weeklyRevenueHistory,
            weeklyRevenueLabels: [
                "Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"
            ],

            monthlyRevenue,
            monthlyRevenueHistory,
            monthlyRevenueLabels: ["1-hafta", "2-hafta", "3-hafta", "4-hafta"],

            yearlyRevenue,
            yearlyRevenueHistory,
            yearlyRevenueLabels: [
                "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
                "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
            ],

            // New data for charts
            topProducts,
            categoryStats
        });

    } catch (error) {
        next(error);
    }
};

module.exports = statistics;
