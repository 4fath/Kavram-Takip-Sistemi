var express = require('express');
var async = require('async');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/User');
var MainTopic = require('../models/MainTopic');
var SubTopic = require('../models/SubTopic');
var Keyword = require('../models/Keyword');
var Topic = require('../models/Topic');
var Comment = require('../models/Comment');

/* GET users listing. */
router.get('/', function (req, res) {
    res.redirect('/user/addTopic');
});

// === REGİSTER ==== //


// REGISTER GET //

router.get('/register', function (req, res) {

    var myMainTopics = [];
    var mySubTopics = [];
    var myKeywords = [];
    var myTopics = [];

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
        },
        function (callback) {
            Keyword.find({}, function (err, keywords) {
                if (err) return callback(err);
                keywords.forEach(function (keyword) {
                    myKeywords.push(keyword);
                });
                callback();
            });
        },
        function (callback) {
            Topic.find({}, function (err, topics) {
                if (err) return callback(err);
                topics.forEach(function (topic) {
                    myTopics.push(topic);
                });
                callback();
            });
        }
    ], function (err) {

        if (err) return (err);
        res.render('signup', {
            mainTopics: myMainTopics,
            subTopics: mySubTopics,
            keywords: myKeywords,
            topics: myTopics
        });
    });

    if (req.session.user) {
        console.log("zaten kayit olundu");
        res.location('/');
        res.redirect('/');
    } else {
        console.log("register'a girdi.");
    }
});

// REGISTER POST //
router.post('/register', function (req, res) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var passwordConfirm = req.body.passwordConfirm;
    var alanlar = req.body.alanlar;
    var interests = [];
    console.log(alanlar);

    // form validation
    req.checkBody('firstName', 'isim bos olamaz').notEmpty();
    req.checkBody('lastName', 'soyisim bos olamaz').notEmpty();
    req.checkBody('email', 'email uygun formatta değil').isEmail();
    req.checkBody('email', 'email boş olamaz').notEmpty();
    req.checkBody('username', 'kullanıcı adi bos olamaz').notEmpty();
    req.checkBody('password', 'şifre gerekli').notEmpty();
    req.checkBody('passwordConfirm', 'iki şifre de uyuşmalıdır').equals(req.body.password);
    req.checkBody('alanlar', 'En az bir tane ilgi alani seçilmelidir ').notEmpty();
    MainTopic.find({}, function (err, mainTopics) {
        if (err) throw err;
    // check errors
        var errors = req.validationErrors();
        if (errors) {
            Keyword.find({}, function (err, keywords) {
                res.render('signup', {
                    errors: errors,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    username: username,
                    password: password,
                    passwordConfirm: passwordConfirm,
                    mainTopics: mainTopics,
                    keywords: keywords
                });
            });

        } else {
            var i = 0;
            console.log(alanlar + "şu birrrrr");
            alanlar.forEach(function (field) {
                var asd = field.toString();

                console.log(field + "şu ikiiiiiii");
                Keyword.findById(field, function (err, keyword) {
                    if (err) throw err;
                    i++;
                    console.log(keyword.name + "naniiik");
                    interests.push(keyword._id);
                    console.log(i + "işte buuuuuuuuuuuuuuuuuuu");
                    // if((keyword.name).toLowerCase() == String(asd).trim().toLowerCase()){
                    //     console.log("girdiiiii");
                    //     interests.push(keyword._id);
                    // }
                    if (i == alanlar.length) {
                        console.log(interests + "şu dörttttt");
                        var newUser = new User({
                            firstName: firstName,
                            lastName: lastName,
                            email: email,
                            username: username,
                            password: password,
                            interests: interests,
                            role: ['author']
                        });

                        User.createUser(newUser, function (err, user) {
                            if (err) throw err;
                            console.log(user);
                        });

                        req.flash('success', "Başarılı bir şekilde kayıt oldunuz !");
                        res.location('/');
                        res.redirect('/')
                    }
                });
            });

        }
    });
});

