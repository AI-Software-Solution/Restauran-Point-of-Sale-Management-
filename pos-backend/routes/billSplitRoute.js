const express = require('express');
const router = express.Router();
const {
    createBillSplit,
    getBillSplit,
    payGuestBill,
    updateGuestBillAmount,
    cancelBillSplit
} = require('../controllers/billSplit.ctr');
const { isVerifiedUser } = require('../middlewares/tokenVerification');

// Barcha endpointlar auth talab qiladi
router.use(isVerifiedUser);

// Buyurtma uchun hisobni bo'lish
router.post('/orders/:orderId/split', createBillSplit);

// Buyurtma uchun split ma'lumotlarini olish
router.get('/orders/:orderId/split', getBillSplit);

// Mehmon hisobini to'lash
router.post('/orders/:orderId/split/guests/:guestId/pay', payGuestBill);

// Guest bill summani yangilash
router.put('/guests/:guestId', updateGuestBillAmount);

// Bill split ni bekor qilish
router.delete('/orders/:orderId/split', cancelBillSplit);

module.exports = router;
