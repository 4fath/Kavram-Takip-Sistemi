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
                            req.flash('success', "Helal sana !");
                            res.render('addTopic', {
                                mainTopics: myMainTopics,
                                subTopics: mySubTopics,
                                user: currentUser
                            });
                        })
                    });

                })

            });

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
            isDraft: true
        });

        newTopic.save(function (err) {
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
                    req.flash('success', "Taslak olarak kaydedilmiştir !");
                    res.render('addTopic', {
                        mainTopics: myMainTopics,
                        subTopics: mySubTopics,
                        user: currentUser
                    });
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
    Topic.findById(topicId, function (err, topic) {
        if (err) throw err;
        console.log(topic.name);

        MainTopic.find({}, function (err, mainTopics) {
            if (err) throw err;
            var mainTopicSira ;
            for (var i = 0; i< mainTopics.length ; i++){
                var currentMainTopic = mainTopics[i];
                console.log(currentMainTopic._id);
                console.log(topic.relevantMainTopics[0]);
                console.log("============");
                
                if (String(topic.relevantMainTopics[0]) === currentMainTopic._id.toString()){
                    console.log("sonunda"+true);
                    mainTopicSira = i;
                }
            }
            
            SubTopic.find({}, function (err, subTopics) {
                if (err) throw err;
                console.log(topic.relevantSubTopics);
                console.log(topic.relevantSubTopics[0]);
                console.log("SUBTOPICC =================");
                var subTopicSira ;
                for (var j = 0; j < subTopics.length ; j++ ){
                    var currentSubTopic = subTopics[j];
                    console.log(currentSubTopic._id);
                    console.log(topic.relevantSubTopics[0]);

                    if (String(topic.relevantSubTopics[0]) === currentSubTopic._id.toString()){
                        console.log("sonunda"+true);
                        subTopicSira = j;
                    }else {
                        console.log(false);
                    }
                }
                
                
                res.render('edit_topic', {
                    topic: topic,
                    topicName: topic.name,
                    topicAbstract: topic.abstract,
                    topicDefinition: topic.definition,
                    myMainTopic: topic.relevantMainTopics[0],
                    mySubTopic: topic.relevantSubTopics[0],
                    mainTopicSira : mainTopicSira,
                    subTopicSira : subTopicSira,
                    mainTopics: mainTopics,
                    subTopics: subTopics
                });
            });
        });
    });
});


router.post('/approveByEditor/:topicId', ensureAuthentication, function (req, res, next) {
    var topicId = req.params.topicId;
    console.log("Topic ID" + topicId);
    Topic.findById(topicId, function (err, topic) {
        if (err) throw err;
        topic.allowStatus = true;
        topic.save(function (err) {
            if (err) throw err;
            console.log("Onaylandı"+ err);
            req.flash('success', "Başarıyla onaylandı");
            res.redirect('/user/editorProfile');
        });
    });
});

router.post('/editTopic/:topicId', ensureAuthentication, function (req, res, next) {
    var topicId = req.params.topicId;

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
        var query = {_id: topicId};

        Topic.findById(topicId, function (err, topic) {
            if (err) throw err;

            topic.name = topicName;
            topic.abstract = topicAbstract;
            topic.definition = topicDefinition;
            topic.relevantMainTopics[0] = selectedMainTopicId;
            topic.relevantSubTopics[0] = selectedSubTopicId;

            topic.save(function (err) {
                if (err) throw err;
                res.redirect('/topic/myDrafts');
            });

        });

        // Topic.findOneAndUpdate(query,
        //     {
        //         $set: {
        //             name: topicName,
        //             abstract: topicAbstract,
        //             definition: topicDefinition,
        //             allowStatus: false
        //         }
        //     },
        //     {upsert: true},
        //     function (err, doc) {
        //         if (err) throw err;
        //         console.log(doc);
        //         var query = {author: currentUser._id, isDraft: true};
        //         Topic.find(query, function (err, topics) {
        //             if (err) throw err;
        //             res.render('onDraftTopics', {
        //                 myDraftTopics: topics,
        //                 user: currentUser
        //             });
        //         });
        //     }
        // )

    } else {
        console.log("hata burda");
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
    var currentUser = req.user;
    var followControl = false;
    Topic.findById(topicId, function (err, topic) {
        if (err) throw err;
        topic.followers.forEach(function (follower) {
            if (follower.toString() == (currentUser._id).toString()){
                followControl = true;
            }
        });
        MainTopic.findById(topic.relevantMainTopics[0], function (err, mainTopic) {
            if (err) throw err;
            SubTopic.findById(topic.relevantSubTopics[0], function (err, subTopic) {
                if (err) throw err;
                User.findById(topic.author, function (err, user) {
                    if (err) throw err;
                    var userName = user.username;
                    MainTopic.find({}, function (err, mainTopics) {
                        if (err) throw err;
                        console.log(followControl);
                        res.render('show_topic', {
                            topic: topic,
                            userName: userName,
                            mainTopics: mainTopics,
                            screenMainTopic: mainTopic,
                            screenSubTopic: subTopic,
                            followerControl: followControl
                        });
                    });

                });
            });
        });
    });
});

router.get('/onApprove', ensureAuthentication, function (req, res, next) {
    var currentUser = req.user;
    var query = {author: currentUser._id, allowStatus: false, isDraft: false};
    Topic.find(query, function (err, topics) {
        if (err) throw err;
        res.render('onArrovedTopic', {
            onApprovedTopics: topics
        });
    });
});


router.get('/myDrafts', ensureAuthentication, function (req, res, next) {
    var currentUser = req.user;
    var query = {author: currentUser._id, isDraft: true};
    Topic.find(query, function (err, topics) {
        if (err) throw err;
        res.render('onDraftTopics', {
            myDraftTopics: topics
        });
    });
});


router.get('/myTopics', ensureAuthentication, function (req, res, next) {
    var currentUser = req.user;
    var query = {author: currentUser._id, isDraft: false, allowStatus: true};
    Topic.find(query, function (err, topics) {
        if (err) throw err;
        res.render('myTopics', {
            myTopics: topics
        });
    });

});

module.exports = router;