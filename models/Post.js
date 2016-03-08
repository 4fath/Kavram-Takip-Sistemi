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

var postSchema = Schema({

        //-- Hangi kavram altina yazilmis --//
        SubTopic: {
            type: Schema.Types.ObjectId,
            ref: 'SubTopic',
            required: true
        },

        MainTopic: {
            type: Schema.Types.ObjectId,
            ref: 'Topic',
            required: true
        },

        content: {
            type: String,
            required: true,
            trim: true,
            min: 120
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
                ref: 'Editor'
            }
        },

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

        relevantMainTopics: [{
            type: Schema.Types.ObjectId,
            ref: 'Topic'
        }],

        relevantSubTopics: [{
            type: Schema.Types.ObjectId,
            ref: 'SubTopic'
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

    },
    {
        timestamps: true
    }
);

var Post = mongoose.model('Post', postSchema);

Post.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = Post;
