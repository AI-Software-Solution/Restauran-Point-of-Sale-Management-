const createHttpError = require("http-errors");
const { Order, Table } = require("../models");
const { isValidId } = require("../utils/validators");

// Valid order statuses and transitions
const VALID_STATUSES = ['Pending', 'In Progress', 'Ready', 'Completed', 'Cancelled'];
const VALID_TRANSITIONS = {
    'Pending': ['In Progress', 'Cancelled'],
    'In Progress': ['Ready', 'Cancelled'],
    'Ready': ['Completed', 'Cancelled'],
    'Completed': [], // No transitions from Completed
    'Cancelled': []  // No transitions from Cancelled
};

const addOrder = async (req, res, next) => {
    try {
        const tableId = req.body.table || req.body.tableId || null;

        const orderData = {
            customerDetails: req.body.customerDetails,
            orderStatus: req.body.orderStatus || 'Pending',
            orderDate: req.body.orderDate || new Date(),
            bills: req.body.bills,
            items: req.body.items || [],
            tableId: tableId,
            paymentMethod: req.body.paymentMethod,
            paymentData: req.body.paymentData || null
        };

        const order = await Order.create(orderData);

        // Update Table status if order has a table
        if (tableId) {
            await Table.update(
                { status: 'Occupied', currentOrderId: order.id },
                { where: { id: tableId } }
            );
        }

        res.status(201).json({
            success: true,
            message: "Order created!",
            data: { ...order.toJSON(), _id: order.id, table: order.tableId }
        });
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            const error = createHttpError(400, "Invalid id!");
            return next(error);
        }

        const order = await Order.findByPk(id, {
            include: [{ model: Table, as: 'table' }]
        });

        if (!order) {
            const error = createHttpError(404, "Order not found!");
            return next(error);
        }

        res.status(200).json({
            success: true,
            data: { ...order.toJSON(), _id: order.id, table: order.tableId }
        });
    } catch (error) {
        next(error);
    }
};

const getOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, status, tableId, startDate, endDate } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        // Status filter
        if (status) {
            where.orderStatus = status;
        }

        // Table filter
        if (tableId) {
            where.tableId = tableId;
        }

        // Date range filter
        if (startDate || endDate) {
            const { Op } = require('sequelize');
            where.createdAt = {};
            if (startDate) {
                where.createdAt[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                where.createdAt[Op.lte] = new Date(endDate);
            }
        }

        const { count, rows: orders } = await Order.findAndCountAll({
            where,
            include: [{ model: Table, as: 'table' }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        const ordersWithId = orders.map(order => ({
            ...order.toJSON(),
            _id: order.id,
            table: order.table ? { ...order.table.toJSON(), _id: order.table.id } : null
        }));

        res.status(200).json({
            data: ordersWithId,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

const deleteOrders = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            const error = createHttpError(400, "Invalid id!");
            return next(error);
        }

        const order = await Order.findByPk(id);
        if (!order) {
            const error = createHttpError(404, "Order not found!");
            return next(error);
        }

        // Update table status if order has a table
        if (order.tableId) {
            await Table.update(
                { status: "Available", currentOrderId: null },
                { where: { id: order.tableId } }
            );
        }

        await Order.destroy({ where: { id } });

        res.status(200).json({ success: true, message: "order deleted successfully" });
    } catch (error) {
        next(error);
    }
};

const updateOrder = async (req, res, next) => {
    try {
        const { orderStatus } = req.body;
        const { id } = req.params;

        if (!isValidId(id)) {
            const error = createHttpError(400, "Invalid id!");
            return next(error);
        }

        const order = await Order.findByPk(id);

        if (!order) {
            const error = createHttpError(404, "Order not found!");
            return next(error);
        }

        // Validate order status
        if (orderStatus && !VALID_STATUSES.includes(orderStatus)) {
            const error = createHttpError(400, `Invalid order status. Valid statuses: ${VALID_STATUSES.join(', ')}`);
            return next(error);
        }

        // Validate status transition
        if (orderStatus && order.orderStatus !== orderStatus) {
            const allowedTransitions = VALID_TRANSITIONS[order.orderStatus] || [];
            if (!allowedTransitions.includes(orderStatus)) {
                const error = createHttpError(400,
                    `Invalid status transition from '${order.orderStatus}' to '${orderStatus}'. ` +
                    `Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`
                );
                return next(error);
            }
        }

        await Order.update({ orderStatus }, { where: { id } });

        // If order is completed or cancelled, make the table available
        if ((orderStatus === "Completed" || orderStatus === "Cancelled") && order.tableId) {
            await Table.update(
                { status: "Available", currentOrderId: null },
                { where: { id: order.tableId } }
            );
        }

        const updatedOrder = await Order.findByPk(id);

        res.status(200).json({
            success: true,
            message: "Order updated",
            data: { ...updatedOrder.toJSON(), _id: updatedOrder.id, table: updatedOrder.tableId }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { addOrder, getOrderById, getOrders, updateOrder, deleteOrders };
