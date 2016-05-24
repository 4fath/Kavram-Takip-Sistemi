/**
 * Created by TOSHIBA on 5.5.2016.
 */

var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Topic = require('../models/Topic');
var Keyword = require('../models/Keyword');
var User = require('../models/User');
var Comment = require('../models/Comment');

var router = express.Router();

router.get('/:subTopicId', function (req, res, next) {
    var subTopicId = req.params.subTopicId;
    console.log(subTopicId);

    var query = {subTopic: subTopicId, hasEditor: true};
    Keyword.find(query, function (err, keywords) {
        if (err) throw err;

        MainTopic.find({}, function (err, mainTopics) {
            res.render('show_keyword_list', {
                keywords: keywords,
                title: 'Anahtar Kelimeler',
                mainTopics : mainTopics
            });
        });
        
    });
});

module.exports = router;