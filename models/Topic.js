/**
 * Created by TOSHIBA on 3.3.2016.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// FIELDS               :  TYPES //
// name                 : 'String'
// definition           : 'String'
// chiefEditor          : 'ChiefEditor'
// created_at           : 'Date'
// updated_at           : 'Date'
// relevantSubTopics    : ['SubTopics']
// relevantPosts        : ['Post']
// followers            : ['User']
// viewCount            : 'Number'
// likeCount            : 'Number'

var TopicSchema = new Schema({

    name : {
        type : String,
        required : true,
        trim : true
    },

    definition : {
        type : String,
        required : true,
        trim : true,
        min : 120           // it can be check on front-end
    },

    chiefEditor : {
        type : Schema.Types.ObjectId,
        ref : 'ChiefEditor',
        required : false
    },

    // just like chiefEditor, so useless
    //createdBy : {
    //    type : Schema.Types.ObjectId,
    //    required : true,
    //    ref : 'ChiefEditor'
    //},

    createdAt : {
        type : Date,
        required: true,
        default : Date.now()
    },

    updatedAt : {
        type : Date,
        default : Date.now()
    },

    relevantSubTopics : [{
        type : Schema.Types.ObjectId,
        ref : 'SubTopic'
    }],

    relevantPosts : [{
        type : Schema.Types.ObjectId,
        ref : 'Post'
    }],

    followers : [{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }],

    viewCount: {
        type: Number,
        required: false,
        default: 1
    },

    likeCount: {
        type: Number,
        default: 0
    },
    
    comments : [{
        content : {
            type : String,
            trim : true,
            require : true
        },
        author : {
            type : Schema.Types.ObjectId,
            ref : 'User',
            require : true
        },
        createdAt : {
            type : Date,
            required: true,
            default : Date.now()
        }
        
    }]

    // it can be calculate via relevantSubTopics size or length
    //subTopicCount : {
    //    type: Number,
    //    default : 0,
    //    required : true
    //}

    // it can be calculate via relevantPosts size or length
    //relevantPostCount : {
    //    type : Number,
    //    default : 0,
    //    required : true
    //}

});

var Topic = mongoose.model('Topic',TopicSchema);

// Topic.pre('save', function(next){
//     var now = new Date();
//     this.updated_at = now;
//     if (!this.created_at) {
//         this.created_at = now;
//     }
//     next();
// });

module.exports = Topic;


module.exports.createTopic = function(newTopic, callback){
    newTopic.save(callback);
    console.log(newTopic)
};
