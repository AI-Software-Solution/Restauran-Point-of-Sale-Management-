const express = require('express');
const router = express.Router();
const kitchenController = require('./kitchen.controller');
const { isVerifiedUser } = require('../../../middlewares/tokenVerification');

// All routes require authentication
router.use(isVerifiedUser);

/**
 * @route   GET /api/v1/kitchen/orders
 * @desc    Get all active orders for kitchen display
 * @access  Private (Kitchen staff)
 */
router.get('/orders', kitchenController.getActiveOrders);

/**
 * @route   GET /api/v1/kitchen/orders/:id
 * @desc    Get single order details
 * @access  Private
 */
router.get('/orders/:id', kitchenController.getOrderDetails);

/**
 * @route   PATCH /api/v1/kitchen/orders/:id/status
 * @desc    Update order status (new, preparing, ready, served)
 * @access  Private (Kitchen staff)
 */
router.patch('/orders/:id/status', kitchenController.updateOrderStatus);

/**
 * @route   POST /api/v1/kitchen/orders/:id/bump
 * @desc    Bump order - mark as ready and notify POS
 * @access  Private (Kitchen staff)
 */
router.post('/orders/:id/bump', kitchenController.bumpOrder);

/**
 * @route   POST /api/v1/kitchen/orders/:id/acknowledge
 * @desc    Acknowledge order - start preparing
 * @access  Private (Kitchen staff)
 */
router.post('/orders/:id/acknowledge', kitchenController.acknowledgeOrder);

/**
 * @route   POST /api/v1/kitchen/orders/:id/recall
 * @desc    Recall order - move back to preparing
 * @access  Private (Kitchen staff)
 */
router.post('/orders/:id/recall', kitchenController.recallOrder);

/**
 * @route   GET /api/v1/kitchen/stats
 * @desc    Get kitchen performance statistics
 * @access  Private
 */
router.get('/stats', kitchenController.getKitchenStats);

module.exports = router;
