const { Floor, Table, Order } = require('../models');

// ==================== FLOOR CRUD ====================

// Get all floors with tables
const getFloors = async (req, res, next) => {
    try {
        const floors = await Floor.findAll({
            where: { isActive: true },
            include: [{
                model: Table,
                as: 'tables',
                include: [{
                    model: Order,
                    as: 'currentOrder',
                    attributes: ['id', 'orderStatus', 'bills']
                }]
            }],
            order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: floors
        });
    } catch (error) {
        next(error);
    }
};

// Get single floor with tables
const getFloor = async (req, res, next) => {
    try {
        const { id } = req.params;

        const floor = await Floor.findByPk(id, {
            include: [{
                model: Table,
                as: 'tables',
                include: [{
                    model: Order,
                    as: 'currentOrder',
                    attributes: ['id', 'orderStatus', 'bills', 'items']
                }]
            }]
        });

        if (!floor) {
            return res.status(404).json({
                success: false,
                message: 'Qavat topilmadi'
            });
        }

        res.status(200).json({
            success: true,
            data: floor
        });
    } catch (error) {
        next(error);
    }
};

// Create new floor
const createFloor = async (req, res, next) => {
    try {
        const { name, description, width, height, backgroundColor } = req.body;

        // Get max sortOrder
        const maxOrder = await Floor.max('sortOrder') || 0;

        const floor = await Floor.create({
            name,
            description,
            width: width || 800,
            height: height || 600,
            backgroundColor: backgroundColor || '#2d2d2d',
            sortOrder: maxOrder + 1
        });

        res.status(201).json({
            success: true,
            data: floor
        });
    } catch (error) {
        next(error);
    }
};

// Update floor
const updateFloor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, width, height, backgroundColor, sortOrder, isActive } = req.body;

        const floor = await Floor.findByPk(id);

        if (!floor) {
            return res.status(404).json({
                success: false,
                message: 'Qavat topilmadi'
            });
        }

        await floor.update({
            name: name !== undefined ? name : floor.name,
            description: description !== undefined ? description : floor.description,
            width: width !== undefined ? width : floor.width,
            height: height !== undefined ? height : floor.height,
            backgroundColor: backgroundColor !== undefined ? backgroundColor : floor.backgroundColor,
            sortOrder: sortOrder !== undefined ? sortOrder : floor.sortOrder,
            isActive: isActive !== undefined ? isActive : floor.isActive
        });

        res.status(200).json({
            success: true,
            data: floor
        });
    } catch (error) {
        next(error);
    }
};

// Delete floor (soft delete)
const deleteFloor = async (req, res, next) => {
    try {
        const { id } = req.params;

        const floor = await Floor.findByPk(id);

        if (!floor) {
            return res.status(404).json({
                success: false,
                message: 'Qavat topilmadi'
            });
        }

        // Remove floor reference from tables
        await Table.update({ floorId: null }, { where: { floorId: id } });

        await floor.update({ isActive: false });

        res.status(200).json({
            success: true,
            message: 'Qavat o\'chirildi'
        });
    } catch (error) {
        next(error);
    }
};

// ==================== TABLE POSITION MANAGEMENT ====================

// Update table position on floor plan
const updateTablePosition = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { floorId, posX, posY, width, height, shape, rotation } = req.body;

        const table = await Table.findByPk(id);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Stol topilmadi'
            });
        }

        // If floorId is provided, verify floor exists
        if (floorId) {
            const floor = await Floor.findByPk(floorId);
            if (!floor) {
                return res.status(404).json({
                    success: false,
                    message: 'Qavat topilmadi'
                });
            }
        }

        await table.update({
            floorId: floorId !== undefined ? floorId : table.floorId,
            posX: posX !== undefined ? posX : table.posX,
            posY: posY !== undefined ? posY : table.posY,
            width: width !== undefined ? width : table.width,
            height: height !== undefined ? height : table.height,
            shape: shape !== undefined ? shape : table.shape,
            rotation: rotation !== undefined ? rotation : table.rotation
        });

        res.status(200).json({
            success: true,
            data: table
        });
    } catch (error) {
        next(error);
    }
};

// Bulk update table positions (for drag & drop save)
const bulkUpdateTablePositions = async (req, res, next) => {
    try {
        const { tables } = req.body;
        // tables: [{ id, floorId, posX, posY, width, height, shape, rotation }, ...]

        if (!tables || !Array.isArray(tables)) {
            return res.status(400).json({
                success: false,
                message: 'Tables array kerak'
            });
        }

        const updatePromises = tables.map(async (t) => {
            const table = await Table.findByPk(t.id);
            if (table) {
                return table.update({
                    floorId: t.floorId !== undefined ? t.floorId : table.floorId,
                    posX: t.posX !== undefined ? t.posX : table.posX,
                    posY: t.posY !== undefined ? t.posY : table.posY,
                    width: t.width !== undefined ? t.width : table.width,
                    height: t.height !== undefined ? t.height : table.height,
                    shape: t.shape !== undefined ? t.shape : table.shape,
                    rotation: t.rotation !== undefined ? t.rotation : table.rotation
                });
            }
            return null;
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            message: `${tables.length} ta stol yangilandi`
        });
    } catch (error) {
        next(error);
    }
};

// Get tables not assigned to any floor (for assignment)
const getUnassignedTables = async (req, res, next) => {
    try {
        const tables = await Table.findAll({
            where: { floorId: null },
            include: [{
                model: Order,
                as: 'currentOrder',
                attributes: ['id', 'orderStatus', 'bills']
            }]
        });

        res.status(200).json({
            success: true,
            data: tables
        });
    } catch (error) {
        next(error);
    }
};

// Get floor plan statistics
const getFloorStats = async (req, res, next) => {
    try {
        const floors = await Floor.findAll({
            where: { isActive: true },
            include: [{
                model: Table,
                as: 'tables'
            }]
        });

        const stats = floors.map(floor => {
            const tables = floor.tables || [];
            const available = tables.filter(t => t.status === 'Available').length;
            const occupied = tables.filter(t => t.status === 'Occupied').length;
            const reserved = tables.filter(t => t.status === 'Reserved').length;
            const totalSeats = tables.reduce((sum, t) => sum + (t.seats || 0), 0);

            return {
                id: floor.id,
                name: floor.name,
                totalTables: tables.length,
                available,
                occupied,
                reserved,
                totalSeats,
                occupancyRate: tables.length > 0 ? Math.round((occupied / tables.length) * 100) : 0
            };
        });

        // Overall stats
        const overall = {
            totalFloors: floors.length,
            totalTables: stats.reduce((sum, s) => sum + s.totalTables, 0),
            totalAvailable: stats.reduce((sum, s) => sum + s.available, 0),
            totalOccupied: stats.reduce((sum, s) => sum + s.occupied, 0),
            totalReserved: stats.reduce((sum, s) => sum + s.reserved, 0),
            totalSeats: stats.reduce((sum, s) => sum + s.totalSeats, 0)
        };

        res.status(200).json({
            success: true,
            data: {
                floors: stats,
                overall
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    // Floor CRUD
    getFloors,
    getFloor,
    createFloor,
    updateFloor,
    deleteFloor,
    // Table Position
    updateTablePosition,
    bulkUpdateTablePositions,
    getUnassignedTables,
    // Stats
    getFloorStats
};
