/**
 * Created by TOSHIBA on 7.3.2016.
 */
// require('dotenv').load();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var mongoUrl = 'mongodb://cagri:123456@ds013848.mlab.com:13848/notion_follow';
var mongoLocal = 'mongodb://localhost/nodeauth';

// both url working fine Local and Remote
mongoose.connect(mongoLocal, function(err){
    if(err){
        console.log('hata var hata :' + err);
    }else {
        console.log('bu kez oldu')
    }
});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));

db.once('open', function callback () {

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
//var roles = 'user editor chiefEditor admin'.split(' ');

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
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true
    },

    // TODO: Encrypt
    password: {
        type : String,
        required : true,
        trim : true,
        bcrypt : true,
        min : 8,            // it can be check on front-end
        max : 20            // it can be check on front-end
    },

    posts : {
        own: [{
            type : Schema.Types.ObjectId,
            ref : 'Post'
        }],

        likes: [{
            type : Schema.Types.ObjectId,
            ref : 'Post'
        }]

    },

    followingTopics : [{
        type : Schema.Types.ObjectId,
        ref : 'Topic'
    }],

    followingSubTopics : [{
        type: Schema.Types.ObjectId,
        ref : 'SubTopic'
    }],

    joinDate : {
        type : Date,
        required : true,
        default : Date.now
    },

    banned : {
        type : Boolean,
        default : false,
        required : false
    },

    socialMediaUrls : {
        twitterUrl : {
            type :String,
            trim : true
        },
        facebookUrl :{
            type : String,
            trim : true
        }
    },

    photoUrl : {
		type : String,
		trim : true,
		required : false
	}            // for storing local or aws etc..


    //Bunun uzerinde dusunmek laz�m, ki�i veya admin ki�iyi silerse
    //leave : {
    //    date : {
    //        type : Date,
    //        required : true,
    //        default : Date.now.getYear() + 1
    //    },
    //    reason : {
    //        type : String,
    //        required : false
    //    }
    //},

    // can use for statistics
    //age : {
    //    type : Number,
    //    min : 10
    //},

    //role: {
    //    type:String,
    //    enum: roles,
    //    required: true,
    //    default: roles[0]
    //},

});

var User = mongoose.model('User',UserSchema);

module.exports = User;

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    })
};

module.exports.getUserByUsername = function(username, callback){
    var query = {username : username};
    User.findOne(query, callback);
};

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
};

module.exports.createUser = function(newUser, callback){
    bcrypt.hash(newUser.password, 10, function(err, hash){
        if (err) throw err;
        newUser.password = hash;
        newUser.save(callback);
    } );
    console.log(newUser)
    
};
