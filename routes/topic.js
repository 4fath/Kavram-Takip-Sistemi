var express = require('express');
var async = require('async');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var nodemailer = require('nodemailer');

var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Topic = require('../models/Topic');
var Keyword = require('../models/Keyword');
var User = require('../models/User');
var Comment = require('../models/Comment');

var router = express.Router();

router.get('/addTopic', ensureAuthentication, function (req, res, next) {
    var myMainTopics = [];
    var mySubTopics = [];
    var myKeywords = [];
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

    MainTopic.find({}, function (err, mainTopics) {
        if (err) throw err;
        mainTopics.forEach(function (mainTopic) {
            myMainTopics.push(mainTopic);
        });

        var query = {hasChiefEditor: true};
        SubTopic.find(query, function (err, subTopics) {
            if (err) throw err;
            subTopics.forEach(function (subTopic) {
                mySubTopics.push(subTopic);
            });

            var query = {hasEditor: true};
            Keyword.find(query, function (err, keywords) {
                if (err) throw err;
                keywords.forEach(function (keyword) {
                    myKeywords.push(keyword);
                });
                Topic.find({}, null, {sort: {viewCount: -1}}, function (err, toppics) {
                    for (var i = 0; i < 5; i++) {
                        newPopTopics.push(toppics[i]);
                    }
                    Topic.find({}, function (err, kavramlar) {
                        if (err) throw (err);
                        var userRole = userRoleControl(req.user);


                        res.render('addTopic', {
                            mainTopics: myMainTopics,
                            subTopics: mySubTopics,
                            keywords: myKeywords,
                            populerTopics: newPopTopics,
                            userRole: userRole,
                            topics: kavramlar,
                            onerilenTopicler: onereceklerimiz
                        });
                    });
                });
            });
        })
    });

});


// Add Topic olayı için..
router.get('/getValueArray', ensureAuthentication, function (req, res, next) {

    MainTopic.find(function (err, mainTopics) {
        if (err) throw err;
        SubTopic.find(function (err, subTopics) {
            if (err) throw err;
            Keyword.find(function (err, keywords) {
                if (err) throw err;
                var jsonObjecct = {
                    mainTopics: mainTopics,
                    subTopics: subTopics,
                    keywords: keywords
                };

                res.setHeader('content-type', 'text/javascript');
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                res.send(jsonObjecct);

            })
        })
    });

});

router.get('/getJustTopic', function (req, res, next) {
    var reqqqq = req.query.q;

    var query = {'name': new RegExp(reqqqq, 'i'), allowStatus: {stage: 1, status: true}};
    Topic.find(query, function (err, topics) {
        if (err) throw err;
        var array = [];
        topics.forEach(function (topic) {
            array.push(topic);
        });
        var jsonObject = {
            topics: array
        };
        res.setHeader('content-type', 'text/javascript');
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.send(jsonObject);
    })
});

