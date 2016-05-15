/**
 * Created by TOSHIBA on 26.4.2016.
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

var MainTopicSchema = new Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    definition: {
        type: String,
        required: true,
        trim: true
    },

    // hasChiefEditor: {
    //     type: Boolean,
    //     default: false,
    //     required: true
    // },
    //
    // chiefEditor: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: false
    // },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    },

    updatedAt: {
        type: Date,
        default: Date.now()
    },

    relevantSubTopics: [{
        type: Schema.Types.ObjectId,
        ref: 'SubTopic'
    }],
    
    relevantSubTopicSize : {
        type : Number,
        default : 0,
        required : true
    },

    viewCount: {
        type: Number,
        required: false,
        default: 1
    },

    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    countOfFollowers: {
        type: Boolean,
        default: 0,
        required: false
    }

});

MainTopicSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});


var MainTopic = mongoose.model('MainTopic', MainTopicSchema);


module.exports = MainTopic;