// === LOGİN ==== //
router.get('/login', function (req, res) {
    if (req.session.user) {
        console.log("zaten giris yapmissin ! ");
        res.location('/');
        res.redirect('/');
    } else {
        var myMainTopics = [];
        MainTopic.find({}, function (err, mainTopics) {
            if (err) throw (err);
            mainTopics.forEach(function (mainTopic) {
                myMainTopics.push(mainTopic);
            });
            Topic.find({}, function (err, topics) {
                if (err) throw (err);
                res.render('signin', {
                    mainTopics: myMainTopics,
                    topics: topics
                });
            });

        });
    }


});

router.get('/logout', function (req, res) {
    req.logout();
    req.flash("success", "Başarılı bir şekilde çıkış yapıldı.");
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
    var currentUser = req.user;
    console.log("buraya girdi");
    console.log(req.user.role);
    var adminControl = false;
    currentUser.role.forEach(function (userRole) {
        if (userRole == "admin")
            adminControl = true;
    });
    if (adminControl) {
        var myMainTopics, mySubTopics, myKeywords, myTopics, myComments;
        var myUsers = [];
        var myAuthors = [];
        var myEditors = [];
        var myChiefEditors = [];
        var displayUser = {};
        var displayTopics = [];
        var adminSubTopics = [];
        var adminKeywords = [];
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
                Keyword.find({}, function (err, keywords) {
                    if (err) return callback(err);
                    // console.log("SubTopicler : "+subTopics);
                    // console.log("============");
                    myKeywords = keywords
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
                        myUsers.push(user);
                        if (user.role === 'author') {
                            myAuthors.push(user);
                        } else if (user.role == 'editor') {
                            myEditors.push(user);
                        } else if (user.role == 'chiefEditor') {
                            myChiefEditors.push(user);
                        }
                    });

                    console.log("Authors : " + myAuthors);
                    console.log("Editors : " + myEditors);
                    console.log("ChiefEditor : " + myChiefEditors);


                    // console.log("Userlar : "+users);
                    // console.log("============");
                });
                callback();
            },
            function (callback) {
                User.findById(currentUser._id, function (err, user) {
                    if (err) return callback(err);
                    displayUser = user;
                    console.log(displayUser.firstName);
                });
                callback();
            },
            function (callback) {
                var query = {author: currentUser._id};
                Topic.find(query, function (err, topics) {
                    if (err) return callback(err);
                    topics.forEach(function (topic) {
                        displayTopics.push(topic);
                        console.log(topic.name);
                    });
                });
                callback();
            }
        ], function (err) {
            if (err) return (err);
            var userRole = userRoleControl(req.user);
            var query = {chiefEditor: req.user._id};
            SubTopic.find(query, function (err, subtopics) {
                if (err) throw (err);
                adminSubTopics = subtopics;
                var queryForKeyword = {editor: req.user._id};
                Keyword.find(queryForKeyword, function (err, keywords) {
                    if (err) throw (err);
                    adminKeywords = keywords;
                    res.render('admin', {
                        myMainTopics: myMainTopics,
                        mySubTopics: mySubTopics,
                        myKeywords: myKeywords,
                        myTopics: myTopics,
                        myComments: myComments,
                        myUsers: myUsers,
                        myAuthors: myAuthors,
                        myEditors: myEditors,
                        myChiefEditors: myChiefEditors,
                        userRole: displayUser.role,
                        userFirstName: currentUser.firstName,
                        userLastName: currentUser.lastName,
                        useremail: currentUser.email,
                        roles: currentUser.role,
                        userRole: userRole,
                        username: currentUser.username,
                        topics: displayTopics,
                        adminSubTopics: adminSubTopics,
                        adminKeywords: adminKeywords
                    });
                });
            });
        });

    } else {
        res.render('not_found');
    }
});

router.post('/adminProfile', function (req, res) {
    var currentUser = req.user;
    var userFirstName = req.body.userFirstName;
    var userLastName = req.body.userLastName;
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    req.checkBody('userFirstName', 'İsim alanı boş olamaz').notEmpty();
    req.checkBody('userLastName', 'Soyisim alanı boş olamaz').notEmpty();
    req.checkBody('username', 'Kullanıcı adı alanı boş olamaz.').notEmpty();
    req.checkBody('useremail', 'Kullanıcı email alanı boş olamaz').notEmpty();
    var errors = req.validationErrors();

    if (!errors) {
        var query = {_id: currentUser._id};

        User.findById(query, function (err, user) {
            if (err) throw err;

            user.firstName = userFirstName;
            user.lastName = userLastName;
            user.email = userEmail;
            user.username = userName;
            console.log(user._id);
            user.save(function (err) {
                if (err) throw err;
                req.flash('success', "Profiliniz başarıyla güncellendi.");
                res.redirect('/');
            })
        })
    }
    else {
        req.flash('error', "Verileri kontrol ediniz!");
        res.render('admin', {
            userFirstName: userFirstName,
            userLastName: userLastName,
            username: userName,
            useremail: userEmail,
            user: currentUser
        });
    }
});

