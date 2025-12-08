const { LandingContent, Testimonial, Product, Category } = require('../models');

// Get all landing page data
const getLandingData = async (req, res, next) => {
    try {
        const [hero, features, contact, testimonials, menuProducts] = await Promise.all([
            LandingContent.findAll({
                where: { section: 'hero', isActive: true },
                order: [['displayOrder', 'ASC']]
            }),
            LandingContent.findAll({
                where: { section: 'features', isActive: true },
                order: [['displayOrder', 'ASC']]
            }),
            LandingContent.findAll({
                where: { section: 'contact', isActive: true },
                order: [['displayOrder', 'ASC']]
            }),
            Testimonial.findAll({
                where: { isActive: true },
                order: [['displayOrder', 'ASC']],
                limit: 6
            }),
            Product.findAll({
                include: [{ model: Category, as: 'category' }],
                limit: 8
            })
        ]);

        // Convert to key-value format for easier frontend consumption
        const heroData = {};
        hero.forEach(item => {
            heroData[item.contentKey] = item.imageUrl || item.contentValue;
        });

        const featuresData = features.map(item => ({
            id: item.id,
            key: item.contentKey,
            title: item.contentValue,
            icon: item.imageUrl
        }));

        const contactData = {};
        contact.forEach(item => {
            contactData[item.contentKey] = item.contentValue;
        });

        res.status(200).json({
            success: true,
            data: {
                hero: heroData,
                features: featuresData,
                contact: contactData,
                testimonials: testimonials.map(t => ({
                    ...t.toJSON(),
                    _id: t.id
                })),
                menu: menuProducts.map(p => ({
                    ...p.toJSON(),
                    _id: p.id
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get hero section only
const getHeroSection = async (req, res, next) => {
    try {
        const heroContent = await LandingContent.findAll({
            where: { section: 'hero', isActive: true },
            order: [['displayOrder', 'ASC']]
        });

        const heroData = {};
        heroContent.forEach(item => {
            heroData[item.contentKey] = item.imageUrl || item.contentValue;
        });

        res.status(200).json({
            success: true,
            data: heroData
        });
    } catch (error) {
        next(error);
    }
};

// Get menu preview (featured products)
const getMenuPreview = async (req, res, next) => {
    try {
        const products = await Product.findAll({
            include: [{ model: Category, as: 'category' }],
            limit: 8
        });

        const categories = await Category.findAll({
            include: [{
                model: Product,
                as: 'products',
                limit: 4
            }]
        });

        res.status(200).json({
            success: true,
            data: {
                featured: products.map(p => ({
                    ...p.toJSON(),
                    _id: p.id
                })),
                categories: categories.map(c => ({
                    ...c.toJSON(),
                    _id: c.id,
                    products: c.products?.map(p => ({
                        ...p.toJSON(),
                        _id: p.id
                    })) || []
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get testimonials
const getTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.findAll({
            where: { isActive: true },
            order: [['displayOrder', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: testimonials.map(t => ({
                ...t.toJSON(),
                _id: t.id
            }))
        });
    } catch (error) {
        next(error);
    }
};

// Get contact information
const getContactInfo = async (req, res, next) => {
    try {
        const contactContent = await LandingContent.findAll({
            where: { section: 'contact', isActive: true },
            order: [['displayOrder', 'ASC']]
        });

        const contactData = {};
        contactContent.forEach(item => {
            contactData[item.contentKey] = item.contentValue;
        });

        res.status(200).json({
            success: true,
            data: contactData
        });
    } catch (error) {
        next(error);
    }
};

// Get features section
const getFeatures = async (req, res, next) => {
    try {
        const features = await LandingContent.findAll({
            where: { section: 'features', isActive: true },
            order: [['displayOrder', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: features.map(item => ({
                id: item.id,
                key: item.contentKey,
                title: item.contentValue,
                icon: item.imageUrl
            }))
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLandingData,
    getHeroSection,
    getMenuPreview,
    getTestimonials,
    getContactInfo,
    getFeatures
};
