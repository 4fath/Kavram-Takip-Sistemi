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

router.get('/:mainTopicId', function (req, res, next) {
    var mainTopicId = req.params.mainTopicId;
    MainTopic.findById(mainTopicId, function (err, mainTopic) {
        if (err) throw err;
        var subTopicArray = mainTopic.relevantSubTopics;
        res.render('show_sub_topic_list',{
            subTopics : subTopicArray
        });
    });
});
module.exports = router;