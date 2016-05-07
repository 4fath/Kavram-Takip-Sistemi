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


// DONE
router.get('/addMainTopic', function (req, res) {
    res.render('addMainTopic');
});

// DONE
router.post('/addMainTopic', function (req, res) {
    console.log("Admin Veni mainTopic ekliyor");

    var name = req.body.mainTopicName;
    var definition = req.body.mainTopicDefinition;
    
    req.checkBody('mainTopicName', 'isim bos olamaz').notEmpty();
    req.checkBody('mainTopicDefinition', 'isim bos olamaz').notEmpty();

    var errors = req.validationErrors();
    if (!errors) {
        var query = {name : name};
        MainTopic.find(query, function (err, mainTopics) {
            if (err) throw err;
            if (mainTopics.length != 0){
                req.flash('error', "Bu isimle zaten Ana Kavram var");
                res.render ('addMainTopic');
            }else {
                var newMainTopic = new MainTopic({
                    name: name,
                    definition: definition,
                    hasChiefEditor : false
                });
                newMainTopic.save(function (err) {
                    if (err) throw err;
                    req.flash('success', "Başarılı bir şekilde Ana kavram eklendi");
                    res.redirect('/admin/addMainTopic');
                })
            }
        });

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
                    if (user.role == 'author') {
                        myUsers.push(user);
                    }
                });
                callback();
            });
        }
    ], function (err) {
        if (err) return (err);
        res.render('addChiefEditor', {
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
                User.findById (userId, function (err, user) {
                    if (err) return callback(err);
                    console.log(user);
                    console.log(user.role);
                    user.role = 'chiefEditor';
                    user.isChiefEditor = true;
                    user.mainTopic = mainTopicId;
                    user.save(function (err) {
                        if (err) return callback(err);
                        console.log("User Update Edildi");
                    })
                });
                callback();
                // User.findOneAndUpdate(query,
                //     {$set: {role: 'chiefEditor', mainTopic: mainTopicId, isChiefEditor: true}},
                //     {safe: true, upsert: true},
                //     function (err, doc) {
                //         if (err) return callback(err);
                //         console.log(doc);
                //         myUser = doc;
                //     });

            },
            function (callback) {
                var query = {_id: mainTopicId};

                MainTopic.findById (mainTopicId, function (err, mainTopic) {
                    if (err) return callback(err);
                    mainTopic.hasChiefEditor = true;
                    mainTopic.chiefEditor = userId;
                    mainTopic.save(function (err) {
                        if (err) return callback(err);
                        console.log("MainTopic Update Edildi");
                    });
                });
                callback();
                // MainTopic.findOneAndUpdate(query,
                //     {$set: {hasChiefEditor: true, chiefEditor: userId}},
                //     {safe: true, upsert: true},
                //     function (err, doc) {
                //         if (err) return callback(err);
                //         console.log(doc);
                //         myMainTopic = doc;
                //     });

            }
        ], function (err) {
            if (err) return (err);
            console.log('All went fine');
            req.flash('success', 'Başarılı bir şekilde atama yapılmıştır');
            res.redirect('/admin/addChiefEditor');

        });

    }else {
        res.render('addChiefEditor', {
            errors: errors
        })
    }

});

module.exports = router;

