var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/User');
var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Topic = require('../models/Topic');
var Comment = require('../models/Comment');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

// === REGİSTER ==== //

router.get('/register', function (req, res, next) {
    if (req.session.user) {
        console.log("zaten kayit olundu");
        res.location('/');
        res.redirect('/');
    } else {
        res.render('signup');
        console.log("register'a girdi.");
    }
});

router.post('/register', function (req, res, next) {
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

        req.flash('success', "Oldu lan");
        res.location('/');
        res.redirect('/');
    }

});

// === LOGİN ==== //
router.get('/login', function (req, res, next) {
    if (req.session.user) {
        console.log("zaten giris yapmissin ! ");
        res.location('/');
        res.redirect('/');
    } else {
        res.render('signin');
        console.log("logine girdi");
    }

});

router.get('/logout', function (req, res, next) {
    req.logout();
    req.flash("success", "Succesfull logout");
    res.redirect('/');
});

router.post('/login', passport.authenticate('local', {
        failureRedirect: '/',
        failureFlash: 'There is something wrong on auth  '
    }),
    function (req, res) {
        console.log('auth success');
        console.log(req.user);
        req.flash('success', 'Başarılı bir şekilde kayıt işlemi gerçekleşti ');
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

router.get('/testRouter/:id', function (req, res, next) {
    var userId = req.params.id;
    User.findById(userId, function (err, user) {
        if (err) throw  err;

        if (user.roles == 'author') {

            req.user = user;
            req.userRole = user.roles;
            //
            // console.log(req.user);
            //
            // console.log(req.userRole);

            req.session.user = user;

            res.send('bu bir author');

        } else {
            res.send('bu author degil')
        }
    })
});

router.get('/testRouter1', function (req, res, next) {
    var user = req.session.user;
    console.log(user);
    res.send(user);
});

router.get('/addChiefEditor', function (req, res, next) {

    User.find({}, function (err, users) {
        if (err) throw err;
        var userArray = [];
        users.forEach(function (user) {
            // TODO : add a condition which will be selected
            userArray.push(user);
        });
        MainTopic.find({}, function (err, mainTopics) {
            if (err) throw err;
            var topicArray = [];
            mainTopics.forEach(function (mainTopic) {
                if (!mainTopic.hasChief){
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

router.post('/addChiefEditor/:userID/:mainTopicID', function (req, res, next) {

    var userId = req.params.userID;
    var mainTopicId = req.params.mainTopicID;

    User.findById(userId, function (err, user) {
        if (err) {
            throw err;
        } else {
            MainTopic.findById(mainTopicId, function (err, mainTopic) {
                if (err) {
                    throw err;
                } else {
                    user.roles = 'chiefEditor';
                    user.isChiefEditor = true;
                    user.mainTopic = mainTopic;
                    mainTopic.chiefEditor = user;

                    mainTopic.save(function (err) {
                        if (err) {
                            throw err;
                        } else {
                            user.save(function (err) {
                                if (err) throw err;
                                res.send("ok");
                            });
                        }
                    })
                }
            });
        }
    });
});


router.get('/addTopic', function (req, res, next) {
    // var topicName = req.body.topicName;
    // var topicDefinition = req.body.topicDefinition;
    // var currentUser = req.user;
    
    MainTopic.find({}, function (err, mainTopics) {
        if (err) throw err;
        SubTopic.find({}, function (err, subTopics) {
            if (err) throw err;
            res.render('addTopic', {
                mainTopics :  mainTopics,
                subTopics : subTopics
            })
        })
    })
});


router.post('/addTopic', function (req, res, next) {
    var selectedMainTopic = req.body.myMainTopic;
    var selectedSubTopic = req.body.mySubTopic;
    
    var topicName = req.body.topicName;
    var topicDefinition = req.body.topicDefinition;
    var currentUser = req.user;

    req.checkBody('topicName', 'isim bos olamaz').notEmpty();
    req.checkBody('topicDefinition', 'isim bos olamaz').notEmpty();


    var errors = req.validationErrors();
    
    if (!errors){

        MainTopic.findById(selectedMainTopic, function (err, mainTopic) {
            if (err) throw err;
            SubTopic.findById(selectedSubTopic, function (err, subTopic) {
                if (err) throw err;
                var newTopic = new Topic({
                    name : topicName,
                    definition : topicDefinition,
                    author : currentUser,
                    relevantMainTopics : [mainTopic],
                    relevantSubTopics : [subTopic]
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

    }else {
        res.render('addTopic');
    }
    
});

// DONE
router.get('/addMainTopic', function (req, res, next) {
    res.render('addMainTopic');
});

// DONE
router.post('/addMainTopic', function (req, res, next) {
    var name = req.body.mainTopicName;
    var definition = req.body.mainTopicDefinition;
    
    req.checkBody('mainTopicName', 'isim bos olamaz').notEmpty();
    req.checkBody('mainTopicDefinition', 'isim bos olamaz').notEmpty();

    var errors = req.validationErrors();
    if (!errors) {
        var newMainTopic = new MainTopic({
            name: name,
            definition: definition
        });
        newMainTopic.save(function (err) {
            if (err) throw err;
            console.log("kayit bsarili");
            res.redirect('/users/addMainTopic');
        })
    } else {
        res.render('addMainTopic', {
            errors: errors,
            name: name,
            definition: definition
        })
    }
});

// DONE
router.get('/addSubTopic', function (req, res, next) {
    MainTopic.find({}, function (err, mainTopics) {
        res.render('addSubTopic', {
            mainTopics : mainTopics
        });
    });
});

// DONE
router.post('/addSubTopic', function (req, res, next) {
    var name = req.body.subTopicName;
    var definition = req.body.subTopicDefinition;
    var mainTopicId = req.body.mainTopicId;
    var currentUser = req.user || {name : 'jane doe', age : 22};

    req.checkBody('subTopicName', "Bu kısım bos olamaz").notEmpty();
    req.checkBody('subTopicDefinition', "Bu kısım bos olamaz").notEmpty();

    var errors = req.validationErrors();
    if (!errors) {
        MainTopic.findById(mainTopicId, function (err, mainTopic) {
            if (err) {
                throw err;
            } else {
                var newSubTopic = new SubTopic({
                    name: name,
                    definition: definition,
                    mainTopics: mainTopic,
                    editor : currentUser
                });

                newSubTopic.save(function (err) {
                    if (err) throw err;
                    console.log("Sub topic kaydedildi");

                    res.redirect('/users/addSubTopic');
                });
            }
        })
    }else {
        res.render('addSubTopic');
    }
});


router.post('/addEditor/:userID/:subTopicID', function (req, res, next) {

});

router.get('/addEditor', function (req, res, next) {
    res.render('addEditor');
});


router.post('/follow/:topicId', function (req, res, next) {
    var currentUser = req.user;
    var clickedId = req.params.topicId;

    var errors = req.validationErrors();
    if (!errors){
       User.findById(currentUser._id, function (err, user) {
           if (err) throw err;
           user.followingTopics.push(clickedId);
           user.save(function (err) {
               if (err) throw err;
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

    }else {

    }

});


module.exports = router;
