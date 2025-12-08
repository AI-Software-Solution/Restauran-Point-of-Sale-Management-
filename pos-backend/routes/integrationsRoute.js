const express = require('express');
const router = express.Router();
const { isVerifiedUser, isAdminOrOwner } = require('../middlewares/tokenVerification');
const {
    // Payment
    clickPrepare,
    clickComplete,
    paymeHandler,
    processPayment,
    getPaymentStatus,
    // Printer
    generateReceipt,
    printReceipt,
    getPrinterStatus,
    // Notifications
    sendNotification,
    orderStatusWebhook,
    // Settings
    getIntegrationSettings,
    updateIntegrationSettings
} = require('../controllers/integrations.ctr');

// ==================== PAYMENT WEBHOOKS (No Auth - Called by Payment Systems) ====================
router.post('/payment/click/prepare', clickPrepare);
router.post('/payment/click/complete', clickComplete);
router.post('/payment/payme', paymeHandler);

// ==================== INTERNAL PAYMENT ROUTES (Auth Required) ====================
router.post('/payment/process', isVerifiedUser, processPayment);
router.get('/payment/status/:orderId', isVerifiedUser, getPaymentStatus);

// ==================== PRINTER ROUTES ====================
router.get('/receipt/:orderId', isVerifiedUser, generateReceipt);
router.post('/receipt/print', isVerifiedUser, printReceipt);
router.get('/printer/status', isVerifiedUser, getPrinterStatus);

// ==================== NOTIFICATION ROUTES ====================
router.post('/notify', isVerifiedUser, sendNotification);
router.post('/order/status-webhook', isVerifiedUser, orderStatusWebhook);

// ==================== SETTINGS ROUTES (Admin Only) ====================
router.get('/settings', isAdminOrOwner, getIntegrationSettings);
router.put('/settings', isAdminOrOwner, updateIntegrationSettings);

module.exports = router;
