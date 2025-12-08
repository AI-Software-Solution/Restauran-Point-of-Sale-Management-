const {
    Course,
    OrderCourse,
    OrderCourseItem,
    Order,
    User,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

// ==================== COURSE CRUD ====================

// Barcha kurslarni olish
const getCourses = async (req, res) => {
    try {
        const courses = await Course.findAll({
            where: { isActive: true },
            order: [['displayOrder', 'ASC']]
        });
        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Kurs yaratish
const createCourse = async (req, res) => {
    try {
        const { name, nameUz, displayOrder, color, icon } = req.body;

        const course = await Course.create({
            name,
            nameUz,
            displayOrder: displayOrder || 0,
            color: color || '#714B67',
            icon,
            isActive: true
        });

        res.status(201).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Kurs yangilash
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findByPk(id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Kurs topilmadi' });
        }

        await course.update(req.body);
        res.json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Kurs o'chirish
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findByPk(id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Kurs topilmadi' });
        }

        await course.update({ isActive: false });
        res.json({ success: true, message: 'Kurs o\'chirildi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== ORDER COURSE MANAGEMENT ====================

// Buyurtma uchun kurslarni olish
const getOrderCourses = async (req, res) => {
    try {
        const { orderId } = req.params;

        const orderCourses = await OrderCourse.findAll({
            where: { orderId },
            include: [
                {
                    model: Course,
                    as: 'course'
                },
                {
                    model: OrderCourseItem,
                    as: 'items'
                },
                {
                    model: User,
                    as: 'firedByUser',
                    attributes: ['id', 'name']
                }
            ],
            order: [[{ model: Course, as: 'course' }, 'displayOrder', 'ASC']]
        });

        res.json({ success: true, data: orderCourses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Buyurtmaga kurs qo'shish
const addCourseToOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { orderId } = req.params;
        const { courseId, items } = req.body;

        // Buyurtma mavjudligini tekshirish
        const order = await Order.findByPk(orderId);
        if (!order) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });
        }

        // Kurs mavjudligini tekshirish
        const course = await Course.findByPk(courseId);
        if (!course) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Kurs topilmadi' });
        }

        // OrderCourse yaratish
        const orderCourse = await OrderCourse.create({
            orderId,
            courseId,
            courseStatus: 'waiting'
        }, { transaction });

        // OrderCourseItems yaratish
        if (items && items.length > 0) {
            for (const item of items) {
                await OrderCourseItem.create({
                    orderCourseId: orderCourse.id,
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity || 1,
                    notes: item.notes,
                    modifiers: item.modifiers
                }, { transaction });
            }
        }

        await transaction.commit();

        // To'liq ma'lumotni qaytarish
        const result = await OrderCourse.findByPk(orderCourse.id, {
            include: [
                { model: Course, as: 'course' },
                { model: OrderCourseItem, as: 'items' }
            ]
        });

        res.status(201).json({ success: true, data: result });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};

// Kursni oshxonaga yuborish (Fire)
const fireCourse = async (req, res) => {
    try {
        const { orderId, courseId } = req.params;
        const userId = req.user?._id;

        const orderCourse = await OrderCourse.findOne({
            where: { orderId, courseId }
        });

        if (!orderCourse) {
            return res.status(404).json({ success: false, message: 'Order course topilmadi' });
        }

        if (orderCourse.courseStatus !== 'waiting') {
            return res.status(400).json({
                success: false,
                message: 'Bu kurs allaqachon yuborilgan'
            });
        }

        await orderCourse.update({
            courseStatus: 'fired',
            firedAt: new Date(),
            firedBy: userId
        });

        // WebSocket orqali oshxonaga xabar yuborish (future)
        // io.to('kitchen').emit('course:fired', { orderId, courseId, orderCourse });

        res.json({
            success: true,
            message: 'Kurs oshxonaga yuborildi',
            data: orderCourse
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Keyingi kursni avtomatik yuborish
const fireNextCourse = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user?._id;

        // Buyurtmaning barcha kurslarini olish
        const orderCourses = await OrderCourse.findAll({
            where: { orderId },
            include: [{ model: Course, as: 'course' }],
            order: [[{ model: Course, as: 'course' }, 'displayOrder', 'ASC']]
        });

        // Kutayotgan birinchi kursni topish
        const nextCourse = orderCourses.find(oc => oc.courseStatus === 'waiting');

        if (!nextCourse) {
            return res.status(400).json({
                success: false,
                message: 'Yuborish uchun kurs yo\'q'
            });
        }

        await nextCourse.update({
            courseStatus: 'fired',
            firedAt: new Date(),
            firedBy: userId
        });

        res.json({
            success: true,
            message: `${nextCourse.course.name} oshxonaga yuborildi`,
            data: nextCourse
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Kurs statusini yangilash (Oshxona uchun)
const updateCourseStatus = async (req, res) => {
    try {
        const { orderId, courseId } = req.params;
        const { status } = req.body;

        const validStatuses = ['waiting', 'fired', 'preparing', 'ready', 'served'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Noto\'g\'ri status'
            });
        }

        const orderCourse = await OrderCourse.findOne({
            where: { orderId, courseId }
        });

        if (!orderCourse) {
            return res.status(404).json({ success: false, message: 'Order course topilmadi' });
        }

        const updateData = { courseStatus: status };

        if (status === 'ready') {
            updateData.readyAt = new Date();
        } else if (status === 'served') {
            updateData.servedAt = new Date();
        }

        await orderCourse.update(updateData);

        res.json({ success: true, data: orderCourse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Kurs item statusini yangilash
const updateCourseItemStatus = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { status } = req.body;

        const item = await OrderCourseItem.findByPk(itemId);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item topilmadi' });
        }

        await item.update({ itemStatus: status });

        // Barcha itemlar ready bo'lsa, kursni ready qilish
        const orderCourse = await OrderCourse.findByPk(item.orderCourseId, {
            include: [{ model: OrderCourseItem, as: 'items' }]
        });

        const allReady = orderCourse.items.every(i =>
            i.id === item.id ? status === 'ready' : i.itemStatus === 'ready'
        );

        if (allReady && orderCourse.courseStatus !== 'ready') {
            await orderCourse.update({
                courseStatus: 'ready',
                readyAt: new Date()
            });
        }

        res.json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Kitchen Display uchun faol kurslar
const getActiveCourses = async (req, res) => {
    try {
        const { status } = req.query;

        const whereClause = {};
        if (status) {
            whereClause.courseStatus = status;
        } else {
            whereClause.courseStatus = { [Op.in]: ['fired', 'preparing'] };
        }

        const activeCourses = await OrderCourse.findAll({
            where: whereClause,
            include: [
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'tableId', 'customerDetails']
                },
                {
                    model: Course,
                    as: 'course'
                },
                {
                    model: OrderCourseItem,
                    as: 'items'
                }
            ],
            order: [['firedAt', 'ASC']]
        });

        res.json({ success: true, data: activeCourses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Default kurslarni yaratish (seed)
const seedDefaultCourses = async (req, res) => {
    try {
        const defaultCourses = [
            { name: 'Appetizer', nameUz: 'Salatlar', displayOrder: 1, color: '#28A745', icon: '🥗' },
            { name: 'Soup', nameUz: 'Sho\'rvalar', displayOrder: 2, color: '#FFC107', icon: '🍜' },
            { name: 'Main Course', nameUz: 'Asosiy taom', displayOrder: 3, color: '#714B67', icon: '🍽️' },
            { name: 'Dessert', nameUz: 'Shirinlik', displayOrder: 4, color: '#E91E63', icon: '🍰' },
            { name: 'Drinks', nameUz: 'Ichimliklar', displayOrder: 5, color: '#17A2B8', icon: '🥤' }
        ];

        for (const course of defaultCourses) {
            await Course.findOrCreate({
                where: { name: course.name },
                defaults: course
            });
        }

        const courses = await Course.findAll({ order: [['displayOrder', 'ASC']] });
        res.json({ success: true, message: 'Default kurslar yaratildi', data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    // Course CRUD
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    // Order Course Management
    getOrderCourses,
    addCourseToOrder,
    fireCourse,
    fireNextCourse,
    updateCourseStatus,
    updateCourseItemStatus,
    getActiveCourses,
    seedDefaultCourses
};
