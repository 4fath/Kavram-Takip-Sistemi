/**
 * Created by TOSHIBA on 1.5.2016.
 */
var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Topic = require('../models/Topic');

var User = require('../models/User');
var Comment = require('../models/Comment');

var router = express.Router();

// TODO : NOT tested 
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

// FOOL 
// TODO : NOT completed 
router.get('/addEditor', function (req, res, next) {
    var queryForUser = {role: 'author'};
    var queryForSubTopic = {hasEditor: false};
    var myUsers = [];
    var mySubTopics = [] ;


    User.find(queryForUser, function (err, users) {
        if (err) throw err;
        SubTopic.find(queryForSubTopic, function (err, subTopics) {
            if (err) throw err;
            res.render('addEditor', {
                myUser : users,
                mySubTopics : subTopics
            });
        })
    });

    // async.parallel([
    //     function (callback) {
    //         User.find(queryForUser, function (err, users) {
    //             if (err) return callback(err);
    //             console.log("Gelen userlar " + users);
    //             // myUsers = users;
    //             console.log(users.length);
    //             users.forEach(function (user) {
    //                 myUsers.push(user);
    //             });
    //         });
    //         callback();
    //     },
    //     function (callback) {
    //         SubTopic.find(queryForSubTopic, function (err, subTopics) {
    //             if (err) return callback(err);
    //             console.log("Gelen subTopicler:" +subTopics);
    //             // mySubTopics = subTopics;
    //             subTopics.forEach(function (subTopic) {
    //                 mySubTopics.push(subTopic)
    //             });
    //         });
    //         callback();
    //     }
    // ], function (err) {
    //     if (err) return (err);
    //     res.render('addEditor', {
    //         myUsers: myUsers,
    //         mySubTopics: mySubTopics
    //     });
    // })
});

// FOOL 
// TODO : NOT completed
router.post('/addEditor', function (req, res, next) {
    var currentUser = req.body.editorID;
    var currentSubTopic = req.body.subTopicID;

    async.parallel([
        function (callback) {
            SubTopic.findById(currentSubTopic, function (err, subTopic) {
                if (err) return callback(err);
                subTopic.editor = currentUser;
                subTopic.save(function (err) {
                    if (err) return callback(err);
                    console.log("subTopic update edildi");
                })
            });
            callback();
        },
        function (callback) {
            User.findById(currentUser, function (err, user) {
                if (err) return callback(err);
                user.role = 'editor';
                user.isEditor = true;
                user.subTopic = currentSubTopic;
                user.save(function (err) {
                    if (err) return callback(err);
                    console.log("User update edildi");
                })
            });
            callback();
        }
    ], function (err) {
        if (err) return (err);
        req.flash('success', "Başarılı bir şekilde alt başlık kayıt edildi");
        res.redirect('/chiefEditor/addEditor');

    });


});


module.exports = router;