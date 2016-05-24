/**
 * Created by TOSHIBA on 24.5.2016.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    to: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    isRead: {
        type: Boolean,
        required: true,
        default: false,
    },

    content: {
        type: String,
        required: true
    },

    subject: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    }

});

MessageSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;