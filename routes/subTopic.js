/**
 * Created by TOSHIBA on 5.5.2016.
 */
var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Topic = require('../models/Topic');

var User = require('../models/User');
var Comment = require('../models/Comment');

var router = express.Router();


router.get('/:subTopicId', function (req, res, next) {
    var subTopicId = req.params.subTopicId;
    SubTopic.findById(subTopicId, function (err, subTopic) {
        if (err) throw err;
        var topicArray = subTopic.relevantTopics;
        res.render('show_topic_list', {
            topics : topicArray
        });
    });
});

module.exports = router;