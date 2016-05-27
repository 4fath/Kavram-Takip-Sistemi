/**
 * Created by TOSHIBA on 7.3.2016.
 */

require('dotenv').config();
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var uniqueValidator = require('mongoose-unique-validator');

var mongoLabURL = process.env.MONGODB_REMOTE_URL ;
var mongoDBLocalURL = process.env.MONGODB_LOCAL_URL ;


// both url working fine Local and Remote
mongoose.connect(mongoLabURL, function (err) {
    if (err) {
        console.log('DB bağlantısında hata oluştu , hata :' + err);
    } else {
        console.log('DB bağlantısı başarıyla kuruldu !');
    }
});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));

db.once('open', function callback() {
    console.log("db once open da");
});

// /*
// * MONGOLAB_URI=mongodb://example:example@ds053312.mongolab.com:53312/todolist
// * 'mongodb://example:example@ds053312.mongolab.com:53312/todolist'
// */
// // mongoose.connect('mongodb://example:example@ds053312.mongolab.com:53312/todolist', function (error) {
// //     if (error) console.error(error);
// //     else console.log('mongo connected');
// // });
//
//
//
// //
// //var connectionUrlMongoLab = 'mongodb://4fath:notion_follow@ds013848.mlab.com:13848/notion_follow';
// ////var connectionUrlLocale = 'mongodb://localhost:27017/nodeauth';
// //var db = mongoose.createConnection(connectionUrlMongoLab);
//
// //db.on('open', function(){
// //   console.log('conneciton opened')
// //});

var Schema = mongoose.Schema;

// FIELDS               :  TYPES //
// firstName            : 'String'
// lastName             : 'String'
// username             : 'String'
// email                : 'String'
// password             : 'String'
// posts                : ['Post','Post']
// followingTopics      : ['Topic']
// followingSubTopics   : ['SubTopic']
// joinDate             : 'Date'
// banned               : 'Boolean'
// socialMediaUrls      : 'String','String'
// profileUrl           : 'String'

var UserSchema = new Schema({

    firstName: {
        type: String,
        required: true,
        trim: true
    },

    lastName: {
        type: String,
        required: true,
        trim: true
    },

    username: {
        type: String,
        index: true,
        required: true,
        trim: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        trim: true,
        bcrypt: true
    },

    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comments'
    }],

    followingMainTopics: [{
        type: Schema.Types.ObjectId,
        ref: 'MainTopic'
    }],

    followingSubTopics: [{
        type: Schema.Types.ObjectId,
        ref: 'SubTopic'
    }],

    followingKeywords: [{
        type: Schema.Types.ObjectId,
        ref: 'Keyword'
    }],

    followingTopics: [{
        type: Schema.Types.ObjectId,
        ref: 'Topic'
    }],

    joinDate: {
        type: Date,
        required: true,
        default: Date.now
    },

    banned: {
        type: Boolean,
        default: false,
        required: false
    },

    socialMediaUrls: {
        twitterUrl: {
            type: String,
            trim: true,
            required: false,
            default: 'http://twitter.com'
        },
        facebookUrl: {
            type: String,
            trim: true,
            required: false,
            default: 'http://facebook.com'
        }
    },

    // uploaded via multer, string for path
    photoUrl: {
        type: String,
        trim: true,
        required: false
    },

    role: [{
        type: String,
        require: true,
        default: 'author'
    }],

    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },

    isChiefEditor: {
        type: Boolean,
        required: true,
        default: false
    },

    isEditor: {
        type: Boolean,
        required: true,
        default: false
    },

    subTopic: [{
        type: Schema.Types.ObjectId,
        ref: 'SubTopic'
    }],

    keyword: [{
        type: Schema.Types.ObjectId,
        ref: 'Keyword'
    }],

    interests: [{
        type: Schema.Types.ObjectId,
        ref: 'Keyword'
    }]

});

UserSchema.plugin(uniqueValidator);

var User = mongoose.model('User', UserSchema);

module.exports = User;

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    })
};

module.exports.getUserByUsername = function (username, callback) {
    var query = {username: username};
    User.findOne(query, callback);
};

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
};

module.exports.createUser = function (newUser, callback) {
    bcrypt.hash(newUser.password, 10, function (err, hash) {
        if (err) throw err;
        newUser.password = hash;
        newUser.save(callback);
    });
    console.log(newUser)

};
