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
    console.log(mainTopicId);

    var query = {mainTopic: mainTopicId, hasChiefEditor: true};

    SubTopic.find(query, function (err, subTopics) {
        if (err) throw err;
        console.log("Bağlantılı olduğu alt başlıklar  : ");
        MainTopic.find({}, function (err, mainTopics) {
            if (err) throw err;
            res.render('show_sub_topic_list', {
                subTopics: subTopics,
                mainTopics: mainTopics
            });
        });
    });
});
module.exports = router;