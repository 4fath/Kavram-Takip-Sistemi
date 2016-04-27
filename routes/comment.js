var express = require('express');

var Comment = require('../models/Comment');
var User = require('../models/User')

var router = express.Router();

router.get('/list', function (req, res, next) {

});

// router.post();

router.post('/addComment', function (req, res, next) {
    var content = req.body.commentBody;
    var user = req.user;
    var topic = req.session.topic;
    // var isDraft = req.body.checkBox;

    var newComment = new Comment({
        content : content,
        author : user,
        allowStatus : false,
        isDraft : false,
        topic : topic
    });
    
    newComment.save(function (err) {
        if(err){
            throw err;
        }else {
            User.findByIdAndUpdate({_id: req.query.id})
        }

        console.log(user.name + "," + topic.name + " e yeni bir yorum ekledi ! " );
        res.send("ok");
    });
    
});



module.exports = router;