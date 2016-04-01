var express = require('express');
var router = express.Router();

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

router.post('/login', function(req,res,next){
   res.send('login ile post atildi, kullaici adi :'+req.body.uLogin + 'sifre :'+ req.body.uPassword); 
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



module.exports = router;
