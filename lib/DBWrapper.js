'use strict';
const mysql = require('mysql');
const config = require('./../config.js');

var DBWrapper = function(){
    this.db = mysql.createConnection({
        host     : config.db.host,
        user     : config.db.user,
        password : config.db.password,
        database : config.db.schema
    });
    
    this.db.connect();
}


/**
 * Factory function
 *
 * @returns {DBWrapper}
*/
function createDBWrapper() {
    return new DBWrapper();
}


module.exports = {
        createDBWrapper : createDBWrapper
};