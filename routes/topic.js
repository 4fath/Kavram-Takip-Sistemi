var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Topic = require('../models/Topic');

var User = require('../models/User');
var Comment = require('../models/Comment');

var router = express.Router();

router.get('/addTopic', ensureAuthentication, function (req, res, next) {
    var myMainTopics = [];
    var mySubTopics = [];
    async.parallel([
        function (callback) {
            MainTopic.find({}, function (err, mainTopics) {
                mainTopics.forEach(function (mainTopic) {
                    if (err) return callback(err);
                    myMainTopics.push(mainTopic);
                });
            });
            callback();
        },
        function (callback) {
            SubTopic.find({}, function (err, subTopics) {
                if (err) return callback(err);
                subTopics.forEach(function (subTopic) {
                    mySubTopics.push(subTopic);
                });
            });
            callback();
        }
    ], function (err) {
        if (err) return (err);
        res.render('add_new_topic', {
            mainTopics: myMainTopics,
            subTopics: mySubTopics
        });
    });

});

// Add Topic
router.post('/addTopic', ensureAuthentication, function (req, res, next) {

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

    if (!errors) {
        var newTopic = new Topic({
            name: topicName,
            abstract: topicAbstract,
            definition: topicDefinition,
            author: currentUser._id,
            relevantMainTopic: [selectedMainTopicId],
            relevantSubTopic: [selectedSubTopicId],
            allowStatus: false,
            isDraft: false
        });

        newTopic.save(function (err) {
            if (err) throw err;
            var query = {_id: selectedMainTopicId};
            SubTopic.findOneAndUpdate(query,
                {$push: {relevantTopics: newTopic._id}},
                {safe: true, upsert: true},
                function (err, doc) {
                    if (err) throw err;
                    res.render('add_new_topic', {
                        messages: 'Başarılı bir şekilde işleminiz kaydedilmiştir,' +
                        ' onaylandıktan sonra sistemde görünmeye başlayacaktır '
                    });
                });
        });

    } else {
        res.render('add_new_topic', {
            errors: errors,
            name: topicName,
            abstract: topicAbstract,
            definition: topicDefinition
        });
    }
});

// Add Topic as Draft
router.post('/addTopicAsDraft', ensureAuthentication, function (req, res, next) {

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

    if (!errors) {
        var newTopic = new Topic({
            name: topicName,
            abstract: topicAbstract,
            definition: topicDefinition,
            author: currentUser._id,
            relevantMainTopic: [selectedMainTopicId],
            relevantSubTopic: [selectedSubTopicId],
            allowStatus: false,
            isDraft: true
        });

        newTopic.save(function (err) {
            if (err) throw err;
            SubTopic.findOneAndUpdate(query,
                {$push: {relevantTopics: newTopic._id}},
                {safe: true, upsert: true},
                function (err, doc) {
                    if (err) throw err;
                    res.render('add_new_topic', {
                        messages: 'Başarılı bir şekilde işleminiz kaydedilmiştir,' +
                        ' onaylandıktan sonra sistemde görünmeye başlayacaktır '
                    });
                });
        });

    } else {
        res.render('add_new_topic', {
            errors: errors,
            name: topicName,
            abstract: topicAbstract,
            definition: topicDefinition
        });
    }
});

router.get('/editTopic/:topicId', ensureAuthentication, function (req, res, next) {
    var topicId = req.params.topicId;
    var query = {_id: topicId, isDraft: true};
    Topic.find(query, function (err, topic) {
        if (err) throw err;
        res.render('edit_topic', {
            topicName: topic.name,
            topicAbstract: topic.abstract,
            topicDefinition: topic.definition
        });
    });
});

router.post('/editTopic/:topicId', ensureAuthentication, function (req, res, next) {
    var topicId = req.params.topicId;

    var selectedMainTopicId = req.body.mainTopicID;
    var selectedSubTopicId = req.body.subTopicID;

    var topicName = req.body.topicName;
    var topicAbstract = req.body.topicAbstract;
    var topicDefinition = req.body.topicDefinition;
    var currentUser = req.user;

    req.checkBody('topicName', 'Keyword alanı boş olamaz.').notEmpty();
    req.checkBody('topicAbstract', 'Özet alanı boş olamaz.').notEmpty();
    req.checkBody('topicDefinition', 'Tanım alanı boş olamaz').notEmpty();

    if (!errors) {
        var query = {_id : topicId};
        Topic.findOneAndUpdate(query,
            {$set: {
                name: topicName,
                abstract : topicAbstract,
                definition : topicDefinition,
                allowStatus : false,
                updatedAt : Date.now
            }},
            {safe: true, upsert: true},
            function (err, doc) {
                if (err) throw err;
                console.log(doc);
                res.render()
            }
        )

    }else {
        res.render('edit_topic',{
            errors : errors,
            topicName: topicName,
            topicAbstract: topicAbstract,
            topicDefinition: topicDefinition
        })
    }

});


function ensureAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

router.get('/:mainTopicId', ensureAuthentication, function (req, res, next) {
    var mainTopicId = req.params.mainTopicId; 
    MainTopic.findById(mainTopicId, function (err, mainTopic) {
        if (err) throw err;
        var subTopicArray = mainTopic.relevantSubTopics;
        res.render('show_sub_topic_list',{
            subTopics : subTopicArray
        });
    });
});

router.get('/:subTopicId', ensureAuthentication, function (req, res, next) {
    var subTopicId = req.params.subTopicId;
    SubTopic.findById(subTopicId, function (err, subTopic) {
        if (err) throw err;
        var topicArray = subTopic.relevantTopics;
        res.render('show_topic_list', {
            topics : topicArray
        });
    });
});

router.get('/:topicId', ensureAuthentication, function (req, res, next) {
    var topicId = req.params.topicId;
    Topic.findById(topicId, function (err, topic) {
        if (err) throw err;
        res.render('show_topic', {
           topic : topic 
        });
    });
});



module.exports = router;