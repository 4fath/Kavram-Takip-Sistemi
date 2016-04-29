/**
 * Created by TOSHIBA on 3.3.2016.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// FIELDS               : TYPES //
// SubTopic             : 'SubTopic'
// MainTopic            : 'Topic'
// content              : 'String'
// author:              : 'User'
// created_at           : 'Date'
// updated_at           : 'Date'
// allowStatus          : 'Boolean'
// viewCount            : 'Number'
// likeCount            : 'Number'
// relevantSubTopics    : ['SubTopics']

var commentSchema = Schema({

        topic: {
            type: Schema.Types.ObjectId,
            ref: 'Topic',
            require: true
        },

        content: {
            type: String,
            required: true,
            trim: true
        },

        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        allowStatus: {
            type: Boolean,
            default: false,
            allowedBy: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        },

        isDraft: {
            type: Boolean,
            require: true,
            default: true,
            lastUpdate : {
                type : Date,
                require : true,
                default : Date.now()
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

        relevantTopics: [{
            type: Schema.Types.ObjectId,
            ref: 'Topic'
        }],
    
        created_at: {
            type: Date,
            default: Date.now(),
            required: true
        },

        updated_at: {
            type: Date,
            required: true,
            default: Date.now()
        },

        viewCount: {
            type: Number,
            required: false,
            default: 1
        },

        likeCount: {
            type: Number,
            default: 0,
            required : false
        }
    },
    {
        timestamps: true
    }
);

commentSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

var Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
