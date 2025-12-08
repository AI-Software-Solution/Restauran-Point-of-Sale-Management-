const { Order, Table, Product } = require('../../../models/index');
const ApiResponse = require('../../shared/utils/apiResponse');
const { asyncHandler } = require('../../shared/middlewares/errorHandler');
const { emit, WS_EVENTS, ROOMS } = require('../../config/websocket');
const logger = require('../../shared/utils/logger');
const { Op } = require('sequelize');

// Kitchen order statuses
const KITCHEN_STATUS = {
    NEW: 'new',
    PREPARING: 'preparing',
    READY: 'ready',
    SERVED: 'served'
};

/**
 * Get active orders for kitchen display
 */
const getActiveOrders = asyncHandler(async (req, res) => {
    const orders = await Order.findAll({
        where: {
            orderStatus: {
                [Op.in]: ['Pending', 'In Progress']
            }
        },
        include: [
            {
                model: Table,
                as: 'tableInfo',
                attributes: ['id', 'tableNo', 'status']
            }
        ],
        order: [['createdAt', 'ASC']], // Oldest first
        limit: 50
    });

    // Format orders for kitchen display
    const kitchenOrders = orders.map(order => {
        const orderData = order.toJSON();
        const createdAt = new Date(orderData.createdAt);
        const now = new Date();
        const waitTimeMinutes = Math.floor((now - createdAt) / 60000);

        return {
            id: orderData.id,
            orderNumber: orderData.id.slice(-6).toUpperCase(),
            tableNo: orderData.tableInfo?.tableNo || 'Olib ketish',
            orderType: orderData.customerDetails?.orderType || 'dine-in',
            customerName: orderData.customerDetails?.name || 'Mehmon',
            items: orderData.items || [],
            status: orderData.orderStatus === 'Pending' ? KITCHEN_STATUS.NEW : KITCHEN_STATUS.PREPARING,
            createdAt: orderData.createdAt,
            waitTime: waitTimeMinutes,
            priority: waitTimeMinutes > 15 ? 'high' : waitTimeMinutes > 10 ? 'medium' : 'normal',
            notes: orderData.notes || ''
        };
    });

    ApiResponse.success(res, {
        orders: kitchenOrders,
        count: kitchenOrders.length,
        stats: {
            newOrders: kitchenOrders.filter(o => o.status === KITCHEN_STATUS.NEW).length,
            preparing: kitchenOrders.filter(o => o.status === KITCHEN_STATUS.PREPARING).length,
            avgWaitTime: kitchenOrders.length > 0
                ? Math.round(kitchenOrders.reduce((sum, o) => sum + o.waitTime, 0) / kitchenOrders.length)
                : 0
        }
    });
});

/**
 * Get single order details for kitchen
 */
const getOrderDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
        include: [
            {
                model: Table,
                as: 'tableInfo',
                attributes: ['id', 'tableNo', 'status']
            }
        ]
    });

    if (!order) {
        return ApiResponse.notFound(res, 'Buyurtma topilmadi');
    }

    const orderData = order.toJSON();
    const createdAt = new Date(orderData.createdAt);
    const now = new Date();
    const waitTimeMinutes = Math.floor((now - createdAt) / 60000);

    ApiResponse.success(res, {
        id: orderData.id,
        orderNumber: orderData.id.slice(-6).toUpperCase(),
        tableNo: orderData.tableInfo?.tableNo || 'Olib ketish',
        orderType: orderData.customerDetails?.orderType || 'dine-in',
        customerName: orderData.customerDetails?.name || 'Mehmon',
        items: orderData.items || [],
        status: orderData.orderStatus,
        createdAt: orderData.createdAt,
        waitTime: waitTimeMinutes,
        notes: orderData.notes || ''
    });
});

/**
 * Update order status from kitchen
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id, {
        include: [
            {
                model: Table,
                as: 'tableInfo',
                attributes: ['id', 'tableNo']
            }
        ]
    });

    if (!order) {
        return ApiResponse.notFound(res, 'Buyurtma topilmadi');
    }

    // Map kitchen status to order status
    let orderStatus;
    switch (status) {
        case KITCHEN_STATUS.PREPARING:
            orderStatus = 'In Progress';
            break;
        case KITCHEN_STATUS.READY:
            orderStatus = 'Ready';
            break;
        case KITCHEN_STATUS.SERVED:
            orderStatus = 'Completed';
            break;
        default:
            orderStatus = 'Pending';
    }

    await order.update({ orderStatus });

    // Emit WebSocket event
    emit.orderStatusChanged(order.id, orderStatus, {
        tableNo: order.tableInfo?.tableNo,
        customerName: order.customerDetails?.name
    });

    // If ready, send notification to POS
    if (status === KITCHEN_STATUS.READY) {
        emit.kitchenOrderReady(order.id, order.tableInfo?.tableNo || 'Olib ketish');
    }

    logger.info('Order status updated from kitchen', {
        orderId: order.id,
        newStatus: orderStatus,
        tableNo: order.tableInfo?.tableNo
    });

    ApiResponse.success(res, {
        message: 'Status yangilandi',
        orderId: order.id,
        status: orderStatus
    });
});

/**
 * Bump order (mark as ready)
 */
const bumpOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
        include: [
            {
                model: Table,
                as: 'tableInfo',
                attributes: ['id', 'tableNo']
            }
        ]
    });

    if (!order) {
        return ApiResponse.notFound(res, 'Buyurtma topilmadi');
    }

    await order.update({ orderStatus: 'Ready' });

    // Emit WebSocket events
    emit.orderStatusChanged(order.id, 'Ready', {
        tableNo: order.tableInfo?.tableNo,
        customerName: order.customerDetails?.name
    });

    emit.kitchenOrderReady(order.id, order.tableInfo?.tableNo || 'Olib ketish');

    // Play sound notification on POS (via WebSocket)
    emit.toRoom(ROOMS.POS, 'order:ready:sound', {
        orderId: order.id,
        tableNo: order.tableInfo?.tableNo || 'Olib ketish'
    });

    logger.info('Order bumped (ready)', {
        orderId: order.id,
        tableNo: order.tableInfo?.tableNo
    });

    ApiResponse.success(res, {
        message: 'Buyurtma tayyor!',
        orderId: order.id
    });
});

/**
 * Acknowledge order (start preparing)
 */
const acknowledgeOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findByPk(id);

    if (!order) {
        return ApiResponse.notFound(res, 'Buyurtma topilmadi');
    }

    await order.update({ orderStatus: 'In Progress' });

    // Emit WebSocket event
    emit.orderStatusChanged(order.id, 'In Progress');

    logger.info('Order acknowledged', { orderId: order.id });

    ApiResponse.success(res, {
        message: 'Buyurtma qabul qilindi',
        orderId: order.id
    });
});

/**
 * Get kitchen statistics
 */
const getKitchenStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's orders
    const todayOrders = await Order.findAll({
        where: {
            createdAt: { [Op.gte]: today }
        },
        attributes: ['id', 'orderStatus', 'createdAt', 'updatedAt']
    });

    // Calculate stats
    const stats = {
        totalOrders: todayOrders.length,
        completed: todayOrders.filter(o => o.orderStatus === 'Completed').length,
        inProgress: todayOrders.filter(o => o.orderStatus === 'In Progress').length,
        pending: todayOrders.filter(o => o.orderStatus === 'Pending').length,
        ready: todayOrders.filter(o => o.orderStatus === 'Ready').length
    };

    // Calculate average preparation time
    const completedOrders = todayOrders.filter(o => o.orderStatus === 'Completed');
    let avgPrepTime = 0;
    if (completedOrders.length > 0) {
        const totalPrepTime = completedOrders.reduce((sum, order) => {
            const created = new Date(order.createdAt);
            const updated = new Date(order.updatedAt);
            return sum + (updated - created);
        }, 0);
        avgPrepTime = Math.round(totalPrepTime / completedOrders.length / 60000); // minutes
    }

    stats.avgPrepTime = avgPrepTime;
    stats.completionRate = stats.totalOrders > 0
        ? ((stats.completed / stats.totalOrders) * 100).toFixed(1)
        : 0;

    ApiResponse.success(res, stats);
});

/**
 * Recall order (move back to preparing)
 */
const recallOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findByPk(id);

    if (!order) {
        return ApiResponse.notFound(res, 'Buyurtma topilmadi');
    }

    await order.update({ orderStatus: 'In Progress' });

    emit.orderStatusChanged(order.id, 'In Progress');

    logger.info('Order recalled', { orderId: order.id });

    ApiResponse.success(res, {
        message: 'Buyurtma qaytarildi',
        orderId: order.id
    });
});

module.exports = {
    getActiveOrders,
    getOrderDetails,
    updateOrderStatus,
    bumpOrder,
    acknowledgeOrder,
    getKitchenStats,
    recallOrder,
    KITCHEN_STATUS
};
