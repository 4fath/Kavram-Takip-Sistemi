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

//noinspection JSUnresolvedFunction
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

//noinspection JSUnresolvedFunction
passport.serializeUser(function (user, done) {
    done(null, user.id);
});


//noinspection JSUnresolvedFunction
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
                console.log('boyle bisey yokmus');
                return done(null, false, {message: 'bilinmeyen user cred'});
            }
            User.comparePassword(password, user.password, function (err, isMacth) {
                if (err) throw err;
                if (isMacth) {
                    return done(null, user);
                } else {
                    console.log('yanlis girmssin abi');
                    return done(null, false, {message: 'password yanlis'});
                }
            })
        })
    }
));

router.get('/addChiefEditor', function (req, res) {

    //noinspection JSUnresolvedFunction
    User.find({}, function (err, users) {
        if (err) throw err;
        var userArray = [];
        users.forEach(function (user) {
            userArray.push(user);
        });
        //noinspection JSUnresolvedFunction
        MainTopic.find({}, function (err, mainTopics) {
            if (err) throw err;
            var topicArray = [];
            mainTopics.forEach(function (mainTopic) {
                if (!mainTopic.hasChief) {
                    topicArray.push(mainTopic);
                }
            });
            res.render('addChiefEditor', {
                users: userArray,
                mainTopics: topicArray
            });
        });
    });

});


router.get('/editorProfile', function (req, res, next) {
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
            if (err) return callback(err);
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
            if (!topic.allowStatus ) {
                mySubTopics.forEach(function (subTopic) {
                    if (topic.relevantSubTopics[0] == subTopic._id) {
                        myWaitingAllowTopics.push(topic);
                    }
                });
            }
        });

        res.render('editorProfile', {
            currentUser: currentUser,
            myTopics: myTopics,
            myTopicsAsDraft: myTopicAsDraft,
            mySubTopics: mySubTopics,
            myWaitingAllowRequests: myWaitingAllowTopics
        });

    });

});

router.get('/addTopic',ensureAuthentication, function (req, res) {
    // var topicName = req.body.topicName;
    // var topicDefinition = req.body.topicDefinition;
    // var currentUser = req.user;


//noinspection JSUnresolvedFunction
    MainTopic.find({}, function (err, mainTopics) {
        if (err) throw err;

//noinspection JSUnresolvedFunction
        SubTopic.find({}, function (err, subTopics) {
            if (err) throw err;
            res.render('addTopic', {
                mainTopics: mainTopics,
                subTopics: subTopics
            })
        })
    })
});


router.post('/addTopic',ensureAuthentication, function (req, res) {
    var selectedMainTopic = req.body.myMainTopic;
    var selectedSubTopic = req.body.mySubTopic;

    var topicName = req.body.topicName;
    var topicDefinition = req.body.topicDefinition;
    var currentUser = req.user;

//noinspection JSUnresolvedFunction
    req.checkBody('topicName', 'isim bos olamaz').notEmpty();

//noinspection JSUnresolvedFunction
    req.checkBody('topicDefinition', 'isim bos olamaz').notEmpty();


    var errors = req.validationErrors();

    if (!errors) {

//noinspection JSUnresolvedFunction
        MainTopic.findById(selectedMainTopic, function (err, mainTopic) {
            if (err) throw err;

//noinspection JSUnresolvedFunction
            SubTopic.findById(selectedSubTopic, function (err, subTopic) {
                if (err) throw err;
                var newTopic = new Topic({
                    name: topicName,
                    definition: topicDefinition,
                    author: currentUser,
                    relevantMainTopics: [mainTopic],
                    relevantSubTopics: [subTopic]
                });

                newTopic.save(function (err) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    console.log('topic eklenmis oldu');
                    res.redirect('/addTopic');
                });

            })
        });

    } else {
        res.render('addTopic');
    }

});


// DONE
router.get('/addSubTopic',ensureAuthentication, function (req, res) {

//noinspection JSUnresolvedFunction
    MainTopic.find({}, function (err, mainTopics) {
        res.render('addSubTopic', {
            mainTopics: mainTopics
        });
    });
});

// DONE
router.post('/addSubTopic',ensureAuthentication, function (req, res) {
    var name = req.body.subTopicName;
    var definition = req.body.subTopicDefinition;
    var mainTopicId = req.body.mainTopicId;
    var currentUser = req.user || {name: 'jane doe', age: 22};

//noinspection JSUnresolvedFunction
    req.checkBody('subTopicName', "Bu kısım bos olamaz").notEmpty();

//noinspection JSUnresolvedFunction
    req.checkBody('subTopicDefinition', "Bu kısım bos olamaz").notEmpty();

    var errors = req.validationErrors();
    if (!errors) {

//noinspection JSUnresolvedFunction
        MainTopic.findById(mainTopicId, function (err, mainTopic) {
            if (err) {
                throw err;
            } else {
                var newSubTopic = new SubTopic({
                    name: name,
                    definition: definition,
                    mainTopics: mainTopic,
                    editor: currentUser
                });

                newSubTopic.save(function (err) {
                    if (err) throw err;
                    console.log("Sub topic kaydedildi");

                    res.redirect('/users/addSubTopic');
                });
            }
        })
    } else {
        res.render('addSubTopic');
    }
});


router.post('/addEditor/:userID/:subTopicID', function (req, res, next) {

});

router.get('/addEditor',ensureAuthentication, function (req, res) {
    res.render('addEditor');
});


router.post('/follow/:topicId', function (req, res) {
    var currentUser = req.user;
    var clickedId = req.params.topicId;

    var errors = req.validationErrors();
    if (!errors) {

//noinspection JSUnresolvedFunction
        User.findById(currentUser._id, function (err, user) {
            if (err) throw err;
            user.followingTopics.push(clickedId);
            user.save(function (err) {
                if (err) throw err;

//noinspection JSUnresolvedFunction
                Topic.findById(clickedId, function (err, topic) {
                    if (err) throw err;
                    topic.followers.push(currentUser._id);
                    topic.save(function (err) {
                        if (err) throw err;
                        console.log("takip islemi başarılı");
                    })
                })
            })
        });

    } else {

    }

});



function ensureAuthentication(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

module.exports = router;
