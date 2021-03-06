'use strict';

var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Keyword = require('../models/Keyword');
var Topic = require('../models/Topic');
var User = require('../models/User');

var router = express.Router();

var globalTopics = [];

function getTopicObj(id) {
    var lenOfTopics = globalTopics.length;
    console.log(lenOfTopics);
    console.log("buraya girdi ==========");
    if (lenOfTopics > 0) {
        var tmp = 0;
        // var currentTopic = globalTopics[tmp];
        var returnedObj = {};
        globalTopics.forEach(function (globalTopic) {
            console.log(id.toString());
            console.log((globalTopic._id).toString());
            console.log("=======");
            if ((globalTopic._id).toString() === id.toString()) {
                returnedObj = globalTopic;
            }
        });
        // while(tmp < lenOfTopics && id.toString() !== (currentTopic._id).toString() ){
        //     tmp++;
        //     currentTopic = globalTopics[tmp];
        // }
        // console.log(tmp);
        console.log(returnedObj);
        return returnedObj;
    } else {
        return {};
    }
}

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
                });
                callback();
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
                                    if ((keyword._id).toString() === myInterest.toString()) {
                                        console.log(true);
                                        if (keyword.relevantTopics.length > 0) {
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
                            globalTopics.push(topic);
                            if (topic.allowStatus.status) {
                                myTopics.push(topic);
                            }
                            if (topic.viewCount > maxViewedTopic.viewCount) {
                                maxViewedTopic = topic;
                            }
                        });

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
                var isAdmin = false;
                var isChief = false;
                var isEditor = false;
                currentUser.role.forEach(function (userRole) {
                    if (userRole == 'admin')
                        isAdmin = true;
                    if (userRole == 'chiefEditor')
                        isChief = true;
                    if (userRole == 'editor')
                        isEditor = true;
                });
                var userRole = "author";
                if (isAdmin)
                    userRole = "admin";
                else if (isChief)
                    userRole = "chiefEditor";
                else if (isEditor)
                    userRole = "editor";


                // BURASI
                var keywordIdArray = [];
                myTopics.forEach(function (topic) {
                    currentUser.followingTopics.forEach(function (myTopic) {
                        // console.log("===========keywordArray ========");
                        // console.log(myTopic.toString());
                        // console.log((topic._id).toString());
                        if ((topic._id).toString() === myTopic.toString()) {    // assume that currentUser following this topic
                            console.log(true);
                            var thisKeyword = topic.relevantKeywords[0];
                            keywordIdArray.push(thisKeyword);

                        }
                    });

                });

                keywordIdArray.forEach(function (keywordId) {
                    myTopics.forEach(function (topic) {
                        var currentTopicsRelKey = topic.relevantKeywords[0];
                        // console.log("=========");
                        // console.log(keywordId.toString());
                        // console.log(currentTopicsRelKey.toString());
                        if (currentTopicsRelKey.toString() === keywordId.toString()) {

                            if (topic.allowStatus.status) {
                                onerilenTopicler.push(topic);
                            }

                        }
                    });
                });

                // var lastonerilenTopicler = [];
                // currentUser.followingTopics.forEach(function (followingTopic) {
                //     onerilenTopicler.forEach(function (onerilen) {
                //         if (followingTopic.toString() === (onerilen._id).toString()) {
                //
                //         }else {
                //             lastonerilenTopicler.push(onerilen);
                //         }
                //     });
                // });
                var n;
                var m;
                var matrix;
                var yer;
                var onereceklerimiz = [];
                User.find({}, function (err, users) {
                    if (err) throw (err);
                    n = users.length;
                    Topic.find({}, function (err, topics) {
                        if (err) throw (err);
                        m = topics.length;
                        var newMatrix = new Array(users.length);
                        for (var i = 0; i < users.length; i++) {
                            newMatrix[i] = new Array(topics.length);
                        }
                        for (var i = 0; i < users.length; i++) {
                            var followingTopics = users[i].followingTopics;
                            if ((currentUser._id).toString() === (users[i]._id).toString())
                                yer = i;
                            for (var j = 0; j < topics.length; j++) {
                                var control = false;
                                followingTopics.forEach(function (topic) {
                                    if (topic.toString() === (topics[j]._id).toString())
                                        control = true;
                                });
                                if (control == true)
                                    newMatrix[i][j] = 1;
                                else
                                    newMatrix[i][j] = 0;
                                console.log(newMatrix[i][j]);
                            }
                        }
                        console.log(newMatrix);
                        var dizi = new Array(users.length);
                        for (var i = 0; i < users.length; i++) {
                            dizi[i] = new Array(2);
                        }
                        for (var i = 0; i < users.length; i++) {
                            var toplam = 0;
                            var d1 = 0;
                            var d2 = 0;
                            for (var j = 0; j < topics.length; j++) {
                                toplam = toplam + (newMatrix[i][j] * newMatrix[yer][j]);
                                d1 = d1 + newMatrix[i][j] * newMatrix[i][j];
                                d2 = d2 + newMatrix[yer][j] * newMatrix[yer][j];
                            }
                            var bolu = (Math.sqrt(d1)) * (Math.sqrt(d2));
                            if (bolu == 0)
                                dizi[i][0] = 0;
                            else
                                dizi[i][0] = toplam / bolu;
                            dizi[i][1] = i;
                        }
                        dizi.sort(function (a, b) {
                            return b[0] - a[0]
                        });
                        console.log(dizi);
                        for (var k = 1; k < 4; k++) {
                            for (var c = 0; c < topics.length; c++) {
                                var varMi = false;
                                if (newMatrix[dizi[k][1]][c] == 1 && newMatrix[dizi[0][1]][c] == 0) {
                                    onereceklerimiz.forEach(function (onerilen) {
                                        if ((onerilen._id).toString() === (topics[c]._id).toString())
                                            varMi = true;
                                    });
                                    if (varMi == false)
                                        onereceklerimiz.push(topics[c]);
                                }
                            }
                        }
                    })
                });

                // console.log("onerilen topicler");
                // console.log(onerilenTopicler);

                onerilenTopicler.push(maxViewedTopic);
                shuffle(onerilenTopicler);

                var topicNames = [];
                var popTopics = [];
                var newPopTopics = [];
                MainTopic.findById(MainTopicsId, function (err, mainTopic) {
                    if (err) throw err;
                    SubTopic.findById(SubTopicId, function (err, subTopic) {
                        if (err) throw err;
                        Keyword.findById(KeywordId, function (err, keyword) {
                            if (err) throw err;
                            Topic.find({}, null, {sort: {viewCount: -1}}, function (err, toppics) {
                                popTopics = toppics;
                                for (var i = 0; i < 5; i++) {
                                    newPopTopics.push(popTopics[i]);
                                    console.log(i);
                                    console.log(popTopics[i].name);
                                }
                                console.log(newPopTopics);
                                User.findById(randomTopic.author, function (err, user) {
                                    if (err) throw err;
                                    console.log(followControl);
                                    Topic.find({}, function (err, topics) {
                                        res.render('kavram_takip', {
                                            title: 'Kavram Takip Sistemi',
                                            mainTopics: myMainTopics,
                                            subTopics: mySubTopics,
                                            topics: topics,
                                            userRole: userRole,

                                            followerControl: followControl,

                                            screenMainTopic: mainTopic,

                                            screenSubTopic: subTopic,

                                            screenKeyword: keyword,

                                            screenTopic: randomTopic,

                                            topicUser: user,

                                            takipEdilenler: takipEdilenListesi,

                                            populerTopics: newPopTopics,

                                            onerilenTopicler: onereceklerimiz
                                        });
                                    })

                                });
                            });
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

            var randomTopics = [];
            var MainTopicsIds = [];
            var SubTopicIds = [];
            var KeywordIds = [];
            for (var i = 0; i < 3; i++) {
                var randomTopic = myTopics[getRandomInt(0, topicLength - 1)];
                if (i != 0) {
                    var topicControl = false;
                    while (!topicControl) {
                        var control = false;
                        randomTopics.forEach(function (top) {
                            if ((top._id).toString() === (randomTopic._id).toString())
                                control = true;
                        });
                        if (control == false) {
                            randomTopics.push(randomTopic);
                            topicControl = true;
                        }
                        else {
                            randomTopic = myTopics[getRandomInt(0, topicLength - 1)];
                        }
                    }
                }
                else {
                    randomTopics.push(randomTopic);
                }
                var followControl1 = false;
                var followControl2 = false;
                var followControl3 = false;
                MainTopicsIds.push(randomTopic.relevantMainTopics[0]);
                SubTopicIds.push(randomTopic.relevantSubTopics[0]);
                KeywordIds.push(randomTopic.relevantKeywords[0]);

            }
            MainTopic.findById(MainTopicsIds[0], function (err, mainTopic) {
                if (err) throw err;
                SubTopic.findById(SubTopicIds[0], function (err, subTopic) {
                    if (err) throw err;
                    Keyword.findById(KeywordIds[0], function (err, keyword) {
                        if (err) throw err;
                        User.findById(randomTopics[0].author, function (err, user) {
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
                                screenTopics: randomTopics,

                                topicUser: user
                            });
                        })
                    });
                })
            });

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
