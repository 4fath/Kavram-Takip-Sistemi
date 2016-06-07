/**
 * Created by TOSHIBA on 7.6.2016.
 */

exports.checkAdmin = function (req, res, next) {
    var controlFlag = false;
    var currenUser = req.user;
    currenUser.role.forEach(function (role) {
        if (role == 'admin')
            controlFlag = true;
    });

    if (controlFlag) {
        next();
    } else {
        res.redirect('/');
    }
};

exports.checkChiefEditor = function (req, res, next) {
    var controlFlag = false;
    var currenUser = req.user;
    currenUser.role.forEach(function (role) {
        if (role == 'chiefEditor')
            controlFlag = true;
    });
    if (controlFlag) {
        next();
    } else {
        res.redirect('/');
    }
};

exports.checkEditor = function (req, res, next) {
    var controlFlag = false;
    var currenUser = req.user;
    currenUser.role.forEach(function (role) {
        if (role == 'editor')
            controlFlag = true;
    });
    if (controlFlag) {
        next();
    } else {
        res.redirect('/');
    }
};