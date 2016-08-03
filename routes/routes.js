'use strict';

var express = require('express');
var router = express.Router();
var pass = require('./../lib/pass');
var passwordHelper = require('./../lib/passwordHelper');


router.get('/', function(req, res, next) {
    res.render('index', { title: 'Topic Model Evaluation Platform', message: req.flash('loginMessage')});
  });
  
router.get('/signup', function(req, res, next) {
      res.render('signup', { title: 'Topic Model Evaluation Platform', messageError: req.flash('signupMessageError'), messageSuccess: req.flash('signupMessageSuccess')});
});


router.post('/signup',function(req, res, next) {
    var db = req.db;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    db.query('SELECT username from user where username=?;', [username], function(err, rows, fields) {
        if(rows[0]){
            req.flash('signupMessageError', 'Username already exists.');
            res.redirect('/signup');
        }else{
            if(password != password2){
                req.flash('signupMessageError', 'Passwords are not identical.');
                res.redirect('/signup');
            }else{
                passwordHelper.hash(password, function(err, pwdHash, pwdSalt) {
                    if (!err){ 
                        db.query('Insert into user(username, pwdhash, pwdsalt) values(?, ?, ?);', [username, pwdHash, pwdSalt], function(err, rows, fields) {
                            if (!err){
                                req.flash('signupMessageSuccess', 'Signup successful. You can now login to the system. Please visit the ');
                                res.redirect('/signup');
                            }else{
                                res.json('Error while performing Query.');
                            }
                        });
                    }
                });
            }
        }
        
    });
});


router.post('/login', pass.passport.authenticate('local', { successRedirect: '/tag',
    failureRedirect: '/',
    failureFlash: true })
);

router.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});

router.get('/tag', pass.isLoggedIn, function(req, res, next) {
  res.render('tag', { title: 'Topic Model Evaluation Platform' });
});

router.get('/labelTopic', pass.isLoggedIn, function(req, res, next) {
    res.render('labelTopic', { title: 'Topic Model Evaluation Platform' });
});

router.get('/topicLabel', pass.isLoggedIn, function(req, res, next) {
    res.render('topicLabel', { title: 'Topic Model Evaluation Platform' });
});

router.get('/annotation', pass.isLoggedIn, function(req, res) {
    var db = req.db;
    db.query('SELECT e.id as id FROM email e WHERE EXISTS (SELECT count(*) as count FROM email, snippet as s, tag as t where email.id = s.email_id and s.id = t.snippet_id and email.id = e.id group by email.id having count >= 10) ORDER BY RAND() limit 1;', function(err, rows, fields) {
        if (!err){
          if(rows[0]){
              var emailId = rows[0].id;
              db.query('(Select distinct entity_title, email_id, email_original, tf_idf from mv_tfidf as a where a.email_id =? order by tf_idf desc limit 10) union distinct (select entity_title, email_id, email_original, tf_idf from mv_tfidf as b where b.email_id !=? order by rand() limit 5);', [emailId, emailId], function(err, rows, fields) {
                  if (!err)
                    res.json(rows)
                  else
                    res.json('Error while performing Query.');
              });
          }else{
              res.json('No data returned.')
          }
        }
        else
          res.json('Error while performing Query.');
      });
});

router.get('/dataLabelTopic', pass.isLoggedIn, function(req, res) {
    var db = req.db;
    db.query('SELECT email.id as id FROM email WHERE EXISTS (SELECT count(*) as count FROM distribution WHERE email.id=email_id group by email_id having count >= 3) ORDER BY RAND() limit 1;', function(err, rows, fields) {
        if (!err){
          if(rows[0]){
              var emailId = rows[0].id;
              db.query('Select t1.email_id, t1.entity_title, t2.term from (SELECT d.email_id, d.entity_title, d.fraction from distribution d where d.email_id =? group by entity_title order by d.fraction limit 3) as t1, topic as t2 where t1.entity_title = t2.entity_title;', [emailId], function(err, rows, fields) {
                  if (!err)
                    res.json(rows)
                  else
                    res.json('Error while performing Query.');
              });
          }else{
              res.json('No data returned.')
          }
        }
        else
          res.json('Error while performing Query.');
      });
});

router.post('/dataLabelTopic', pass.isLoggedIn, function(req, res) {
    var db = req.db;
    var emailId = req.body.emailId;
    var userName = req.user.Username;
    var entityTitles = JSON.parse(req.body.entityTitles);
    var selectedEntityTitle = req.body.selectedEntityTitle;
    var originalEntityTitle = req.body.originalEntityTitle;
    var insert = [];
    for(var i = 0; i < entityTitles.length; i++){
        var entityTitle = entityTitles[i];
        var isOriginal;
        var isSelected;
        (originalEntityTitle == entityTitle ? isOriginal = true : isOriginal = false);
        (selectedEntityTitle == entityTitle ? isSelected = true : isSelected = false);
        insert.push([userName, emailId, entityTitle, isOriginal, isSelected]);
    }
    console.log(insert);
    db.query('Insert into topiclabelannotation(user_username, email_id, entity_title, original, selected) values ?;', [insert], function(err, rows, fields) {
        if (!err){
            console.log("Query performed.");
            res.json(rows)
        }else{
            res.json('Error while performing Query.'); 
        }
    });
});



router.post('/annotation', pass.isLoggedIn, function(req, res) {
    var db = req.db;
    var emailId = req.body.emailId;
    var userName = req.user.Username;
    var selectedTags = JSON.parse(req.body.selectedTags);
    var allTags = JSON.parse(req.body.allTags);
    var insert = [];
    for(var i = 0; i < allTags.length; i++){
        var entityTitle = allTags[i];
        var index = selectedTags.indexOf(entityTitle);
        var rank = 0;
        if(index > -1){
            rank = index + 1;
        }
        insert.push([userName, emailId, entityTitle, rank]);
    }
    console.log(insert);
    db.query('Insert into annotation(user_username, email_id, entity_title, rank) values ?;', [insert], function(err, rows, fields) {
        if (!err){
            console.log("Query performed.");
            res.json(rows)
        }else{
            res.json('Error while performing Query.'); 
        }
    });
});

module.exports = router;