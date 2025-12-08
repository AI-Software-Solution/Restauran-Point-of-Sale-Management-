const { User, Order, Product, Category, Table, ActivityLog, SystemSetting, sequelize } = require('../models');
const { Op } = require('sequelize');

// ==================== ACTIVITY LOG ====================

// Log an activity
const logActivity = async (userId, action, entityType = null, entityId = null, details = null, req = null) => {
    try {
        await ActivityLog.create({
            userId,
            action,
            entityType,
            entityId,
            details,
            ipAddress: req?.ip || req?.connection?.remoteAddress || null,
            userAgent: req?.headers?.['user-agent'] || null
        });
    } catch {
        // Activity log error - silently ignore
    }
};

// Get activity logs
const getActivityLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, userId, action, entityType, startDate, endDate } = req.query;

        const where = {};
        if (userId) where.userId = userId;
        if (action) where.action = { [Op.like]: `%${action}%` };
        if (entityType) where.entityType = entityType;
        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await ActivityLog.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'role']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==================== SYSTEM SETTINGS ====================

// Get all settings
const getSettings = async (req, res, next) => {
    try {
        const { category } = req.query;
        const where = {};
        if (category) where.category = category;

        const settings = await SystemSetting.findAll({
            where,
            order: [['category', 'ASC'], ['key', 'ASC']]
        });

        // Convert to key-value object grouped by category
        const grouped = settings.reduce((acc, setting) => {
            if (!acc[setting.category]) acc[setting.category] = {};

            let value = setting.value;
            if (setting.valueType === 'number') value = parseFloat(value);
            else if (setting.valueType === 'boolean') value = value === 'true';
            else if (setting.valueType === 'json') {
                try { value = JSON.parse(value); } catch (e) { }
            }

            acc[setting.category][setting.key] = {
                value,
                description: setting.description,
                valueType: setting.valueType
            };
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: grouped
        });
    } catch (error) {
        next(error);
    }
};

// Get single setting
const getSetting = async (req, res, next) => {
    try {
        const { key } = req.params;

        const setting = await SystemSetting.findOne({ where: { key } });

        if (!setting) {
            return res.status(404).json({
                success: false,
                message: 'Sozlama topilmadi'
            });
        }

        res.status(200).json({
            success: true,
            data: setting
        });
    } catch (error) {
        next(error);
    }
};

// Update or create setting
const updateSetting = async (req, res, next) => {
    try {
        const { key, value, valueType, category, description, isPublic } = req.body;

        const [setting, created] = await SystemSetting.findOrCreate({
            where: { key },
            defaults: {
                value: String(value),
                valueType: valueType || 'string',
                category: category || 'general',
                description,
                isPublic: isPublic || false
            }
        });

        if (!created) {
            await setting.update({
                value: String(value),
                valueType: valueType || setting.valueType,
                category: category || setting.category,
                description: description !== undefined ? description : setting.description,
                isPublic: isPublic !== undefined ? isPublic : setting.isPublic
            });
        }

        await logActivity(req.user?.id, 'update_setting', 'setting', setting.id, { key, value }, req);

        res.status(200).json({
            success: true,
            data: setting,
            created
        });
    } catch (error) {
        next(error);
    }
};

// Bulk update settings
const bulkUpdateSettings = async (req, res, next) => {
    try {
        const { settings } = req.body;
        // settings: [{ key, value, valueType, category, description }, ...]

        const results = [];
        for (const s of settings) {
            const [setting] = await SystemSetting.upsert({
                key: s.key,
                value: String(s.value),
                valueType: s.valueType || 'string',
                category: s.category || 'general',
                description: s.description || null
            });
            results.push(setting);
        }

        await logActivity(req.user?.id, 'bulk_update_settings', 'settings', null, { count: settings.length }, req);

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        next(error);
    }
};

// Initialize default settings
const initializeSettings = async (req, res, next) => {
    try {
        const defaultSettings = [
            // Business
            { key: 'business_name', value: 'Bobur Mirzo Restaurant', valueType: 'string', category: 'business', description: 'Restoran nomi' },
            { key: 'business_address', value: 'Urganch shahri', valueType: 'string', category: 'business', description: 'Manzil' },
            { key: 'business_phone', value: '+998901234567', valueType: 'string', category: 'business', description: 'Telefon' },
            { key: 'business_email', value: 'info@boburmirzo.uz', valueType: 'string', category: 'business', description: 'Email' },

            // Tax & Currency
            { key: 'tax_rate', value: '12', valueType: 'number', category: 'tax', description: 'Soliq foizi (%)' },
            { key: 'currency', value: 'UZS', valueType: 'string', category: 'tax', description: 'Valyuta' },
            { key: 'currency_symbol', value: "so'm", valueType: 'string', category: 'tax', description: 'Valyuta belgisi' },

            // Appearance
            { key: 'primary_color', value: '#F6B100', valueType: 'string', category: 'appearance', description: 'Asosiy rang' },
            { key: 'logo_url', value: '', valueType: 'string', category: 'appearance', description: 'Logo URL' },

            // Notifications
            { key: 'low_stock_alert', value: 'true', valueType: 'boolean', category: 'notifications', description: 'Kam qolgan mahsulot ogohlantirishlari' },
            { key: 'order_notification', value: 'true', valueType: 'boolean', category: 'notifications', description: 'Yangi buyurtma bildirishnomalari' },

            // Operations
            { key: 'auto_close_orders', value: 'false', valueType: 'boolean', category: 'operations', description: "Buyurtmalarni avtomatik yopish" },
            { key: 'require_table_for_order', value: 'true', valueType: 'boolean', category: 'operations', description: 'Buyurtma uchun stol majburiy' }
        ];

        let created = 0;
        for (const s of defaultSettings) {
            const [, wasCreated] = await SystemSetting.findOrCreate({
                where: { key: s.key },
                defaults: s
            });
            if (wasCreated) created++;
        }

        res.status(200).json({
            success: true,
            message: `${created} ta yangi sozlama yaratildi`,
            total: defaultSettings.length
        });
    } catch (error) {
        next(error);
    }
};

