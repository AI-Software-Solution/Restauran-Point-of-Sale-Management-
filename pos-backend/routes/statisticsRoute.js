const statistics = require('../controllers/statistics.ctr')
const { isVerifiedUser } = require('../middlewares/tokenVerification')

const router = require('express').Router()

router.get('/', isVerifiedUser, statistics)

module.exports = router