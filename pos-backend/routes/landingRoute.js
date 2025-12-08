const express = require('express');
const {
    getLandingData,
    getHeroSection,
    getMenuPreview,
    getTestimonials,
    getContactInfo,
    getFeatures
} = require('../controllers/landingController');

const router = express.Router();

// Public routes - no authentication required
router.get('/', getLandingData);
router.get('/hero', getHeroSection);
router.get('/menu', getMenuPreview);
router.get('/testimonials', getTestimonials);
router.get('/contact', getContactInfo);
router.get('/features', getFeatures);

module.exports = router;
