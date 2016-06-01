
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// FIELDS               :  TYPES //
// firstName            : 'String'
// lastName             : 'String'
// username             : 'String'
// password             : 'String'
// email                : 'String'
// attachedTopic        : 'Topic'
// joinDate             : 'Date'



var ChiefEditorSchema = new Schema({

    firstName : {
        type : String,
        required : true,
        trim : true
    },

    lastName : {
        type : String,
        required : true,
        trim : true
    },

    username : {
        type : String,
        required : true,
        trim : true,
        min : 4,            // it can be check on front-end
        max : 12            // it can be check on front-end
    },

    email : {
        type : String,
        required : true,
        trim : true
    },

    password : {
        type : String,
        required : true,
        trim : true,
        min : 8,            // it can be check on front-end
        max : 20            // it can be check on front-end
    },

    attachedTopic : {
        type : Schema.Types.ObjectId,
        ref : 'Topic',
        required : true
    },

    joinDate : {
        type : Date,
        required : true,
        default : Date.now()
    }

});


var ChiefEditor = mongoose.model('ChiefEditor', ChiefEditorSchema);

module.exports = ChiefEditor;