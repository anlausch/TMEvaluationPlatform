'use strict';

//Database
var mysql = require('mysql');
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'EmailForensics'
  });

db.connect();

module.exports= db;