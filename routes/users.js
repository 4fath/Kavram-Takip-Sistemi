var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/User');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
    res.render('register',{
        'title': 'Register'
    });
    console.log("handled get from angular");
});
router.get('/login', function(req, res, next) {
    res.render('login',{
        'title': 'Login'
    });
});


 // TODO: think strong on bcrypt stractegy
router.post('/login', passport.authenticate('local',
    {
        failureRedirect:'/',
        failureFlash : 'There is something wrong on auth  '
    }),
    function(req,res){
        console.log('auth success');
        req.flash('success', 'Başarılı bir şekilde kayıt işlemi gerçekleşti ');

        res.location('/');
        res.redirect('/');
});


router.get('/getUsers', function (req, res, next) {
   User.find({}, function (err, users) {
       if (err) throw err;
       res.send(users);
   })

});


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user){
                console.log('boyle bisey yokmus');
                return done( null, false, { message : 'bilinmeyen user cred' });
            }

            User.comparePassword(password, user.password, function (err, isMacth) {
                if (err) throw err;
                if (isMacth){
                    return done(null, user);
                }else {
                    console.log('yanlis girmssin abi');
                    return done(null, false, {message : 'password yanlis'});
                }
            })
        })
    }
    
));

router.get('/testRouter/:id', function (req, res, next) {
   var userId = req.params.id;
    User.findById(userId, function (err, user) {
        if (err) throw  err;
        if (user.roles == 'author'){

            req.user = user;
            req.userRole = user.roles;
            //
            // console.log(req.user);
            //
            // console.log(req.userRole);

            req.session.user = user;

            res.send('bu bir author');

        }else {
            res.send('bu author degil')
        }
    })
});

router.get('/testRouter1', function (req, res, next) {
    var user = req.session.user;
    console.log(user);
    res.send(user);
});

router.post('/register', function(req,res,next){
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var username = req.body.username;
    var password =  req.body.password;
    var passwordConfirm = req.body.passwordConfirm;

    // form validation
    req.checkBody('firstName','isim bos olamaz').notEmpty();
    req.checkBody('lastName','isim bos olamaz').notEmpty();
    req.checkBody('email','').isEmail();
    req.checkBody('email','').notEmpty();
    req.checkBody('username','kullanici adi bos olamaz').notEmpty();
    req.checkBody('password','bu alan da gerekli').notEmpty();
    req.checkBody('passwordConfirm','iki passpord da uyusmali').equals(req.body.password);
    
    // check errors
    var errors = req.validationErrors();
    if(errors){
        res.render('register',{
            errors : errors,
            firstName  : firstName,
            lastName : lastName,
            email : email,
            username : username,
            password : password,
            passwordConfirm : passwordConfirm
        })
    }else {
        var newUser = new User({
            firstName  : firstName,
            lastName : lastName,
            email : email,
            username : username,
            password : password
        });


        User.createUser(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
        });
        
        req.flash('success', "Oldu lan");
        res.location('/');
        res.redirect('/');
    }

});


router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    User.findById(id, function (err, user) {
       if (err) throw err;
        console.log(user);
        res.send(user);
    });

});



module.exports = router;
