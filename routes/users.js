var express = require('express');
var async = require('async');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/User');
var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Topic = require('../models/Topic');
var Comment = require('../models/Comment');

/* GET users listing. */
router.get('/', function (req, res) {
    res.redirect('/user/addTopic');
});

// === REGİSTER ==== //

router.get('/register', function (req, res) {

    var myMainTopics = [];
    var mySubTopics = [];

    async.parallel([
        function (callback) {
            MainTopic.find({}, function (err, mainTopics) {
                if (err) return callback(err);
                mainTopics.forEach(function (mainTopic) {
                    myMainTopics.push(mainTopic);
                });
                callback();
            });
        },
        function (callback) {
            SubTopic.find({}, function (err, subTopics) {
                if (err) return callback(err);
                subTopics.forEach(function (subTopic) {
                    mySubTopics.push(subTopic);
                });
                callback();
            });
        }
    ], function (err) {

        if (err) return (err);
        res.render('signup', {

        });

    });




    if (req.session.user) {
        console.log("zaten kayit olundu");
        res.location('/');
        res.redirect('/');
    } else {
        res.render('signup');
        console.log("register'a girdi.");
    }
});

router.post('/register', function (req, res) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var passwordConfirm = req.body.passwordConfirm;

    // form validation
    req.checkBody('firstName', 'isim bos olamaz').notEmpty();
    req.checkBody('lastName', 'isim bos olamaz').notEmpty();
    req.checkBody('email', '').isEmail();
    req.checkBody('email', '').notEmpty();
    req.checkBody('username', 'kullanici adi bos olamaz').notEmpty();
    req.checkBody('password', 'bu alan da gerekli').notEmpty();
    req.checkBody('passwordConfirm', 'iki passpord da uyusmali').equals(req.body.password);

    // check errors
    var errors = req.validationErrors();
    if (errors) {
        res.render('signup', {
            errors: errors,
            firstName: firstName,
            lastName: lastName,
            email: email,
            username: username,
            password: password,
            passwordConfirm: passwordConfirm
        });
    } else {
        var newUser = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            username: username,
            password: password
        });

        User.createUser(newUser, function (err, user) {
            if (err) throw err;
            console.log(user);
        });

        req.flash('success', "Başarılı bir şekilde kayıt oldunuz !");
        res.location('/');
        res.redirect('/');
    }

});

// === LOGİN ==== //
router.get('/login', function (req, res) {
    if (req.session.user) {
        console.log("zaten giris yapmissin ! ");
        res.location('/');
        res.redirect('/');
    } else {
        res.render('signin');
        console.log("logine girdi");
    }

});

router.get('/logout', function (req, res) {
    req.logout();
    req.flash("success", "Yine Bekleriz .. ");
    res.redirect('/');
});

router.post('/login', passport.authenticate('local', {
        failureRedirect: '/user/login',
        failureFlash: 'Kullanıcı adı ve şifrenizi kotrol edip tekrar deneyiniz'
    }),
    function (req, res) {
        console.log('auth success');
        console.log(req.user);
        req.flash('success', 'Hoşgeldin '+req.user.firstName);
        res.location('/');
        res.redirect('/');
    });

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                console.log('Bu username ile bağlantılı kullanıcı yoktur.');
                return done(null, false, {message: 'Kullanıcı adınız ve şifrenizi kontrol ediniz.'});
            }
            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    console.log('Kullanıcı şifreyi yanlış girdi.');
                    return done(null, false, {message: 'Kullanıcı adını ve şifrenizi kontrol ediniz.'});
                }
            })
        })
    }
));

router.get('/adminProfile', ensureAuthentication, function (req, res, next) {
    
    console.log("buraya girdi");
    console.log(req.user.role);
    if (req.user.role == 'admin') {
        var myMainTopics, mySubTopics, myTopics, myComments;
        var myUsers = [];
        var myAuthors = [];
        var myEditors = [];
        var myChiefEditors = [];

        async.parallel([
            function (callback) {
                MainTopic.find({}, function (err, mainTopics) {
                    if (err) return callback(err);
                    // console.log("MainTopicler : "+mainTopics);
                    // console.log("============");
                    myMainTopics = mainTopics;
                });
                callback();
            },
            function (callback) {
                SubTopic.find({}, function (err, subTopics) {
                    if (err) return callback(err);
                    // console.log("SubTopicler : "+subTopics);
                    // console.log("============");
                    mySubTopics = subTopics
                });
                callback();
            },
            function (callback) {
                Topic.find({}, function (err, topics) {
                    if (err) return callback(err);
                    // console.log("Topicler : "+topics);
                    // console.log("============");
                    myTopics = topics;
                });
                callback();
            },
            function (callback) {
                User.find({}, function (err, users) {
                    if (err) return callback(err);
                    users.forEach(function (user) {
                        if (user.role === 'author') {
                            myAuthors.push(user);
                            myUsers.push(user);
                        } else if (user.role == 'editor') {
                            myEditors.push(user);
                            myUsers.push(user);
                        } else if (user.role == 'chiefEditor') {
                            myChiefEditors.push(user);
                            myUsers.push(user);
                        }
                    });

                    console.log("Authors : " + myAuthors);
                    console.log("Editors : " + myEditors);
                    console.log("ChiefEditor : " + myChiefEditors);


                    // console.log("Userlar : "+users);
                    // console.log("============");
                });
                callback();
            }
        ], function (err) {
            if (err) return (err);
            console.log(err);
            console.log("sonuclandi");
            res.render('admin', {
                myMainTopics: myMainTopics,
                mySubTopics: mySubTopics,
                myTopics: myTopics,
                myComments: myComments,
                myUsers: myUsers,
                myAuthors: myAuthors,
                myEditors: myEditors,
                myChiefEditors: myChiefEditors
            });
        });

    } else {
        res.render('not_found');
    }
    
    
});


