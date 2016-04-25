var express = require('express');
var router = express.Router();
var Topic = require('../models/Topic');
var User = require('../models/User');

router.get('/list', function (req, res, next) {

    var emptyMessage = 'Hiç bir kayıt bulunamadı';
    Topic.find({}, function (err, topics) {

        var i = 0;
        var topicMap = {};

        // topics.forEach(function (topic) {
        //     topicMap[topic._id] = topic;
        //     i++;
        // });

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
   res.render('add_new_topic' );
});

router.post('/add', function (req, res, next) {
    var topicName = req.body.kavram_adi;
    var topicDefinition = req.body.kavram_tanimi;


    var newTopic = new Topic({
        name: topicName,
        definition: topicDefinition
    });

    Topic.createTopic(newTopic, function (err, newTopic) {
        if (err) throw err;
        console.log(newTopic);
    });

    res.type('application/json');
    res.send(newTopic);

});


module.exports = router;