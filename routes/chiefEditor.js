/**
 * Created by TOSHIBA on 1.5.2016.
 */


var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Keyword = require('../models/Keyword');
var Topic = require('../models/Topic');

var User = require('../models/User');
var Comment = require('../models/Comment');

var router = express.Router();

// TODO : NOT tested
// router.get('/addSubTopic', function (req, res) {
//     var myMainTopics = [];
//     MainTopic.find({}, function (err, mainTopics) {
//         if (err) throw err;
//         mainTopics.forEach(function (mainTopic) {
//             myMainTopics.push(mainTopic)
//         });
//         res.render('addSubTopic', {
//             mainTopics: myMainTopics
//         })
//     });
// });
//
// // TODO : NOT tested
// router.post('/addSubTopic', function (req, res, next) {
//     var currentUserId = req.user._id;
//     var mainTopicId = req.body.mainTopicId;
//
//     var subTopicName = req.body.subTopicName;
//     var subTopicDefinition = req.body.subTopicDefinition;
//     req.checkBody('subTopicName', "Bu kısım boş olmamlı.").notEmpty();
//     req.checkBody('subTopicDefinition', "Bu kısım bos olmamalı").notEmpty();
//
//     var errors = req.validationErrors();
//     if (!errors) {
//         var newSubTopic = new SubTopic({
//             name: subTopicName,
//             definition: subTopicDefinition,
//             mainTopic: mainTopicId
//         });
//
//         newSubTopic.save(function (err) {
//             if (err) throw err;
//
//             var query = {_id: mainTopicId};
//
//             MainTopic.findOneAndUpdate(query,
//                 {$push: {relevantSubTopics: newSubTopic._id}},
//                 {safe: true, upsert: true},
//                 function (err, doc) {
//                     if (err) throw err;
//                     console.log("SubTopic başarılı bir şekilde kaydedildi : " + newSubTopic);
//                     console.log("MainTopic update edildi : " + doc);
//                     req.flash('success', 'Başarılı bir şekkilde eklendi');
//                     res.redirect('/user/chiefEditorProfile');
//                 }
//             );
//         });
//     } else {
//         res.render('addSubTopic', {
//             errors: errors,
//             subTopicName: subTopicName,
//             subTopicDefinition: subTopicDefinition
//         });
//     }
// });

router.get('/addKeyword', function (req, res) {
    var mySubTopics = [];
    var currentUser = req.user;
    var query = {chiefEditor: currentUser._id};
    SubTopic.find(query, function (err, subTopics) {
        if (err) throw err;
        subTopics.forEach(function (subTopic) {
            mySubTopics.push(subTopic)
        });
        res.render('addKeyword', {
            subTopics: mySubTopics
        })
    });
});

// TODO : NOT tested
router.post('/addKeyword', function (req, res, next) {

    var subTopicId = req.body.subTopicId;
    var keywordName = req.body.keywordName;
    var keywordDefinition = req.body.keywordDefinition;
    req.checkBody('keywordName', "Bu kısım boş olmamlı.").notEmpty();
    req.checkBody('keywordDefinition', "Bu kısım bos olmamalı").notEmpty();

    var errors = req.validationErrors();
    if (!errors) {
        var newKeyword = new Keyword({
            name: keywordName,
            definition: keywordDefinition,
            subTopic: subTopicId
        });

        newKeyword.save(function (err) {
            if (err) throw err;

            var query = {_id: subTopicId};

            SubTopic.findOneAndUpdate(query,
                {$push: {relevantKeywords: newKeyword._id}},
                {safe: true, upsert: true},
                function (err, doc) {
                    if (err) throw err;
                    console.log("Keyword başarılı bir şekilde kaydedildi : " + newKeyword);
                    console.log("SubTopic update edildi : " + doc);
                    req.flash('success', 'Başarılı bir şekilde Anahtar Kelime eklendi :' + newKeyword.name);
                    res.redirect('/user/chiefEditorProfile');
                }
            );
        });
    } else {
        res.render('addKeyword', {
            errors: errors,
            keywordName: keywordName,
            keywordDefinition: keywordDefinition
        });
    }
});


router.get('/addEditor', function (req, res, next) {
    var currentUser = req.user;
    var queryForUser = {role: 'author'};
    var myKeywords = [];

    var queryForSubTopic = {chiefEditor: currentUser._id};
    SubTopic.find(queryForSubTopic, function (err, subTopic) {
        if (err) throw err;
        var temp = subTopic;
        User.find(queryForUser, function (err, users) {
            if (err) throw err;
            // var queryForKeyword = {hasEditor: false, subTopic: subtopic};
            Keyword.find({}, function (err, keywords) {
                // keywords.forEach(function (keyword) {
                //     console.log(subTopic+ "sub");
                //     console.log(keyword.subTopic+ "key");
                //     if ((keyword.subTopic).toString() === subTopic._id.toString()){
                //         myKeywords.push(keyword);
                //         console.log(keyword.name);
                //     }
                // });
                console.log(myKeywords.name);
                if (err) throw err;
                res.render('addEditor', {
                    myUser: users,
                    myKeywords: keywords
                });
            });
        });
    });


    // var myUsers = [];
    // var mySubTopics = [] ;
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
    var currentKeyword = req.body.keywordID;

    async.parallel([
        function (callback) {
            Keyword.findById(currentKeyword, function (err, keyword) {
                if (err) return callback(err);
                keyword.editor = currentUser;
                keyword.save(function (err) {
                    if (err) return callback(err);
                    console.log("Keyword update edildi");
                })
            });
            callback();
        },
        function (callback) {
            User.findById(currentUser, function (err, user) {
                if (err) return callback(err);
                user.role = 'editor';
                user.isEditor = true;
                user.keyword = currentKeyword;
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