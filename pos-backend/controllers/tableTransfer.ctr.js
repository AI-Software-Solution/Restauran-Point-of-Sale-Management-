const {
    TableTransfer,
    Table,
    Order,
    User,
    sequelize
} = require('../models');

// Buyurtmani boshqa stolga ko'chirish
const transferOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { tableId } = req.params;
        const { toTableId, reason } = req.body;
        const userId = req.user?._id;

        // Joriy stolni topish
        const fromTable = await Table.findByPk(tableId);
        if (!fromTable) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Joriy stol topilmadi' });
        }

        // Maqsad stolini topish
        const toTable = await Table.findByPk(toTableId);
        if (!toTable) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Maqsad stol topilmadi' });
        }

        // Maqsad stol bo'sh ekanligini tekshirish
        if (toTable.status === 'Occupied') {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Maqsad stol band' });
        }

        // Joriy stolda buyurtma borligini tekshirish
        if (!fromTable.currentOrderId) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Bu stolda buyurtma yo\'q' });
        }

        const orderId = fromTable.currentOrderId;
        const order = await Order.findByPk(orderId);

        // Transfer tarixini saqlash
        await TableTransfer.create({
            orderId,
            fromTableId: tableId,
            toTableId,
            transferType: 'move',
            reason,
            performedBy: userId
        }, { transaction });

        // Buyurtmani yangi stolga bog'lash
        await order.update({ tableId: toTableId }, { transaction });

        // Joriy stolni bo'shatish
        await fromTable.update({
            status: 'Available',
            currentOrderId: null
        }, { transaction });

        // Yangi stolni band qilish
        await toTable.update({
            status: 'Occupied',
            currentOrderId: orderId
        }, { transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: `Buyurtma ${fromTable.tableNo}-stoldan ${toTable.tableNo}-stolga ko'chirildi`,
            data: {
                fromTable: fromTable.tableNo,
                toTable: toTable.tableNo,
                orderId
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Transfer error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Stollarni birlashtirish (merge)
const mergeTables = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { sourceTableIds, targetTableId, reason } = req.body;
        const userId = req.user?._id;

        if (!sourceTableIds || sourceTableIds.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Manba stollar kerak' });
        }

        // Maqsad stolini topish
        const targetTable = await Table.findByPk(targetTableId);
        if (!targetTable) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Maqsad stol topilmadi' });
        }

        // Maqsad stolda buyurtma bormi
        let mainOrderId = targetTable.currentOrderId;
        let mainOrder = mainOrderId ? await Order.findByPk(mainOrderId) : null;

        const mergedItems = mainOrder ? [...(mainOrder.items || [])] : [];
        let totalAmount = mainOrder ? parseFloat(mainOrder.bills?.totalPayable || 0) : 0;

        // Har bir manba stolni qayta ishlash
        for (const sourceTableId of sourceTableIds) {
            if (sourceTableId === targetTableId) continue;

            const sourceTable = await Table.findByPk(sourceTableId);
            if (!sourceTable || !sourceTable.currentOrderId) continue;

            const sourceOrder = await Order.findByPk(sourceTable.currentOrderId);
            if (!sourceOrder) continue;

            // Transfer tarixini saqlash
            await TableTransfer.create({
                orderId: sourceOrder.id,
                fromTableId: sourceTableId,
                toTableId: targetTableId,
                transferType: 'merge',
                reason,
                performedBy: userId
            }, { transaction });

            // Itemlarni birlashtirish
            const sourceItems = sourceOrder.items || [];
            mergedItems.push(...sourceItems);
            totalAmount += parseFloat(sourceOrder.bills?.totalPayable || 0);

            // Manba buyurtmani cancelled qilish
            await sourceOrder.update({
                orderStatus: 'Cancelled',
                paymentData: {
                    ...sourceOrder.paymentData,
                    mergedTo: targetTableId,
                    mergedAt: new Date()
                }
            }, { transaction });

            // Manba stolni bo'shatish
            await sourceTable.update({
                status: 'Available',
                currentOrderId: null
            }, { transaction });
        }

        // Agar maqsad stolda buyurtma bo'lmasa, yangi yaratish
        if (!mainOrder && mergedItems.length > 0) {
            mainOrder = await Order.create({
                tableId: targetTableId,
                customerDetails: { name: 'Merged Order', guests: 0 },
                orderStatus: 'Pending',
                items: mergedItems,
                bills: {
                    subtotal: totalAmount,
                    tax: totalAmount * 0.1,
                    totalPayable: totalAmount * 1.1
                }
            }, { transaction });

            mainOrderId = mainOrder.id;
        } else if (mainOrder) {
            // Mavjud buyurtmani yangilash
            await mainOrder.update({
                items: mergedItems,
                bills: {
                    ...mainOrder.bills,
                    subtotal: totalAmount,
                    totalPayable: totalAmount * 1.1
                }
            }, { transaction });
        }

        // Maqsad stolni yangilash
        await targetTable.update({
            status: 'Occupied',
            currentOrderId: mainOrderId
        }, { transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: 'Stollar birlashtirildi',
            data: {
                targetTable: targetTable.tableNo,
                mergedTables: sourceTableIds,
                orderId: mainOrderId
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Merge error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Transfer tarixini olish
const getTransferHistory = async (req, res) => {
    try {
        const { tableId } = req.params;

        const transfers = await TableTransfer.findAll({
            where: {
                [require('sequelize').Op.or]: [
                    { fromTableId: tableId },
                    { toTableId: tableId }
                ]
            },
            include: [
                {
                    model: Table,
                    as: 'fromTable',
                    attributes: ['id', 'tableNo']
                },
                {
                    model: Table,
                    as: 'toTable',
                    attributes: ['id', 'tableNo']
                },
                {
                    model: User,
                    as: 'performer',
                    attributes: ['id', 'name']
                },
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'orderStatus', 'bills']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({ success: true, data: transfers });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Barcha transfer tarixini olish
const getAllTransfers = async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        const where = {};

        if (startDate && endDate) {
            where.createdAt = {
                [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        if (type) {
            where.transferType = type;
        }

        const transfers = await TableTransfer.findAll({
            where,
            include: [
                {
                    model: Table,
                    as: 'fromTable',
                    attributes: ['id', 'tableNo']
                },
                {
                    model: Table,
                    as: 'toTable',
                    attributes: ['id', 'tableNo']
                },
                {
                    model: User,
                    as: 'performer',
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 100
        });

        res.json({ success: true, data: transfers });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    transferOrder,
    mergeTables,
    getTransferHistory,
    getAllTransfers
};
