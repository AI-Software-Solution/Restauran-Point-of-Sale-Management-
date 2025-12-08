const express = require('express');
const router = express.Router();
const {
    transferOrder,
    mergeTables,
    getTransferHistory,
    getAllTransfers
} = require('../controllers/tableTransfer.ctr');
const { isVerifiedUser } = require('../middlewares/tokenVerification');

// Barcha endpointlar auth talab qiladi
router.use(isVerifiedUser);

// Buyurtmani boshqa stolga ko'chirish
router.post('/tables/:tableId/transfer', transferOrder);

// Stollarni birlashtirish
router.post('/merge', mergeTables);

// Stol uchun transfer tarixini olish
router.get('/tables/:tableId/history', getTransferHistory);

// Barcha transfer tarixini olish
router.get('/history', getAllTransfers);

module.exports = router;
