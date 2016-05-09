var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Topic = require('../models/Topic');
var Comment = require('../models/Comment');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

    var currentUser = req.user;

    var myMainTopics = [];
    var mySubTopics = [];
    var myTopics = [];
    var onerilenTopicler = [];

    // USER access
    if (currentUser) {
        var currentUserId = currentUser._id;
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
            // oneri listesi
            function (callback) {
                SubTopic.find({}, function (err, subTopics) {
                    if (err) return callback(err);
                    subTopics.forEach(function (subTopic) {
                        mySubTopics.push(subTopic);
                        currentUser.followingSubTopics.forEach(function (subTopicc) {
                            if (subTopic._id == subTopicc._id) {
                                subTopic.relevantTopics.forEach(function (topic) {
                                    currentUser.followingTopics.forEach(function (myTopic) {
                                        if (topic._id != myTopic._id) {
                                            onerilenTopicler.push(topic);
                                        }
                                    });
                                });
                            }
                        });
                    });
                    callback();
                });
            },
            function (callback) {
                Topic.find({}, function (err, topics) {
                    if (err) return callback(err);
                    if (topics.length > 0) {
                        var maxViewedTopic = topics[0];
                        topics.forEach(function (topic) {
                            myTopics.push(topic);
                            if (topic.viewCount > maxViewedTopic.viewCount) {
                                maxViewedTopic = topic;
                            }
                        });
                        onerilenTopicler.push(maxViewedTopic);
                    }
                    callback();
                });
            }
        ], function (err) {
            if (err) return (err);

            var mainTopicLength = myMainTopics.length;
            var subTopicLength = mySubTopics.length;
            var topicLength = myTopics.length;

            var takipEdilenListesi;
            if (currentUser.followingTopics.length == 0) {
                takipEdilenListesi = currentUser.followingTopics;
            } else {
                takipEdilenListesi = [];
            }

            // get a random Main, Sub etc.. topic for display on screen
            var randomMainTopic = myMainTopics[getRandomInt(0, mainTopicLength - 1)];
            var randomSubTopic = myMainTopics[getRandomInt(0, subTopicLength - 1)];


            // instanceof istediğim gibi çalışıyor
            // if (myMainTopics[0] instanceof SubTopic){
            //     console.log("SubTopic sanan mainTopic")
            // }else if (myMainTopics[0] instanceof MainTopic){
            //     console.log("mainTopic gibi mainTopic")
            // }else {
            //     console.log("Ne olduğunu anlamdık");
            // }


            var randomTopic = myTopics[getRandomInt(0, topicLength - 1)];

            //  var randomTopic = myTopics[topicLength - 1];

            var MainTopicsId ;
            var SubTopicId ;
            if (randomTopic){
                MainTopicsId = randomTopic.relevantMainTopics[0];
                SubTopicId = randomTopic.relevantSubTopics[0];
                MainTopic.findById(MainTopicsId, function (err, mainTopic) {
                    if (err) throw err;
                    SubTopic.findById(SubTopicId, function (err, subTopic) {
                        if (err) throw err;
                        res.render('kavram_takip', {
                            title: 'Kavram Takip Sistemi',
                            mainTopics: myMainTopics,
                            subTopics: mySubTopics,
                            topics: myTopics,

                            screenMainTopic: mainTopic,
                            screenSubTopic: subTopic,
                            screenTopic: randomTopic,
                            takipEdilenler: takipEdilenListesi,
                            onerilenTopicler: onerilenTopicler
                        });
                    })
                });

            }else {
                MainTopicsId = {};
                SubTopicId = {};

                MainTopic.find(MainTopicsId, function (err, mainTopic) {
                    if (err) throw err;
                    SubTopic.find(SubTopicId, function (err, subTopic) {
                        if (err) throw err;
                        res.render('kavram_takip', {
                            title: 'Kavram Takip Sistemi',
                            mainTopics: myMainTopics,
                            subTopics: mySubTopics,
                            topics: myTopics,
                            screenMainTopic: mainTopic,
                            screenSubTopic: subTopic,
                            screenTopic: randomTopic
                        });
                    })
                });
            }


            // finding screen mainTopic and subTopic


        });


        // ======== GUEST access
    } else {
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
        ], function (err) {
            if (err) return (err);

            var mainTopicLength = myMainTopics.length;
            var subTopicLength = mySubTopics.length;
            var topicLength = myTopics.length;

            // get a random Main, Sub etc.. topic for display on screen
            var randomMainTopic = myMainTopics[getRandomInt(0, mainTopicLength - 1)];
            var randomSubTopic = myMainTopics[getRandomInt(0, subTopicLength - 1)];
            var randomTopic = myTopics[getRandomInt(0, topicLength - 1)];

            // var randomTopic = myTopics[topicLength - 1];

            var MainTopicsId;
            var SubTopicId;
            if (randomTopic){
                MainTopicsId = randomTopic.relevantMainTopics[0];
                SubTopicId = randomTopic.relevantSubTopics[0];

                MainTopic.findById(MainTopicsId, function (err, mainTopic) {
                    if (err) throw err;
                    SubTopic.findById(SubTopicId, function (err, subTopic) {
                        if (err) throw err;
                        res.render('kavram_takip', {
                            title: 'Kavram Takip Sistemi',
                            mainTopics: myMainTopics,
                            subTopics: mySubTopics,
                            topics: myTopics,
                            screenMainTopic: mainTopic,
                            screenSubTopic: subTopic,
                            screenTopic: randomTopic
                        });
                    })
                });



            }else {
                MainTopicsId = {};
                SubTopicId = {};

                MainTopic.find(MainTopicsId, function (err, mainTopic) {
                    if (err) throw err;
                    SubTopic.find(SubTopicId, function (err, subTopic) {
                        if (err) throw err;
                        res.render('kavram_takip', {
                            title: 'Kavram Takip Sistemi',
                            mainTopics: myMainTopics,
                            subTopics: mySubTopics,
                            topics: myTopics,
                            screenMainTopic: mainTopic,
                            screenSubTopic: subTopic,
                            screenTopic: randomTopic
                        });
                    })
                });



            }

            // var MainTopicsId = randomTopic.relevantMainTopics[0];
            // var SubTopicId = randomTopic.relevantSubTopics[0];

            // finding screen mainTopic and subTopic


        });
    }
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = router;
