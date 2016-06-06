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
    var popTopics = [];
    var globalUser;
    var globalTopic;
    var newPopTopics = [];

    var n;
    var m;
    var matrix;
    var yer;
    var onereceklerimiz = [];
    User.find({}, function (err, users) {
        if (err) throw (err);
        n = users.length;
        Topic.find({}, function (err, topics) {
            if (err) throw (err);
            m = topics.length;
            var newMatrix = new Array(users.length);
            for (var i = 0; i < users.length; i++) {
                newMatrix[i] = new Array(topics.length);
            }
            for (var i = 0; i < users.length; i++) {
                var followingTopics = users[i].followingTopics;
                if ((req.user._id).toString() === (users[i]._id).toString())
                    yer = i;
                for (var j = 0; j < topics.length; j++) {
                    var control = false;
                    followingTopics.forEach(function (topic) {
                        if (topic.toString() === (topics[j]._id).toString())
                            control = true;
                    });
                    if (control == true)
                        newMatrix[i][j] = 1;
                    else
                        newMatrix[i][j] = 0;
                }
            }
            console.log(newMatrix);
            var dizi = new Array(users.length);
            for (var i = 0; i < users.length; i++) {
                dizi[i] = new Array(2);
            }
            for (var i = 0; i < users.length; i++) {
                var toplam = 0;
                var d1 = 0;
                var d2 = 0;
                for (var j = 0; j < topics.length; j++) {
                    toplam = toplam + (newMatrix[i][j] * newMatrix[yer][j]);
                    d1 = d1 + newMatrix[i][j] * newMatrix[i][j];
                    d2 = d2 + newMatrix[yer][j] * newMatrix[yer][j];
                }
                var bolu = (Math.sqrt(d1)) * (Math.sqrt(d2));
                if (bolu == 0)
                    dizi[i][0] = 0;
                else
                    dizi[i][0] = toplam / bolu;
                dizi[i][1] = i;
            }
            dizi.sort(function (a, b) {
                return b[0] - a[0]
            });
            console.log(dizi);
            for (var k = 1; k < 5; k++) {
                for (var c = 0; c < topics.length; c++) {
                    var varMi = false;
                    if (newMatrix[dizi[k][1]][c] == 1 && newMatrix[dizi[0][1]][c] == 0) {
                        onereceklerimiz.forEach(function (onerilen) {
                            if ((onerilen._id).toString() === (topics[c]._id).toString())
                                varMi = true;
                        });
                        if (varMi == false)
                            onereceklerimiz.push(topics[c]);
                    }
                }
            }
            var userRole = userRoleControl(currentUser);
            User.findById(viewUserId, function (err, user) {
                if (err) throw err;
                var query = {author: viewUserId};
                Topic.find(query, function (err, topics) {
                    if (err) throw err;
                    // res.json(user+topics.length);
                    MainTopic.find({}, function (err, mainTopics) {
                        if (err) throw err;
                        Topic.find({}, null, {sort: {viewCount: -1}}, function (err, toppics) {
                            popTopics = toppics;
                            for (var i = 0; i < 5; i++) {
                                newPopTopics.push(popTopics[i]);
                            }
                            res.render('public_profile', {
                                viewUser: user,
                                topics: topics,
                                onerilenTopicler: onereceklerimiz,
                                mainTopics: mainTopics,
                                populerTopics: newPopTopics,
                                userRole: userRole
                            })
                        });
                    });
                });
            });
        })
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
        User.findById(toId, function (err, user) {
            if (err) throw (err);

            var newMessage = new Message({
                fromName: req.user.username,
                from: fromId,
                to: toId,
                toName: user.username,
                isRead: false,
                content: content,
                subject: subject
            });

            newMessage.save(function (err) {
                if (err) throw err;
                req.flash('success', "Mesajınız başarıyla gönderilmiştir.");
                res.redirect('/');

            });
        });
    } else {
        console.log(errors);
        res.sendStatus(404);
    }
});

router.post('/reply', function (req, res, next) {
    console.log("Buraya girdi");
    // res.render('not_found');

    var fromId = req.user._id;

    var subject = req.body.subject;
    var content = req.body.messageContent;
    var toId;
    var toName;

    req.checkBody('messageContent', 'İçerik alanını doldurunuz').notEmpty();

    var errors = req.validationErrors();

    if (!errors) {
        var query = {subject: subject};

        Message.find(query, function (err, messages) {
            if (err) throw (err);

            if ((messages[0].from).toString() === (req.user._id).toString()) {
                toId = messages[0].to;
                toName = messages[0].toName;
            }
            else {
                toId = messages[0].from;
                toName = messages[0].toName;
            }
            var newMessage = new Message({
                from: req.user._id,
                fromName: req.user.username,
                to: toId,
                toName: toName,
                isRead: false,
                content: content,
                subject: subject
            });

            newMessage.save(function (err) {
                if (err) throw err;
                req.flash('success', "Mesajınız başarıyla gönderilmiştir.");
                res.redirect('/');

            });
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
    var mesajlar = [];
    var i = 0;
    Message.find({}, function (err, messages) {
        if (err) throw err;
        Message.find(query).distinct('subject').exec(function (err, subjects) {
            if (err) throw err;
            subjects.forEach(function (subject) {
                var control = false;
                var i = 0;
                while (!control) {
                    if (subject === messages[i].subject) {
                        control = true;
                        mesajlar.push(messages[i]);
                    }
                    i++;
                }
            });
            res.render('inbox', {
                userRole: userRole,
                roles: currentUser.role,
                mesajlar: mesajlar
            });
        });
    });
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
        var query = {subject: message.subject}
        Message.find(query, function (err, messages) {
            if (err) throw err;
            res.render('showMessage', {
                userRole: userRole,
                roles: currentUser.role,
                mesajlar: messages
            })
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

function onerilecekleriGetir(currentUser) {

    return onereceklerimiz;
}

module.exports = router;
