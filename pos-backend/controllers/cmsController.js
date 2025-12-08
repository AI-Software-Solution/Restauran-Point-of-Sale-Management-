const createHttpError = require('http-errors');
const { LandingContent, Testimonial, MediaFile } = require('../models');
const path = require('path');
const fs = require('fs');

// ==================== LANDING CONTENT CRUD ====================

// Get all landing content (admin)
const getAllContent = async (req, res, next) => {
    try {
        const { section } = req.query;
        const where = section ? { section } : {};

        const content = await LandingContent.findAll({
            where,
            order: [['section', 'ASC'], ['displayOrder', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: content.map(c => ({
                ...c.toJSON(),
                _id: c.id
            }))
        });
    } catch (error) {
        next(error);
    }
};

// Create landing content
const createContent = async (req, res, next) => {
    try {
        const { section, contentKey, contentValue, imageUrl, displayOrder, isActive } = req.body;

        if (!section || !contentKey) {
            return next(createHttpError(400, 'Section and contentKey are required'));
        }

        const content = await LandingContent.create({
            section,
            contentKey,
            contentValue,
            imageUrl,
            displayOrder: displayOrder || 0,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({
            success: true,
            message: 'Content created successfully',
            data: { ...content.toJSON(), _id: content.id }
        });
    } catch (error) {
        next(error);
    }
};

// Update landing content
const updateContent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const content = await LandingContent.findByPk(id);
        if (!content) {
            return next(createHttpError(404, 'Content not found'));
        }

        await content.update(updateData);

        res.status(200).json({
            success: true,
            message: 'Content updated successfully',
            data: { ...content.toJSON(), _id: content.id }
        });
    } catch (error) {
        next(error);
    }
};

// Delete landing content
const deleteContent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const content = await LandingContent.findByPk(id);
        if (!content) {
            return next(createHttpError(404, 'Content not found'));
        }

        await content.destroy();

        res.status(200).json({
            success: true,
            message: 'Content deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ==================== TESTIMONIALS CRUD ====================

// Get all testimonials (admin)
const getAllTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.findAll({
            order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']]
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

// Create testimonial
const createTestimonial = async (req, res, next) => {
    try {
        const { customerName, customerImage, rating, content, displayOrder, isActive } = req.body;

        if (!customerName || !content) {
            return next(createHttpError(400, 'Customer name and content are required'));
        }

        const testimonial = await Testimonial.create({
            customerName,
            customerImage,
            rating: rating || 5,
            content,
            displayOrder: displayOrder || 0,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({
            success: true,
            message: 'Testimonial created successfully',
            data: { ...testimonial.toJSON(), _id: testimonial.id }
        });
    } catch (error) {
        next(error);
    }
};

// Update testimonial
const updateTestimonial = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const testimonial = await Testimonial.findByPk(id);
        if (!testimonial) {
            return next(createHttpError(404, 'Testimonial not found'));
        }

        await testimonial.update(updateData);

        res.status(200).json({
            success: true,
            message: 'Testimonial updated successfully',
            data: { ...testimonial.toJSON(), _id: testimonial.id }
        });
    } catch (error) {
        next(error);
    }
};

// Delete testimonial
const deleteTestimonial = async (req, res, next) => {
    try {
        const { id } = req.params;

        const testimonial = await Testimonial.findByPk(id);
        if (!testimonial) {
            return next(createHttpError(404, 'Testimonial not found'));
        }

        await testimonial.destroy();

        res.status(200).json({
            success: true,
            message: 'Testimonial deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ==================== MEDIA FILES ====================

// Upload file
const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(createHttpError(400, 'No file uploaded'));
        }

        const { folder } = req.body;
        const file = req.file;

        const mediaFile = await MediaFile.create({
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: `/uploads/${folder || 'general'}/${file.filename}`,
            folder: folder || 'general',
            uploadedBy: req.user?.id || null
        });

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                ...mediaFile.toJSON(),
                _id: mediaFile.id
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get all media files
const getAllMediaFiles = async (req, res, next) => {
    try {
        const { folder } = req.query;
        const where = folder ? { folder } : {};

        const files = await MediaFile.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: files.map(f => ({
                ...f.toJSON(),
                _id: f.id
            }))
        });
    } catch (error) {
        next(error);
    }
};

// Delete media file
const deleteMediaFile = async (req, res, next) => {
    try {
        const { id } = req.params;

        const file = await MediaFile.findByPk(id);
        if (!file) {
            return next(createHttpError(404, 'File not found'));
        }

        // Delete physical file
        const filePath = path.join(__dirname, '..', file.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await file.destroy();

        res.status(200).json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ==================== SEED DEFAULT CONTENT ====================

const seedDefaultContent = async (req, res, next) => {
    try {
        // Check if content already exists
        const existingContent = await LandingContent.count();
        if (existingContent > 0) {
            return res.status(200).json({
                success: true,
                message: 'Default content already exists'
            });
        }

        // Hero section defaults
        const heroDefaults = [
            { section: 'hero', contentKey: 'title', contentValue: 'Bobur Mirzo Restaurant', displayOrder: 1 },
            { section: 'hero', contentKey: 'subtitle', contentValue: 'Imperatorlik Taomlarining Zamonaviy Talqini', displayOrder: 2 },
            { section: 'hero', contentKey: 'description', contentValue: 'O\'zbekistonning boy oshxona an\'analarini kashf eting', displayOrder: 3 },
            { section: 'hero', contentKey: 'backgroundImage', contentValue: '', imageUrl: '/uploads/hero/hero-bg.jpg', displayOrder: 4 }
        ];

        // Features defaults
        const featureDefaults = [
            { section: 'features', contentKey: 'feature1', contentValue: 'Halol Mahsulotlar', imageUrl: 'halal', displayOrder: 1 },
            { section: 'features', contentKey: 'feature2', contentValue: 'Tez Yetkazib Berish', imageUrl: 'delivery', displayOrder: 2 },
            { section: 'features', contentKey: 'feature3', contentValue: 'An\'anaviy Retseptlar', imageUrl: 'recipe', displayOrder: 3 },
            { section: 'features', contentKey: 'feature4', contentValue: 'Oilaviy Muhit', imageUrl: 'family', displayOrder: 4 }
        ];

        // Contact defaults
        const contactDefaults = [
            { section: 'contact', contentKey: 'address', contentValue: 'Toshkent sh., Amir Temur ko\'chasi, 123-uy', displayOrder: 1 },
            { section: 'contact', contentKey: 'phone', contentValue: '+998 90 123 45 67', displayOrder: 2 },
            { section: 'contact', contentKey: 'email', contentValue: 'info@boburmirzo.uz', displayOrder: 3 },
            { section: 'contact', contentKey: 'workingHours', contentValue: 'Har kuni: 10:00 - 23:00', displayOrder: 4 },
            { section: 'contact', contentKey: 'mapLat', contentValue: '41.3111', displayOrder: 5 },
            { section: 'contact', contentKey: 'mapLng', contentValue: '69.2797', displayOrder: 6 }
        ];

        await LandingContent.bulkCreate([...heroDefaults, ...featureDefaults, ...contactDefaults]);

        // Default testimonials
        const testimonialDefaults = [
            { customerName: 'Aziz Karimov', rating: 5, content: 'Ajoyib restoran! Osh juda mazali, xizmat a\'lo darajada.', displayOrder: 1 },
            { customerName: 'Dilnoza Rahimova', rating: 5, content: 'Oilamiz bilan har hafta kelamiz. Atmosfera juda yaxshi.', displayOrder: 2 },
            { customerName: 'Sardor Aliyev', rating: 4, content: 'Taomlar sifati yuqori, narxlar ham o\'rtacha.', displayOrder: 3 }
        ];

        await Testimonial.bulkCreate(testimonialDefaults);

        res.status(201).json({
            success: true,
            message: 'Default content seeded successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    // Landing content
    getAllContent,
    createContent,
    updateContent,
    deleteContent,
    // Testimonials
    getAllTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    // Media files
    uploadFile,
    getAllMediaFiles,
    deleteMediaFile,
    // Seed
    seedDefaultContent
};
