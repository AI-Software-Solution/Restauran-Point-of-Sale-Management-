const {
    BillSplit,
    GuestBill,
    GuestBillItem,
    Order,
    Table,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

// Buyurtma uchun hisobni bo'lish
const createBillSplit = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { orderId } = req.params;
        const { splitType, totalGuests, guestAssignments } = req.body;

        // Buyurtmani topish
        const order = await Order.findByPk(orderId);
        if (!order) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });
        }

        // Mavjud split bormi tekshirish
        const existingSplit = await BillSplit.findOne({ where: { orderId } });
        if (existingSplit) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Bu buyurtma uchun allaqachon split mavjud' });
        }

        // Bill split yaratish
        const billSplit = await BillSplit.create({
            orderId,
            splitType: splitType || 'equal',
            totalGuests: totalGuests || 2,
            status: 'active'
        }, { transaction });

        // Buyurtma ma'lumotlari
        const orderBills = order.bills || {};
        const orderItems = order.items || [];

        // Null check for bills data
        if (!orderBills || !orderBills.totalPayable) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Buyurtma hisob ma\'lumotlari topilmadi. Iltimos, avval buyurtmani yakunlang.'
            });
        }

        const totalAmount = parseFloat(orderBills.totalPayable) || 0;
        const taxRate = orderBills.tax && orderBills.subtotal
            ? parseFloat(orderBills.tax) / parseFloat(orderBills.subtotal)
            : 0.12; // Default 12% tax rate

        // Mehmonlar uchun hisob yaratish
        const guestBills = [];

        if (splitType === 'equal') {
            // Teng bo'lish
            const amountPerGuest = totalAmount / totalGuests;
            const subtotalPerGuest = amountPerGuest / (1 + taxRate);
            const taxPerGuest = amountPerGuest - subtotalPerGuest;

            for (let i = 1; i <= totalGuests; i++) {
                const guestBill = await GuestBill.create({
                    billSplitId: billSplit.id,
                    guestNumber: i,
                    guestName: `Mehmon ${i}`,
                    subtotal: subtotalPerGuest.toFixed(2),
                    tax: taxPerGuest.toFixed(2),
                    total: amountPerGuest.toFixed(2),
                    paymentStatus: 'pending'
                }, { transaction });
                guestBills.push(guestBill);
            }
        } else if (splitType === 'by_item' && guestAssignments) {
            // Mahsulot bo'yicha bo'lish
            const guestTotals = {};

            // Har bir mehmon uchun jami hisoblash
            for (const assignment of guestAssignments) {
                const { guestNumber, productId, quantity, unitPrice, productName } = assignment;

                if (!guestTotals[guestNumber]) {
                    guestTotals[guestNumber] = {
                        subtotal: 0,
                        items: []
                    };
                }

                const itemTotal = quantity * unitPrice;
                guestTotals[guestNumber].subtotal += itemTotal;
                guestTotals[guestNumber].items.push({
                    productId,
                    productName,
                    quantity,
                    unitPrice,
                    totalPrice: itemTotal
                });
            }

            // Guest billlar yaratish
            for (const [guestNum, data] of Object.entries(guestTotals)) {
                const tax = data.subtotal * taxRate;
                const total = data.subtotal + tax;

                const guestBill = await GuestBill.create({
                    billSplitId: billSplit.id,
                    guestNumber: parseInt(guestNum),
                    guestName: `Mehmon ${guestNum}`,
                    subtotal: data.subtotal.toFixed(2),
                    tax: tax.toFixed(2),
                    total: total.toFixed(2),
                    paymentStatus: 'pending'
                }, { transaction });

                // Guest bill items yaratish
                for (const item of data.items) {
                    await GuestBillItem.create({
                        guestBillId: guestBill.id,
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice
                    }, { transaction });
                }

                guestBills.push(guestBill);
            }
        } else if (splitType === 'custom') {
            // Ixtiyoriy summa bo'yicha bo'lish - frontenddan keladi
            for (let i = 1; i <= totalGuests; i++) {
                const guestBill = await GuestBill.create({
                    billSplitId: billSplit.id,
                    guestNumber: i,
                    guestName: `Mehmon ${i}`,
                    subtotal: 0,
                    tax: 0,
                    total: 0,
                    paymentStatus: 'pending'
                }, { transaction });
                guestBills.push(guestBill);
            }
        }

        await transaction.commit();

        // To'liq ma'lumotni qaytarish
        const result = await BillSplit.findByPk(billSplit.id, {
            include: [{
                model: GuestBill,
                as: 'guestBills',
                include: [{
                    model: GuestBillItem,
                    as: 'items'
                }]
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Hisob muvaffaqiyatli bo\'lindi',
            data: result
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Bill split error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Buyurtma uchun split ma'lumotlarini olish
const getBillSplit = async (req, res) => {
    try {
        const { orderId } = req.params;

        const billSplit = await BillSplit.findOne({
            where: { orderId },
            include: [{
                model: GuestBill,
                as: 'guestBills',
                include: [{
                    model: GuestBillItem,
                    as: 'items'
                }],
                order: [['guestNumber', 'ASC']]
            }, {
                model: Order,
                as: 'order'
            }]
        });

        if (!billSplit) {
            return res.status(404).json({ success: false, message: 'Split topilmadi' });
        }

        res.json({ success: true, data: billSplit });

    } catch (error) {
        console.error('Get bill split error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mehmon hisobini to'lash
const payGuestBill = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { orderId, guestId } = req.params;
        const { paymentMethod } = req.body;

        // Guest bill topish
        const guestBill = await GuestBill.findByPk(guestId, {
            include: [{
                model: BillSplit,
                as: 'billSplit',
                where: { orderId }
            }]
        });

        if (!guestBill) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Mehmon hisobi topilmadi' });
        }

        if (guestBill.paymentStatus === 'paid') {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Bu hisob allaqachon to\'langan' });
        }

        // To'lovni amalga oshirish
        await guestBill.update({
            paymentStatus: 'paid',
            paymentMethod: paymentMethod || 'cash',
            paidAt: new Date()
        }, { transaction });

        // Barcha mehmonlar to'ladimi tekshirish
        const allGuestBills = await GuestBill.findAll({
            where: { billSplitId: guestBill.billSplitId }
        });

        const allPaid = allGuestBills.every(gb =>
            gb.id === guestBill.id ? true : gb.paymentStatus === 'paid'
        );
        const somePaid = allGuestBills.some(gb => gb.paymentStatus === 'paid');

        // BillSplit statusini yangilash
        const billSplit = await BillSplit.findByPk(guestBill.billSplitId);
        await billSplit.update({
            status: allPaid ? 'completed' : (somePaid ? 'partial' : 'active')
        }, { transaction });

        // Agar hammasi to'langan bo'lsa, buyurtmani completed qilish
        if (allPaid) {
            const order = await Order.findByPk(orderId);
            await order.update({
                paymentStatus: 'paid',
                paidAt: new Date()
            }, { transaction });

            // Stolni bo'shatish
            if (order.tableId) {
                await Table.update(
                    { status: 'Available', currentOrderId: null },
                    { where: { id: order.tableId }, transaction }
                );
            }
        }

        await transaction.commit();

        res.json({
            success: true,
            message: 'To\'lov muvaffaqiyatli amalga oshirildi',
            data: {
                guestBill: await GuestBill.findByPk(guestId),
                billSplitStatus: allPaid ? 'completed' : (somePaid ? 'partial' : 'active'),
                orderCompleted: allPaid
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Pay guest bill error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Guest bill summani yangilash (custom split uchun)
const updateGuestBillAmount = async (req, res) => {
    try {
        const { guestId } = req.params;
        const { subtotal, tax, total, guestName } = req.body;

        const guestBill = await GuestBill.findByPk(guestId);
        if (!guestBill) {
            return res.status(404).json({ success: false, message: 'Mehmon hisobi topilmadi' });
        }

        if (guestBill.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'To\'langan hisobni o\'zgartirish mumkin emas' });
        }

        await guestBill.update({
            subtotal: subtotal || guestBill.subtotal,
            tax: tax || guestBill.tax,
            total: total || guestBill.total,
            guestName: guestName || guestBill.guestName
        });

        res.json({ success: true, data: guestBill });

    } catch (error) {
        console.error('Update guest bill error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Bill split ni bekor qilish
const cancelBillSplit = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { orderId } = req.params;

        const billSplit = await BillSplit.findOne({
            where: { orderId },
            include: [{
                model: GuestBill,
                as: 'guestBills'
            }]
        });

        if (!billSplit) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Split topilmadi' });
        }

        // To'langan hisoblar bormi tekshirish
        const hasPaidBills = billSplit.guestBills.some(gb => gb.paymentStatus === 'paid');
        if (hasPaidBills) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'To\'langan hisoblar bor, splitni bekor qilish mumkin emas'
            });
        }

        // Guest bill items ni o'chirish
        for (const guestBill of billSplit.guestBills) {
            await GuestBillItem.destroy({ where: { guestBillId: guestBill.id }, transaction });
        }

        // Guest bills ni o'chirish
        await GuestBill.destroy({ where: { billSplitId: billSplit.id }, transaction });

        // Bill split ni o'chirish
        await billSplit.destroy({ transaction });

        await transaction.commit();

        res.json({ success: true, message: 'Bill split bekor qilindi' });

    } catch (error) {
        await transaction.rollback();
        console.error('Cancel bill split error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createBillSplit,
    getBillSplit,
    payGuestBill,
    updateGuestBillAmount,
    cancelBillSplit
};
