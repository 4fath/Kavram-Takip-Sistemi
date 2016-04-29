var express = require('express');
var router = express.Router();
var Topic = require('../models/Topic');
var User = require('../models/User');
var Comment = require('../models/Comment');

router.get('/list', function (req, res, next) {
    var emptyMessage = 'Hiç bir kayıt bulunamadı';
    Topic.find({}, function (err, topics) {
        var i = 0;
        var topicMap = {};
        if (topicMap) {
            // res.send(topics);
            res.render('kavram_list', {data: topics});
            console.log(topics);
        } else {
            res.type('application/json');
            res.send(JSON.stringify(emptyMessage));
        }
    });
});

router.get('/add', function (req, res, next) {
   res.render('add_new_topic');
});

router.post('/add', function (req, res, next) {
    var topicName = req.body.kavram_adi;
    var topicDefinition = req.body.kavram_tanimi;
    var user = req.user;
    if (user){
        console.log("user gelmis"+user);
    }else {
        console.log("user gelmemis");
    }

    var newTopic = new Topic({
        name: topicName,
        definition: topicDefinition,
        chiefEditor : user
    });

    Topic.createTopic(newTopic, function (err, newTopic) {
        if (err) throw err;
        console.log(newTopic);
    });

    res.type('application/json');
    res.send(newTopic);

});



router.get('/:id', function (req, res, next) {
    var topicID = req.params.id;
    Topic.findById(topicID, function (err, topic) {
        if (err) throw err;
        myTopic = topic;
        req.session.topic = topic;
        var myCommentArray = [];
        Comment.find({ topic : topic._id}, function (err, comments) {
            if (err) throw err;
            console.log(comments);
            myCommentArray = comments;
            Topic.find({}, function (err, topics) {
                if (err) throw err;
                res.render('kavram_takip', {
                    title: 'Kavram Takip Sistemi Test',
                    mainTopic : topic,
                    comments : myCommentArray,
                    topics : topics
                });
            });
            

        });
    });
});


module.exports = router;