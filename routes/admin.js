/**
 * Created by TOSHIBA on 30.4.2016.
 */

var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Topic = require('../models/Topic');

var User = require('../models/User');
var Comment = require('../models/Comment');

var router = express.Router();

router.get('/', function (req, res, next) {

    // req.user.role == 'admin'
    if (req.user.role == 'admin') {
        var myMainTopics, mySubTopics, myTopics, myComments;
        var myUsers = [];
        var myAuthors = [];
        var myEditors = [];
        var myChiefEditors = [];

        async.parallel([
            function (callback) {
                MainTopic.find({}, function (err, mainTopics) {
                    if (err) return callback(err);
                    myMainTopics = mainTopics;
                });
                callback();
            },
            function (callback) {
                SubTopic.find({}, function (err, subTopics) {
                    if (err) return callback(err);
                    mySubTopics = subTopics
                });
                callback();
            },
            function (callback) {
                Topic.find({}, function (err, topics) {
                    if (err) return callback(err);
                    myTopics = topics;
                })
            },
            function (callback) {
                User.find({}, function (err, users) {
                    if (err) return callback(err);
                    users.forEach(function (user) {
                        if (user.role === 'author') {
                            myAuthors.push(user);
                            myUsers.push(user);
                        } else if (user.role == 'editor') {
                            myEditors.push(user);
                            myUsers.push(user);
                        } else if (user.role == 'chiefEditor') {
                            myChiefEditors.push(user);
                            myUsers.push(user);
                        }
                    });
                })
            },
            function (callback) {
                Comment.find({}, function (err, comments) {
                    if (err) return callback(err);
                    myComments = comments;
                })
            }
        ], function (err) {
            if (err) return (err);
            res.render('admin', {
                myMainTopics: myMainTopics,
                mySubTopics: mySubTopics,
                myTopics: myTopics,
                myComments: myComments,
                myUsers: myUsers,
                myAuthors: myAuthors,
                myEditors: myEditors,
                myChiefEditors: myChiefEditors
            });
        });

    } else {
        res.render('not_found');
    }
});

router.get('/addMainTopic', function (req, res) {
    MainTopic.find({}, function (err, mainTopics) {
        if (err) throw err;
        res.render('add_main_topic', {
           mainTopics : mainTopics 
        });
    });
});

router.post('/addMainTopic', function (req, res) {
    
    var name = req.body.mainTopicName;
    var definition = req.body.mainTopicDefinition;
    
    req.checkBody('mainTopicName', 'isim bos olamaz').notEmpty();
    req.checkBody('mainTopicDefinition', 'isim bos olamaz').notEmpty();

    var errors = req.validationErrors();
    if (!errors) {
        var newMainTopic = new MainTopic({
            name: name,
            definition: definition,
            hasChiefEditor : false
        });
        newMainTopic.save(function (err) {
            if (err) throw err;
            res.redirect('/admin/addMainTopic');
        })
    } else {
        res.render('addMainTopic', {
            errors: errors,
            name: name,
            definition: definition
        });
    }
});

router.get('/addChiefEditor', function (req, res, next) {
    var myMainTopics = [];
    var myUsers = [];
    async.parallel([
        function (callback) {
            MainTopic.find({}, function (err, mainTopics) {
                if (err) return callback(err);
                mainTopics.forEach(function (mainTopic) {
                    if (!mainTopic.hasChiefEditor) {
                        myMainTopics.push(mainTopic);
                    }
                });
                callback();
            })
        },
        function (callback) {
            User.find({}, function (err, users) {
                if (err) return callback(err);
                users.forEach(function (user) {
                    if (user.role == 'editor') {
                        myUsers.push(user);
                    }
                });
                callback();
            });
        }
    ], function (err) {
        if (err) return (err);
        res.render('', {
            myMainTopics: myMainTopics,
            myUsers: myUsers
        });
    });
});

router.post('/addChiefEditor', function (req, res, next) {

    var userId = req.body.userID;
    var mainTopicId = req.body.mainTopicID;

    req.checkBody('userID', 'User boş olmamalıdır').notEmpty();
    req.checkBody('mainTopicID', 'MainTopic Boş olmamalıdır').notEmpty();

    var errors = req.validationErrors();
    if (!errors) {

        var myUser = {};
        var myMainTopic = {};

        async.parallel([
            function (callback) {
                var query = {_id: userId};
                User.findOneAndUpdate(query,
                    {$set: {role: 'chiefEditor', mainTopic: mainTopicId, isChiefEditor: true}},
                    {safe: true, upsert: true},
                    function (err, doc) {
                        if (err) return callback(err);
                        console.log(doc);
                        myUser = doc;
                    });
                callback();
            },
            function (callback) {
                var query = {_id: mainTopicId};
                MainTopic.findOneAndUpdate(query,
                    {$set: {hasChiefEditor: true, chiefEditor: userId}},
                    {safe: true, upsert: true},
                    function (err, doc) {
                        if (err) return callback(err);
                        console.log(doc);
                        myMainTopic = doc;
                    });
                callback();
            }
        ], function (err) {
            if (err) return (err);
            console.log('All went fine');
            res.send("ok");

        });

    }

});

module.exports = router;

