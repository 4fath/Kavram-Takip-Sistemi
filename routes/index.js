var express = require('express');
var router = express.Router();

var MainTopic = require('../models/MainTopic');

/* GET home page. */
router.get('/', function (req, res, next) {

    var sendingTopics = [];
    MainTopic.find({}, function (err, topics) {
        if (err) throw err;
        console.log(topics);
        topics.forEach(function (topic) {
            sendingTopics.push(topic.name);
            console.log(topic);
        });

        res.render('kavram_takip', {
                title: 'Kavram Takip Sistemi Test',
                mainTopics : sendingTopics
            });
    });

    console.log("ilk neresi");

});

module.exports = router;
