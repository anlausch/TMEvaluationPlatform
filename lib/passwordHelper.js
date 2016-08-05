"use strict";

const crypto = require('crypto');

var PasswordHelper = function(){
    this.len = 256;
    this.saltLen = 64;
    this.noIterations = 10000;
    this.digest = 'sha256';
}

PasswordHelper.prototype.hashPassword = function(password, salt, callback) {  
    var len = this.len / 2;
    var self = this;
    if(3 === arguments.length) {
        crypto.pbkdf2(password, salt, this.noIterations, len, this.digest, function(err, derivedKey) {
            if (err) {
                return callback(err);
            }
            return callback(null, derivedKey.toString('hex'));
        });
    }else{
        callback = salt;
        crypto.randomBytes(this.saltLen / 2, function(err, salt) {
            if (err) {
                return callback(err);
            }
            salt = salt.toString('hex');
            crypto.pbkdf2(password, salt, self.noIterations, len, self.digest, function(err, derivedKey) {
                if (err) {
                    return callback(err);
                }
                callback(null, derivedKey.toString('hex'), salt);
            });
        });
    }
}

PasswordHelper.prototype.verify = function(password, hash, salt, callback) {
    this.hashPassword(password, salt, function(err, hashedPassword) {
        if(err) {
            return callback(err);
        }
        if(hashedPassword === hash) {
            callback(null, true);
        }else{
            callback(null, false);
        }
    });
}


/**
 * Factory function
 *
 * @returns {PasswordHelper}
*/
function createPasswordHelper() {
    return new PasswordHelper();
}

module.exports = {
        createPasswordHelper: createPasswordHelper
};