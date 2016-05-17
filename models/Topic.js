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
// relevantKeywords     : ['Keyword']
// followers            : ['User']
// viewCount            : 'Number'
// likeCount            : 'Number'

var TopicSchema = new Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    abstract: {
        type: String,
        required: true,
        trim: true
    },

    definition: {
        type: String,
        required: true,
        trim: true
    },

    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },

    //     Stage=0 ise Onaya gönderilmiştir
    //     Stage=1 ise Onaylanmıştır
    //     Stage=-1 ise Red olunmuştur
    allowStatus: {
        type: Boolean,
        default: false,
        allowedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String,
            trim: true
        },
        stage: {
            type: Number
        }
    },

    isDraft: {
        type: Boolean,
        require: true,
        default: true,
        lastUpdate: {
            type: Date,
            require: true,
            default: Date.now()
        }
    },

    relevantMainTopics: [{
        type: Schema.Types.ObjectId,
        ref: 'MainTopic'
    }],

    relevantSubTopics: [{
        type: Schema.Types.ObjectId,
        ref: 'SubTopic'
    }],

    relevantKeywords: [{
        type: Schema.Types.ObjectId,
        ref: 'Keyword'
    }],

    relevantComments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],

    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: false
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

    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        required: false
    }],

    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    },

    updatedAt: {
        type: Date,
        default: Date.now()
    }

});


TopicSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

var Topic = mongoose.model('Topic', TopicSchema);

module.exports = Topic;

module.exports.createTopic = function (newTopic, callback) {
    newTopic.save(callback);
};
