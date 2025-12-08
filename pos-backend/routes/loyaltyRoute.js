const express = require('express');
const router = express.Router();
const {
    getProgram,
    updateProgram,
    registerMember,
    findMemberByPhone,
    findMemberByCard,
    getAllMembers,
    updateMember,
    earnPoints,
    redeemPoints,
    addBonusPoints,
    getMemberTransactions,
    getRewards,
    createReward,
    updateReward,
    deleteReward,
    getLoyaltyStats
} = require('../controllers/loyalty.ctr');
const { isVerifiedUser } = require('../middlewares/tokenVerification');

// Barcha endpointlar auth talab qiladi
router.use(isVerifiedUser);

// ==================== PROGRAM ====================
router.get('/program', getProgram);
router.put('/program', updateProgram);

// ==================== MEMBERS ====================
router.post('/members', registerMember);
router.get('/members', getAllMembers);
router.get('/members/phone/:phone', findMemberByPhone);
router.get('/members/card/:cardNumber', findMemberByCard);
router.put('/members/:memberId', updateMember);

// ==================== POINTS ====================
router.post('/members/:memberId/earn', earnPoints);
router.post('/members/:memberId/redeem', redeemPoints);
router.post('/members/:memberId/bonus', addBonusPoints);
router.get('/members/:memberId/transactions', getMemberTransactions);

// ==================== REWARDS ====================
router.get('/rewards', getRewards);
router.post('/rewards', createReward);
router.put('/rewards/:rewardId', updateReward);
router.delete('/rewards/:rewardId', deleteReward);

// ==================== STATS ====================
router.get('/stats', getLoyaltyStats);

module.exports = router;
