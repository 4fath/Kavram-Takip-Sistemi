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

        // User.find({username : req.body.username}, function (err, user) {
        //    if (err) throw err;
        //     req.session.user = user;
        // });

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


router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    var usedId = req.user._id;
    User.findById(usedId, function (err, user) {
        if (err) throw err;
        console.log(user);
        res.send(user);
    });

});

router.get('/addChiefEditor', function (req, res, next) {

    User.find({}, function (err, users) {
        if (err) throw err;
        MainTopic.find({}, function (err, mainTopics) {
            res.render('addChiefEditor', {
                users: users,
                mainTopics: mainTopics
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

router.get('/addMainTopic', function (req, res, next) {
    res.render('addMainTopic');
});

router.post('/addMainTopic', function (req, res, next) {

    var name = req.body.mainTopicName;
    var definition = req.body.definition;

    req.checkBody('mainTopicName', 'isim bos olamaz').notEmpty();
    req.checkBody('definition', 'isim bos olamaz').notEmpty();

    var errors = req.validationErrors();

    if (!errors) {
        var newMainTopic = new MainTopic({
            name: name,
            definition: definition
        });

        newMainTopic.save(function (err) {
            if (err) throw err;
            console.log("kayit bsarili");
            res.send("ok");
        })

    } else {
        res.render('addMainTopic', {
            errors: errors,
            name: name,
            definition: definition
        })
    }


});

router.get('/addSubTopic', function (req, res, next) {
    res.render('addSubTopic');
});

router.post('/addSubTopic/:mainTopicId', function (req, res, next) {
    var name = req.body.subTopicName;
    var definition = req.body.subTopicDefinition;
    var mainTopicId = req.params.mainTopicId;

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
                    mainTopics: mainTopic
                });

                newSubTopic.save(function (err) {
                    if (err) throw err;
                    console.log("Sub topic kaydedildi");
                    res.send("ok");
                });
            }
        })
    }
});

router.post('/addEditor/:userID/:subTopicID', function (req, res, next) {

});

router.get('/addEditor', function (req, res, next) {
    res.render('addEditor');
});


module.exports = router;