// Add Topic
router.post('/addTopic', ensureAuthentication, function (req, res, next) {
    //
    // upload.single('topic_image'),
    var selectedMainTopicId = req.body.myMainTopic;
    var selectedSubTopicId = req.body.mySubTopic;
    var selectedKeywordId = req.body.myKeyword;

    var topicName = req.body.topicName;
    var topicAbstract = req.body.topicAbstract;
    var topicDefinition = req.body.topicDefinition;
    var currentUser = req.user;

    req.checkBody('topicName', 'Kavram adı boş olamaz.').notEmpty();
    req.checkBody('topicAbstract', 'Özet alanı boş olamaz.').notEmpty();
    req.checkBody('topicDefinition', 'Tanım alanı boş olamaz').notEmpty();

    var errors = req.validationErrors();
    console.log(errors);

    if (!errors) {
        var newTopic = new Topic({
            name: topicName,
            abstract: topicAbstract,
            definition: topicDefinition,
            author: currentUser._id,
            relevantMainTopics: [selectedMainTopicId],
            relevantSubTopics: [selectedSubTopicId],
            relevantKeywords: [selectedKeywordId],
            allowStatus: {status: false, stage: 0},
            isDraft: false
        });

        newTopic.save(function (err) {
            if (err) throw err;
            Keyword.findById(selectedKeywordId, function (err, keyword) {
                keyword.relevantTopics.push(newTopic._id);
                keyword.save(function (err) {
                    if (err) throw err;
                    req.flash('success', "Eklediğiniz Kavram sistemimize eklenmiştir, onaylandıktan sonra sistemde görünecektir !");
                    res.redirect('/');
                });
            });
        });

    } else {
        var myMainTopics = [];
        var mySubTopics = [];
        var myKeywords = [];
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

                Keyword.find({}, function (err, keywords) {
                    if (err) throw err;
                    keywords.forEach(function (keyword) {
                        myKeywords.push(keyword);
                    });
                    res.render('addTopic', {
                        user: req.user,
                        errors: errors,
                        mainTopics: myMainTopics,
                        subTopics: mySubTopics,
                        keywords: myKeywords,
                        topicName: topicName,
                        topicAbstract: topicAbstract,
                        topicDefinition: topicDefinition
                    });
                });
            });
        });
    }
});

var mimTypesArray = ["image/bmp", "image/fif", "image/florian", "image/ief", "image/jpeg", "image/pjpeg",
    "image/pict", "image/png", "image/x-rgb", "image/tiff", "image/x-xbitmap"];

function isImage(mimType) {
    for (var j = 0; j < mimTypesArray.length; j++) {
        if (mimTypesArray[j].match(mimType)) return j;
    }
    return -1;
}

// TODO : check out this 
function checkSize(imageSize) {
    // assuming max image size 5Mb
    var maxSize = 5000000;
    var minSize = 25000;

    if (imageSize < maxSize && imageSize > minSize) {
        return 1;
    } else {
        return 0;
    }
}

router.post('/rejectTopic/:topicId', ensureAuthentication, function (req, res, next) {
    var currentUser = req.user;
    var followControl = false;
    var rejectReason = req.body.rejectReason;
    var topicId = req.params.topicId;

    req.checkBody('rejectReason', 'Sebep alanı boş olamaz.').notEmpty();

    var errors = req.validationErrors();

    if (!errors) {
        Topic.findById(topicId, function (err, topic) {
            topic.allowStatus = {stage: -1, status: false};
            topic.reason = rejectReason;

            topic.save(function (err) {
                if (err) throw err;
                req.flash('success', "Kavram reddi kullanıcıya bilgilendirilmiştir.");
                res.redirect('/');
            });
        });

    } else {
        Topic.findById(topicId, function (err, topic) {
            if (err) throw err;
            topic.followers.forEach(function (follower) {
                if (follower.toString() == (currentUser._id).toString()) {
                    followControl = true;
                }
            });
            topic.viewCount++;
            topic.save(function (err) {
                if (err) throw err;
            });

            // TODO : do it async parallel i am sory for this merdiven
            MainTospic.findById(topic.relevantMainTopics[0], function (err, mainTopic) {
                if (err) throw err;
                SubTopic.findById(topic.relevantSubTopics[0], function (err, subTopic) {
                    if (err) throw err;
                    Keyword.findById(topic.relevantKeywords[0], function (err, keyword) {
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
                                    screenKeyword: keyword,
                                    followerControl: followControl
                                });
                            });
                        });
                    });
                });
            });
        });
    }
});

