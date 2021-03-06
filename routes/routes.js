'use strict';
const express = require('express');
const router = express.Router();
const PassportWrapper = require('./../lib/PassportWrapper').createPassportWrapper();
const PasswordHelper = require('./../lib/PasswordHelper').createPasswordHelper();
const StatsEngine = require('./../lib/StatsEngine').createStatsEngine();


/**
 * Login page
 */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Topic Model Evaluation Platform', message: req.flash('loginMessage')});
});


/**
 * Signup page
 */
router.get('/signup', function(req, res, next) {
      res.render('signup', { title: 'Topic Model Evaluation Platform', messageError: req.flash('signupMessageError'), messageSuccess: req.flash('signupMessageSuccess')});
});


/**
 * Entity selection and ranking annotation page
 */
router.get('/entitySelection', PassportWrapper.isLoggedIn, function(req, res, next) {
  res.render('entitySelection', { title: 'Topic Model Evaluation Platform' });
});


/**
 * Label-Topic annotation page
 */
router.get('/labelTopic', PassportWrapper.isLoggedIn, function(req, res, next) {
    res.render('labelTopic', { title: 'Topic Model Evaluation Platform' });
});


/**
 * Topic-Label annotation page
 */
router.get('/topicLabel', PassportWrapper.isLoggedIn, function(req, res, next) {
    res.render('topicLabel', { title: 'Topic Model Evaluation Platform' });
});


/**
 * Statistics page
 */
router.get('/stats', PassportWrapper.isLoggedIn, function(req, res, next) {
    res.render('stats', { title: 'Topic Model Evaluation Platform' });
});


/**
 * Overview page
 */
router.get('/overview', PassportWrapper.isLoggedIn, function(req, res, next) {
    res.render('overview', { title: 'Topic Model Evaluation Platform' });
});


/**
 * Login service
 */
router.post('/login', PassportWrapper.passport.authenticate('local', { successRedirect: '/overview',
    failureRedirect: '/',
    failureFlash: true })
);


/**
 * Logout service
 */
router.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});


