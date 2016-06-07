/**
 * Created by TOSHIBA on 30.4.2016.
 */

var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Keyword = require('../models/Keyword');
var Topic = require('../models/Topic');
var user = require('./users');

var User = require('../models/User');

var checkControl = require('./auth_check');

var router = express.Router();

router.get('/', function (req, res, next) {

    if (req.user.role == 'admin') {
        var myMainTopics, mySubTopics, myTopics, myKeywords, myUsers;
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
                Keyword.find({}, function (err, keywords) {
                    if (err) return callback(err);
                    myKeywords = keywords;
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
                    myUsers = users;
                    users.forEach(function (user) {
                        if (user.role === 'author') {
                            myAuthors.push(user);
                        } else if (user.role == 'editor') {
                            myEditors.push(user);
                        } else if (user.role == 'chiefEditor') {
                            myChiefEditors.push(user);
                        }
                    });
                })
            }
        ], function (err) {
            if (err) return (err);
            res.render('admin', {
                myMainTopics: myMainTopics,
                mySubTopics: mySubTopics,
                myKeywords: myKeywords,
                myTopics: myTopics,
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

router.get('/addMainTopic', checkControl.checkAdmin, function (req, res) {
    var userRole = userRoleControl(req.user);
    res.render('addMainTopic',
        {
            userRole: userRole,
            roles: req.user.role
        });
});

// DONE
router.post('/addMainTopic', checkControl.checkAdmin, function (req, res) {
    console.log("Admin Veni mainTopic ekliyor");

    var name = req.body.mainTopicName;
    var definition = req.body.mainTopicDefinition;
    var userRole = userRoleControl(req.user);
    req.checkBody('mainTopicName', 'isim bos olamaz').notEmpty();
    req.checkBody('mainTopicDefinition', 'isim bos olamaz').notEmpty();

    var errors = req.validationErrors();
    if (!errors) {
        var query = {name: name};
        MainTopic.find(query, function (err, mainTopics) {
            if (err) throw err;
            if (mainTopics.length != 0) {
                req.flash('error', "Bu isimle zaten Ana Kavram var");
                res.render('addMainTopic');
            } else {
                var newMainTopic = new MainTopic({
                    name: name,
                    definition: definition
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
            definition: definition,
            userRole: userRole
        });
    }
});

router.get('/addSubTopic', checkControl.checkAdmin, function (req, res) {
    var userRole = userRoleControl(req.user);
    var myMainTopics = [];
    MainTopic.find({}, function (err, mainTopics) {
        if (err) throw err;
        mainTopics.forEach(function (mainTopic) {
            myMainTopics.push(mainTopic)
        });
        res.render('addSubTopic', {
            mainTopics: myMainTopics,
            roles: req.user.role,
            userRole: userRole
        })
    });
});

router.post('/addSubTopic', checkControl.checkAdmin, function (req, res, next) {
    var currentUserId = req.user._id;
    var mainTopicId = req.body.mainTopicId;
    var userRole = userRoleControl(req.user);
    var subTopicName = req.body.subTopicName;
    var subTopicDefinition = req.body.subTopicDefinition;
    req.checkBody('subTopicName', "Bu kısım boş olmamlı.").notEmpty();
    req.checkBody('subTopicDefinition', "Bu kısım bos olmamalı").notEmpty();

    var errors = req.validationErrors();
    if (!errors) {
        var newSubTopic = new SubTopic({
            name: subTopicName,
            definition: subTopicDefinition,
            mainTopic: mainTopicId
        });

        newSubTopic.save(function (err) {
            if (err) throw err;

            var query = {_id: mainTopicId};

            MainTopic.findOneAndUpdate(query,
                {$push: {relevantSubTopics: newSubTopic._id}},
                {safe: true, upsert: true},
                function (err, doc) {
                    if (err) throw err;
                    console.log("SubTopic başarılı bir şekilde kaydedildi : " + newSubTopic);
                    console.log("MainTopic update edildi : " + doc);
                    req.flash('success', 'Başarılı bir şekilde eklendi');
                    res.redirect('/admin/addSubTopic');
                }
            );
        });
    } else {
        res.render('addSubTopic', {
            errors: errors,
            subTopicName: subTopicName,
            subTopicDefinition: subTopicDefinition,
            userRole: userRole
        });
    }
});

router.get('/addChiefEditor', checkControl.checkAdmin, function (req, res, next) {
    var mySubTopics = [];
    var myUsers = [];
    var currentUser = req.user;
    async.parallel([
        function (callback) {
            SubTopic.find({}, function (err, subTopics) {
                if (err) return callback(err);
                subTopics.forEach(function (subTopic) {
                    if (!subTopic.hasChiefEditor) {
                        mySubTopics.push(subTopic);
                    }
                });
                callback();
            })
        },
        function (callback) {
            User.find({}, function (err, users) {
                if (err) return callback(err);
                users.forEach(function (user) {
                    myUsers.push(user);
                });
                callback();
            });
        }
    ], function (err) {
        if (err) return (err);
        var userRole = userRoleControl(req.user);
        res.render('addChiefEditor', {
            mySubTopics: mySubTopics,
            myUsers: myUsers,
            user: currentUser,
            userRole: userRole,
            roles: currentUser.role
        });
    });
});

router.post('/addChiefEditor', checkControl.checkAdmin, function (req, res, next) {

    var userId = req.body.userID;
    var subTopicId = req.body.subTopicID;

    req.checkBody('userID', 'Kullanıcı boş olmamalıdır').notEmpty();
    req.checkBody('subTopicID', 'Bilim Alanı boş olmamalıdır').notEmpty();
    var chiefEditorControl = false;
    var errors = req.validationErrors();
    if (!errors) {
        async.parallel([
            function (callback) {
                User.findById(userId, function (err, user) {
                    if (err) return callback(err);
                    console.log(user);
                    console.log(user.role);

                    user.role.forEach(function (rolee) {
                        if (rolee == "chiefEditor")
                            chiefEditorControl = true;
                    });
                    if (chiefEditorControl == false)
                        user.role.push("chiefEditor");
                    user.isChiefEditor = true;
                    user.subTopic.push(subTopicId);
                    user.save(function (err) {
                        if (err) return callback(err);
                        console.log("User Update Edildi");
                    })
                });
                callback();
            },
            function (callback) {
                SubTopic.findById(subTopicId, function (err, subTopic) {
                    if (err) return callback(err);
                    subTopic.hasChiefEditor = true;
                    subTopic.chiefEditor = userId;
                    subTopic.save(function (err) {
                        if (err) return callback(err);
                        console.log("SubTopic Update Edildi");
                    });
                });
                callback();
            }
        ], function (err) {
            if (err) return (err);

            console.log('All went fine');
            req.flash('success', 'Başarılı bir şekilde atama yapılmıştır');
            res.redirect('/admin/addChiefEditor');
        });

    } else {
        var userRole = userRoleControl(req.user);
        res.render('addChiefEditor', {
            userRole: userRole,
            errors: errors,
            user: req.user
        })
    }

});

function userRoleControl(user) {
    var isAdmin = false;
    var isChief = false;
    var isEditor = false;
    user.role.forEach(function (userRole) {
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
    return userRole;
}

module.exports = router;

