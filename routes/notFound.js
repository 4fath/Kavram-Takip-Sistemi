/**
 * Created by TOSHIBA on 1.5.2016.
 */

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('not_found');
});

router.post('/', function (req, res, next) {
    res.redirect('/');
    res.location('/');
});

module.exports = router;