// Add Topic as Draft
router.post('/addTopicAsDraft', ensureAuthentication, function (req, res, next) {

    var selectedMainTopicId = req.body.myMainTopic;
    var selectedSubTopicId = req.body.mySubTopic;
    var selectedKeywordId = req.body.myKeyword;
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
            relevantKeywords: [selectedKeywordId],
            allowStatus: {stage: 9, status: false},
            isDraft: true
        });

        newTopic.save(function (err) {
            if (err) throw err;

            var myMainTopics = [];
            var mySubTopics = [];
            var myKeywords = [];

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

                    Keyword.find({}, function (err, keywords) {
                        if (err) throw err;
                        keywords.forEach(function (keyword) {
                            myKeywords.push(keyword);
                        });
                        Topic.find({}, function (err, topics) {
                            if (err) throw (err);

                            req.flash('success', "Taslak olarak kaydedilmiştir !");
                            // res.redirect('/');
                            res.render('addTopic', {
                                mainTopics: myMainTopics,
                                subTopics: mySubTopics,
                                keywords: myKeywords,
                                user: currentUser,
                                topics: topics
                            });
                        });
                    });
                });
            });
        });

    } else {
        MainTopic.find({}, function (err, mainTopics) {
            if (err) throw err;
            var myMainTopics = [];
            mainTopics.forEach(function (mainTopic) {
                myMainTopics.push(mainTopic);
            });
            res.render('add_new_topic', {
                errors: errors,
                name: topicName,
                abstract: topicAbstract,
                definition: topicDefinition,
                mainTopics: myMainTopics
            })
        })
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

                Keyword.find({}, function (err, keywords) {
                    if (err) throw err;
                    console.log(topic.relevantKeywords);
                    console.log(topic.relevantKeywords[0]);
                    console.log("Keyword =================");
                    var keywordSira;
                    for (var k = 0; k < keywords.length; k++) {
                        var currentKeyword = keywords[k];
                        console.log(currentKeyword._id);
                        console.log(topic.relevantKeywords[0]);

                        if (String(topic.relevantKeywords[0]) === currentKeyword._id.toString()) {
                            console.log("sonunda keyword" + true);
                            keywordSira = k;
                        } else {
                            console.log(false);
                        }
                    }
                    var userRole = userRoleControl(req.user);
                    res.render('edit_topic', {
                        topic: topic,
                        topicName: topic.name,
                        topicAbstract: topic.abstract,
                        topicDefinition: topic.definition,

                        myMainTopic: topic.relevantMainTopics[0],
                        mySubTopic: topic.relevantSubTopics[0],
                        myKeyword: topic.relevantKeywords[0],

                        mainTopicSira: mainTopicSira,
                        subTopicSira: subTopicSira,
                        keywordSira: keywordSira,

                        mainTopics: mainTopics,
                        subTopics: subTopics,
                        keywords: keywords,

                        roles: req.user.role,
                        userRole: userRole
                    });
                });
            });
        });
    });
});

router.post('/editTopic/:topicId', ensureAuthentication, function (req, res, next) {
    var topicId = req.params.topicId;

    var topicName = req.body.topicName;
    var topicAbstract = req.body.topicAbstract;
    var topicDefinition = req.body.topicDefinition;
    var currentUser = req.user;

    req.checkBody('topicAbstract', 'Özet alanı boş olamaz.').notEmpty();
    req.checkBody('topicDefinition', 'Tanım alanı boş olamaz').notEmpty();

    var errors = req.validationErrors();
    if (!errors) {

        Topic.findById(topicId, function (err, topic) {
            if (err) throw err;

            topic.abstract = topicAbstract;
            topic.definition = topicDefinition;

            topic.save(function (err) {
                if (err) throw err;
                res.redirect('/topic/myDrafts');
            });
        });

    } else {
        console.log("hata burda");
        res.render('edit_topic', {
            user : currentUser,
            errors: errors,
            topicName: topicName,
            topicAbstract: topicAbstract,
            topicDefinition: topicDefinition
        })
    }

});

