const router = require('express').Router();
const { isVerifiedUser, isAdminOrOwner } = require('../middlewares/tokenVerification');
const {
    // Floor CRUD
    getFloors,
    getFloor,
    createFloor,
    updateFloor,
    deleteFloor,
    // Table Position
    updateTablePosition,
    bulkUpdateTablePositions,
    getUnassignedTables,
    // Stats
    getFloorStats
} = require('../controllers/floor.ctr');

// ==================== FLOOR ROUTES ====================
router.get('/', isVerifiedUser, getFloors);
router.get('/stats', isVerifiedUser, getFloorStats);
router.get('/unassigned-tables', isVerifiedUser, getUnassignedTables);
router.get('/:id', isVerifiedUser, getFloor);
router.post('/', isAdminOrOwner, createFloor);
router.put('/:id', isAdminOrOwner, updateFloor);
router.delete('/:id', isAdminOrOwner, deleteFloor);

// ==================== TABLE POSITION ROUTES ====================
router.put('/table/:id/position', isAdminOrOwner, updateTablePosition);
router.post('/tables/positions', isAdminOrOwner, bulkUpdateTablePositions);

module.exports = router;
