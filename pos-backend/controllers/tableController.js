const { Table, Order } = require("../models");
const createHttpError = require("http-errors");
const { isValidId } = require("../utils/validators");

const addTable = async (req, res, next) => {
    try {
        const { tableNo, seats } = req.body;

        if (!tableNo) {
            const error = createHttpError(400, "Please provide table No!");
            return next(error);
        }

        const isTablePresent = await Table.findOne({ where: { tableNo } });

        if (isTablePresent) {
            const error = createHttpError(400, "Table already exist!");
            return next(error);
        }

        const newTable = await Table.create({ tableNo, seats });
        res.status(201).json({ ...newTable.toJSON(), _id: newTable.id });
    } catch (error) {
        next(error);
    }
};

const getTables = async (req, res, next) => {
    try {
        const tables = await Table.findAll({
            include: [{
                model: Order,
                as: 'currentOrder',
                attributes: ['customerDetails']
            }]
        });

        const tablesWithId = tables.map(table => ({
            ...table.toJSON(),
            _id: table.id,
            currentOrder: table.currentOrder ? {
                ...table.currentOrder.toJSON(),
                _id: table.currentOrder.id
            } : null
        }));

        res.status(200).json(tablesWithId);
    } catch (error) {
        next(error);
    }
};

const deleteTable = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            const error = createHttpError(400, "Invalid id!");
            return next(error);
        }

        const deleted = await Table.destroy({ where: { id } });

        if (!deleted) {
            const error = createHttpError(404, "Table not found!");
            return next(error);
        }

        res.status(200).json({ success: true, message: "Table deleted successfully" });
    } catch (error) {
        next(error);
    }
};

const updateTable = async (req, res, next) => {
    try {
        const { status, orderId } = req.body;
        const { id } = req.params;

        if (status === "takeaway") {
            return res.status(200).json({
                success: true,
                message: "Takeaway order does not require a table update."
            });
        }

        if (!isValidId(id)) {
            return next(createHttpError(400, "Invalid id!"));
        }

        const [rowsUpdated] = await Table.update(
            { status, currentOrderId: orderId },
            { where: { id } }
        );

        if (rowsUpdated === 0) {
            return next(createHttpError(404, "Table not found!"));
        }

        const table = await Table.findByPk(id);
        res.status(200).json({
            success: true,
            message: "Table updated!",
            data: { ...table.toJSON(), _id: table.id }
        });
    } catch (error) {
        next(error);
    }
};

const availableTable = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            const error = createHttpError(400, "Invalid id!");
            return next(error);
        }

        const [rowsUpdated] = await Table.update(
            { status: "Available", currentOrderId: null },
            { where: { id } }
        );

        if (rowsUpdated === 0) {
            const error = createHttpError(404, "Table not found!");
            return next(error);
        }

        const table = await Table.findByPk(id);
        res.status(200).json({
            success: true,
            message: "Table marked as available!",
            data: { ...table.toJSON(), _id: table.id }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { addTable, getTables, updateTable, deleteTable, availableTable };
