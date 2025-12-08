const express = require('express');
const {
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
} = require('../controllers/cmsController');
const { isVerifiedUser } = require('../middlewares/tokenVerification');
const { upload } = require('../config/multer');

const router = express.Router();

// All CMS routes require authentication
router.use(isVerifiedUser);

// Landing Content CRUD
router.get('/content', getAllContent);
router.post('/content', createContent);
router.put('/content/:id', updateContent);
router.delete('/content/:id', deleteContent);

// Testimonials CRUD
router.get('/testimonials', getAllTestimonials);
router.post('/testimonials', createTestimonial);
router.put('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

// Media Files
router.get('/media', getAllMediaFiles);
router.post('/media/upload', upload.single('file'), uploadFile);
router.delete('/media/:id', deleteMediaFile);

// Seed default content
router.post('/seed', seedDefaultContent);

module.exports = router;
