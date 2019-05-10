//서버 시작--> npm start
var express = require('express');
var router = express.Router();

/* GET home page. */
router.use('/training', require('./training/index'));
router.use('/homework', require('./homework/index'));
module.exports = router;
