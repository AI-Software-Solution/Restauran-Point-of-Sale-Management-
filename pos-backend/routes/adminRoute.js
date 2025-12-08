const router = require('express').Router();
const { isVerifiedUser, isAdminOrOwner } = require('../middlewares/tokenVerification');
const {
    // Activity Log
    getActivityLogs,
    // Settings
    getSettings,
    getSetting,
    updateSetting,
    bulkUpdateSettings,
    initializeSettings,
    // Dashboard
    getAdminStats,
    // User Management
    getUsers,
    updateUser,
    deleteUser,
    // Reports
    getSalesReport,
    getProductReport
} = require('../controllers/admin.ctr');

// All routes require admin or owner role
const adminOnly = [isVerifiedUser, isAdminOrOwner];

// ==================== DASHBOARD ====================
router.get('/stats', adminOnly, getAdminStats);

// ==================== ACTIVITY LOG ====================
router.get('/activity-logs', adminOnly, getActivityLogs);

// ==================== SETTINGS ====================
router.get('/settings', adminOnly, getSettings);
router.get('/settings/:key', adminOnly, getSetting);
router.put('/settings', adminOnly, updateSetting);
router.post('/settings/bulk', adminOnly, bulkUpdateSettings);
router.post('/settings/initialize', adminOnly, initializeSettings);

// ==================== USER MANAGEMENT ====================
router.get('/users', adminOnly, getUsers);
router.put('/users/:id', adminOnly, updateUser);
router.delete('/users/:id', adminOnly, deleteUser);

// ==================== REPORTS ====================
router.get('/reports/sales', adminOnly, getSalesReport);
router.get('/reports/products', adminOnly, getProductReport);

module.exports = router;
