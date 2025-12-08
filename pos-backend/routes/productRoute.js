const router = require('express').Router()
const {getProducts, addProduct, updateProduct, deleteProduct, getOneProduct} = require('../controllers/products')
const { isVerifiedUser } = require('../middlewares/tokenVerification')

// Public routes (for menu display)
router.get('/', getProducts)
router.get('/:id', getOneProduct)

// Protected routes (require authentication)
router.post('/', isVerifiedUser, addProduct)
router.put('/:id', isVerifiedUser, updateProduct)
router.delete('/:id', isVerifiedUser, deleteProduct)

module.exports = router