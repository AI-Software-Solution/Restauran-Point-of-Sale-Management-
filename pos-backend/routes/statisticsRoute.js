const statistics = require('../controllers/statistics.ctr')

const router = require('express').Router()

router.get('/', statistics)

module.exports = router