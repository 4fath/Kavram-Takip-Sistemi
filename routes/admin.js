/**
 * Created by TOSHIBA on 30.4.2016.
 */

var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Keyword = require('../models/Keyword');
var Topic = require('../models/Topic');

var User = require('../models/User');

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
            definition: definition
        });
    }
});

router.get('/addSubTopic', function (req, res) {

    var myMainTopics = [];
    MainTopic.find({}, function (err, mainTopics) {
        if (err) throw err;
        mainTopics.forEach(function (mainTopic) {
            myMainTopics.push(mainTopic)
        });
        res.render('addSubTopic', {
            mainTopics: myMainTopics
        })
    });
});

// TODO : NOT tested
router.post('/addSubTopic', function (req, res, next) {
    var currentUserId = req.user._id;
    var mainTopicId = req.body.mainTopicId;

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
                    req.flash('success', 'Başarılı bir şekkilde eklendi');
                    res.redirect('/user/chiefEditorProfile');
                }
            );
        });
    } else {
        res.render('addSubTopic', {
            errors: errors,
            subTopicName: subTopicName,
            subTopicDefinition: subTopicDefinition
        });
    }
});

router.get('/addChiefEditor', function (req, res, next) {
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
            mySubTopics: mySubTopics,
            myUsers: myUsers,
            user: currentUser
        });
    });
});

router.post('/addChiefEditor', function (req, res, next) {

    var userId = req.body.userID;
    var subTopicId = req.body.subTopicID;

    req.checkBody('userID', 'Kullanıcı boş olmamalıdır').notEmpty();
    req.checkBody('subTopicID', 'Bilim Alanı boş olmamalıdır').notEmpty();

    var errors = req.validationErrors();
    if (!errors) {
        async.parallel([
            function (callback) {
                User.findById(userId, function (err, user) {
                    if (err) return callback(err);
                    console.log(user);
                    console.log(user.role);
                    user.role = 'chiefEditor';
                    user.isChiefEditor = true;
                    user.subTopic = subTopicId;
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
        res.render('addChiefEditor', {
            errors: errors,
            user: req.user
        })
    }

});

// router.get('/Profile', function (req, res, next) {
//     console.log('admin Profile girdi');
//     var userId = req.user._id;
//     var displayUser = {};
//     var displayTopics = [];
//     var currentUser = req.user;
//     async.parallel([
//         function (callback) {
//             User.findById(userId, function (err, user) {
//                 if (err) return callback(err);
//                 displayUser = user;
//                 console.log(displayUser.firstName);
//             });
//             callback();
//         },
//
//         function (callback) {
//             var query = {author : userId};
//             Topic.find(query, function (err, topics) {
//                 if (err) return callback(err);
//                 topics.forEach(function (topic) {
//                     displayTopics.push(topic);
//                     console.log(topic.name);
//                 });
//             });
//             callback();
//         }
//
//     ], function (err) {
//         if (err) return (err);
//         console.log(currentUser.firstName);
//         res.render('admin',{
//             userRole : displayUser.role,
//             userFirstName: currentUser.firstName,
//             userLastName: currentUser.lastName,
//             useremail: currentUser.email,
//             username: currentUser.username,
//             topics : displayTopics
//         })
//     });
// });
//
// router.post('/adminProfile', function (req, res) {
//     var currentUser = req.user;
//     var userFirstName = req.body.userFirstName;
//     var userLastName = req.body.userLastName;
//     var userName = req.body.username;
//     var userEmail = req.body.useremail;
//
//     req.checkBody('userFirstName', 'İsim alanı boş olamaz').notEmpty();
//     req.checkBody('userLastName', 'Soyisim alanı boş olamaz').notEmpty();
//     req.checkBody('username', 'Kullanıcı adı alanı boş olamaz.').notEmpty();
//     req.checkBody('useremail', 'Kullanıcı email alanı boş olamaz').notEmpty();
//     var errors = req.validationErrors();
//
//     if (!errors) {
//         var query = {_id: currentUser._id};
//
//         User.findById(query, function (err, user) {
//             if (err) throw err;
//
//             user.firstName = userFirstName;
//             user.lastName = userLastName;
//             user.email = userEmail;
//             user.username = userName;
//             console.log(user._id);
//             User.createUser(user, function (err) {
//                 if (err) throw err;
//                 req.flash('success', "Profiliniz başarıyla güncellendi.");
//                 res.redirect('/');
//             })
//         })
//     }
//     else {
//         req.flash('error', "Verileri kontrol ediniz!");
//         res.render('admin', {
//             userFirstName: userFirstName,
//             userLastName: userLastName,
//             username: userName,
//             useremail: userEmail,
//             user: currentUser
//         });
//     }
// });

module.exports = router;

