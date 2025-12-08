const {
    Supplier,
    Ingredient,
    InventoryTransaction,
    ProductIngredient,
    InventoryAlert,
    Product,
    User,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

// ==================== SUPPLIER CONTROLLERS ====================

// Get all suppliers
const getSuppliers = async (req, res, next) => {
    try {
        const suppliers = await Supplier.findAll({
            where: { isActive: true },
            include: [{
                model: Ingredient,
                as: 'ingredients',
                attributes: ['id', 'name']
            }],
            order: [['name', 'ASC']]
        });
        res.status(200).json({ success: true, data: suppliers });
    } catch (error) {
        next(error);
    }
};

// Create supplier
const createSupplier = async (req, res, next) => {
    try {
        const { name, contactPerson, phone, email, address } = req.body;
        const supplier = await Supplier.create({
            name, contactPerson, phone, email, address
        });
        res.status(201).json({ success: true, data: supplier });
    } catch (error) {
        next(error);
    }
};

// Update supplier
const updateSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, contactPerson, phone, email, address, isActive } = req.body;

        const supplier = await Supplier.findByPk(id);
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Yetkazib beruvchi topilmadi' });
        }

        await supplier.update({ name, contactPerson, phone, email, address, isActive });
        res.status(200).json({ success: true, data: supplier });
    } catch (error) {
        next(error);
    }
};

// Delete supplier
const deleteSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const supplier = await Supplier.findByPk(id);
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Yetkazib beruvchi topilmadi' });
        }

        await supplier.update({ isActive: false });
        res.status(200).json({ success: true, message: 'Yetkazib beruvchi o\'chirildi' });
    } catch (error) {
        next(error);
    }
};

// ==================== INGREDIENT CONTROLLERS ====================

// Get all ingredients
const getIngredients = async (req, res, next) => {
    try {
        const { category, lowStock, search } = req.query;

        const where = { isActive: true };

        if (category) {
            where.categoryName = category;
        }

        if (lowStock === 'true') {
            where.currentStock = {
                [Op.lte]: sequelize.col('min_stock')
            };
        }

        if (search) {
            where.name = { [Op.iLike]: `%${search}%` };
        }

        const ingredients = await Ingredient.findAll({
            where,
            include: [{
                model: Supplier,
                as: 'supplier',
                attributes: ['id', 'name', 'phone']
            }],
            order: [['name', 'ASC']]
        });

        res.status(200).json({ success: true, data: ingredients });
    } catch (error) {
        next(error);
    }
};

// Get single ingredient with transactions
const getIngredient = async (req, res, next) => {
    try {
        const { id } = req.params;

        const ingredient = await Ingredient.findByPk(id, {
            include: [
                {
                    model: Supplier,
                    as: 'supplier'
                },
                {
                    model: InventoryTransaction,
                    as: 'transactions',
                    limit: 20,
                    order: [['createdAt', 'DESC']],
                    include: [{
                        model: User,
                        as: 'performer',
                        attributes: ['id', 'name']
                    }]
                },
                {
                    model: ProductIngredient,
                    as: 'productIngredients',
                    include: [{
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name']
                    }]
                }
            ]
        });

        if (!ingredient) {
            return res.status(404).json({ success: false, message: 'Ingredient topilmadi' });
        }

        res.status(200).json({ success: true, data: ingredient });
    } catch (error) {
        next(error);
    }
};

// Create ingredient
const createIngredient = async (req, res, next) => {
    try {
        const { name, sku, barcode, unit, currentStock, minStock, costPerUnit, supplierId, categoryName } = req.body;

        const ingredient = await Ingredient.create({
            name, sku, barcode, unit, currentStock, minStock, costPerUnit, supplierId, categoryName
        });

        // Create initial transaction if stock > 0
        if (currentStock > 0) {
            await InventoryTransaction.create({
                ingredientId: ingredient.id,
                type: 'in',
                quantity: currentStock,
                previousStock: 0,
                newStock: currentStock,
                unitCost: costPerUnit,
                totalCost: currentStock * costPerUnit,
                supplierId,
                note: 'Boshlang\'ich zaxira',
                performedBy: req.user?.id
            });
        }

        res.status(201).json({ success: true, data: ingredient });
    } catch (error) {
        next(error);
    }
};

// Update ingredient
const updateIngredient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, sku, barcode, unit, minStock, costPerUnit, supplierId, categoryName, isActive } = req.body;

        const ingredient = await Ingredient.findByPk(id);
        if (!ingredient) {
            return res.status(404).json({ success: false, message: 'Ingredient topilmadi' });
        }

        await ingredient.update({ name, sku, barcode, unit, minStock, costPerUnit, supplierId, categoryName, isActive });
        res.status(200).json({ success: true, data: ingredient });
    } catch (error) {
        next(error);
    }
};

