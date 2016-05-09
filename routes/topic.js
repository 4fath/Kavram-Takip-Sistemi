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
    MainTopic.find({}, function (err, mainTopics) {
        if (err) throw err;
        mainTopics.forEach(function (mainTopic) {
            myMainTopics.push(mainTopic);
        });

        SubTopic.find({}, function (err, subTopics) {
            if (err) throw err;
            subTopics.forEach(function (subTopic) {
                mySubTopics.push(subTopic);
            });
            res.render('addTopic', {
                mainTopics: myMainTopics,
                subTopics: mySubTopics
            });
        })
    });

    // async.parallel([
    //     function (callback) {
    //         MainTopic.find({}, function (err, mainTopics) {
    //             if (err) return callback(err);
    //             console.log(mainTopics);
    //             myMainTopics = mainTopics;
    //             // mainTopics.forEach(function (mainTopic) {
    //             //     myMainTopics.push(mainTopic);
    //             // });
    //         });
    //         callback();
    //     },
    //     function (callback) {
    //         SubTopic.find({}, function (err, subTopics) {
    //             if (err) return callback(err);
    //             console.log(subTopics);
    //             mySubTopics = subTopics;
    //             // subTopics.forEach(function (subTopic) {
    //             //     mySubTopics.push(subTopic);
    //             // });
    //         });
    //         callback();
    //     }
    // ], function (err) {
    //     if (err) return (err);
    //     console.log("MainTopics :" + myMainTopics);
    //     console.log("SubTopics :" + mySubTopics);
    //     res.render('addTopic', {
    //         mainTopics: myMainTopics,
    //         subTopics: mySubTopics
    //     });
    // });

});

// Add Topic
router.post('/addTopic', ensureAuthentication, function (req, res, next) {

    var selectedMainTopicId = req.body.myMainTopic;
    var selectedSubTopicId = req.body.mySubTopic;

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
            relevantMainTopics: [selectedMainTopicId],
            relevantSubTopics: [selectedSubTopicId],
            allowStatus: false,
            isDraft: false
        });

        newTopic.save(function (err) {
            if (err) throw err;
            var query = {_id: selectedMainTopicId};

            SubTopic.findById(selectedSubTopicId, function (err, subTopic) {

                console.log(subTopic);

                subTopic.relevantTopics.push(newTopic._id);

                +subTopic.save(function (err) {
                    if (err) throw err;
                    var myMainTopics = [];
                    var mySubTopics = [];
                    MainTopic.find({}, function (err, mainTopics) {
                        if (err) throw err;
                        mainTopics.forEach(function (mainTopic) {
                            myMainTopics.push(mainTopic);
                        });

                        SubTopic.find({}, function (err, subTopics) {
                            if (err) throw err;
                            subTopics.forEach(function (subTopic) {
                                mySubTopics.push(subTopic);
                            });
                            res.render('addTopic', {
                                messages: 'Başarılı bir şekilde işleminiz kaydedilmiştir,' +
                                ' onaylandıktan sonra sistemde görünmeye başlayacaktır ',
                                mainTopics: myMainTopics,
                                subTopics: mySubTopics
                            });
                        })
                    });

                })

            });

            // SubTopic.findOneAndUpdate(query,
            //     {$push: {relevantTopics: newTopic._id}},
            //     {safe: true, upsert: true},
            //     function (err, doc) {
            //         if (err) throw err;
            //         res.render('add_new_topic', {
            //             messages: 'Başarılı bir şekilde işleminiz kaydedilmiştir,' +
            //             ' onaylandıktan sonra sistemde görünmeye başlayacaktır ',
            //             mainTopics: myMainTopics,
            //             subTopics: mySubTopics
            //         });
            //     });
        });

    } else {
        var myMainTopics = [];
        var mySubTopics = [];

        MainTopic.find({}, function (err, mainTopics) {
            if (err) throw err;
            mainTopics.forEach(function (mainTopic) {
                myMainTopics.push(mainTopic);
            });

            SubTopic.find({}, function (err, subTopics) {
                if (err) throw err;
                subTopics.forEach(function (subTopic) {
                    mySubTopics.push(subTopic);
                });
                res.render('addTopic', {
                    errors: errors,
                    mainTopics: myMainTopics,
                    subTopics: mySubTopics,
                    topicName: topicName,
                    topicAbstract: topicAbstract,
                    topicDefinition: topicDefinition
                });
            })
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
        var query = {_id: topicId};
        Topic.findOneAndUpdate(query,
            {
                $set: {
                    name: topicName,
                    abstract: topicAbstract,
                    definition: topicDefinition,
                    allowStatus: false,
                    updatedAt: Date.now
                }
            },
            {safe: true, upsert: true},
            function (err, doc) {
                if (err) throw err;
                console.log(doc);
                res.render()
            }
        )

    } else {
        res.render('edit_topic', {
            errors: errors,
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

router.get('/getTopic/:topicId', ensureAuthentication, function (req, res, next) {
    var topicId = req.params.topicId;
    Topic.findById(topicId, function (err, topic) {
        if (err) throw err;
        
        User.findById(topic.author, function (err, user) {
            if (err) throw err;
            var userName = user.username;
            res.render('show_topic', {
                topic: topic,
                user : userName
            });    
        });
    });
});

router.get('/onApprove', ensureAuthentication, function (req, res, next) {
    var currentUser = req.user;
    var query = {author : currentUser._id , allowStatus : false };
    Topic.find(query, function (err, topics) {
        if (err) throw err;
        res.render('onArrovedTopic', {
            onApprovedTopics : topics
        });
    });
});


router.get('/myDrafts' , ensureAuthentication, function (req, res, next) {
    var currentUser = req.user;
    var query = {author : currentUser._id , isDraft : true };
    Topic.find(query, function (err, topics) {
        if (err) throw err;
        res.render('onDraftTopics', {
            myDraftTopics : topics
        });
    });
});


router.get('/myTopics', ensureAuthentication, function (req, res, next) {
    var currentUser = req.user;
    var query = {author : currentUser._id, isDraft : false, allowStatus : true};
    Topic.find(query, function (err, topics) {
        if (err) throw err;
        res.render ('myTopics', {
            myTopics : topics
        });
    });
    
});

module.exports = router;