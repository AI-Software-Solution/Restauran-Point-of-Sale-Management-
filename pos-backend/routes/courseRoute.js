const express = require('express');
const router = express.Router();
const {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getOrderCourses,
    addCourseToOrder,
    fireCourse,
    fireNextCourse,
    updateCourseStatus,
    updateCourseItemStatus,
    getActiveCourses,
    seedDefaultCourses
} = require('../controllers/course.ctr');
const { isVerifiedUser } = require('../middlewares/tokenVerification');

// Barcha endpointlar auth talab qiladi
router.use(isVerifiedUser);

// ==================== COURSE CRUD ====================
router.get('/', getCourses);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

// Seed default courses
router.post('/seed', seedDefaultCourses);

// ==================== ORDER COURSE MANAGEMENT ====================

// Buyurtma uchun kurslarni olish
router.get('/orders/:orderId', getOrderCourses);

// Buyurtmaga kurs qo'shish
router.post('/orders/:orderId', addCourseToOrder);

// Kursni oshxonaga yuborish (Fire)
router.post('/orders/:orderId/courses/:courseId/fire', fireCourse);

// Keyingi kursni avtomatik yuborish
router.post('/orders/:orderId/fire-next', fireNextCourse);

// Kurs statusini yangilash
router.put('/orders/:orderId/courses/:courseId/status', updateCourseStatus);

// Item statusini yangilash
router.put('/items/:itemId/status', updateCourseItemStatus);

// ==================== KITCHEN DISPLAY ====================

// Oshxona uchun faol kurslar
router.get('/kitchen/active', getActiveCourses);

module.exports = router;
