const { Product, Category, ModifierGroup, Modifier, ProductModifierGroup } = require("../models");
const createHttpError = require("http-errors");
const { isValidId } = require("../utils/validators");

const addProduct = async (req, res, next) => {
    try {
        const { name, description, price, image, category, sortOrder, isActive, modifierGroupIds } = req.body;

        if (!isValidId(category)) {
            const error = createHttpError(400, "Invalid category id!");
            return next(error);
        }

        const isCategoryAvailable = await Category.findByPk(category);

        if (!isCategoryAvailable) {
            const error = createHttpError(404, "There is no such category");
            return next(error);
        }

        const newProduct = await Product.create({
            name,
            description: description || null,
            price,
            image: image || null,
            categoryId: isCategoryAvailable.id,
            sortOrder: sortOrder || 0,
            isActive: isActive !== undefined ? isActive : true
        });

        // Modifikator guruhlarini biriktirish
        if (modifierGroupIds && modifierGroupIds.length > 0) {
            const associations = modifierGroupIds.map((groupId, index) => ({
                productId: newProduct.id,
                modifierGroupId: groupId,
                sortOrder: index
            }));
            await ProductModifierGroup.bulkCreate(associations);
        }

        res.status(201).json({ ...newProduct.toJSON(), _id: newProduct.id });
    } catch (error) {
        next(error);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const { categoryId, isActive, withModifiers, page = 1, limit = 50, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }
        // Search qo'shish
        if (search) {
            const { Op } = require('sequelize');
            where.name = { [Op.iLike]: `%${search}%` };
        }

        const include = [{ model: Category, as: 'category' }];

        // Modifikatorlarni qo'shish
        if (withModifiers === 'true') {
            include.push({
                model: ModifierGroup,
                as: 'modifierGroups',
                through: { attributes: ['sortOrder'] },
                include: [{
                    model: Modifier,
                    as: 'modifiers',
                    where: { isActive: true },
                    required: false
                }]
            });
        }

        // Pagination bilan findAndCountAll
        const { count, rows: products } = await Product.findAndCountAll({
            where,
            include,
            order: [['sortOrder', 'ASC'], ['name', 'ASC']],
            limit: parseInt(limit),
            offset,
            distinct: true // modifierGroups uchun to'g'ri count
        });

        const productsWithId = products.map(p => ({
            ...p.toJSON(),
            _id: p.id,
            category: p.categoryId // Keep category as ID for frontend compatibility
        }));

        res.status(200).json({
            data: productsWithId,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

const getOneProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            const error = createHttpError(400, "Invalid id!");
            return next(error);
        }

        const product = await Product.findByPk(id, {
            include: [
                { model: Category, as: 'category' },
                {
                    model: ModifierGroup,
                    as: 'modifierGroups',
                    through: { attributes: ['sortOrder'] },
                    include: [{
                        model: Modifier,
                        as: 'modifiers',
                        where: { isActive: true },
                        required: false
                    }]
                }
            ]
        });

        if (!product) {
            const error = createHttpError(404, "There is no such product");
            return next(error);
        }

        res.status(200).json({
            ...product.toJSON(),
            _id: product.id,
            category: product.categoryId
        });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            const error = createHttpError(400, "Invalid id!");
            return next(error);
        }

        // If category is being updated, rename it to categoryId
        const updateData = { ...req.body };
        if (updateData.category) {
            updateData.categoryId = updateData.category;
            delete updateData.category;
        }

        // Modifikatorlarni alohida boshqarish
        const modifierGroupIds = updateData.modifierGroupIds;
        delete updateData.modifierGroupIds;

        const [rowsUpdated] = await Product.update(updateData, { where: { id } });

        if (rowsUpdated === 0) {
            const error = createHttpError(404, "Product not found!");
            return next(error);
        }

        // Modifikator guruhlarini yangilash
        if (modifierGroupIds !== undefined) {
            await ProductModifierGroup.destroy({ where: { productId: id } });
            if (modifierGroupIds && modifierGroupIds.length > 0) {
                const associations = modifierGroupIds.map((groupId, index) => ({
                    productId: parseInt(id),
                    modifierGroupId: groupId,
                    sortOrder: index
                }));
                await ProductModifierGroup.bulkCreate(associations);
            }
        }

        const product = await Product.findByPk(id, {
            include: [{
                model: ModifierGroup,
                as: 'modifierGroups',
                include: [{ model: Modifier, as: 'modifiers' }]
            }]
        });
        res.status(200).json({ ...product.toJSON(), _id: product.id });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    const { id } = req.params;
    try {
        if (!isValidId(id)) {
            const error = createHttpError(400, "Invalid id!");
            return next(error);
        }

        // Avval modifikator bog'lanishlarini o'chirish
        await ProductModifierGroup.destroy({ where: { productId: id } });

        const deleted = await Product.destroy({ where: { id } });

        if (!deleted) {
            const error = createHttpError(400, 'Product not found');
            return next(error);
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { addProduct, getProducts, getOneProduct, updateProduct, deleteProduct };
