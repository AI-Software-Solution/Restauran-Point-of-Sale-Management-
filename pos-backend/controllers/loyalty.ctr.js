const {
    LoyaltyProgram,
    LoyaltyMember,
    LoyaltyTransaction,
    LoyaltyReward,
    Order,
    User,
    Product,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

// ==================== LOYALTY PROGRAM ====================

// Loyalty dasturini olish
const getProgram = async (req, res) => {
    try {
        let program = await LoyaltyProgram.findOne({ where: { isActive: true } });

        // Agar mavjud bo'lmasa, default yaratish
        if (!program) {
            program = await LoyaltyProgram.create({
                name: 'Restaurant Loyalty',
                pointsPerCurrency: 0.01, // 100 so'm = 1 ball
                minRedeemPoints: 100,
                pointValue: 100, // 1 ball = 100 so'm
                isActive: true
            });
        }

        res.json({ success: true, data: program });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Loyalty dasturini yangilash
const updateProgram = async (req, res) => {
    try {
        const program = await LoyaltyProgram.findOne({ where: { isActive: true } });

        if (!program) {
            return res.status(404).json({ success: false, message: 'Dastur topilmadi' });
        }

        await program.update(req.body);
        res.json({ success: true, data: program });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== LOYALTY MEMBERS ====================

// Yangi a'zo ro'yxatdan o'tkazish
const registerMember = async (req, res) => {
    try {
        const { phone, name, email, birthDate } = req.body;

        // Telefon mavjudligini tekshirish
        const existing = await LoyaltyMember.findOne({ where: { phone } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan'
            });
        }

        // Card number yaratish
        const cardNumber = `LOY${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;

        const member = await LoyaltyMember.create({
            phone,
            name,
            email,
            birthDate,
            cardNumber,
            currentPoints: 0,
            tier: 'bronze',
            isActive: true
        });

        res.status(201).json({ success: true, data: member });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Telefon bo'yicha a'zoni topish
const findMemberByPhone = async (req, res) => {
    try {
        const { phone } = req.params;

        const member = await LoyaltyMember.findOne({
            where: { phone, isActive: true },
            include: [{
                model: LoyaltyTransaction,
                as: 'transactions',
                limit: 10,
                order: [['createdAt', 'DESC']]
            }]
        });

        if (!member) {
            return res.status(404).json({ success: false, message: 'A\'zo topilmadi' });
        }

        res.json({ success: true, data: member });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Karta raqami bo'yicha a'zoni topish
const findMemberByCard = async (req, res) => {
    try {
        const { cardNumber } = req.params;

        const member = await LoyaltyMember.findOne({
            where: { cardNumber, isActive: true }
        });

        if (!member) {
            return res.status(404).json({ success: false, message: 'A\'zo topilmadi' });
        }

        res.json({ success: true, data: member });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Barcha a'zolarni olish
const getAllMembers = async (req, res) => {
    try {
        const { tier, search, page = 1, limit = 20 } = req.query;

        const where = { isActive: true };

        if (tier) {
            where.tier = tier;
        }

        if (search) {
            where[Op.or] = [
                { phone: { [Op.iLike]: `%${search}%` } },
                { name: { [Op.iLike]: `%${search}%` } },
                { cardNumber: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const offset = (page - 1) * limit;

        const { rows: members, count } = await LoyaltyMember.findAndCountAll({
            where,
            order: [['totalSpent', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            data: members,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// A'zo ma'lumotlarini yangilash
const updateMember = async (req, res) => {
    try {
        const { memberId } = req.params;

        const member = await LoyaltyMember.findByPk(memberId);
        if (!member) {
            return res.status(404).json({ success: false, message: 'A\'zo topilmadi' });
        }

        await member.update(req.body);
        res.json({ success: true, data: member });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== POINTS MANAGEMENT ====================

// Ball qo'shish (Earn)
const earnPoints = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { memberId } = req.params;
        const { orderId, orderAmount } = req.body;
        const userId = req.user?._id;

        const member = await LoyaltyMember.findByPk(memberId);
        if (!member) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'A\'zo topilmadi' });
        }

        // Dastur sozlamalarini olish
        const program = await LoyaltyProgram.findOne({ where: { isActive: true } });
        const pointsPerCurrency = program ? parseFloat(program.pointsPerCurrency) : 0.01;

        // Ballarni hisoblash
        const pointsEarned = Math.floor(orderAmount * pointsPerCurrency);

        if (pointsEarned <= 0) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Ball to\'plash uchun summa kam' });
        }

        const previousBalance = member.currentPoints;
        const newBalance = previousBalance + pointsEarned;

        // Tranzaksiyani saqlash
        await LoyaltyTransaction.create({
            memberId,
            orderId,
            transactionType: 'earn',
            points: pointsEarned,
            orderAmount,
            description: `Buyurtma #${orderId} uchun ball`,
            previousBalance,
            newBalance,
            performedBy: userId
        }, { transaction });

        // A'zo balansini yangilash
        await member.update({
            currentPoints: newBalance,
            totalEarned: member.totalEarned + pointsEarned,
            totalSpent: parseFloat(member.totalSpent) + parseFloat(orderAmount),
            visitCount: member.visitCount + 1,
            lastVisit: new Date()
        }, { transaction });

        // Tier yangilash
        await updateMemberTier(member, transaction);

        await transaction.commit();

        res.json({
            success: true,
            message: `${pointsEarned} ball qo'shildi`,
            data: {
                pointsEarned,
                newBalance,
                member: await LoyaltyMember.findByPk(memberId)
            }
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

// Ballarni sarflash (Redeem)
const redeemPoints = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { memberId } = req.params;
        const { points, rewardId, description } = req.body;
        const userId = req.user?._id;

        const member = await LoyaltyMember.findByPk(memberId);
        if (!member) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'A\'zo topilmadi' });
        }

        // Yetarli ball bormi
        if (member.currentPoints < points) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Yetarli ball yo\'q' });
        }

        // Minimum redeem tekshirish
        const program = await LoyaltyProgram.findOne({ where: { isActive: true } });
        if (program && points < program.minRedeemPoints) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Minimal ${program.minRedeemPoints} ball sarflash mumkin`
            });
        }

        const previousBalance = member.currentPoints;
        const newBalance = previousBalance - points;

        // Mukofot narhini hisoblash
        const pointValue = program ? parseFloat(program.pointValue) : 100;
        const discountValue = points * pointValue;

        // Tranzaksiyani saqlash
        await LoyaltyTransaction.create({
            memberId,
            transactionType: 'redeem',
            points: -points,
            description: description || `${points} ball sarflandi`,
            previousBalance,
            newBalance,
            performedBy: userId
        }, { transaction });

        // A'zo balansini yangilash
        await member.update({
            currentPoints: newBalance,
            totalRedeemed: member.totalRedeemed + points
        }, { transaction });

        // Agar reward bo'lsa, redemption ni yangilash
        if (rewardId) {
            const reward = await LoyaltyReward.findByPk(rewardId);
            if (reward) {
                await reward.update({
                    currentRedemptions: reward.currentRedemptions + 1
                }, { transaction });
            }
        }

        await transaction.commit();

        res.json({
            success: true,
            message: `${points} ball sarflandi`,
            data: {
                pointsRedeemed: points,
                discountValue,
                newBalance,
                member: await LoyaltyMember.findByPk(memberId)
            }
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

// Bonus ball qo'shish
const addBonusPoints = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { memberId } = req.params;
        const { points, description } = req.body;
        const userId = req.user?._id;

        const member = await LoyaltyMember.findByPk(memberId);
        if (!member) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'A\'zo topilmadi' });
        }

        const previousBalance = member.currentPoints;
        const newBalance = previousBalance + points;

        await LoyaltyTransaction.create({
            memberId,
            transactionType: 'bonus',
            points,
            description: description || 'Bonus ball',
            previousBalance,
            newBalance,
            performedBy: userId
        }, { transaction });

        await member.update({
            currentPoints: newBalance,
            totalEarned: member.totalEarned + points
        }, { transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: `${points} bonus ball qo'shildi`,
            data: await LoyaltyMember.findByPk(memberId)
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

