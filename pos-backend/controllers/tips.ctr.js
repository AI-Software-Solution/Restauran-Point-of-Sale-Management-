const {
    Tip,
    TipDistribution,
    Order,
    User,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

// Buyurtmaga tip qo'shish
const addTip = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { amount, percentage, paymentMethod, waiterId } = req.body;

        // Buyurtma mavjudligini tekshirish
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });
        }

        // Tip summani hisoblash
        let tipAmount = amount;
        if (!tipAmount && percentage) {
            const orderTotal = parseFloat(order.bills?.totalPayable || 0);
            tipAmount = orderTotal * (percentage / 100);
        }

        if (!tipAmount || tipAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Tip summasi noto\'g\'ri' });
        }

        const tip = await Tip.create({
            orderId,
            waiterId: waiterId || order.waiterId,
            amount: tipAmount.toFixed(2),
            percentage: percentage || null,
            paymentMethod: paymentMethod || 'cash',
            isDistributed: false
        });

        res.status(201).json({ success: true, data: tip });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Buyurtma uchun tiplarni olish
const getOrderTips = async (req, res) => {
    try {
        const { orderId } = req.params;

        const tips = await Tip.findAll({
            where: { orderId },
            include: [{
                model: User,
                as: 'waiter',
                attributes: ['id', 'name', 'role']
            }, {
                model: TipDistribution,
                as: 'distributions',
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'role']
                }]
            }]
        });

        res.json({ success: true, data: tips });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Ofitsiant bo'yicha tiplar
const getWaiterTips = async (req, res) => {
    try {
        const { waiterId } = req.params;
        const { startDate, endDate } = req.query;

        const where = { waiterId };

        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const tips = await Tip.findAll({
            where,
            include: [{
                model: Order,
                as: 'order',
                attributes: ['id', 'tableId', 'bills']
            }],
            order: [['createdAt', 'DESC']]
        });

        // Statistika
        const totalTips = tips.reduce((sum, tip) => sum + parseFloat(tip.amount), 0);
        const avgTip = tips.length > 0 ? totalTips / tips.length : 0;

        res.json({
            success: true,
            data: {
                tips,
                stats: {
                    totalTips: totalTips.toFixed(2),
                    avgTip: avgTip.toFixed(2),
                    count: tips.length
                }
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tipni taqsimlash (Pool system)
const distributeTip = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { tipId } = req.params;
        const { distributions } = req.body;

        // distributions: [{ userId, sharePercentage }, ...]

        const tip = await Tip.findByPk(tipId);
        if (!tip) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Tip topilmadi' });
        }

        if (tip.isDistributed) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Bu tip allaqachon taqsimlangan' });
        }

        const tipAmount = parseFloat(tip.amount);
        let totalPercentage = 0;

        // Taqsimotlarni yaratish
        for (const dist of distributions) {
            totalPercentage += dist.sharePercentage;

            const shareAmount = (tipAmount * dist.sharePercentage) / 100;

            await TipDistribution.create({
                tipId,
                userId: dist.userId,
                shareAmount: shareAmount.toFixed(2),
                sharePercentage: dist.sharePercentage
            }, { transaction });
        }

        // Tekshirish: 100% bo'lishi kerak
        if (Math.abs(totalPercentage - 100) > 0.01) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Taqsimot foizlari 100% bo\'lishi kerak'
            });
        }

        // Tipni distributed deb belgilash
        await tip.update({ isDistributed: true }, { transaction });

        await transaction.commit();

        // To'liq ma'lumotni qaytarish
        const result = await Tip.findByPk(tipId, {
            include: [{
                model: TipDistribution,
                as: 'distributions',
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'role']
                }]
            }]
        });

        res.json({ success: true, data: result });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

// Avtomatik taqsimlash (teng bo'lish)
const autoDistributeTip = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { tipId } = req.params;
        const { userIds } = req.body;

        if (!userIds || userIds.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Foydalanuvchilar kerak' });
        }

        const tip = await Tip.findByPk(tipId);
        if (!tip) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Tip topilmadi' });
        }

        if (tip.isDistributed) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Bu tip allaqachon taqsimlangan' });
        }

        const tipAmount = parseFloat(tip.amount);
        const sharePercentage = 100 / userIds.length;
        const shareAmount = tipAmount / userIds.length;

        for (const userId of userIds) {
            await TipDistribution.create({
                tipId,
                userId,
                shareAmount: shareAmount.toFixed(2),
                sharePercentage: sharePercentage.toFixed(2)
            }, { transaction });
        }

        await tip.update({ isDistributed: true }, { transaction });

        await transaction.commit();

        const result = await Tip.findByPk(tipId, {
            include: [{
                model: TipDistribution,
                as: 'distributions',
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'role']
                }]
            }]
        });

        res.json({ success: true, data: result });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tip hisoboti
const getTipsReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const where = {};
        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        // Umumiy statistika
        const tips = await Tip.findAll({
            where,
            include: [{
                model: User,
                as: 'waiter',
                attributes: ['id', 'name']
            }]
        });

        const totalTips = tips.reduce((sum, tip) => sum + parseFloat(tip.amount), 0);

        // Ofitsiantlar bo'yicha
        const waiterStats = {};
        for (const tip of tips) {
            const waiterId = tip.waiterId || 'unassigned';
            const waiterName = tip.waiter?.name || 'Belgilanmagan';

            if (!waiterStats[waiterId]) {
                waiterStats[waiterId] = {
                    name: waiterName,
                    total: 0,
                    count: 0
                };
            }

            waiterStats[waiterId].total += parseFloat(tip.amount);
            waiterStats[waiterId].count += 1;
        }

        // To'lov usuli bo'yicha
        const methodStats = {};
        for (const tip of tips) {
            const method = tip.paymentMethod || 'cash';
            if (!methodStats[method]) {
                methodStats[method] = 0;
            }
            methodStats[method] += parseFloat(tip.amount);
        }

        res.json({
            success: true,
            data: {
                totalTips: totalTips.toFixed(2),
                totalCount: tips.length,
                avgTip: tips.length > 0 ? (totalTips / tips.length).toFixed(2) : 0,
                byWaiter: Object.values(waiterStats),
                byMethod: methodStats
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tipni o'chirish
const deleteTip = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { tipId } = req.params;

        const tip = await Tip.findByPk(tipId);
        if (!tip) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Tip topilmadi' });
        }

        // Taqsimotlarni o'chirish
        await TipDistribution.destroy({
            where: { tipId },
            transaction
        });

        // Tipni o'chirish
        await tip.destroy({ transaction });

        await transaction.commit();

        res.json({ success: true, message: 'Tip o\'chirildi' });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    addTip,
    getOrderTips,
    getWaiterTips,
    distributeTip,
    autoDistributeTip,
    getTipsReport,
    deleteTip
};
