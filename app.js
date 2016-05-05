require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var bodyParser = require('body-parser');
var multer = require('multer');
var flash = require('connect-flash');
var mongo = require('mongodb');
var mongoose = require('mongoose');


// routes
var index = require('./routes/index');
var user = require('./routes/users');
var topic = require('./routes/topic');
var mainTopic = require('./routes/mainTopic');
var subTopic = require('./routes/subTopic');
var comment = require('./routes/comment');
var admin = require('./routes/admin');
var notFound = require('./routes/notFound');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(multer({dest:'./uploads'}).single('photo'));

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//handle express session
app.use(session({
  secret : process.env.MY_SECRET_SESSION,
  saveUninitialized: true,
  resave : true
}));

//passport
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(function(req, res, next){
  res.locals.messages =  require('express-messages')(req,res);
  next();
});

app.get('*', function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

app.use('/', index);
app.use('/user', user);
app.use('/topic', topic);
app.use('/mainTopic',mainTopic);
app.use('/subTopic',subTopic);
app.use('/comment', comment);
app.use('/admin', admin);
app.use('/*', notFound);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
