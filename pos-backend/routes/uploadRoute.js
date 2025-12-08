const express = require('express');
const router = express.Router();
const { uploadWithResize, processImage, processImageWithSize } = require('../config/multer');
const { isVerifiedUser } = require('../middlewares/tokenVerification');
const { MediaFile } = require('../models/index');

// Generic image upload with 400x400 resize
router.post('/image',
    isVerifiedUser,
    uploadWithResize.single('image'),
    processImage,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No image file provided'
                });
            }

            // Save to MediaFile for tracking
            const mediaFile = await MediaFile.create({
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: 'image/webp',
                size: req.file.size,
                url: req.file.url,
                folder: req.file.folder,
                uploadedBy: req.user?.id || null
            });

            res.status(200).json({
                success: true,
                message: 'Image uploaded successfully',
                data: {
                    id: mediaFile.id,
                    url: req.file.url,
                    filename: req.file.filename
                }
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload image',
                error: error.message
            });
        }
    }
);

// Category image upload (400x400)
router.post('/category/:id/image',
    isVerifiedUser,
    uploadWithResize.single('image'),
    async (req, res, next) => {
        req.body.folder = 'categories';
        next();
    },
    processImage,
    async (req, res) => {
        try {
            const { Category } = require('../models/index');
            const category = await Category.findByPk(req.params.id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            await category.update({ image: req.file.url });

            res.status(200).json({
                success: true,
                message: 'Category image updated',
                data: {
                    id: category.id,
                    image: req.file.url
                }
            });
        } catch (error) {
            console.error('Category image upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload category image',
                error: error.message
            });
        }
    }
);

// Product image upload (400x400)
router.post('/product/:id/image',
    isVerifiedUser,
    uploadWithResize.single('image'),
    async (req, res, next) => {
        req.body.folder = 'products';
        next();
    },
    processImage,
    async (req, res) => {
        try {
            const { Product } = require('../models/index');
            const product = await Product.findByPk(req.params.id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            await product.update({ image: req.file.url });

            res.status(200).json({
                success: true,
                message: 'Product image updated',
                data: {
                    id: product.id,
                    image: req.file.url
                }
            });
        } catch (error) {
            console.error('Product image upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload product image',
                error: error.message
            });
        }
    }
);

module.exports = router;
