/**
 * Created by Asus on 15.05.2016.
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

router.get('/:keywordId', function (req, res, next) {
    var keywordId = req.params.keywordId;
    console.log(keywordId);

    Topic.find({}, function (err, topics) {
        if (err) throw err;

        var screenTopicArray = [];
        topics.forEach(function (topic) {
            // TODO : forEach 
            if (topics.relevantKeywords[0] == keywordId) {
                if (topic.allowStatus)
                    screenTopicArray.push(topic);
            }
        });

        MainTopic.find({}, function (err, mainTopics) {
            res.render('show_topic_list', {
                topics: screenTopicArray,
                title: 'Kavramlar',
                mainTopics: mainTopics
            });
        });

    });
});


module.exports = router;