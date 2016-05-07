/**
 * Created by TOSHIBA on 8.3.2016.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
        min : 120          
    },

    editor : {
        type : Schema.Types.ObjectId,
        ref : 'User',
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

    // NOTE : look at that point when you searching wolfram design
    mainTopic : {
        type : Schema.Types.ObjectId,
        ref : 'MainTopic',
        required : true
    },

    relevantTopics : [{
        type : Schema.Types.ObjectId,
        ref : 'Topic'
    }],

    followers : [{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }],

    viewCount: {
        type: Number,
        required: false,
        default: 1
    }
    
});

var SubTopic = mongoose.model('SubTopic',SubTopicSchema);

SubTopicSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = SubTopic;