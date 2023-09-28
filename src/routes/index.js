const router = require('express').Router();

const series = require('./series')

router.use('/series', series)

module.exports = router;