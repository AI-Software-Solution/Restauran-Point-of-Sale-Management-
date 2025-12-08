const express = require('express');
const router = express.Router();
const {
    addNote,
    getOrderNotes,
    acknowledgeNote,
    deleteNote,
    getActiveNotes,
    getAllergyAlerts,
    getAllergyPresets,
    createAllergyPreset,
    updateAllergyPreset,
    deleteAllergyPreset,
    seedAllergyPresets,
    getPrepPreferences
} = require('../controllers/kitchenNotes.ctr');
const { isVerifiedUser } = require('../middlewares/tokenVerification');

// Barcha endpointlar auth talab qiladi
router.use(isVerifiedUser);

// ==================== KITCHEN NOTES ====================

// Buyurtmaga izoh qo'shish
router.post('/orders/:orderId/notes', addNote);

// Buyurtma uchun izohlarni olish
router.get('/orders/:orderId/notes', getOrderNotes);

// Izohni tasdiqlash
router.put('/notes/:noteId/acknowledge', acknowledgeNote);

// Izohni o'chirish
router.delete('/notes/:noteId', deleteNote);

// Oshxona uchun barcha faol izohlar
router.get('/active', getActiveNotes);

// Kritik (allergiya) izohlar
router.get('/allergy-alerts', getAllergyAlerts);

// ==================== ALLERGY PRESETS ====================

router.get('/allergy-presets', getAllergyPresets);
router.post('/allergy-presets', createAllergyPreset);
router.put('/allergy-presets/:id', updateAllergyPreset);
router.delete('/allergy-presets/:id', deleteAllergyPreset);
router.post('/allergy-presets/seed', seedAllergyPresets);

// ==================== PREP PREFERENCES ====================

router.get('/prep-preferences', getPrepPreferences);

module.exports = router;