/**
 * Signup service
 */
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
                PasswordHelper.hashPassword(password, function(err, pwdHash, pwdSalt) {
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


/**
 * GET Entity selection and ranking annotation service
 */
router.get('/dataEntitySelection', PassportWrapper.isLoggedIn, function(req, res) {
    var db = req.db;
    db.query('SELECT d.id as id FROM document d WHERE EXISTS (SELECT count(*) as count FROM document, snippet as s, tag as t where document.id = s.documentid and s.id = t.snippetid and document.id = d.id group by document.id having count >= 10) ORDER BY RAND() limit 1;', function(err, rows, fields) {
        if (!err){
          if(rows[0]){
              var emailId = rows[0].id;
              db.query('(Select distinct entitytitle, documentid, documentoriginal, tfidf from mv_tfidf as a where a.documentid =? order by tfidf desc limit 10) union distinct (select entitytitle, documentid, documentoriginal, tfidf from mv_tfidf as b where b.documentid !=? order by rand() limit 5);', [emailId, emailId], function(err, rows, fields) {
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


/**
 * POST Entity selection and ranking annotation service
 */
router.post('/dataEntitySelection', PassportWrapper.isLoggedIn, function(req, res) {
    var db = req.db;
    var emailId = req.body.emailId;
    var userName = req.user.Username;
    var selectedTags = JSON.parse(req.body.selectedTags);
    var allTags = JSON.parse(req.body.allTags);
    var insert = [];
    console.log(emailId);
    console.log(userName);
    console.log(selectedTags);
    console.log(allTags)
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
    db.query('Insert into entityselectionannotation(username, documentid, entitytitle, rank) values ?;', [insert], function(err, rows, fields) {
        if (!err){
            console.log("Query performed.");
            res.json(rows)
        }else{
            res.json('Error while performing Query.'); 
        }
    });
});


/**
 * GET Topic-label relation annotation service
 */
router.get('/dataLabelTopic', PassportWrapper.isLoggedIn, function(req, res) {
    var db = req.db;
    db.query('SELECT document.id as id FROM document WHERE EXISTS (SELECT count(*) as count FROM documenttopicdistribution WHERE document.id=documentid group by documentid having count >= 3) ORDER BY RAND() limit 1;', function(err, rows, fields) {
        if (!err){
          if(rows[0]){
              var emailId = rows[0].id;
              db.query('Select t1.documentid, t1.entitytitle, t2.term from (SELECT d.documentid, d.entitytitle, d.fraction from documenttopicdistribution d where d.documentid =? group by entitytitle order by d.fraction limit 3) as t1, topic as t2 where t1.entitytitle = t2.entitytitle ORDER BY t1.entitytitle, t2.termweight DESC;', [emailId], function(err, rows, fields) {
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


/**
 * POST Topic-label relation annotation service
 */
router.post('/dataLabelTopic', PassportWrapper.isLoggedIn, function(req, res) {
    var db = req.db;
    var emailId = req.body.emailId;
    var userName = req.user.Username;
    var entityTitles = JSON.parse(req.body.entityTitles);
    var selectedEntityTitle = req.body.selectedEntityTitle;
    var originalEntityTitle = req.body.originalEntityTitle;
    var mode = req.body.mode;
    var insert = [];
    for(var i = 0; i < entityTitles.length; i++){
        var entityTitle = entityTitles[i];
        var isOriginal;
        var isSelected;
        (originalEntityTitle == entityTitle ? isOriginal = true : isOriginal = false);
        (selectedEntityTitle == entityTitle ? isSelected = true : isSelected = false);
        insert.push([userName, emailId, entityTitle, isOriginal, isSelected, mode]);
    }
    console.log(insert);
    db.query('Insert into topiclabelannotation (username, documentid, entitytitle, isoriginal, isselected, mode) values ?;', [insert], function(err, rows, fields) {
        if (!err){
            console.log("Query performed.");
            res.json(rows)
        }else{
            res.json('Error while performing Query.'); 
        }
    });
});


/**
 * GET Mean avg precision service
 */
router.get('/statsMAP', function(req, res, next) {// authorization missing
    var db = req.db;
    var mode = "";
    var onlyTop4 = false;
    if(JSON.parse(req.query.onlyTop4) === true) onlyTop4 = true;
    if(req.query.mode){
        if(req.query.mode === "tfidf" || req.query.mode === "llda"){
            mode = req.query.mode;
        }else{
            return res.json("Invalid Parameter value.");
        }
    }else{
        return res.json("Invalid Parameter value.");
    }
    console.log("Mode: " + mode);
    StatsEngine.calculateMAP(mode, onlyTop4, function(result){
        res.json(result);
    });
});


/**
 * GET accuracy service
 */
router.get('/statsAccuracy', function(req, res, next) {// authorization missing
    var db = req.db;
    var mode = "";
    if(req.query.mode){
        (req.query.mode === "label_mode" || req.query.mode === "term_mode" ? mode = req.query.mode : mode="");
    }
    StatsEngine.calculateAccuracy(mode, function(result){
        res.json(result);
    });
});


/**
 * GET number of documents service
 */
router.get('/statsNumberOfDocuments', function(req, res, next) {// authorization missing
    var db = req.db;
    StatsEngine.getNumberOfDocuments(function(result){
        res.json(result);
    });
});


/**
 * GET number of documents annotated
 */
router.get('/statsNumberOfDocumentsAnnotated', function(req, res, next) {// authorization missing
    var db = req.db;
    if(req.query.task){
        if(req.query.task === "entity_selection"){
            StatsEngine.getNumberOfDocumentsEntitySelectionAnnotated(function(result){
                res.json(result);
            });
        }else if(req.query.task === "topic_label_relation"){
            var mode = "";
            if(req.query.mode){
                (req.query.mode === "label_mode" || req.query.mode === "term_mode" ? mode = req.query.mode : mode="");
            }
            StatsEngine.getNumberOfDocumentsTopicLabelAnnotated(mode, function(result){
                res.json(result);
            });
        }else{
            res.json("Invalid parameter value.");
        }
    }


});


/**
 * GET number of annotations
 */
router.get('/statsNumberOfAnnotations', function(req, res, next) {// authorization missing
    var db = req.db;
    if(req.query.task){
        if(req.query.task === "entity_selection"){
            StatsEngine.getNumberOfEntitySelectionAnnotations(function(result){
                res.json(result);
            });
        }else if(req.query.task === "topic_label_relation"){
            var mode = "";
            if(req.query.mode){
                (req.query.mode === "label_mode" || req.query.mode === "term_mode" ? mode = req.query.mode : mode="");
            }
            StatsEngine.getNumberOfTopicLabelAnnotations(mode, function(result){
                res.json(result);
            });
        }else{
            res.json("Invalid parameter value.");
        }
    }
});


/**
 * GET number of annotations in which the user did select nothing
 */
router.get('/statsNumberOfAnnotationsNothingSelected', function(req, res, next) {// authorization missing
    var db = req.db;
    if(req.query.task){
        if(req.query.task === "entity_selection"){
            StatsEngine.getNumberOfEntitySelectionAnnotationsNothingSelected(function(result){
                res.json(result);
            });
        }else if(req.query.task === "topic_label_relation"){
            var mode = "";
            if(req.query.mode){
                (req.query.mode === "label_mode" || req.query.mode === "term_mode" ? mode = req.query.mode : mode="");
            }
            StatsEngine.getNumberOfTopicLabelAnnotationsNothingSelected(mode, function(result){
                res.json(result);
            });
        }else{
            res.json("Invalid parameter value.");
        }
    }
});


/**
 * GET number of annotations in which the user only selected noisy entities
 */
router.get('/statsNumberOfAnnotationsOnlyNoisySelected', function(req, res, next) {// authorization missing
    var db = req.db;
    StatsEngine.getNumberOfAnnotationsOnlyNoisySelected(function(result){
        res.json(result);
    });
});


/**
 * GET avg number of entities picked by the user
 */
router.get('/statsAvgNumberOfEntitiesPicked', function(req, res, next) {// authorization missing
    var db = req.db;
    StatsEngine.getAvgNumberOfEntitiesPicked(function(result){
        res.json(result);
    });
});


/**
 * GET recall on the user selection
 */
router.get('/statsRecallOnUserSelection', function(req, res, next) {// authorization missing
    var db = req.db;
    StatsEngine.getUserPrecision(function(result){
        res.json(result);
    });
});


/**
 * GET precision of the Tf-Idf ranking at k
 */
router.get('/statsTfidfPrecisionAtK', function(req, res, next) {// authorization missing
    var db = req.db;
    var k = (req.query.k == 1 || req.query.k == 2 || req.query.k == 3 || req.query.k == 5 || req.query.k == 10 ? req.query.k : 5);
    StatsEngine.getTfidfPrecisionAtN(k, function(result){
        res.json(result);
    });
});


/**
 * GET recall at k of the tfidf ranking
 */
router.get('/statsTfidfRecallAtK', function(req, res, next) {// authorization missing
    var db = req.db;
    var k = (req.query.k == 1 || req.query.k == 2 || req.query.k == 3 || req.query.k == 5 || req.query.k == 10 ? req.query.k : 5);
    StatsEngine.getTfidfRecallAtN(k, function(result){
        res.json(result);
    });
});



/**
 * GET precision of the L-LDA ranking (at 4)
 */
router.get('/statsLLDAPrecision', function(req, res, next) {// authorization missing
    var db = req.db;
    StatsEngine.getLLDAPrecision(function(result){
        res.json(result);
    });
});


module.exports = router;