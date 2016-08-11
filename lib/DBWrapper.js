'use strict';
const mysql = require('mysql');

var DBWrapper = function(){
    this.db = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'root',
        database : 'emailpipeline'
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