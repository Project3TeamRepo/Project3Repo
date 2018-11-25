module.exports = function(app) {

    const passport = require('passport’);
    const LocalStrategy = require('passport-local').Strategy;
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, 
    function (email, password, cb) {
        return cb(null, {userId: 'user_1', userName: email}, {message: 'Logged In Successfully'});
    }
    ));
};


