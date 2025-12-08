const express = require('express');
const router = express.Router();
const { isVerifiedUser } = require('../middlewares/tokenVerification');
const {
    // Groups
    getAllModifierGroups,
    getModifierGroup,
    createModifierGroup,
    updateModifierGroup,
    deleteModifierGroup,
    // Items
    getModifiersByGroup,
    createModifier,
    updateModifier,
    deleteModifier,
    // Product associations
    getProductModifiers,
    assignModifiersToProduct,
    removeModifierFromProduct
} = require('../controllers/modifiers.ctr');

// ==================== MODIFIER GROUPS ====================
router.get('/groups', isVerifiedUser, getAllModifierGroups);
router.get('/groups/:id', isVerifiedUser, getModifierGroup);
router.post('/groups', isVerifiedUser, createModifierGroup);
router.put('/groups/:id', isVerifiedUser, updateModifierGroup);
router.delete('/groups/:id', isVerifiedUser, deleteModifierGroup);

// ==================== MODIFIERS (Items) ====================
router.get('/groups/:groupId/items', isVerifiedUser, getModifiersByGroup);
router.post('/items', isVerifiedUser, createModifier);
router.put('/items/:id', isVerifiedUser, updateModifier);
router.delete('/items/:id', isVerifiedUser, deleteModifier);

// ==================== PRODUCT-MODIFIER ASSOCIATIONS ====================
router.get('/products/:productId', isVerifiedUser, getProductModifiers);
router.post('/products/:productId', isVerifiedUser, assignModifiersToProduct);
router.delete('/products/:productId/groups/:groupId', isVerifiedUser, removeModifierFromProduct);

module.exports = router;
