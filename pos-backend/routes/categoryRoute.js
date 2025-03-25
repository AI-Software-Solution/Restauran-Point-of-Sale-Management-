const router = require('express').Router()
const {getCategories, addCategory, updateCategory, deleteCategory, getOneCategory} = require('../controllers/category')

router.get('/', getCategories)
router.post('/', addCategory)
router.get('/:id', getOneCategory)
router.put('/:id', updateCategory)
router.delete('/:id', deleteCategory)

module.exports = router