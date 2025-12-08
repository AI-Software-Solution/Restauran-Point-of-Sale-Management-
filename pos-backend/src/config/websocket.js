const { Server } = require('socket.io');
const logger = require('../shared/utils/logger');

let io = null;

// WebSocket event types
const WS_EVENTS = {
    // Order events
    ORDER_CREATED: 'order:created',
    ORDER_UPDATED: 'order:updated',
    ORDER_STATUS_CHANGED: 'order:status_changed',
    ORDER_COMPLETED: 'order:completed',
    ORDER_CANCELLED: 'order:cancelled',

    // Kitchen events
    KITCHEN_NEW_ORDER: 'kitchen:new_order',
    KITCHEN_ORDER_READY: 'kitchen:order_ready',
    KITCHEN_ORDER_BUMP: 'kitchen:order_bump',

    // Table events
    TABLE_STATUS_CHANGED: 'table:status_changed',
    TABLE_ORDER_ASSIGNED: 'table:order_assigned',

    // Payment events
    PAYMENT_RECEIVED: 'payment:received',
    PAYMENT_FAILED: 'payment:failed',

    // Dashboard events
    STATS_UPDATED: 'stats:updated',
    REVENUE_UPDATED: 'revenue:updated',

    // Inventory events
    STOCK_LOW: 'stock:low',
    STOCK_OUT: 'stock:out',
    STOCK_UPDATED: 'stock:updated',

    // Notification events
    NOTIFICATION: 'notification'
};

// Room names
const ROOMS = {
    KITCHEN: 'kitchen',
    DASHBOARD: 'dashboard',
    POS: 'pos',
    INVENTORY: 'inventory',
    ADMIN: 'admin'
};

const initializeWebSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    io.on('connection', (socket) => {
        logger.info('WebSocket client connected', { socketId: socket.id });

        // Join specific rooms based on client type
        socket.on('join:room', (room) => {
            if (Object.values(ROOMS).includes(room)) {
                socket.join(room);
                logger.info('Client joined room', { socketId: socket.id, room });
            }
        });

        // Leave room
        socket.on('leave:room', (room) => {
            socket.leave(room);
            logger.info('Client left room', { socketId: socket.id, room });
        });

        // Handle kitchen order acknowledgment
        socket.on('kitchen:acknowledge', (orderId) => {
            io.to(ROOMS.POS).emit('order:acknowledged', { orderId });
            logger.info('Order acknowledged by kitchen', { orderId });
        });

        // Handle order ready notification
        socket.on('kitchen:ready', (orderId) => {
            io.to(ROOMS.POS).emit(WS_EVENTS.KITCHEN_ORDER_READY, { orderId });
            logger.info('Order ready in kitchen', { orderId });
        });

        socket.on('disconnect', (reason) => {
            logger.info('WebSocket client disconnected', { socketId: socket.id, reason });
        });

        socket.on('error', (error) => {
            logger.error('WebSocket error', { socketId: socket.id, error: error.message });
        });
    });

    logger.info('WebSocket server initialized');
    return io;
};

// Emit helpers
const emit = {
    // Emit to all connected clients
    toAll(event, data) {
        if (io) io.emit(event, data);
    },

    // Emit to specific room
    toRoom(room, event, data) {
        if (io) io.to(room).emit(event, data);
    },

    // Emit to specific socket
    toSocket(socketId, event, data) {
        if (io) io.to(socketId).emit(event, data);
    },

    // Order events
    orderCreated(order) {
        this.toAll(WS_EVENTS.ORDER_CREATED, order);
        this.toRoom(ROOMS.KITCHEN, WS_EVENTS.KITCHEN_NEW_ORDER, order);
    },

    orderUpdated(order) {
        this.toAll(WS_EVENTS.ORDER_UPDATED, order);
    },

    orderStatusChanged(orderId, status, order) {
        this.toAll(WS_EVENTS.ORDER_STATUS_CHANGED, { orderId, status, order });
    },

    orderCompleted(order) {
        this.toAll(WS_EVENTS.ORDER_COMPLETED, order);
        this.toRoom(ROOMS.DASHBOARD, WS_EVENTS.STATS_UPDATED, { type: 'order_completed' });
    },

    // Kitchen events
    kitchenOrderReady(orderId, tableNumber) {
        this.toRoom(ROOMS.POS, WS_EVENTS.KITCHEN_ORDER_READY, { orderId, tableNumber });
    },

    // Payment events
    paymentReceived(payment) {
        this.toAll(WS_EVENTS.PAYMENT_RECEIVED, payment);
        this.toRoom(ROOMS.DASHBOARD, WS_EVENTS.REVENUE_UPDATED, { amount: payment.amount });
    },

    // Table events
    tableStatusChanged(tableId, status) {
        this.toAll(WS_EVENTS.TABLE_STATUS_CHANGED, { tableId, status });
    },

    // Stock events
    stockAlert(product, currentStock, minStock) {
        const event = currentStock === 0 ? WS_EVENTS.STOCK_OUT : WS_EVENTS.STOCK_LOW;
        this.toRoom(ROOMS.INVENTORY, event, { product, currentStock, minStock });
        this.toRoom(ROOMS.ADMIN, event, { product, currentStock, minStock });
    },

    // Dashboard stats
    statsUpdated(stats) {
        this.toRoom(ROOMS.DASHBOARD, WS_EVENTS.STATS_UPDATED, stats);
    },

    // Notifications
    notification(userId, message, type = 'info') {
        // For user-specific notifications, we'd need user socket mapping
        this.toAll(WS_EVENTS.NOTIFICATION, { userId, message, type, timestamp: new Date() });
    }
};

const getIO = () => io;

module.exports = {
    initializeWebSocket,
    getIO,
    emit,
    WS_EVENTS,
    ROOMS
};
