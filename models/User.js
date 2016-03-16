/**
 * Created by TOSHIBA on 7.3.2016.
 */
var mongoose = require('mongoose');
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


    //Bunun uzerinde dusunmek lazým, kiþi veya admin kiþiyi silerse
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

