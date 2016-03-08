/**
 * Created by TOSHIBA on 8.3.2016.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// TODO : add definition to convention

// FIELDS               :  TYPES //
// name                 : 'String'
// definition           : 'String'
// editor:              : 'Editor'
// created_at           : 'Date'
// updated_at           : 'Date'
// mainTopics           : ['Topic']
// relevantPosts        : ['Post']
// viewCount            : 'Number'
// followers            : 'User'
// relevantPosts        : ['Post']

var SubTopicSchema = new Schema({

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

    editor : {
        type : Schema.Types.ObjectId,
        ref : 'Editor',
        required : true
    },

    createdAt : {
        type : Date,
        required: true,
        default : Date.now()
    },

    updatedAt : {
        type : Date,
        default : Date.now()
    },

    mainTopics : [{
        type : Schema.Types.ObjectId,
        ref : 'Topic'
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
    }

});

var SubTopic = mongoose.model('User',SubTopicSchema);

SubTopic.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = SubTopic;