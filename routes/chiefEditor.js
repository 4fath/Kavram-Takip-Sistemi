/**
 * Created by TOSHIBA on 1.5.2016.
 */


var express = require('express');
var async = require('async');

var checkControl = require('./auth_check');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Keyword = require('../models/Keyword');
var Topic = require('../models/Topic');

var User = require('../models/User');
var Comment = require('../models/Comment');

var router = express.Router();

router.get('/addKeyword', checkControl.checkChiefEditor, function (req, res) {
    var mySubTopics = [];
    var currentUser = req.user;
    var userRole = userRoleControl(req.user);
    var query = {chiefEditor: currentUser._id};
    SubTopic.find(query, function (err, subTopics) {
        if (err) throw err;
        subTopics.forEach(function (subTopic) {
            mySubTopics.push(subTopic)
        });
        res.render('addKeyword', {
            userRole: userRole,
            subTopics: mySubTopics,
            roles: req.user.role
        })
    });
});

router.post('/addKeyword', checkControl.checkChiefEditor, function (req, res, next) {

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
                    res.redirect('/chiefEditor/addKeyword');
                }
            );
        });
    } else {
        var userRole = userRoleControl(req.user);
        res.render('addKeyword', {
            userRole: userRole,
            errors: errors,
            keywordName: keywordName,
            keywordDefinition: keywordDefinition
        });
    }
});

router.get('/addEditor', checkControl.checkChiefEditor, function (req, res, next) {
    var currentUser = req.user;
    var myKeywords = [];
    var userRole = userRoleControl(req.user);
    var queryForSubTopic = {chiefEditor: currentUser._id};
    SubTopic.find(queryForSubTopic, function (err, subTopics) {
        if (err) throw err;
        User.find({}, function (err, users) {
            if (err) throw err;
            var queryForKeyword = {hasEditor: false};
            Keyword.find(queryForKeyword, function (err, keywords) {
                if (err) throw err;
                for (var i = 0; i < subTopics.length; i++) {
                    keywords.forEach(function (keyword) {
                        if ((keyword.subTopic).toString() === (subTopics[i]._id).toString())
                            myKeywords.push(keyword);
                    });
                    if (i == subTopics.length - 1) {
                        res.render('addEditor', {
                            myUser: users,
                            myKeywords: myKeywords,
                            userRole: userRole,
                            roles: req.user.role
                        });
                    }
                }
            });
        });
    });
});

router.post('/addEditor', checkControl.checkChiefEditor, function (req, res, next) {
    var currentUser = req.body.editorID;
    var currentKeyword = req.body.keywordID;

    async.parallel([
        function (callback) {
            Keyword.findById(currentKeyword, function (err, keyword) {
                if (err) return callback(err);
                keyword.hasEditor = true;
                keyword.editor = currentUser;
                keyword.save(function (err) {
                    if (err) return callback(err);
                    console.log("Keyword update edildi");
                });
            });
            callback();
        },
        function (callback) {
            User.findById(currentUser, function (err, user) {
                if (err) return callback(err);
                var editorControl = false;
                user.role.forEach(function (userRole) {
                    if (userRole == 'editor') {
                        editorControl = true;
                    }
                });

                if (!editorControl) {
                    user.role.push('editor');
                }
                
                user.isEditor = true;
                user.keyword.push(currentKeyword);
                
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