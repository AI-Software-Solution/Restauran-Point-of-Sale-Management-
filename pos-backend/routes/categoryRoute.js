const router = require('express').Router()
const {getCategories, addCategory, updateCategory, deleteCategory, getOneCategory} = require('../controllers/category')
const { isVerifiedUser } = require('../middlewares/tokenVerification')

// Public routes (for menu display)
router.get('/', getCategories)
router.get('/:id', getOneCategory)

// Protected routes (require authentication)
router.post('/', isVerifiedUser, addCategory)
router.put('/:id', isVerifiedUser, updateCategory)
router.delete('/:id', isVerifiedUser, deleteCategory)

module.exports = router