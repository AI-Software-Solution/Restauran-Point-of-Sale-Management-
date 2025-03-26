const statistics = require('../controllers/statistics.ctr')

const router = require('express').Router()

router.get('/statistics', statistics)

module.exports = router