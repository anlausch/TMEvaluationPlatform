'use strict';
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const DBWrapper = require('./DBWrapper').createDBWrapper();
const PasswordHelper = require('./PasswordHelper').createPasswordHelper();

var PassportWrapper = function(){
    this.passport = passport;
    this.passport.use('local', new LocalStrategy({
            passReqToCallback: true
        },
        function(req, username, password, done) {
            DBWrapper.db.query('Select * from user where name=?;', [username], function(err, rows, fields) {
                if (err) { 
                    return done(err); 
                }
                else if (rows.length == 0) {
                    return done(null, false, { message: req.flash('loginMessage', 'Incorrect username. If you do not have an account yet, please follow the link above to sign up to the system.') });
                }
                else {
                    PasswordHelper.verify(password, rows[0].PwdHash, rows[0].PwdSalt, function(err, result) {
                        if(err){
                            return done(null, false, { message: req.flash('loginMessage', 'Something went wrong.') });
                        }else if(!result){
                            return done(null, false, { message: req.flash('loginMessage', 'Incorrect password. If you do not have an account yet, please follow the link above to sign up to the system.') });
                        }
                        var user = rows[0];
                        return done(null, user);
                    });
                }
            });
        }
    ));
    
    
    this.passport.serializeUser(function(user, done) {
        done(null, user);
    });


    this.passport.deserializeUser(function(user, done) {
        done(null, user);
    });
}


PassportWrapper.prototype.isLoggedIn =function (req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}


/**
 * Factory function
 *
 * @returns {PassportWrapper}
*/
function createPassportWrapper() {
    return new PassportWrapper();
}


module.exports = {
        createPassportWrapper : createPassportWrapper
};