// TODO : NOT tested
router.get('/chiefEditorProfile', ensureAuthentication, function (req, res, next) {
    var currentUser = req.user;
    var userId = req.user._id;
    var myMainTopics = [];
    var myTopics = [];
    var myTopicAsDraft = [];
    var myWholeSystemSubTopic = [];
    var myWaitingAllowSubTopics = [];
    var displayUser = {};
    var displayTopics = [];
    var chiefSubTopics = [];
    var chiefKeywords = [];
    var userRole = userRoleControl(req.user);
    async.parallel([
        function (callback) {
            User.findById(userId, function (err, user) {
                if (err) return callback(err);
                displayUser = user;
                console.log(displayUser.firstName);
            });
            callback();
        },

        function (callback) {
            var query = {author: userId};
            Topic.find(query, function (err, topics) {
                if (err) return callback(err);
                topics.forEach(function (topic) {
                    displayTopics.push(topic);
                    console.log(topic.name);
                });
            });
            callback();
        }

    ], function (err) {
        if (err) return (err);
        console.log(currentUser.firstName);
        var query = {chiefEditor: userId};
        SubTopic.find(query, function (err, subtopics) {
            if (err) throw (err);
            chiefSubTopics = subtopics;
            var queryForKeyword = {editor: userId};
            Keyword.find(queryForKeyword, function (err, keywords) {
                if (err) throw (err);
                chiefKeywords = keywords;
                res.render('chiefEditorProfile', {
                    userRole: userRole,
                    userFirstName: currentUser.firstName,
                    userLastName: currentUser.lastName,
                    useremail: currentUser.email,
                    username: currentUser.username,
                    roles: req.user.role,
                    topics: displayTopics,
                    chiefSubTopics: chiefSubTopics,
                    chiefKeywords: chiefKeywords
                });
            });
        });
    });
    
    
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

router.post('/chiefEditorProfile', function (req, res) {
    var currentUser = req.user;
    var userFirstName = req.body.userFirstName;
    var userLastName = req.body.userLastName;
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    req.checkBody('userFirstName', 'İsim alanı boş olamaz').notEmpty();
    req.checkBody('userLastName', 'Soyisim alanı boş olamaz').notEmpty();
    req.checkBody('username', 'Kullanıcı adı alanı boş olamaz.').notEmpty();
    req.checkBody('useremail', 'Kullanıcı email alanı boş olamaz').notEmpty();
    var errors = req.validationErrors();
    var userRole = userRoleControl(req.user);
    if (!errors) {
        var query = {_id: currentUser._id};

        User.findById(query, function (err, user) {
            if (err) throw err;

            user.firstName = userFirstName;
            user.lastName = userLastName;
            user.email = userEmail;
            user.username = userName;
            console.log(user._id);
            user.save(function (err) {
                if (err) throw err;
                req.flash('success', "Profiliniz başarıyla güncellendi.");
                res.redirect('/');
            })
        })
    }
    else {
        req.flash('error', "Verileri kontrol ediniz!");
        res.render('chiefEditorProfile', {
            userFirstName: userFirstName,
            userLastName: userLastName,
            username: userName,
            useremail: userEmail,
            user: currentUser,
            userRole: userRole
        });
    }
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
    var displayUser = {};
    var displayTopics = [];
    var currentUser = req.user;
    var userRole = userRoleControl(req.user);
    var editorKeywords = [];
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
        },
        function (callback) {
            User.findById(userId, function (err, user) {
                if (err) return callback(err);
                displayUser = user;
                console.log(displayUser.firstName);
            });
            callback();
        },

        function (callback) {
            var query = {author: userId};
            Topic.find(query, function (err, topics) {
                if (err) return callback(err);
                topics.forEach(function (topic) {
                    displayTopics.push(topic);
                    console.log(topic.name);
                });
            });
            callback();
        }
    ], function (err) {
        if (err) return (err);
        myWholeSystemTopic.forEach(function (topic) {
            if (!topic.allowStatus.status) {
                mySubTopics.forEach(function (subTopic) {
                    if (topic.relevantSubTopics[0] == subTopic._id) {
                        myWaitingAllowTopics.push(topic);
                    }
                });
            }
        });


        // editor profilinde , kendi üzerine atanmış subTopiclerin altına ayzılan onaylanmamış topicler gelecek
        var queryForKeyword = {editor: userId};
        Keyword.find(queryForKeyword, function (err, keywords) {
            if (err) throw (err);
            editorKeywords = keywords;
            res.render('editor_profile', {
                myTopics: myTopics,
                myTopicsAsDraft: myTopicAsDraft,
                mySubTopics: mySubTopics,
                myWaitingAllowRequests: myWaitingAllowTopics,
                userRole: userRole,
                userFirstName: currentUser.firstName,
                userLastName: currentUser.lastName,
                useremail: currentUser.email,
                roles: req.user.role,
                username: currentUser.username,
                topics: displayTopics,
                editorKeywords: editorKeywords
            });
        });
    });
});