router.post('/approveByEditor/:topicId', ensureAuthentication, function (req, res, next) {
    var topicId = req.params.topicId;
    console.log("Topic ID" + topicId);
    Topic.findById(topicId, function (err, topic) {
        if (err) throw err;
        User.find({}, function (err, users) {
            if (err) throw err;
            if (topic.followers) {
                topic.followers.forEach(function (follower) {
                    var useremail;
                    for (var i = 0; i < users.length; i++) {
                        if ((users[i]._id).toString() === follower.toString())
                            useremail = users[i].email;
                    }

                    var smtpTransport = nodemailer.createTransport("SMTP", {
                        service: "Gmail",
                        auth: {
                            user: "kavramtakip@gmail.com",
                            pass: "kavram123"
                        }
                    });
                    var newurl = "http://localhost:3000/topic/getTopic/" + topic._id;
                    var mailOptions = {
                        from: "Kavram Takip Sistemi ✔ <kavramtakip@gmail.com>", // sender address
                        to: useremail, // list of receivers
                        subject: "Kavram Güncellemesi", // Subject line
                        html: "<b>Aşağıdaki kavramda güncelleme olmuştur. Linke tıklayarak kavramın yeni halini görüntüleyebilirsiniz.</b><br><br><a href=" + newurl + ">Kavrama git</a>"// html body

                    };

                    smtpTransport.sendMail(mailOptions, function (error, response) {
                        if (error) {
                            console.log("EMAIl HATSAU");
                            console.log(error);
                        } else {
                            console.log("Message sent: " + response.message);
                        }

                        // if you don't want to use this transport object anymore, uncomment following line
                        //smtpTransport.close(); // shut down the connection pool, no more messages
                    });
                });
                topic.allowStatus = {stage: 1, status: true};
                topic.save(function (err) {
                    if (err) throw err;
                    console.log("Onaylandı" + err);
                    req.flash('success', "Başarıyla onaylandı");
                    res.redirect('/user/editorProfile');
                });
            }
            else {
                topic.allowStatus = {stage: 1, status: true};
                topic.save(function (err) {
                    if (err) throw err;
                    console.log("Onaylandı" + err);
                    req.flash('success', "Başarıyla onaylandı");
                    res.redirect('/user/editorProfile');
                });
            }
        });
    });
});

