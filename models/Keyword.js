/**
 * Created by TOSHIBA on 15.5.2016.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var KeywordSchema = new Schema({

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

    hasEditor: {
        type: Boolean,
        required: true,
        default: false
    },

    editor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    },

    updatedAt: {
        type: Date,
        default: Date.now()
    },

    subTopic: {
        type: Schema.Types.ObjectId,
        ref: 'SubTopic',
        required: true
    },

    relevantTopics: [{
        type: Schema.Types.ObjectId,
        ref: 'Topic'
    }],

    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }]

});


KeywordSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

var Keyword = mongoose.model('Keyword', KeywordSchema);

module.exports = Keyword;