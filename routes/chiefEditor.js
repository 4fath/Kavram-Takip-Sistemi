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
        res.render('add_sub_topic', {
            mainTopics : myMainTopics
        })
    });
});

// TODO : NOT tested
router.post('/addSubTopic', function (req, res, next) {
    var currentUserId = req.user._id;
    var mainTopicId = req.body.mainTopicID;
    var subTopicName = req.body.subTopicName;
    var subTopicDefinition = req.body.subTopicDefinition;
    req.checkBody('subTopicName', "Bu kısım boş olmamlı.").notEmpty();
    req.checkBody('subTopicDefinition', "Bu kısım bos olmamalı").notEmpty();

    var errors = req.validationErrors();
    if (!errors){
        var newSubTopic = new SubTopic({
            name : subTopicName,
            definition : subTopicDefinition,
            mainTopic : mainTopicId,
            editor : currentUserId
        });

        newSubTopic.save(function (err) {
            if (err) throw err;
            var query = {_id : mainTopicId};
            MainTopic.findOneAndUpdate(query,
                {$push : {relevantSubTopics : newSubTopic._id}},
                {safe: true, upsert: true},
                function (err, doc) {
                    if (err) throw err;
                    console.log("SubTopic başarılı bir şekilde kaydedildi : "+newSubTopic );
                    console.log("MainTopic update edildi : " + doc);
                    res.render('/', {
                        message : 'SubTopic başarılı bir şekilde eklendi.'
                    });
                }
            );
        });
    }else {
        res.render('add_sub_topic', {
            errors : errors,
            subTopicName : subTopicName,
            subTopicDefinition : subTopicDefinition
        });
    }
});

// FOOL 
// TODO : NOT completed 
router.get('/addEditor', function (req, res, next) {
    var queryForUser = {isEditor : false};
    var queryForSubTopic = {hasEditor : false};
    var myUsers = [];
    var mySubTopics = [];

    async.parallel([
        function (callback) {
            User.find(queryForUser, function (err, users) {
                if (err) return callback(err);
                users.forEach(function (user) {
                    myUsers.push(user);
                });
            });
            callback();
        },
        function (callback) {
            SubTopic.find(queryForSubTopic, function (err, subTopics) {
                if (err) return callback(err);
                subTopics.forEach(function (subTopic) {
                    mySubTopics.push(subTopic)
                });
            });
            callback();
        }

    ], function (err) {
        if (err) return (err);
        res.render('add_editor',{
            
        });
    })
});

// FOOL 
// TODO : NOT completed
router.post('/addEditor', function (req, res, next) {
    
});


module.exports = router;