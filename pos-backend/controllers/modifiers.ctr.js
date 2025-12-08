const { ModifierGroup, Modifier, ProductModifierGroup, Product } = require('../models/index');
const { Op } = require('sequelize');

// ==================== MODIFIER GROUPS ====================

// Get all modifier groups
const getAllModifierGroups = async (req, res) => {
    try {
        const { isActive } = req.query;

        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        const groups = await ModifierGroup.findAll({
            where,
            include: [{
                model: Modifier,
                as: 'modifiers',
                order: [['sortOrder', 'ASC']]
            }],
            order: [['sortOrder', 'ASC'], ['name', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: groups
        });
    } catch (error) {
        console.error('Get modifier groups error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch modifier groups',
            error: error.message
        });
    }
};

// Get single modifier group
const getModifierGroup = async (req, res) => {
    try {
        const group = await ModifierGroup.findByPk(req.params.id, {
            include: [{
                model: Modifier,
                as: 'modifiers',
                order: [['sortOrder', 'ASC']]
            }]
        });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Modifier group not found'
            });
        }

        res.status(200).json({
            success: true,
            data: group
        });
    } catch (error) {
        console.error('Get modifier group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch modifier group',
            error: error.message
        });
    }
};

// Create modifier group
const createModifierGroup = async (req, res) => {
    try {
        const { name, type, required, minSelect, maxSelect, sortOrder } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        const group = await ModifierGroup.create({
            name,
            type: type || 'single',
            required: required || false,
            minSelect: minSelect || 0,
            maxSelect: maxSelect || 10,
            sortOrder: sortOrder || 0,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Modifier group created successfully',
            data: group
        });
    } catch (error) {
        console.error('Create modifier group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create modifier group',
            error: error.message
        });
    }
};

// Update modifier group
const updateModifierGroup = async (req, res) => {
    try {
        const group = await ModifierGroup.findByPk(req.params.id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Modifier group not found'
            });
        }

        const { name, type, required, minSelect, maxSelect, sortOrder, isActive } = req.body;

        await group.update({
            name: name !== undefined ? name : group.name,
            type: type !== undefined ? type : group.type,
            required: required !== undefined ? required : group.required,
            minSelect: minSelect !== undefined ? minSelect : group.minSelect,
            maxSelect: maxSelect !== undefined ? maxSelect : group.maxSelect,
            sortOrder: sortOrder !== undefined ? sortOrder : group.sortOrder,
            isActive: isActive !== undefined ? isActive : group.isActive
        });

        res.status(200).json({
            success: true,
            message: 'Modifier group updated successfully',
            data: group
        });
    } catch (error) {
        console.error('Update modifier group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update modifier group',
            error: error.message
        });
    }
};

// Delete modifier group
const deleteModifierGroup = async (req, res) => {
    try {
        const group = await ModifierGroup.findByPk(req.params.id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Modifier group not found'
            });
        }

        // Delete all modifiers in this group first
        await Modifier.destroy({ where: { groupId: group.id } });
        // Delete product associations
        await ProductModifierGroup.destroy({ where: { modifierGroupId: group.id } });
        // Delete the group
        await group.destroy();

        res.status(200).json({
            success: true,
            message: 'Modifier group deleted successfully'
        });
    } catch (error) {
        console.error('Delete modifier group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete modifier group',
            error: error.message
        });
    }
};

// ==================== MODIFIERS (Items) ====================

// Get modifiers by group
const getModifiersByGroup = async (req, res) => {
    try {
        const modifiers = await Modifier.findAll({
            where: { groupId: req.params.groupId },
            order: [['sortOrder', 'ASC'], ['name', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: modifiers
        });
    } catch (error) {
        console.error('Get modifiers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch modifiers',
            error: error.message
        });
    }
};

// Create modifier
const createModifier = async (req, res) => {
    try {
        const { groupId, name, price, isDefault, sortOrder } = req.body;

        if (!groupId || !name) {
            return res.status(400).json({
                success: false,
                message: 'Group ID and name are required'
            });
        }

        // Check if group exists
        const group = await ModifierGroup.findByPk(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Modifier group not found'
            });
        }

        // If this is default, reset other defaults in the group (for single type)
        if (isDefault && group.type === 'single') {
            await Modifier.update(
                { isDefault: false },
                { where: { groupId, isDefault: true } }
            );
        }

        const modifier = await Modifier.create({
            groupId,
            name,
            price: price || 0,
            isDefault: isDefault || false,
            sortOrder: sortOrder || 0,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Modifier created successfully',
            data: modifier
        });
    } catch (error) {
        console.error('Create modifier error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create modifier',
            error: error.message
        });
    }
};

