const express = require('express');
const router = express.Router();
const {
    addTip,
    getOrderTips,
    getWaiterTips,
    distributeTip,
    autoDistributeTip,
    getTipsReport,
    deleteTip
} = require('../controllers/tips.ctr');
const { isVerifiedUser } = require('../middlewares/tokenVerification');

// Barcha endpointlar auth talab qiladi
router.use(isVerifiedUser);

// Buyurtmaga tip qo'shish
router.post('/orders/:orderId/tip', addTip);

// Buyurtma uchun tiplarni olish
router.get('/orders/:orderId/tips', getOrderTips);

// Ofitsiant bo'yicha tiplar
router.get('/waiter/:waiterId', getWaiterTips);

// Tipni taqsimlash
router.post('/:tipId/distribute', distributeTip);

// Avtomatik taqsimlash
router.post('/:tipId/auto-distribute', autoDistributeTip);

// Tip hisoboti
router.get('/report', getTipsReport);

// Tipni o'chirish
router.delete('/:tipId', deleteTip);

module.exports = router;
