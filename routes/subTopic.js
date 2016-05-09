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
    console.log(subTopicId);
    
    Topic.find({}, function (err, topics) {
        if (err) throw err;
        
        var screenTopicArray = [];
        topics.forEach(function (topic) {
            // TODO : forEach 
            if (topic.relevantSubTopics[0] == subTopicId){
                screenTopicArray.push(topic);
            }
        });
        res.render('show_topic_list', {
            topics : screenTopicArray,
            title : 'Kavramlar'
        });
    });
});

module.exports = router;