// TODO : NOT tested
router.get('/chiefEditorProfile', ensureAuthentication, function (req, res, next) {
    
    var userId = req.user._id;
    var myMainTopics = [];
    var myTopics = [];
    var myTopicAsDraft = [];
    var myWholeSystemSubTopic = [];
    var myWaitingAllowSubTopics = [];
    
    res.render('chiefEditorProfile');
    
    
    // async.parallel([
    //     function(callback){
    //         var query = {chiefEditor : userId};
    //         MainTopic.find(query, function (err, mainTopics) {
    //            if (err) return callback(err);
    //             myMainTopics = mainTopics;
    //             // mainTopics.forEach(function (mainTopic) {
    //             //     myMainTopics.push(mainTopic);
    //             // });
    //         });
    //         callback();
    //     },
    //     function (callback) {
    //         var query = {author: userId};
    //         Topic.find(query, function (err, topics) {
    //             if (err) return callback(err);
    //             topics.forEach(function (topic) {
    //                 if (topic.idDraft) {
    //                     myTopicAsDraft.push(topic);
    //                 } else {
    //                     myTopics.push(topic);
    //                 }
    //             });
    //             callback();
    //         })
    //     },
    //     function (callback) {
    //         if (err) return callback(err);
    //         SubTopic.find({}, function (err, topics) {
    //             if (err) return callback(err);
    //             topics.forEach(function (topic) {
    //                 myWholeSystemSubTopic.push(topic);
    //             });
    //             callback();
    //         })
    //     }
    //    
    // ], function (err) {
    //     if (err) return (err);
    //
    //     myWholeSystemSubTopic.forEach(function (subTopic) {
    //         if (!subTopic.allowStatus) {
    //             myMainTopics.forEach(function (mainTopic) {
    //                 if (subTopic.relevantSubTopics[0] == mainTopic._id) {
    //                     myWaitingAllowSubTopics.push(subTopic);
    //                 }
    //             });
    //         }
    //     });
    //
    //     res.render('chiefEditorProfile', {
    //         currentUser: currentUser,
    //         myTopics: myTopics,
    //         myTopicsAsDraft: myTopicAsDraft,
    //         myMainTopics: myMainTopics,
    //         myWaitingAllowRequests: myWaitingAllowSubTopics
    //     });
    //    
    // });
    
});

// TODO : NOT tested
router.get('/editorProfile', ensureAuthentication, function (req, res, next) {
    var userId = req.user._id;
    var currentEditorUser = {};
    var mySubTopics = [];
    var myTopics = [];
    var myTopicAsDraft = [];
    var myWholeSystemTopic = [];
    var myWaitingAllowTopics = [];

    async.parallel([
        function (callback) {
            User.findById(userId, function (err, user) {
                if (err) return callback(err);
                currentEditorUser = user;
            });
            callback();
        },
        function (callback) {
            var query = {editor: userId};
            SubTopic.find(query, function (err, subTopics) {
                if (err) return callback(err);
                subTopics.forEach(function (subTopic) {
                    mySubTopics.push(subTopic);
                });
                callback();
            })
        },
        function (callback) {
            var query = {author: userId};
            Topic.find(query, function (err, topics) {
                if (err) return callback(err);
                topics.forEach(function (topic) {
                    if (topic.idDraft) {
                        myTopicAsDraft.push(topic);
                    } else {
                        myTopics.push(topic);
                    }
                });
                callback();
            })
        },
        function (callback) {
            Topic.find({}, function (err, topics) {
                if (err) return callback(err);
                topics.forEach(function (topic) {
                    myWholeSystemTopic.push(topic);
                });
                callback();
            })
        }
    ], function (err) {
        if (err) return (err);
        myWholeSystemTopic.forEach(function (topic) {
            if (!topic.allowStatus) {
                mySubTopics.forEach(function (subTopic) {
                    if (topic.relevantSubTopics[0] == subTopic._id) {
                        myWaitingAllowTopics.push(topic);
                    }
                });
            }
        });


        // editor profilinde , kendi üzerine atanmış subTopiclerin altına ayzılan onaylanmamış topicler gelecek

        res.render('editor_profile', {
            myTopics: myTopics,
            myTopicsAsDraft: myTopicAsDraft,
            mySubTopics: mySubTopics,
            myWaitingAllowRequests: myWaitingAllowTopics
        });
    });
});

