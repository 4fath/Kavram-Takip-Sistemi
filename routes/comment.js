// NOTE : useless for now

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
    var topic = req.session.topic || "session_bos";
    // var isDraft = req.body.checkBox;

    var newComment = new Comment({
        content: content,
        author: user,
        allowStatus: false,
        isDraft: false,
        topic: topic._id || topic.id
    });

    newComment.save(function (err) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log(newComment);
            User.findById(user._id, function (err, user) {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    user.comments.push(newComment);
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                            throw err;
                        } else {
                            console.log("Success");
                            req.flash('success', 'Başarılı bir şekilde yorum eklendi');
                            res.location('/topic/'+topic._id);
                            res.redirect('/topic/'+topic._id);
                        }
                    })
                }

            })
        }

    });

});


module.exports = router;