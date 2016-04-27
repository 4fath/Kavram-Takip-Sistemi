/**
 * Created by TOSHIBA on 26.4.2016.
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

var MainTopicSchema = new Schema({

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
        ref : 'user',
        required : false
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

    relevantSubTopics : [{
        type : Schema.Types.ObjectId,
        ref : 'SubTopic'
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

MainTopicSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});


var MainTopic = mongoose.model('MainTopic',MainTopicSchema);



module.exports = MainTopic;