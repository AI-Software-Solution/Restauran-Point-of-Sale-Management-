const router = require('express').Router();
const { isVerifiedUser, isAdminOrOwner } = require('../middlewares/tokenVerification');
const {
    // Suppliers
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    // Ingredients
    getIngredients,
    getIngredient,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    findByBarcode,
    // Transactions
    addStock,
    removeStock,
    adjustStock,
    recordWaste,
    getTransactions,
    // Recipe
    getProductRecipe,
    setProductRecipe,
    // Alerts
    getAlerts,
    resolveAlert,
    // Stats
    getInventoryStats
} = require('../controllers/inventory.ctr');

// ==================== SUPPLIER ROUTES ====================
router.get('/suppliers', isVerifiedUser, getSuppliers);
router.post('/suppliers', isAdminOrOwner, createSupplier);
router.put('/suppliers/:id', isAdminOrOwner, updateSupplier);
router.delete('/suppliers/:id', isAdminOrOwner, deleteSupplier);

// ==================== INGREDIENT ROUTES ====================
router.get('/ingredients', isVerifiedUser, getIngredients);
router.get('/ingredients/barcode/:barcode', isVerifiedUser, findByBarcode); // Barcode/SKU qidirish
router.get('/ingredients/:id', isVerifiedUser, getIngredient);
router.post('/ingredients', isAdminOrOwner, createIngredient);
router.put('/ingredients/:id', isAdminOrOwner, updateIngredient);
router.delete('/ingredients/:id', isAdminOrOwner, deleteIngredient);

// ==================== TRANSACTION ROUTES ====================
router.get('/transactions', isVerifiedUser, getTransactions);
router.post('/transactions/add', isVerifiedUser, addStock);
router.post('/transactions/remove', isVerifiedUser, removeStock);
router.post('/transactions/adjust', isAdminOrOwner, adjustStock);
router.post('/transactions/waste', isVerifiedUser, recordWaste);

// ==================== RECIPE ROUTES ====================
router.get('/recipe/:productId', isVerifiedUser, getProductRecipe);
router.post('/recipe/:productId', isAdminOrOwner, setProductRecipe);

// ==================== ALERT ROUTES ====================
router.get('/alerts', isVerifiedUser, getAlerts);
router.put('/alerts/:id/resolve', isVerifiedUser, resolveAlert);

// ==================== STATS ROUTES ====================
router.get('/stats', isVerifiedUser, getInventoryStats);

module.exports = router;
