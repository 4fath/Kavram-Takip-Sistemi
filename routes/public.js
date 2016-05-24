/**
 * Created by TOSHIBA on 24.5.2016.
 */
var express = require('express');
var async = require('async');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Keyword = require('../models/Keyword');
var Topic = require('../models/Topic');
var Message = require('../models/Message');

var User = require('../models/User');

var router = express.Router();

router.get('/getProfile/:userId', function (req, res, next) {

    console.log("every thing is fine");
    var currentUser = req.user;
    var viewUserId = req.params.userId;

    var globalUser;
    var globalTopic;

    User.findById(viewUserId, function (err, user) {
        if (err) throw err;
        var query = {author: viewUserId};
        Topic.find(query, function (err, topics) {
            if (err) throw err;
            // res.json(user+topics.length);
            res.render('public_profile', {
                viewUser: user,
                topics: topics
            })
        });
    });

});


router.post('/sendMessage/:toId', function (req, res, next) {
    console.log(req.params.toId);
    console.log("Buraya girdi");
    // res.render('not_found');

    var fromId = req.user._id;
    var toId = req.params.toId;

    var subject = req.body.subject;
    var content = req.body.content;

    req.checkBody('subject', 'Konu alanınu doldurunuz').notEmpty();
    req.checkBody('content', 'İçerik alanını doldurunuz').notEmpty();

    var errors = req.validationErrors();

    if (!errors) {
        var newMessage = new Message({
            from: fromId,
            to: toId,
            isRead: false,
            content: content,
            subject: subject
        });

        newMessage.save(function (err) {
            if (err) throw err;
            console.log("oldu lan");
            res.sendStatus(200);

        });


    } else {
        console.log("hata var");
        res.sendStatus(404);
    }
    
});


module.exports = router;
