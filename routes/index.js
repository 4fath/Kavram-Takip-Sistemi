var express = require('express');
var router = express.Router();

var MainTopic = require('../models/MainTopic');
var Topic = require('../models/Topic');
var Comment = require('../models/Comment');

/* GET home page. */
router.get('/', function (req, res, next) {

    // var myTopic = {test : "test name"} ;
    // req.session.topic = myTopic;
    
    Topic.findOne({}, function (err, topic) {
       if (err) throw err;
        myTopic = topic;
        req.session.topic = topic;
        var myCommentArray = [];
        Comment.find({ topic : topic._id}, function (err, comments) {
            if (err) throw err;
            console.log(comments);
            myCommentArray = comments;
            Topic.find({}, function (err, topics) {
                if (err) throw err;
                res.render('kavram_takip', {
                    title: 'Kavram Takip Sistemi Test',
                    mainTopic : topic,
                    comments : myCommentArray,
                    topics : topics
                });
            });

        });
    });


    // var sendingTopics = [];
    // var requetUser = req.user;
    // MainTopic.find({}, function (err, topics) {
    //     if (err) throw err;
    //     console.log(topics);
    //     topics.forEach(function (topic) {
    //         sendingTopics.push(topic.name);
    //         console.log(topic);
    //     });
    //     res.render('kavram_takip', {
    //             title: 'Kavram Takip Sistemi Test',
    //             mainTopics : sendingTopics
    //         });
    // });

    console.log("ilk neresi");

});

module.exports = router;
