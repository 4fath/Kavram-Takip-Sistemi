/**
 * Created by TOSHIBA on 5.5.2016.
 */
var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Topic = require('../models/Topic');

var User = require('../models/User');
var Comment = require('../models/Comment');

var router = express.Router();

router.get('/:mainTopicId', function (req, res, next) {
    var mainTopicId = req.params.mainTopicId;
    console.log(mainTopicId);

    var query = { mainTopic : mainTopicId };

    SubTopic.find(query, function (err, subTopics) {
        if (err) throw err;
        console.log("Bağlantılı olduğu alt başlıklar  : ");
        // console.log(subTopics);

        subTopics.forEach(function (subTopic) {
            console.log(subTopic.name);
            console.log(subTopic);
            console.log("================")
        });


        if (subTopics.length == 0){
            var query = {mainTopics : mainTopicId};
            SubTopic.find(query, function (err, subTopics) {
                if (err) throw err;
                console.log("we are in");
                console.log(subTopics);
                res.render('show_sub_topic_list',{
                    subTopics : subTopics
                });
            })
        }else {
            res.render('show_sub_topic_list',{
                subTopics : subTopics
            });
        }

    });
});
module.exports = router;