// Find ingredient by barcode
const findByBarcode = async (req, res, next) => {
    try {
        const { barcode } = req.params;

        const ingredient = await Ingredient.findOne({
            where: {
                [Op.or]: [
                    { barcode: barcode },
                    { sku: barcode }
                ],
                isActive: true
            },
            include: [{
                model: Supplier,
                as: 'supplier',
                attributes: ['id', 'name', 'phone']
            }]
        });

        if (!ingredient) {
            return res.status(404).json({ success: false, message: 'Ingredient topilmadi' });
        }

        res.status(200).json({ success: true, data: ingredient });
    } catch (error) {
        next(error);
    }
};

// Delete ingredient
const deleteIngredient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ingredient = await Ingredient.findByPk(id);
        if (!ingredient) {
            return res.status(404).json({ success: false, message: 'Ingredient topilmadi' });
        }

        await ingredient.update({ isActive: false });
        res.status(200).json({ success: true, message: 'Ingredient o\'chirildi' });
    } catch (error) {
        next(error);
    }
};

// ==================== INVENTORY TRANSACTION CONTROLLERS ====================

// Add stock (kirim)
const addStock = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { ingredientId, quantity, unitCost, supplierId, note } = req.body;

        const ingredient = await Ingredient.findByPk(ingredientId, { transaction: t });
        if (!ingredient) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Ingredient topilmadi' });
        }

        const previousStock = parseFloat(ingredient.currentStock) || 0;
        const newStock = previousStock + parseFloat(quantity);
        const totalCost = parseFloat(quantity) * parseFloat(unitCost || ingredient.costPerUnit);

        // Update ingredient stock
        await ingredient.update({
            currentStock: newStock,
            costPerUnit: unitCost || ingredient.costPerUnit
        }, { transaction: t });

        // Create transaction record
        const transaction = await InventoryTransaction.create({
            ingredientId,
            type: 'in',
            quantity,
            previousStock,
            newStock,
            unitCost: unitCost || ingredient.costPerUnit,
            totalCost,
            supplierId,
            note,
            performedBy: req.user?.id
        }, { transaction: t });

        // Resolve any low stock alerts
        await InventoryAlert.update(
            { isResolved: true, resolvedAt: new Date(), resolvedBy: req.user?.id },
            {
                where: {
                    ingredientId,
                    isResolved: false,
                    alertType: { [Op.in]: ['low_stock', 'out_of_stock'] }
                },
                transaction: t
            }
        );

        await t.commit();

        res.status(201).json({
            success: true,
            data: transaction,
            newStock
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

// Remove stock (chiqim)
const removeStock = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { ingredientId, quantity, note, orderId } = req.body;

        const ingredient = await Ingredient.findByPk(ingredientId, { transaction: t });
        if (!ingredient) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Ingredient topilmadi' });
        }

        const previousStock = parseFloat(ingredient.currentStock) || 0;
        const newStock = Math.max(0, previousStock - parseFloat(quantity));

        if (previousStock < parseFloat(quantity)) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `Omborda yetarli mahsulot yo'q. Mavjud: ${previousStock} ${ingredient.unit}`
            });
        }

        // Update ingredient stock
        await ingredient.update({ currentStock: newStock }, { transaction: t });

        // Create transaction record
        const transaction = await InventoryTransaction.create({
            ingredientId,
            type: 'out',
            quantity,
            previousStock,
            newStock,
            orderId,
            note,
            performedBy: req.user?.id
        }, { transaction: t });

        // Check for low stock alert
        if (newStock <= parseFloat(ingredient.minStock)) {
            const existingAlert = await InventoryAlert.findOne({
                where: { ingredientId, isResolved: false },
                transaction: t
            });

            if (!existingAlert) {
                const alertType = newStock === 0 ? 'out_of_stock' : 'low_stock';
                await InventoryAlert.create({
                    ingredientId,
                    alertType,
                    message: newStock === 0
                        ? `${ingredient.name} tugadi!`
                        : `${ingredient.name} kam qoldi: ${newStock} ${ingredient.unit}`
                }, { transaction: t });
            }
        }

        await t.commit();

        res.status(201).json({
            success: true,
            data: transaction,
            newStock
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

// Adjust stock (tuzatish)
const adjustStock = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { ingredientId, newQuantity, note } = req.body;

        const ingredient = await Ingredient.findByPk(ingredientId, { transaction: t });
        if (!ingredient) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Ingredient topilmadi' });
        }

        const previousStock = parseFloat(ingredient.currentStock) || 0;
        const quantity = parseFloat(newQuantity) - previousStock;

        // Update ingredient stock
        await ingredient.update({ currentStock: newQuantity }, { transaction: t });

        // Create transaction record
        const transaction = await InventoryTransaction.create({
            ingredientId,
            type: 'adjustment',
            quantity: Math.abs(quantity),
            previousStock,
            newStock: newQuantity,
            note: note || `Inventarizatsiya: ${previousStock} -> ${newQuantity}`,
            performedBy: req.user?.id
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            success: true,
            data: transaction,
            newStock: newQuantity
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

// Record waste (isrof)
const recordWaste = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { ingredientId, quantity, note } = req.body;

        const ingredient = await Ingredient.findByPk(ingredientId, { transaction: t });
        if (!ingredient) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Ingredient topilmadi' });
        }

        const previousStock = parseFloat(ingredient.currentStock) || 0;
        const newStock = Math.max(0, previousStock - parseFloat(quantity));

        // Update ingredient stock
        await ingredient.update({ currentStock: newStock }, { transaction: t });

        // Create transaction record
        const transaction = await InventoryTransaction.create({
            ingredientId,
            type: 'waste',
            quantity,
            previousStock,
            newStock,
            note: note || 'Isrof/Buzilgan mahsulot',
            performedBy: req.user?.id
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            success: true,
            data: transaction,
            newStock
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

// Get transaction history
const getTransactions = async (req, res, next) => {
    try {
        const { ingredientId, type, startDate, endDate, limit = 50, offset = 0 } = req.query;

        const where = {};

        if (ingredientId) {
            where.ingredientId = ingredientId;
        }

        if (type) {
            where.type = type;
        }

        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const { count, rows: transactions } = await InventoryTransaction.findAndCountAll({
            where,
            include: [
                {
                    model: Ingredient,
                    as: 'ingredient',
                    attributes: ['id', 'name', 'unit']
                },
                {
                    model: Supplier,
                    as: 'supplier',
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'performer',
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            data: transactions,
            pagination: {
                total: count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==================== PRODUCT INGREDIENT (RECIPE) CONTROLLERS ====================

// Get product recipe
const getProductRecipe = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const recipe = await ProductIngredient.findAll({
            where: { productId },
            include: [{
                model: Ingredient,
                as: 'ingredient',
                attributes: ['id', 'name', 'unit', 'currentStock', 'costPerUnit']
            }]
        });

        res.status(200).json({ success: true, data: recipe });
    } catch (error) {
        next(error);
    }
};

// Set product recipe
const setProductRecipe = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { productId } = req.params;
        const { ingredients } = req.body; // [{ ingredientId, quantity }]

        // Delete existing recipe
        await ProductIngredient.destroy({
            where: { productId },
            transaction: t
        });

        // Create new recipe
        const recipe = await ProductIngredient.bulkCreate(
            ingredients.map(ing => ({
                productId,
                ingredientId: ing.ingredientId,
                quantity: ing.quantity
            })),
            { transaction: t }
        );

        await t.commit();

        res.status(200).json({ success: true, data: recipe });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

// ==================== ALERTS CONTROLLERS ====================

// Get active alerts
const getAlerts = async (req, res, next) => {
    try {
        const { resolved = 'false' } = req.query;

        const alerts = await InventoryAlert.findAll({
            where: { isResolved: resolved === 'true' },
            include: [{
                model: Ingredient,
                as: 'ingredient',
                attributes: ['id', 'name', 'unit', 'currentStock', 'minStock']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ success: true, data: alerts });
    } catch (error) {
        next(error);
    }
};

// Resolve alert
const resolveAlert = async (req, res, next) => {
    try {
        const { id } = req.params;

        const alert = await InventoryAlert.findByPk(id);
        if (!alert) {
            return res.status(404).json({ success: false, message: 'Ogohlantirish topilmadi' });
        }

        await alert.update({
            isResolved: true,
            resolvedAt: new Date(),
            resolvedBy: req.user?.id
        });

        res.status(200).json({ success: true, data: alert });
    } catch (error) {
        next(error);
    }
};

// ==================== INVENTORY STATISTICS ====================

const getInventoryStats = async (req, res, next) => {
    try {
        const ingredients = await Ingredient.findAll({ where: { isActive: true } });

        const totalIngredients = ingredients.length;
        const lowStockCount = ingredients.filter(i =>
            parseFloat(i.currentStock) <= parseFloat(i.minStock) && parseFloat(i.currentStock) > 0
        ).length;
        const outOfStockCount = ingredients.filter(i =>
            parseFloat(i.currentStock) === 0
        ).length;

        const totalValue = ingredients.reduce((sum, i) =>
            sum + (parseFloat(i.currentStock) * parseFloat(i.costPerUnit)), 0
        );

        // Category breakdown
        const categoryStats = {};
        ingredients.forEach(ing => {
            const cat = ing.categoryName || 'Boshqa';
            if (!categoryStats[cat]) {
                categoryStats[cat] = { count: 0, value: 0 };
            }
            categoryStats[cat].count++;
            categoryStats[cat].value += parseFloat(ing.currentStock) * parseFloat(ing.costPerUnit);
        });

        // Recent transactions
        const recentTransactions = await InventoryTransaction.findAll({
            include: [{
                model: Ingredient,
                as: 'ingredient',
                attributes: ['name', 'unit']
            }],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        // Active alerts count
        const activeAlertsCount = await InventoryAlert.count({
            where: { isResolved: false }
        });

        res.status(200).json({
            success: true,
            data: {
                totalIngredients,
                lowStockCount,
                outOfStockCount,
                totalValue,
                activeAlertsCount,
                categoryStats: Object.entries(categoryStats).map(([name, data]) => ({
                    name,
                    ...data
                })),
                recentTransactions
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
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
};
