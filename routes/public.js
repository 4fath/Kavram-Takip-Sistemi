/**
 * Created by TOSHIBA on 24.5.2016.
 */
var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Keyword = require('../models/Keyword');
var Topic = require('../models/Topic');

var User = require('../models/User');

var router = express.Router();

router.get('/:userId', function (req, res, next) {

    var currentUser = req.user;
    var viewUserId = req.params.userId;

    var globalUser;
    var globalTopic;
    async.parallel([

        function (callback) {
            User.findById(viewUserId, function (err, user) {
                if (err) callback(err);
                globalUser = user;
            });
            callback();
        },
        function (callback) {
            var query = {author: viewUserId};
            Topic.find(query, function (err, topics) {
                if (err) callback(err);
                globalTopic = topics;
            });
        }
    ], function (err) {
        if (err) return err;
        res.render('public_profile', {
            userTopics: globalTopic,
            viewUser: globalUser
        })

    });

});


module.exports = router;