router.get('/authorProfile', function (req, res, next) {
    console.log('authorProfile girdi');
    var userId = req.user._id;
    var displayUser = {};
    var displayTopics = [];

    async.parallel([
        function (callback) {
            User.findById(userId, function (err, user) {
                if (err) return callback(err);
                displayUser = user;
            });
            callback();
        },

        function (callback) {
            var query = {author : userId};
            Topic.find(query, function (err, topics) {
                if (err) return callback(err);
                topics.forEach(function (topic) {
                    displayTopics.push(topic);
                });
            });
            callback();
        }

    ], function (err) {
        if (err) return (err);
        res.render('user_profile',{
            userRole : displayUser.role,
            userFirstName : displayUser.firstName,
            userSecondName : displayUser.lastName,
            username : displayUser.username,
            topics : displayTopics
        })
    });
});


router.get('/editor/getOnay', ensureAuthentication, function (req, res, next) {
    
    var user = req.user;
    if ( user.role != 'editor'){
        res.redirect('/');
    }
    var userID = user._id;
    
    var query = {editor : userID};

    SubTopic.find(query, function (err, subTopics) {
        if (err) throw err;
        console.log("bulunan sub topicler "+ subTopics);
        var currentSubTopic = subTopics[0];
        var subTopicID = currentSubTopic._id;
        console.log(subTopicID);
        
        Topic.find({}, function (err, topics) {
            if (err) throw err;
            var onayBekleyenTopicler = [];


            topics.forEach(function (subTop) {
                console.log("=========");
                console.log(subTop.relevantSubTopics[0]);

            });
            topics.forEach(function (topic) {
               if (!topic.allowStatus ){
                   console.log("caca");
                   if (subTopicID.toString() === String(topic.relevantSubTopics[0])){
                       console.log("uygun bulundu");
                       onayBekleyenTopicler.push(topic);

                   }
               }
            });

            // console.log(onayBekleyenTopicler);
            // if (onayBekleyenTopicler[0] == subTopicID){
            //     console.log(true);
            // }else {
            //     console.log(false);
            // }
            res.render('onaydakiTopicler', {
                onayBekleyenler : onayBekleyenTopicler
            })
            
        })
    })
    
});
router.post('/follow/:topicId', function (req, res) {
    console.log("hata burada");
    var currentUser = req.user;
    var clickedId = req.params.topicId;
    console.log("hata burada1");
    var errors = req.validationErrors();
    if (!errors) {

//noinspection JSUnresolvedFunction
        User.findById(currentUser._id, function (err, user) {
            if (err) throw err;
            user.followingTopics.push(clickedId);
            console.log("hata burada2");
            user.save(function (err) {
                if (err) throw err;

//noinspection JSUnresolvedFunction
                Topic.findById(clickedId, function (err, topic) {
                    if (err) throw err;
                    console.log("hata burada3");
                    topic.followers.push(currentUser._id);
                    topic.save(function (err) {
                        if (err) throw err;
                        console.log("takip islemi başarılı");
                        req.flash('success',"Takip Listenize eklendi");
                        res.redirect('/');
                    })
                })
            })
        });

    }
});

router.get('/following_list/:userId', function (req, res, next) {
    //var bos = req.user._id;
    var topicList = [];
    var takipEdilenler = [];
    var userId = req.params.userId;
    console.log(userId);

    User.findById(userId, function (err, user) {
        if (err) throw (err);
        console.log("Buraya gelebildik");
        console.log(user);

        user.followingTopics.forEach(function (following) {
            takipEdilenler.push(following);
        });
        var i = 0;
        takipEdilenler.forEach(function (topicId) {
            Topic.findById(topicId, function (err, topic) {
                if (err) throw(err);
                topicList.push(topic);
                console.log(topic);
                i++;
                if (i == takipEdilenler.length){
                    res.render('following_topics',{
                        takipEdilenlerTopicler : topicList
                    });
                }
            });
        });
        console.log(topicList);


    });

});

function ensureAuthentication(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

module.exports = router;