router.post('/editorProfile', function (req, res) {
    var currentUser = req.user;
    var userFirstName = req.body.userFirstName;
    var userLastName = req.body.userLastName;
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    req.checkBody('userFirstName', 'İsim alanı boş olamaz').notEmpty();
    req.checkBody('userLastName', 'Soyisim alanı boş olamaz').notEmpty();
    req.checkBody('username', 'Kullanıcı adı alanı boş olamaz.').notEmpty();
    req.checkBody('useremail', 'Kullanıcı email alanı boş olamaz').notEmpty();
    var errors = req.validationErrors();
    var userRole = userRoleControl(req.user);
    if (!errors) {
        var query = {_id: currentUser._id};

        User.findById(query, function (err, user) {
            if (err) throw err;

            user.firstName = userFirstName;
            user.lastName = userLastName;
            user.email = userEmail;
            user.username = userName;
            console.log(user._id);
            user.save(function (err) {
                if (err) throw err;
                req.flash('success', "Profiliniz başarıyla güncellendi.");
                res.redirect('/');
            })
        })
    }
    else {
        req.flash('error', "Verileri kontrol ediniz!");
        res.render('chiefEditorProfile', {
            userFirstName: userFirstName,
            userLastName: userLastName,
            username: userName,
            useremail: userEmail,
            user: currentUser,
            userRole: userRole
        });
    }
});

router.get('/authorProfile', function (req, res, next) {
    console.log('authorProfile girdi');
    var userId = req.user._id;
    var displayUser = {};
    var displayTopics = [];
    var currentUser = req.user;
    var userRole = userRoleControl(req.user);
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
        console.log(currentUser.firstName);
        res.render('user_profile',{
            userRole: userRole,
            userFirstName: currentUser.firstName,
            userLastName: currentUser.lastName,
            useremail: currentUser.email,
            username: currentUser.username,
            roles: req.user.role,
            topics : displayTopics
        })
    });
});

router.post('/authorProfile', function (req, res) {
    var currentUser = req.user;
    var userFirstName = req.body.userFirstName;
    var userLastName = req.body.userLastName;
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    req.checkBody('userFirstName', 'İsim alanı boş olamaz').notEmpty();
    req.checkBody('userLastName', 'Soyisim alanı boş olamaz').notEmpty();
    req.checkBody('username', 'Kullanıcı adı alanı boş olamaz.').notEmpty();
    req.checkBody('useremail', 'Kullanıcı email alanı boş olamaz').notEmpty();
    var errors = req.validationErrors();
    var userRole = userRoleControl(req.user);
    if (!errors) {
        var query = {_id: currentUser._id};

        User.findById(query, function (err, user) {
            if (err) throw err;

            user.firstName = userFirstName;
            user.lastName = userLastName;
            user.email = userEmail;
            user.username = userName;
            console.log(user._id);
            user.save(function (err) {
                if (err) throw err;
                req.flash('success', "Profiliniz başarıyla güncellendi.");
                res.redirect('/');
            })
        })
    }
    else {
        req.flash('error', "Verileri kontrol ediniz!");
        res.render('user_profile', {
            userFirstName: userFirstName,
            userLastName: userLastName,
            username: userName,
            useremail: userEmail,
            user: currentUser,
            userRole: userRole
        });
    }
});