router.get('/getTopic/:topicId', function (req, res, next) {
    var topicId = req.params.topicId;
    if (req.user) {
        var currentUser = req.user;
        var followControl = false;
        var userRole = userRoleControl(req.user);

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
                for (var k = 1; k < 4; k++) {
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

        Topic.findById(topicId, function (err, topic) {
            if (err) throw err;
            topic.followers.forEach(function (follower) {
                if (follower.toString() == (currentUser._id).toString()) {
                    followControl = true;
                }
            });
            topic.viewCount++;
            topic.save(function (err) {
                if (err) throw err;
            });

            var newPopTopics = [];
            var isAuthor = false;
            MainTopic.findById(topic.relevantMainTopics[0], function (err, mainTopic) {
                if (err) throw err;
                SubTopic.findById(topic.relevantSubTopics[0], function (err, subTopic) {
                    if (err) throw err;
                    Keyword.findById(topic.relevantKeywords[0], function (err, keyword) {
                        if (err) throw err;
                        User.findById(topic.author, function (err, user) {
                            if (err) throw err;
                            if ((user._id).toString() === (currentUser._id).toString())
                                isAuthor = true;
                            var userName = user.username;
                            MainTopic.find({}, function (err, mainTopics) {
                                if (err) throw err;
                                Topic.find({}, null, {sort: {viewCount: -1}}, function (err, toppics) {
                                    for (var i = 0; i < 5; i++) {
                                        newPopTopics.push(toppics[i]);
                                    }
                                    Topic.find({}, function (err, topics) {
                                        if (err) throw (err);
                                        res.render('show_topic', {
                                            topic: topic,
                                            userName: userName,
                                            userRole: userRole,
                                            mainTopics: mainTopics,
                                            populerTopics: newPopTopics,
                                            screenMainTopic: mainTopic,
                                            screenSubTopic: subTopic,
                                            screenKeyword: keyword,
                                            followerControl: followControl,
                                            roles: currentUser.role,
                                            topics: topics,
                                            onerilenTopicler: onereceklerimiz,
                                            isAuthor: isAuthor
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    else {
        Topic.findById(topicId, function (err, topic) {
            if (err) throw err;
            topic.viewCount++;
            topic.save(function (err) {
                if (err) throw err;
            });
            MainTopic.find({}, function (err, mainTopics) {
                if (err) throw err;
                res.render('show_topic', {
                    topic: topic,
                    mainTopics: mainTopics
                });
            });
        });
    }
    
    
});

router.get('/onApprove', ensureAuthentication, function (req, res, next) {
    var currentUser = req.user;
    var onApprovedTopics = [];
    var userRole = userRoleControl(req.user);
    var query = {author: currentUser._id, allowStatus: {stage: 0, status: false,}};
    Topic.find(query, function (err, topics) {
        if (err) throw err;
        console.log("buldu");
        topics.forEach(function (topic) {
            onApprovedTopics.push(topic);
            console.log(topic.name);
        });
        res.render('onArrovedTopic', {
            onApprovedTopics: onApprovedTopics,
            roles: req.user.role,
            userRole: userRole
        });
    });
});

router.get('/myRejectedTopics', ensureAuthentication, function (req, res, next) {
    var currentUser = req.user;
    var userRole = userRoleControl(req.user);
    var query = {author: currentUser._id, allowStatus: {stage: -1, status: false}};
    Topic.find(query, function (err, topics) {
        if (err) throw err;
        res.render('rejectedTopics', {
            rejectedTopics: topics,
            roles: req.user.role,
            userRole: userRole
        });
    });
});

router.get('/myDrafts', ensureAuthentication, function (req, res, next) {
    var currentUser = req.user;
    var userRole = userRoleControl(req.user);
    var query = {author: currentUser._id, isDraft: true};
    Topic.find(query, function (err, topics) {
        if (err) throw err;
        res.render('onDraftTopics', {
            myDraftTopics: topics,
            roles: req.user.role,
            userRole: userRole
        });
    });
});

router.get('/myTopics', ensureAuthentication, function (req, res, next) {
    var currentUser = req.user;
    var userRole = userRoleControl(req.user);
    var query = {
        author: currentUser._id,
        isDraft: false,
        allowStatus: {stage: 1, status: true}
    };
    Topic.find(query, function (err, topics) {
        if (err) throw err;
        res.render('myTopics', {
            myTopics: topics,
            roles: req.user.role,
            userRole: userRole
        });
    });

});

router.post('/sendApprove/:topicId', ensureAuthentication, function (req, res, next) {
    var topicId = req.params.topicId;
    var topicAbstract = req.body.topicAbstract;
    var topicDefinition = req.body.topicDefinition;
    var currentUser = req.user;

    req.checkBody('topicAbstract', 'Özet alanı boş olamaz.').notEmpty();
    req.checkBody('topicDefinition', 'Tanım alanı boş olamaz').notEmpty();

    var errors = req.validationErrors();

    if (!errors) {
        Topic.findById(topicId, function (err, topic) {
            if (err) throw err;

            topic.definition = topicDefinition;
            topic.abstract = topicAbstract;
            topic.allowStatus = {stage: 0, status: false};
            topic.reason = null;
            topic.isDraft = false;

            topic.save(function (err) {
                if (err) throw err;
                req.flash('success', "Eklediğiniz Kavram sistemimize eklenmiştir, onaylandıktan sonra sistemde görünecektir !");
                res.redirect('/');
            });
        });

    } else {
        var myMainTopics = [];
        var mySubTopics = [];
        var myKeywords = [];
        var newPopTopics = [];
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

                Keyword.find({}, function (err, keywords) {
                    if (err) throw err;
                    keywords.forEach(function (keyword) {
                        myKeywords.push(keyword);
                    });
                    var kavramlar = [];
                    Topic.find({}, null, {sort: {viewCount: -1}}, function (err, toppics) {
                        for (var i = 0; i < 5; i++) {
                            newPopTopicsPopTopics.push(toppics[i]);
                        }
                        Topic.find({}, function (err, kavramar) {
                            if (err) throw (err);
                            kavramlar = kavramar;
                            res.render('addTopic', {
                                errors: errors,
                                mainTopics: myMainTopics,
                                subTopics: mySubTopics,
                                keywords: myKeywords,
                                populerTopics: newPopTopics,
                                topicName: topicName,
                                topicAbstract: topicAbstract,
                                topicDefinition: topicDefinition,
                                topics: kavramlar
                            });
                        });
                    });
                });
            });
        });
    }
});

router.post('/findTopic', function (req, res, next) {
    if (req.user) {
        var currentUser = req.user;
        var kavramAdi = req.body.kavramAdi;
        console.log(kavramAdi);
        var query = {name: kavramAdi};
        var followControl = false;
        var userRole = userRoleControl(req.user);

        var n;
        var m;
        var matrix;
        var yer;
        var onereceklerimiz = [];

        Topic.find(query, function (err, topics) {
            if (err) throw err;
            console.log(topics);
            var topic = topics[0];
            topic.followers.forEach(function (follower) {
                if (follower.toString() == (currentUser._id).toString()) {
                    followControl = true;
                }
            });
            topic.viewCount++;
            topic.save(function (err) {
                if (err) throw err;
            });
            var newPopTopics = [];
            MainTopic.findById(topic.relevantMainTopics[0], function (err, mainTopic) {
                if (err) throw err;
                SubTopic.findById(topic.relevantSubTopics[0], function (err, subTopic) {
                    if (err) throw err;
                    Keyword.findById(topic.relevantKeywords[0], function (err, keyword) {
                        if (err) throw err;
                        User.findById(topic.author, function (err, user) {
                            if (err) throw err;
                            var userName = user.username;
                            MainTopic.find({}, function (err, mainTopics) {
                                if (err) throw err;
                                Topic.find({}, null, {sort: {viewCount: -1}}, function (err, toppics) {
                                    if (err) throw err;
                                    for (var i = 0; i < 5; i++) {
                                        newPopTopics.push(toppics[i]);
                                    }
                                    Topic.find({}, function (err, topics) {
                                        if (err) throw err;


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
                                                res.render('show_topic', {
                                                    topic: topic,
                                                    userName: userName,
                                                    userRole: userRole,
                                                    mainTopics: mainTopics,
                                                    populerTopics: newPopTopics,
                                                    screenMainTopic: mainTopic,
                                                    screenSubTopic: subTopic,
                                                    screenKeyword: keyword,
                                                    followerControl: followControl,
                                                    topics: topics,
                                                    user: currentUser,
                                                    roles: currentUser.role,
                                                    onerilenTopicler: onereceklerimiz
                                                });
                                            })
                                        });
                                    })
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    else {
        var kavramAdi = req.body.kavramAdi;
        var query = {name: kavramAdi};

        Topic.find(query, function (err, topics) {
            if (err) throw err;
            var topic = topics[0];
            topic.viewCount++;
            topic.save(function (err) {
                if (err) throw err;
            });
            MainTopic.find({}, function (err, mainTopics) {
                if (err) throw err;
                res.render('show_topic', {
                    topic: topic,
                    mainTopics: mainTopics
                });
            });
        });
    }
});

router.post('/search/:topicId', function (req, res, next) {
    Topic.findById(req.params.topicId, function (err, topic) {
        if (err) throw err;
        console.log(topic);
        res.send(topic);
    })
});

function ensureAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

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