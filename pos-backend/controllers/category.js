const { Product, Category } = require("../models");
const createHttpError = require("http-errors");
const { isValidId } = require("../utils/validators");

const addCategory = async (req, res, next) => {
    try {
        const { name, description, image, sortOrder, isActive } = req.body;

        const category = await Category.findOne({ where: { name } });
        if (category) {
            const error = createHttpError(400, "Category is already available");
            return next(error);
        }

        const newCategory = await Category.create({
            name,
            description: description || null,
            image: image || null,
            sortOrder: sortOrder || 0,
            isActive: isActive !== undefined ? isActive : true
        });
        res.status(201).json({ ...newCategory.toJSON(), _id: newCategory.id });
    } catch (error) {
        next(error);
    }
};

const getCategories = async (req, res, next) => {
    try {
        const { isActive, withProducts } = req.query;

        const where = {};
        // Faqat faol kategoriyalarni olish (agar so'ralsa)
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        const include = [];
        if (withProducts === 'true') {
            include.push({
                model: Product,
                as: 'products',
                where: { isActive: true },
                required: false
            });
        }

        const categories = await Category.findAll({
            where,
            include,
            order: [['sortOrder', 'ASC'], ['name', 'ASC']]
        });

        const categoriesWithId = categories.map(cat => ({
            ...cat.toJSON(),
            _id: cat.id
        }));
        res.status(200).json(categoriesWithId);
    } catch (error) {
        next(error);
    }
};

const getOneCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            const error = createHttpError(400, "Invalid id!");
            return next(error);
        }

        const category = await Category.findByPk(id);
        if (!category) {
            const error = createHttpError(404, "Category not found!");
            return next(error);
        }

        const products = await Product.findAll({ where: { categoryId: id } });

        res.status(200).json({
            category: { ...category.toJSON(), _id: category.id },
            products: products.map(p => ({ ...p.toJSON(), _id: p.id }))
        });
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            const error = createHttpError(400, "Invalid id!");
            return next(error);
        }

        const [rowsUpdated] = await Category.update(req.body, { where: { id } });

        if (rowsUpdated === 0) {
            const error = createHttpError(404, "Category not found!");
            return next(error);
        }

        const category = await Category.findByPk(id);
        res.status(200).json({ ...category.toJSON(), _id: category.id });
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    const { id } = req.params;
    const { hardDelete } = req.query; // Optional: ?hardDelete=true for permanent deletion

    try {
        if (!isValidId(id)) {
            const error = createHttpError(400, "Invalid id!");
            return next(error);
        }

        const category = await Category.findByPk(id);
        if (!category) {
            return next(createHttpError(404, "Category not found"));
        }

        // Check if category has active products
        const activeProducts = await Product.count({
            where: { categoryId: id, isActive: true }
        });

        if (activeProducts > 0 && hardDelete !== 'true') {
            return next(createHttpError(400,
                `Bu kategoriyada ${activeProducts} ta faol mahsulot bor. ` +
                `Avval mahsulotlarni boshqa kategoriyaga ko'chiring yoki o'chiring.`
            ));
        }

        if (hardDelete === 'true') {
            // Hard delete - permanently remove products and category
            await Product.destroy({ where: { categoryId: id } });
            await Category.destroy({ where: { id } });
            res.status(200).json({ message: "Kategoriya va mahsulotlar butunlay o'chirildi" });
        } else {
            // Soft delete - just mark as inactive
            await Category.update({ isActive: false }, { where: { id } });
            await Product.update({ isActive: false }, { where: { categoryId: id } });
            res.status(200).json({ message: "Kategoriya o'chirildi (soft delete)" });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { addCategory, getCategories, updateCategory, deleteCategory, getOneCategory };
