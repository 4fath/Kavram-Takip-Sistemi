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

router.post('/sendMessage', function (req, res, next) {
    console.log("Buraya girdi");
    // res.render('not_found');

    var fromId = req.user._id;

    var subject = req.body.messageSubject;
    var content = req.body.messageContent;
    var toId = req.body.toId;

    req.checkBody('messageSubject', 'Konu alanınu doldurunuz').notEmpty();
    req.checkBody('messageContent', 'İçerik alanını doldurunuz').notEmpty();

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
            req.flash('success', "Mesajınız başarıyla gönderilmiştir.");
            res.redirect('/');

        });


    } else {
        console.log(errors);
        res.sendStatus(404);
    }
    
});

router.get('/inbox', function (req, res, next) {
    var currentUser = req.user;
    var query = {to: currentUser._id};
    var userRole = userRoleControl(currentUser);

    Message.find(query, function (err, messages) {
        if (err) throw err;
        res.render('inbox', {
            userRole: userRole,
            roles: currentUser.role,
            mesajlar: messages
        })
    })
});

router.get('/outbox', function (req, res, next) {
    var currentUser = req.user;
    var query = {from: currentUser._id};
    var userRole = userRoleControl(currentUser);

    Message.find(query, function (err, messages) {
        if (err) throw err;
        res.render('outbox', {
            userRole: userRole,
            roles: currentUser.role,
            mesajlar: messages
        })
    })
});

router.get('/showMessage/:messageId', function (req, res, next) {
    var currentUser = req.user;
    var messageId = req.params.messageId;
    var userRole = userRoleControl(currentUser);

    Message.findById(messageId, function (err, message) {
        if (err) throw err;
        res.render('showMessage', {
            userRole: userRole,
            roles: currentUser.role,
            mesaj: message
        })
    })
});

function userRoleControl(user) {
    var isAdmin = false;
    var isChief = false;
    var isEditor = false;
    user.role.forEach(function (userRole) {
        if (userRole == 'admin')
            isAdmin = true;
        if (userRole == 'chiefEditor')
            isChief = true;
        if (userRole == 'editor')
            isEditor = true;
    });
    var userRole = "author";
    if (isAdmin)
        userRole = "admin";
    else if (isChief)
        userRole = "chiefEditor";
    else if (isEditor)
        userRole = "editor";
    return userRole;
}

module.exports = router;
