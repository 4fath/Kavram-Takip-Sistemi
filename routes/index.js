var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Topic = require('../models/Topic');
var Comment = require('../models/Comment');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

    var myMainTopics = [];
    var mySubTopics = [];
    var myTopics = [];

    // parallel search for async process
    async.parallel([
        function (callback) {
            MainTopic.find({}, function (err, mainTopics) {
                if (err) return callback(err);
                mainTopics.forEach(function (mainTopic) {
                    myMainTopics.push(mainTopic);
                });
                callback();
            });
        },
        function (callback) {
            SubTopic.find({}, function (err, subTopics) {
                if (err) return callback(err);
                subTopics.forEach(function (subTopic) {
                    mySubTopics.push(subTopic);
                });
                callback();
            });
        },
        function (callback) {
            Topic.find({}, function (err, topics) {
                if (err) return callback(err);
                topics.forEach(function (topic) {
                    myTopics.push(topic);
                });
                callback();
            });
        }
    ],function (err) {
        if (err) return (err);

        var mainTopicLength = myMainTopics.length;
        var subTopicLength = mySubTopics.length;
        var topicLength = myTopics.length;

        // get a random Main, Sub etc.. topic for display on screen
        var randomMainTopic = myMainTopics[getRandomInt(0, mainTopicLength-1)];
        var randomSubTopic = myMainTopics[getRandomInt(0, subTopicLength-1)];
        var randomTopic = myTopics[getRandomInt(0, topicLength-1)];

        res.render('kavram_takip', {
            title : 'Kavram Takip Sistemi',
            mainTopics : myMainTopics,
            subTopics : mySubTopics,
            topics : myTopics,
            randomMainTopic : randomMainTopic,
            randomSubTopic : randomSubTopic,
            randomTopic : randomTopic
        });

    });

});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = router;
