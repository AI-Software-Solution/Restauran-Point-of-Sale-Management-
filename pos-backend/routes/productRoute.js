const router = require('express').Router()
const {getProducts, addProduct, updateProduct, deleteProduct, getOneProduct} = require('../controllers/products')

router.get('/', getProducts)
router.post('/', addProduct)
router.get('/:id', getOneProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

module.exports = router