// A'zo tranzaksiyalari
const getMemberTransactions = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const offset = (page - 1) * limit;

        const { rows: transactions, count } = await LoyaltyTransaction.findAndCountAll({
            where: { memberId },
            include: [{
                model: Order,
                as: 'order',
                attributes: ['id', 'bills', 'tableId']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            data: transactions,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== REWARDS ====================

// Barcha mukofotlarni olish
const getRewards = async (req, res) => {
    try {
        const { tier } = req.query;

        const where = { isActive: true };

        const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
        if (tier) {
            const tierIndex = tierOrder.indexOf(tier);
            where.minTier = {
                [Op.in]: tierOrder.slice(0, tierIndex + 1)
            };
        }

        const rewards = await LoyaltyReward.findAll({
            where,
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price', 'image']
            }],
            order: [['pointsRequired', 'ASC']]
        });

        res.json({ success: true, data: rewards });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mukofot yaratish
const createReward = async (req, res) => {
    try {
        const reward = await LoyaltyReward.create(req.body);
        res.status(201).json({ success: true, data: reward });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mukofot yangilash
const updateReward = async (req, res) => {
    try {
        const { rewardId } = req.params;

        const reward = await LoyaltyReward.findByPk(rewardId);
        if (!reward) {
            return res.status(404).json({ success: false, message: 'Mukofot topilmadi' });
        }

        await reward.update(req.body);
        res.json({ success: true, data: reward });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mukofot o'chirish
const deleteReward = async (req, res) => {
    try {
        const { rewardId } = req.params;

        const reward = await LoyaltyReward.findByPk(rewardId);
        if (!reward) {
            return res.status(404).json({ success: false, message: 'Mukofot topilmadi' });
        }

        await reward.update({ isActive: false });
        res.json({ success: true, message: 'Mukofot o\'chirildi' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== HELPER FUNCTIONS ====================

// Tier yangilash
async function updateMemberTier(member, transaction) {
    const totalSpent = parseFloat(member.totalSpent);

    let newTier = 'bronze';
    if (totalSpent >= 10000000) {
        newTier = 'platinum'; // 10M+
    } else if (totalSpent >= 5000000) {
        newTier = 'gold'; // 5M+
    } else if (totalSpent >= 1000000) {
        newTier = 'silver'; // 1M+
    }

    if (member.tier !== newTier) {
        await member.update({ tier: newTier }, { transaction });
    }
}

// Loyalty statistikasi
const getLoyaltyStats = async (req, res) => {
    try {
        const totalMembers = await LoyaltyMember.count({ where: { isActive: true } });

        const tierStats = await LoyaltyMember.findAll({
            attributes: [
                'tier',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('total_spent')), 'totalSpent']
            ],
            where: { isActive: true },
            group: ['tier']
        });

        const totalPointsIssued = await LoyaltyTransaction.sum('points', {
            where: { transactionType: 'earn' }
        }) || 0;

        const totalPointsRedeemed = await LoyaltyTransaction.sum('points', {
            where: { transactionType: 'redeem' }
        }) || 0;

        res.json({
            success: true,
            data: {
                totalMembers,
                tierStats,
                totalPointsIssued,
                totalPointsRedeemed: Math.abs(totalPointsRedeemed),
                activePoints: totalPointsIssued + totalPointsRedeemed
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    // Program
    getProgram,
    updateProgram,
    // Members
    registerMember,
    findMemberByPhone,
    findMemberByCard,
    getAllMembers,
    updateMember,
    // Points
    earnPoints,
    redeemPoints,
    addBonusPoints,
    getMemberTransactions,
    // Rewards
    getRewards,
    createReward,
    updateReward,
    deleteReward,
    // Stats
    getLoyaltyStats
};
