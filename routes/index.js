var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Keyword = require('../models/Keyword');
var Topic = require('../models/Topic');
var User = require('../models/User');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

    var currentUser = req.user;

    var myMainTopics = [];
    var mySubTopics = [];
    var myKeywords = [];
    var myTopics = [];
    var onerilenTopicler = [];
    var maxViewedTopic;

    // NOT : async yapıda iç içe iki kez db sorgusu yapmamaya özen gösterelim.
    // en son da sonuçlar elimizde olduğu zaman üzerinde işlemler yapalı.

    // USER access
    if (currentUser) {
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
            // Keywordler interest içinde , Topicler takip ediliyor
            // Takip edilen Topiclerin her birinin keywordune gidilip onun altından bir topic seçilecek
            // interestlerinin her birinin altından bir topic seçilecek
            // toplam 5
            function (callback) {
                Keyword.find({}, function (err, keywords) {
                    if (err) return callback(err);
                    if (keywords.length > 0) {
                        keywords.forEach(function (keyword) {
                            myKeywords.push(keyword);
                            if (currentUser.interests.length > 0) {
                                currentUser.interests.forEach(function (myInterest) {
                                    if ((keyword._id).toString() === myInterest.toString) {
                                        if (keyword.relevantMainTopics.length > 0) {
                                            keyword.relevantTopics.forEach(function (topic) {
                                                onerilenTopicler.push(topic);
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                    callback();
                });
            },
            function (callback) {
                Topic.find({}, function (err, topics) {
                    if (err) return callback(err);
                    if (topics.length > 0) {
                        maxViewedTopic = topics[0];
                        topics.forEach(function (topic) {
                            if (topic.allowStatus.status) {
                                myTopics.push(topic);
                            }
                            if (topic.viewCount > maxViewedTopic.viewCount) {
                                maxViewedTopic = topic;
                            }
                        });

                        // onerilenTopicler.push(maxViewedTopic);
                    }
                    callback();
                });
            }
        ], function (err) {
            if (err) return (err);

            var mainTopicLength = myMainTopics.length;
            var subTopicLength = mySubTopics.length;
            var keywordLength = myKeywords.length;
            var topicLength = myTopics.length;

            var takipEdilenListesi;
            if (currentUser.followingTopics.length != 0) {
                takipEdilenListesi = currentUser.followingTopics;
            } else {
                takipEdilenListesi = [];
            }

            // get a random Main, Sub etc.. topic for display on screen
            var randomMainTopic = myMainTopics[getRandomInt(0, mainTopicLength - 1)];
            var randomSubTopic = mySubTopics[getRandomInt(0, subTopicLength - 1)];
            var randomKeyword = myKeywords[getRandomInt(0, keywordLength - 1)];

            var randomTopic = myTopics[getRandomInt(0, topicLength - 1)];

            var MainTopicsId;
            var SubTopicId;
            var KeywordId;
            if (randomTopic) {
                var followControl = false;
                MainTopicsId = randomTopic.relevantMainTopics[0];
                SubTopicId = randomTopic.relevantSubTopics[0];
                KeywordId = randomTopic.relevantKeywords[0];

                // check screenTopic follow status
                randomTopic.followers.forEach(function (follower) {
                    if (follower.toString() == (currentUser._id).toString()) {
                        followControl = true;
                    }
                });

                myTopics.forEach(function (topic) {

                    currentUser.followingTopics.forEach(function (myTopic) {
                        if ((topic._id).toString() === myTopic) {    // assume that currentUser following this topic

                            var tmp = 0;
                            if (myKeywords.length > 0) {
                                while (tmp < myKeywords.length) {
                                    var currentKeyword = myKeywords[tmp];
                                    if ((currentKeyword._id).toString() === myTopic.relevantKeywords[0]) {

                                        if (currentKeyword.relevantTopics.length > 0) {
                                            currentKeyword.relevantTopics.forEach(function (relevanTopic) {
                                                onerilenTopicler.push(relevanTopic);
                                            });
                                        }
                                    }
                                    tmp++;
                                }
                            }

                        }
                    });

                });
                onerilenTopicler.push(maxViewedTopic);
                shuffle(onerilenTopicler);
                var slicedTopics;
                if (onerilenTopicler > 10) {
                    slicedTopics = onerilenTopicler.slice(0, 11);
                } else {
                    slicedTopics = onerilenTopicler.slice(0, onerilenTopicler.length);
                }

                MainTopic.findById(MainTopicsId, function (err, mainTopic) {
                    if (err) throw err;
                    SubTopic.findById(SubTopicId, function (err, subTopic) {
                        if (err) throw err;
                        Keyword.findById(KeywordId, function (err, keyword) {
                            if (err) throw err;

                            User.findById(randomTopic.author, function (err, user) {
                                if (err) throw err;
                                console.log(followControl);

                                res.render('kavram_takip', {
                                    title: 'Kavram Takip Sistemi',
                                    mainTopics: myMainTopics,
                                    subTopics: mySubTopics,
                                    topics: myTopics,

                                    followerControl: followControl,

                                    screenMainTopic: mainTopic,

                                    screenSubTopic: subTopic,

                                    screenKeyword: keyword,

                                    screenTopic: randomTopic,

                                    topicUser: user,

                                    takipEdilenler: takipEdilenListesi,

                                    onerilenTopicler: slicedTopics // TODO : think about that
                                });
                            })
                        });

                    })
                });

            } else {
                MainTopicsId = {};
                SubTopicId = {};

                MainTopic.find(MainTopicsId, function (err, mainTopic) {
                    if (err) throw err;
                    SubTopic.find(SubTopicId, function (err, subTopic) {
                        if (err) throw err;
                        Keyword.find({}, function (err, keyword) {
                            if (err) throw err;
                            res.render('kavram_takip', {
                                title: 'Kavram Takip Sistemi',
                                mainTopics: myMainTopics,
                                subTopics: mySubTopics,
                                topics: myTopics,
                                screenMainTopic: mainTopic,
                                screenSubTopic: subTopic,
                                screenKeyword: keyword,
                                screenTopic: randomTopic
                            });
                        });

                    })
                });
            }
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
                Keyword.find({}, function (err, keywords) {
                    if (err) return callback(err);
                    keywords.forEach(function (keyword) {
                        myKeywords.push(keyword);
                    });
                    callback();
                });
            },

            function (callback) {
                Topic.find({}, function (err, topics) {
                    if (err) return callback(err);
                    topics.forEach(function (topic) {
                        if (topic.allowStatus.status) {
                            myTopics.push(topic);
                        }
                    });
                    callback();
                });
            }
        ], function (err) {
            if (err) return (err);

            var mainTopicLength = myMainTopics.length;
            var subTopicLength = mySubTopics.length;
            var keywordLength = myKeywords.length;
            var topicLength = myTopics.length;

            // get a random Main, Sub etc.. topic for display on screen
            var randomMainTopic = myMainTopics[getRandomInt(0, mainTopicLength - 1)];
            var randomSubTopic = mySubTopics[getRandomInt(0, subTopicLength - 1)];
            var randomKeyword = myKeywords[getRandomInt(0, keywordLength - 1)];

            var randomTopic = myTopics[getRandomInt(0, topicLength - 1)];

            var MainTopicsId;
            var SubTopicId;
            var KeywordId;
            if (randomTopic) {
                MainTopicsId = randomTopic.relevantMainTopics[0];
                SubTopicId = randomTopic.relevantSubTopics[0];
                KeywordId = randomTopic.relevantKeywords[0];
                MainTopic.findById(MainTopicsId, function (err, mainTopic) {
                    if (err) throw err;
                    SubTopic.findById(SubTopicId, function (err, subTopic) {
                        if (err) throw err;
                        Keyword.findById(KeywordId, function (err, keyword) {
                            if (err) throw err;
                            User.findById(randomTopic.author, function (err, user) {
                                if (err) throw err;
                                res.render('kavram_takip', {
                                    title: 'Kavram Takip Sistemi',
                                    mainTopics: myMainTopics,
                                    subTopics: mySubTopics,
                                    keywords: myKeywords,
                                    topics: myTopics,

                                    screenMainTopic: mainTopic,
                                    screenSubTopic: subTopic,
                                    screenKeyword: keyword,
                                    screenTopic: randomTopic,

                                    topicUser: user
                                });
                            })
                        });
                    })
                });

            } else {
                MainTopicsId = {};
                SubTopicId = {};
                KeywordId = {};

                MainTopic.find(MainTopicsId, function (err, mainTopic) {
                    if (err) throw err;
                    SubTopic.find(SubTopicId, function (err, subTopic) {
                        if (err) throw err;
                        Keyword.find(KeywordId, function (err, keyword) {
                            if (err) throw err;
                            res.render('kavram_takip', {
                                title: 'Kavram Takip Sistemi',
                                mainTopics: myMainTopics,
                                subTopics: mySubTopics,
                                topics: myTopics,

                                screenMainTopic: mainTopic,
                                screenSubTopic: subTopic,
                                screenKeyword: keyword,
                                screenTopic: randomTopic
                            });
                        });
                    })
                });
            }
        });
    }
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

module.exports = router;