// ==================== ADMIN DASHBOARD ====================

// Get admin dashboard stats
const getAdminStats = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalUsers,
            totalOrders,
            totalProducts,
            totalCategories,
            totalTables,
            todayOrders,
            recentActivity
        ] = await Promise.all([
            User.count(),
            Order.count(),
            Product.count(),
            Category.count(),
            Table.count(),
            Order.count({ where: { createdAt: { [Op.gte]: today } } }),
            ActivityLog.findAll({
                include: [{ model: User, as: 'user', attributes: ['name', 'role'] }],
                order: [['createdAt', 'DESC']],
                limit: 10
            })
        ]);

        // Calculate revenue properly
        let revenue = 0;
        const completedOrders = await Order.findAll({
            where: {
                createdAt: { [Op.gte]: today },
                orderStatus: 'Completed'
            },
            attributes: ['bills']
        });
        completedOrders.forEach(o => {
            if (o.bills?.totalWithTax) {
                revenue += parseFloat(o.bills.totalWithTax);
            }
        });

        // User stats by role
        const usersByRole = await User.findAll({
            attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['role']
        });

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalOrders,
                    totalProducts,
                    totalCategories,
                    totalTables,
                    todayOrders,
                    todayRevenue: revenue
                },
                usersByRole: usersByRole.reduce((acc, u) => {
                    acc[u.role] = parseInt(u.get('count'));
                    return acc;
                }, {}),
                recentActivity
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==================== USER MANAGEMENT ====================

// Get all users with filters
const getUsers = async (req, res, next) => {
    try {
        const { role, status, search, page = 1, limit = 20 } = req.query;

        const where = {};
        if (role) where.role = role;
        if (status !== undefined) where.status = status === 'true';
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update user role/status
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, role, status, phone } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Foydalanuvchi topilmadi'
            });
        }

        // Prevent self-demotion from admin
        if (req.user.id === parseInt(id) && role && role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: "O'zingizning admin rolini o'zgartira olmaysiz"
            });
        }

        await user.update({
            name: name || user.name,
            role: role || user.role,
            status: status !== undefined ? status : user.status,
            phone: phone || user.phone
        });

        await logActivity(req.user?.id, 'update_user', 'user', id, { role, status }, req);

        const { password, ...userData } = user.toJSON();

        res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        next(error);
    }
};

// Delete user
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (req.user.id === parseInt(id)) {
            return res.status(400).json({
                success: false,
                message: "O'zingizni o'chira olmaysiz"
            });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Foydalanuvchi topilmadi'
            });
        }

        await logActivity(req.user?.id, 'delete_user', 'user', id, { email: user.email }, req);

        await user.destroy();

        res.status(200).json({
            success: true,
            message: "Foydalanuvchi o'chirildi"
        });
    } catch (error) {
        next(error);
    }
};

// ==================== REPORTS ====================

// Get sales report
const getSalesReport = async (req, res, next) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const orders = await Order.findAll({
            where: {
                createdAt: { [Op.between]: [start, end] },
                orderStatus: 'Completed'
            },
            attributes: ['id', 'bills', 'items', 'createdAt'],
            order: [['createdAt', 'ASC']]
        });

        // Group by date
        const salesByDate = {};
        let totalRevenue = 0;
        let totalOrders = 0;
        let totalItems = 0;

        orders.forEach(order => {
            const date = groupBy === 'month'
                ? order.createdAt.toISOString().slice(0, 7)
                : order.createdAt.toISOString().slice(0, 10);

            if (!salesByDate[date]) {
                salesByDate[date] = { date, revenue: 0, orders: 0, items: 0 };
            }

            const revenue = order.bills?.totalWithTax || 0;
            const items = order.items?.length || 0;

            salesByDate[date].revenue += revenue;
            salesByDate[date].orders += 1;
            salesByDate[date].items += items;

            totalRevenue += revenue;
            totalOrders += 1;
            totalItems += items;
        });

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    totalOrders,
                    totalItems,
                    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
                },
                dailySales: Object.values(salesByDate),
                period: { start, end }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get product performance report
const getProductReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const orders = await Order.findAll({
            where: {
                createdAt: { [Op.between]: [start, end] },
                orderStatus: 'Completed'
            },
            attributes: ['items']
        });

        // Aggregate product sales
        const productSales = {};
        orders.forEach(order => {
            (order.items || []).forEach(item => {
                const key = item.name || item.productId;
                if (!productSales[key]) {
                    productSales[key] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[key].quantity += item.quantity || 1;
                productSales[key].revenue += (item.price || 0) * (item.quantity || 1);
            });
        });

        // Sort by revenue
        const sortedProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue);

        res.status(200).json({
            success: true,
            data: {
                topProducts: sortedProducts.slice(0, 20),
                allProducts: sortedProducts,
                period: { start, end }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    // Activity Log
    logActivity,
    getActivityLogs,
    // Settings
    getSettings,
    getSetting,
    updateSetting,
    bulkUpdateSettings,
    initializeSettings,
    // Dashboard
    getAdminStats,
    // User Management
    getUsers,
    updateUser,
    deleteUser,
    // Reports
    getSalesReport,
    getProductReport
};
