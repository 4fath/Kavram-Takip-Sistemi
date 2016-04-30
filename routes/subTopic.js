/**
 * Created by TOSHIBA on 30.4.2016.
 */
var express = require('express');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Topic = require('../models/Topic');

var User = require('../models/User');
var Comment = require('../models/Comment');

var router = express.Router();

router.get('/addSubTopic', function (req, res, next) {
    var myMainTopics = {};
    MainTopic.find({}, function (err, mainTopics) {
        if (err) throw err;
        myMainTopics = mainTopics;
        res.render('add_sub_topic', {
            mainTopics : myMainTopics
        })
    });
});

router.post('/addSubTopic', function (req, res, next) {

    var mainTopicId = req.body.mainTopicID;
    var currentUser = req.user || { name : guest, accessTime : Date.now()};

    var subTopicName = req.body.subTopicName;
    var subTopicDefinition = req.body.subTopicDefinition;

    req.checkBody('subTopicName', "Bu kısım boş olmamlı.").notEmpty();
    req.checkBody('subTopicDefinition', "Bu kısım bos olmamalı").notEmpty();

    var errors = req.validationErrors();
    if (!errors){
        var newSubTopic = new SubTopic({
            name : subTopicName,
            definition : subTopicDefinition,
            author : currentUser._id,
            mainTopic : mainTopicId
        });

        newSubTopic.save(function (err) {
           if (err) throw err;
            console.log("Başarılı bir şekilde alt başlık kaydedildi ");
            res.redirect('/');
        });

    }else {
        res.render('add_sub_topic', {
            errors : errors,
            subTopicName : subTopicName,
            subTopicDefinition : subTopicDefinition
        });
    }

});

module.exports = router;