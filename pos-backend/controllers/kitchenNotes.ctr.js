const {
    KitchenNote,
    AllergyPreset,
    Order,
    User,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

// ==================== KITCHEN NOTES ====================

// Buyurtmaga izoh qo'shish
const addNote = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { itemIndex, productId, noteType, noteText, severity } = req.body;

        // Buyurtma mavjudligini tekshirish
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });
        }

        const note = await KitchenNote.create({
            orderId,
            itemIndex,
            productId,
            noteType: noteType || 'general',
            noteText,
            severity: severity || (noteType === 'allergy' ? 'critical' : 'low'),
            isAcknowledged: false
        });

        res.status(201).json({ success: true, data: note });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Buyurtma uchun izohlarni olish
const getOrderNotes = async (req, res) => {
    try {
        const { orderId } = req.params;

        const notes = await KitchenNote.findAll({
            where: { orderId },
            include: [{
                model: User,
                as: 'acknowledger',
                attributes: ['id', 'name']
            }],
            order: [
                ['severity', 'DESC'],
                ['createdAt', 'ASC']
            ]
        });

        res.json({ success: true, data: notes });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Izohni tasdiqlash (Oshxona tomonidan)
const acknowledgeNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user?._id;

        const note = await KitchenNote.findByPk(noteId);
        if (!note) {
            return res.status(404).json({ success: false, message: 'Izoh topilmadi' });
        }

        await note.update({
            isAcknowledged: true,
            acknowledgedAt: new Date(),
            acknowledgedBy: userId
        });

        res.json({ success: true, data: note });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Izohni o'chirish
const deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;

        const note = await KitchenNote.findByPk(noteId);
        if (!note) {
            return res.status(404).json({ success: false, message: 'Izoh topilmadi' });
        }

        await note.destroy();
        res.json({ success: true, message: 'Izoh o\'chirildi' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Oshxona uchun barcha faol izohlar
const getActiveNotes = async (req, res) => {
    try {
        const { severity, type } = req.query;
        const where = { isAcknowledged: false };

        if (severity) {
            where.severity = severity;
        }

        if (type) {
            where.noteType = type;
        }

        const notes = await KitchenNote.findAll({
            where,
            include: [{
                model: Order,
                as: 'order',
                attributes: ['id', 'tableId', 'customerDetails', 'orderStatus']
            }],
            order: [
                ['severity', 'DESC'],
                ['createdAt', 'ASC']
            ]
        });

        res.json({ success: true, data: notes });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Kritik (allergiya) izohlarni olish
const getAllergyAlerts = async (req, res) => {
    try {
        const notes = await KitchenNote.findAll({
            where: {
                noteType: 'allergy',
                isAcknowledged: false
            },
            include: [{
                model: Order,
                as: 'order',
                attributes: ['id', 'tableId', 'customerDetails']
            }],
            order: [['createdAt', 'ASC']]
        });

        res.json({ success: true, data: notes });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== ALLERGY PRESETS ====================

// Barcha allergiya presetlarini olish
const getAllergyPresets = async (req, res) => {
    try {
        const presets = await AllergyPreset.findAll({
            where: { isActive: true },
            order: [['name', 'ASC']]
        });

        res.json({ success: true, data: presets });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Allergiya preset yaratish
const createAllergyPreset = async (req, res) => {
    try {
        const { name, nameUz, icon, color } = req.body;

        const preset = await AllergyPreset.create({
            name,
            nameUz,
            icon,
            color: color || '#DC3545'
        });

        res.status(201).json({ success: true, data: preset });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Allergiya preset yangilash
const updateAllergyPreset = async (req, res) => {
    try {
        const { id } = req.params;
        const preset = await AllergyPreset.findByPk(id);

        if (!preset) {
            return res.status(404).json({ success: false, message: 'Preset topilmadi' });
        }

        await preset.update(req.body);
        res.json({ success: true, data: preset });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Allergiya preset o'chirish
const deleteAllergyPreset = async (req, res) => {
    try {
        const { id } = req.params;
        const preset = await AllergyPreset.findByPk(id);

        if (!preset) {
            return res.status(404).json({ success: false, message: 'Preset topilmadi' });
        }

        await preset.update({ isActive: false });
        res.json({ success: true, message: 'Preset o\'chirildi' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Default allergiya presetlarini yaratish
const seedAllergyPresets = async (req, res) => {
    try {
        const defaultPresets = [
            { name: 'Gluten', nameUz: 'Gluten', icon: '🌾', color: '#FFC107' },
            { name: 'Nuts', nameUz: 'Yong\'oq', icon: '🥜', color: '#8B4513' },
            { name: 'Dairy', nameUz: 'Sut mahsulotlari', icon: '🥛', color: '#87CEEB' },
            { name: 'Eggs', nameUz: 'Tuxum', icon: '🥚', color: '#FFE4B5' },
            { name: 'Shellfish', nameUz: 'Dengiz mahsulotlari', icon: '🦐', color: '#FF6347' },
            { name: 'Soy', nameUz: 'Soya', icon: '🫘', color: '#9ACD32' },
            { name: 'Fish', nameUz: 'Baliq', icon: '🐟', color: '#4169E1' },
            { name: 'Peanuts', nameUz: 'Yer yong\'oq', icon: '🥜', color: '#D2691E' },
            { name: 'Sesame', nameUz: 'Kunjut', icon: '🌰', color: '#F5DEB3' },
            { name: 'Spicy', nameUz: 'Achchiq', icon: '🌶️', color: '#DC3545' }
        ];

        for (const preset of defaultPresets) {
            await AllergyPreset.findOrCreate({
                where: { name: preset.name },
                defaults: preset
            });
        }

        const presets = await AllergyPreset.findAll({ where: { isActive: true } });
        res.json({ success: true, message: 'Default presetlar yaratildi', data: presets });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== PREP PREFERENCES ====================

// Standart tayyorlash preferenslari
const getPrepPreferences = async (req, res) => {
    try {
        const preferences = [
            { category: 'Go\'sht pishirish', options: ['Kam pishgan (Rare)', 'O\'rtacha (Medium)', 'Yaxshi pishgan (Well Done)'] },
            { category: 'Achchiqlik', options: ['Achchiqsiz', 'Ozgina achchiq', 'O\'rtacha achchiq', 'Juda achchiq'] },
            { category: 'Tuz', options: ['Tuzsiz', 'Kam tuz', 'Normal'] },
            { category: 'Moy', options: ['Kam moyda', 'Normal', 'Ko\'proq moyda'] },
            { category: 'So\'slar', options: ['So\'ssiz', 'So\'s alohida', 'So\'s ustida'] },
            { category: 'Sabzavotlar', options: ['Xom', 'Yarim pishgan', 'To\'liq pishgan'] }
        ];

        res.json({ success: true, data: preferences });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    // Kitchen Notes
    addNote,
    getOrderNotes,
    acknowledgeNote,
    deleteNote,
    getActiveNotes,
    getAllergyAlerts,
    // Allergy Presets
    getAllergyPresets,
    createAllergyPreset,
    updateAllergyPreset,
    deleteAllergyPreset,
    seedAllergyPresets,
    // Prep Preferences
    getPrepPreferences
};
