var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Topic = require('../models/Topic');

var User = require('../models/User');
var Comment = require('../models/Comment');

var router = express.Router();

router.get('/add', function (req, res, next) {
   res.render('add_new_topic');
});

 // Add Topic
router.post('/addTopic', function (req, res, next) {

    var selectedMainTopicId = req.body.mainTopicID;
    var selectedSubTopicId = req.body.subTopicID;

    var topicName = req.body.topicName;
    var topicAbstract = req.body.topicAbstract;
    var topicDefinition = req.body.topicDefinition;
    var currentUser = req.user;
    
    req.checkBody('topicName', 'Keyword alanı boş olamaz.').notEmpty();
    req.checkBody('topicAbstract', 'Özet alanı boş olamaz.').notEmpty();
    req.checkBody('topicDefinition', 'Tanım alanı boş olamaz').notEmpty();

    var errors = req.validationErrors();

    if (!errors){
        var newTopic = new Topic({
            name : topicName,
            abstract : topicAbstract,
            definition : topicDefinition,
            author : currentUser._id,
            relevantMainTopic : [selectedMainTopicId],
            relevantSubTopic : [selectedSubTopicId],
            allowStatus : false,
            isDraft : false
        });
        
        newTopic.save(function (err) {
            if (err) throw err;
            res.render('add_new_topic',{
                messages : 'Başarılı bir şekilde işleminiz kaydedilmiştir,' +
                ' onaylandıktan sonra sistemde görünmeye başlayacaktır '
            });
        });

    } else {
        res.render('add_new_topic', {
            errors :errors,
            name : topicName,
            abstract : topicAbstract,
            definition : topicDefinition
        });
    }
});

 // Add Topic as Draft
router.post('/addTopicAsDraft', function (req, res, next) {

    var selectedMainTopicId = req.body.mainTopicID;
    var selectedSubTopicId = req.body.subTopicID;

    var topicName = req.body.topicName;
    var topicAbstract = req.body.topicAbstract;
    var topicDefinition = req.body.topicDefinition;
    var currentUser = req.user;

    req.checkBody('topicName', 'Keyword alanı boş olamaz.').notEmpty();
    req.checkBody('topicAbstract', 'Özet alanı boş olamaz.').notEmpty();
    req.checkBody('topicDefinition', 'Tanım alanı boş olamaz').notEmpty();

    var errors = req.validationErrors();

    if (!errors){
        var newTopic = new Topic({
            name : topicName,
            abstract : topicAbstract,
            definition : topicDefinition,
            author : currentUser._id,
            relevantMainTopic : [selectedMainTopicId],
            relevantSubTopic : [selectedSubTopicId],
            allowStatus : false,
            isDraft : true
        });

        newTopic.save(function (err) {
            if (err) throw err;
            res.render('add_new_topic',{
                messages : 'Başarılı bir şekilde işleminiz kaydedilmiştir,' +
                'istediğiniz zaman tekrar değişiklik yapabilirsiniz. '
            });
        });

    }else {
        res.render('add_new_topic', {
            errors :errors,
            name : topicName,
            abstract : topicAbstract,
            definition : topicDefinition
        });
    }
});

module.exports = router;