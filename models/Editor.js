/**
 * Created by TOSHIBA on 7.3.2016.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// FIELDS               :  TYPES //
// firstName            : 'String'
// lastName             : 'String'
// username             : 'String'
// password             : 'String'
// email                : 'String'
// attachedSubTopic     : 'Topic'
// joinDate             : 'Date'
// allowByChiefEditor   : 'ChiefEditor'

var EditorSchema = new Schema({

    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true
    },

    // TODO : password will stored via encrypt module
    password: {
        type : String,
        required : true,
        trim : true
    },

    attachedSubTopic : {
        type: Schema.Types.ObjectId,
        ref : 'SubTopic',
        required : true
    },

    joinDate : {
        type : Date,
        default : Date.now(),
        required : true
    },

    allowByChiefEditor : {
        type : Schema.Types.ObjectId,
        ref : 'ChiefEditor',
        required : true
    }

});


var Editor = mongoose.model('Editor', EditorSchema);

module.exports = Editor;