// Update modifier
const updateModifier = async (req, res) => {
    try {
        const modifier = await Modifier.findByPk(req.params.id);

        if (!modifier) {
            return res.status(404).json({
                success: false,
                message: 'Modifier not found'
            });
        }

        const { name, price, isDefault, sortOrder, isActive } = req.body;

        // If setting as default, reset others (for single type groups)
        if (isDefault) {
            const group = await ModifierGroup.findByPk(modifier.groupId);
            if (group && group.type === 'single') {
                await Modifier.update(
                    { isDefault: false },
                    { where: { groupId: modifier.groupId, isDefault: true } }
                );
            }
        }

        await modifier.update({
            name: name !== undefined ? name : modifier.name,
            price: price !== undefined ? price : modifier.price,
            isDefault: isDefault !== undefined ? isDefault : modifier.isDefault,
            sortOrder: sortOrder !== undefined ? sortOrder : modifier.sortOrder,
            isActive: isActive !== undefined ? isActive : modifier.isActive
        });

        res.status(200).json({
            success: true,
            message: 'Modifier updated successfully',
            data: modifier
        });
    } catch (error) {
        console.error('Update modifier error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update modifier',
            error: error.message
        });
    }
};

// Delete modifier
const deleteModifier = async (req, res) => {
    try {
        const modifier = await Modifier.findByPk(req.params.id);

        if (!modifier) {
            return res.status(404).json({
                success: false,
                message: 'Modifier not found'
            });
        }

        await modifier.destroy();

        res.status(200).json({
            success: true,
            message: 'Modifier deleted successfully'
        });
    } catch (error) {
        console.error('Delete modifier error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete modifier',
            error: error.message
        });
    }
};

// ==================== PRODUCT-MODIFIER ASSOCIATIONS ====================

// Get modifier groups for a product
const getProductModifiers = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.productId, {
            include: [{
                model: ModifierGroup,
                as: 'modifierGroups',
                through: { attributes: ['sortOrder'] },
                include: [{
                    model: Modifier,
                    as: 'modifiers',
                    where: { isActive: true },
                    required: false,
                    order: [['sortOrder', 'ASC']]
                }]
            }]
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product.modifierGroups
        });
    } catch (error) {
        console.error('Get product modifiers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product modifiers',
            error: error.message
        });
    }
};

// Assign modifier groups to product
const assignModifiersToProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { modifierGroupIds } = req.body;

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Remove existing associations
        await ProductModifierGroup.destroy({ where: { productId } });

        // Create new associations
        if (modifierGroupIds && modifierGroupIds.length > 0) {
            const associations = modifierGroupIds.map((groupId, index) => ({
                productId: parseInt(productId),
                modifierGroupId: groupId,
                sortOrder: index
            }));
            await ProductModifierGroup.bulkCreate(associations);
        }

        // Fetch updated product with modifiers
        const updatedProduct = await Product.findByPk(productId, {
            include: [{
                model: ModifierGroup,
                as: 'modifierGroups',
                include: [{ model: Modifier, as: 'modifiers' }]
            }]
        });

        res.status(200).json({
            success: true,
            message: 'Product modifiers updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Assign modifiers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign modifiers to product',
            error: error.message
        });
    }
};

// Remove modifier group from product
const removeModifierFromProduct = async (req, res) => {
    try {
        const { productId, groupId } = req.params;

        const deleted = await ProductModifierGroup.destroy({
            where: { productId, modifierGroupId: groupId }
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Association not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Modifier group removed from product'
        });
    } catch (error) {
        console.error('Remove modifier from product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove modifier from product',
            error: error.message
        });
    }
};

module.exports = {
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
};