router.post('/changePassword', function (req, res) {
    var currentUser = req.user;
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    var newPasswordConfirm = req.body.newPasswordConfirm;
    req.checkBody('newPassword', 'Yeni şifreyi giriniz').notEmpty();
    req.checkBody('newPasswordConfirm', 'Girdiğiniz şifreler uyuşmuyor.').equals(newPassword);

    var errors = req.validationErrors();
    if (!errors) {
        User.comparePassword(oldPassword, currentUser.password, function (err, isMatch) {
            if (err) throw err;
            if (isMatch) {
                var query = {_id: currentUser._id};

                User.findById(query, function (err, user) {
                    if (err) throw err;

                    // topic.name = topicName;
                    user.password = newPassword;

                    User.createUser(user, function (err, euser) {
                        if (err) throw err;
                        req.flash('success', "Şifreniz değiştirildi.");
                        res.redirect('/');
                    });
                });

            } else {
                console.log('Kullanıcı şifreyi yanlış girdi.');
                req.flash('error', "Eski şifreniz uyuşmuyor. Tekrar deneyiniz.");
                res.redirect('/user/authorProfile');
            }
        });
    }
    else {
        console.log("Hata var maalesef!!!");
        req.flash('error', "Girdiğiniz verilerde hata var. Tekrar deneyiniz.");
        res.redirect('/user/authorProfile');
    }

});

router.get('/editor/getOnay', ensureAuthentication, function (req, res, next) {
    
    var user = req.user;
    var userID = user._id;
    var userRole = userRoleControl(req.user);
    var query = {editor : userID};

    Keyword.find(query, function (err, keywords) {
        if (err) throw err;
        console.log("bulunan keywords " + keywords);
        keywords.forEach(function (keyword) {
            var currentKeyword = keyword;
            var keywordID = currentKeyword._id;
            var onayBekleyenTopicler = [];
            console.log(keywordID);
            var query = {allowStatus: {stage: 0, status: false}};
            Topic.find(query, function (err, topics) {
                if (err) throw err;

                topics.forEach(function (topic) {
                    if (keywordID.toString() === String(topic.relevantKeywords[0])) {
                        console.log("uygun bulundu");
                        onayBekleyenTopicler.push(topic);
                    }
                });

                res.render('onaydakiTopicler', {
                    onayBekleyenler: onayBekleyenTopicler,
                    userRole: userRole,
                    roles: req.user.role
                })

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

        User.findById(currentUser._id, function (err, user) {
            if (err) throw err;
            user.followingTopics.push(clickedId);
            console.log("hata burada2");
            user.save(function (err) {
                if (err) throw err;

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
    var userRole = userRoleControl(req.user);
    console.log(userId);
    console.log(userRole);
    var currentUser;
    User.findById(userId, function (err, user) {
        if (err) throw (err);
        console.log("Buraya gelebildik");
        console.log(user);
        currentUser = user;
        user.followingTopics.forEach(function (following) {
            takipEdilenler.push(following);
        });
        var i = 0;
        if (takipEdilenler[0]) {
            takipEdilenler.forEach(function (topicId) {
                Topic.findById(topicId, function (err, topic) {
                    if (err) throw(err);
                    topicList.push(topic);
                    console.log(topic);
                    i++;
                    if (i == takipEdilenler.length) {
                        res.render('following_topics', {
                            takipEdilenlerTopicler: topicList,
                            takipEdilenler: takipEdilenler,
                            roles: currentUser.role,
                            userRole: userRole
                        });
                    }
                });
            });
        }
        else {
            res.render('following_topics', {
                takipEdilenler: takipEdilenler,
                roles: req.user.role,
                userRole: userRole
            });
        }

        console.log(topicList);
    });

});

function ensureAuthentication(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

function isAdmin(req, res, next) {
    if (req.user.role == 'admin') {
    }
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
