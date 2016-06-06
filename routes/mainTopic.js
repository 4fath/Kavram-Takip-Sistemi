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
    var currentUser = req.user;
    console.log(mainTopicId);
    var newPopTopics = [];
    var query = {mainTopic: mainTopicId};

    var n;
    var m;
    var matrix;
    var yer;
    var onereceklerimiz = [];
    if (currentUser) {
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
                    if ((currentUser._id).toString() === (users[i]._id).toString())
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
                        console.log(newMatrix[i][j]);
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
            })
        });
    }
    if (currentUser)
        var userRole = userRoleControl(currentUser);
    SubTopic.find(query, function (err, subTopics) {
        if (err) throw err;
        console.log("Bağlantılı olduğu alt başlıklar  : ");
        MainTopic.find({}, function (err, mainTopics) {
            if (err) throw err;
            Topic.find({}, null, {sort: {viewCount: -1}}, function (err, toppics) {
                for (var i = 0; i < 5; i++) {
                    newPopTopics.push(toppics[i]);
                }
                res.render('show_sub_topic_list', {
                    subTopics: subTopics,
                    mainTopics: mainTopics,
                    onerilenTopicler: onereceklerimiz,
                    populerTopics: newPopTopics,
                    userRole: userRole
                });
            });
        });
    });
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