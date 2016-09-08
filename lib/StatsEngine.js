"use strict;"
const async = require('async');
const DBWrapper = require('./DBWrapper').createDBWrapper();

var StatsEngine = function(){
    this.db = DBWrapper.db;
}


/**
 * Retrieves the number of documents from the database
 * 
 * @returns {Integer} count
 * 
 */
StatsEngine.prototype.getNumberOfDocuments = function(fnCallback){
    var db = this.db;
    db.query('SELECT COUNT(*) AS count FROM document', function(err, rows, fields) {
        if (!err){
            if(rows){
                fnCallback(rows[0]);
            }
        }
   });
}


/**
 * Retrieves the number of documents from the database, which are annotated by a user regarding the entity selection
 * 
 * @returns {Integer} count
 * 
 */
StatsEngine.prototype.getNumberOfDocumentsEntitySelectionAnnotated = function(fnCallback){
    var db = this.db;
    db.query('SELECT COUNT(*) AS count FROM (SELECT DISTINCT documentid FROM entityselectionannotation) AS t', function(err, rows, fields) {
        if (!err){
            if(rows){
                fnCallback(rows[0]);
            }
        }
   });
}


/**
 * Retrieves the number of documents from the database, which are annotated by a user regarding the topic-label relation
 * 
 * @returns {Integer} count
 * 
 */
StatsEngine.prototype.getNumberOfDocumentsTopicLabelAnnotated = function(fnCallback){
    var db = this.db;
    db.query('SELECT COUNT(DISTINCT documentid) AS count FROM topiclabelannotation', function(err, rows, fields) {
        if (!err){
            if(rows){
                fnCallback(rows[0]);
            }
        }
   });
}


/**
 * Retrieves the number of annotations of the entity selection and ranking from the database
 * 
 * @returns {Integer} count
 * 
 */
StatsEngine.prototype.getNumberOfEntitySelectionAnnotations = function(fnCallback){
    var db = this.db;
    db.query('SELECT COUNT(*) AS count FROM (SELECT DISTINCT documentid, userusername, timestamp FROM entityselectionannotation) AS t', function(err, rows, fields) {
        if (!err){
            if(rows){
                fnCallback(rows[0]);
            }
        }
   });
}


/**
 * Retrieves the number of annotations of the topic-label relation from the database
 * 
 * @returns {Integer} count
 * 
 */
StatsEngine.prototype.getNumberOfTopicLabelAnnotations = function(fnCallback){
    var db = this.db;
    db.query('SELECT COUNT(DISTINCT userusername, documentid, timestamp) AS count FROM topiclabelannotation', function(err, rows, fields) {
        if (!err){
            if(rows){
                fnCallback(rows[0]);
            }
        }
   });
}


/**
 * Retrieves the number of entity selection and ranking annotations in which the user did not select any entity
 * 
 * @returns {Integer} count
 * 
 */
StatsEngine.prototype.getNumberOfEntitySelectionAnnotationsNothingSelected = function(fnCallback){
    var db = this.db;
    db.query('SELECT COUNT(*) AS count FROM (SELECT rank, documentid, userusername, timestamp FROM entityselectionannotation GROUP BY rank, documentid, userusername, timestamp HAVING COUNT(*)=15) AS t', function(err, rows, fields) {
        if (!err){
            if(rows){
                fnCallback(rows[0]);
            }
        }
   });
}


/**
 * Retrieves the number of topic-label relation annotations in which the user did select nothing
 * 
 * @returns {Integer} count
 * 
 */
StatsEngine.prototype.getNumberOfTopicLabelAnnotationsNothingSelected = function(fnCallback){
    var db = this.db;
    db.query('SELECT COUNT(*) AS count FROM (SELECT userusername, timestamp, documentid, isselected FROM topiclabelannotation GROUP BY userusername, timestamp, documentid, isselected HAVING COUNT(*) = 3) AS t', function(err, rows, fields) {
        if (!err){
            if(rows){
                fnCallback(rows[0]);
            }
        }
   });
}


/**
 * Retrieves the number of annotations in which the user only selected noisy entities
 * 
 * @returns {Integer} count
 * 
 */
StatsEngine.prototype.getNumberOfAnnotationsOnlyNoisySelected = function(fnCallback){
    var db = this.db;
    db.query('SELECT COUNT(*) AS count FROM (SELECT DISTINCT a.documentid '
            + 'FROM entityselectionannotation a LEFT OUTER JOIN (SELECT documentid, entitytitle FROM '
            + '(SELECT documentid, entitytitle, tfIdf, @doc_rank:=IF(@current_doc = documentId, @doc_rank + 1, 1) '
            + 'AS doc_rank, @current_doc:=documentId FROM mv_tfidf ORDER BY documentId , tfIdf DESC) ranked WHERE doc_rank <= 10) AS b '
            + 'ON a.documentid = b.documentid AND a.entitytitle = b.entitytitle WHERE b.entitytitle IS NULL AND rank > 0 GROUP BY rank , documentid, timestamp HAVING COUNT(*) != 0) '
            + 'AS noisyselected, (SELECT t.documentid FROM (SELECT documentid, entitytitle FROM '
            + '(SELECT documentid, entitytitle, tfIdf, @doc_rank:=IF(@current_doc = documentId, @doc_rank + 1, 1) AS doc_rank, @current_doc:=documentId '
            + 'FROM mv_tfidf ORDER BY documentId , tfIdf DESC) ranked WHERE doc_rank <= 10) AS t, '
            + '(SELECT * FROM entityselectionannotation) AS t2 WHERE t.documentid = t2.documentid AND t.entitytitle = t2.entitytitle '
            + 'GROUP BY t2.documentid , t2.userusername , t2.timestamp , rank HAVING COUNT(*) = 10) AS norealentityselected '
            + 'WHERE noisyselected.documentid = norealentityselected.documentid ', function(err, rows, fields) {
            
        if (!err){
            if(rows){
                fnCallback(rows[0]);
            }
        }
   });
}


/**
 * Retrieves the avg number of entities picked by the user
 * 
 * @returns {double} average
 * 
 */
StatsEngine.prototype.getAvgNumberOfEntitiesPicked = function(fnCallback){
    var db = this.db;
    db.query('SELECT AVG(c) as average FROM (SELECT COUNT(*) AS c FROM velsen_europarl_final.entityselectionannotation WHERE rank > 0 GROUP BY userusername, timestamp, documentid) AS d', function(err, rows, fields) {
        if (!err){
            if(rows){
                fnCallback(rows[0]);
            }
        }
   });
}


/**
 * Retrieves the precision of the user input
 * 
 * @returns {double} p
 * 
 */
StatsEngine.prototype.getUserPrecision = function(fnCallback){
    var db = this.db;
    db.query('SELECT tp/tpfp AS p FROM (SELECT COUNT(*) AS tpfp FROM entityselectionannotation a WHERE rank > 0) AS tpfp, (SELECT COUNT(*) AS tp FROM (SELECT documentId, entityTitle, tfIdf FROM (SELECT documentId, entityTitle, tfIdf, @doc_rank := IF(@current_doc = documentId, @doc_rank + 1, 1) AS doc_rank, @current_doc := documentId FROM mv_tfidf ORDER BY documentId, tfIdf DESC) ranked WHERE doc_rank <= 10) AS a, entityselectionannotation b WHERE a.documentId = b.documentid AND a.entitytitle = b.entitytitle AND rank > 0) AS tp', function(err, rows, fields) {
        if (!err){
            if(rows){
                fnCallback(rows[0]);
            }
        }
   });
}


/**
 * Retrieves the tfidf recall for the top 5 entities
 * 
 * @returns {double} r
 * 
 */
StatsEngine.prototype.getTfidfRecall = function(fnCallback){
    var db = this.db;
    db.query('SELECT tp/tpfn AS r FROM (SELECT COUNT(*) AS tp FROM '
            +'( SELECT documentId, entityTitle, tfIdf FROM (SELECT documentId, entityTitle, tfIdf, @doc_rank := IF(@current_doc = documentId, @doc_rank + 1, 1) AS doc_rank, '
            +'@current_doc := documentId FROM mv_tfidf ORDER BY documentId, tfIdf DESC) ranked WHERE doc_rank <= 5) AS a, '
            +'entityselectionannotation b WHERE a.documentId = b.documentid AND a.entitytitle = b.entitytitle AND rank > 0) AS tp, '
            +'(SELECT COUNT(*) AS tpfn FROM entityselectionannotation b WHERE rank !=0) AS tpfn', function(err, rows, fields) {
        if (!err){
            if(rows){
                fnCallback(rows[0]);
            }
        }
   });
}


/**
 * Retrieves the tfidf precision for the top n entities
 * ignoring the annotations where the user did not select any entity 
 * 
 * @param {integer} n
 * @returns {double} p
 * 
 */
StatsEngine.prototype.getTfidfPrecisionAtN = function(n, fnCallback){
    var db = this.db;
    
    db.query('SELECT AVG(p) AS p FROM (SELECT tp, documentid, n, tp/n AS p FROM '
            +'(SELECT COUNT(*) AS tp, a.documentid, ? AS n FROM (SELECT documentId, entityTitle, tfIdf FROM '
            +'(SELECT documentId, entityTitle, tfIdf, @doc_rank := IF(@current_doc = documentId, @doc_rank + 1, 1) AS doc_rank, '
            +'@current_doc := documentId FROM mv_tfidf ORDER BY documentId, tfIdf DESC) ranked WHERE doc_rank <= ?) AS a, '
            +'entityselectionannotation b WHERE a.documentId = b.documentid AND a.entitytitle = b.entitytitle AND rank > 0 GROUP BY a.documentid) AS tpperdoc) AS pperdoc', [n, n], function(err, rows, fields) {
        if (!err){
            if(rows){
                fnCallback(rows[0]);
            }
        }
   });
}


/**
 * Retrieves the L-LDA precision
 * ignoring the annotations where the user did not select any entity 
 * 
 * @returns {double} p
 * 
 */
StatsEngine.prototype.getLLDAPrecision = function(fnCallback){
    var db = this.db;
    db.query('SELECT AVG(p) AS p FROM (SELECT tp, documentid, n, tp/n AS p FROM '
            +'(SELECT a.documentid, COUNT(*) AS tp, 4 AS n FROM documenttopicdistribution a, entityselectionannotation b '
            +'WHERE a.documentid = b. documentid AND a.entitytitle = b.entitytitle AND rank > 0 GROUP BY a.documentid) AS tpperdoc) AS pperdoc', function(err, rows, fields) {
        if (!err){
            if(rows){
                fnCallback(rows[0]);
            }
        }
   });
}


/**
 * Calculates accuracy according to the following formula: ((tp + tn)/(tp + fp + fn + tn))
 * and depending on the value given by mode (filter)
 * 
 * @params mode (can be either empty string, 'term_mode' or 'label_mode'), callback
 * @returns accuracy
 * 
 */
StatsEngine.prototype.calculateAccuracy = function(mode, fnCallback){
    var db = this.db;
    if(mode === "term_mode" || mode === "label_mode"){
        db.query('Select (tp.no + tn.no)/(tp.no + tn.no + fp.no + fn.no) from (Select count(*) as no from topiclabelannotation where isoriginal=1 and isselected=1 and mode=?) as tp,'
                + '(Select count(*) as no from topiclabelannotation where isoriginal=0 and isselected=0 and mode=?) as tn,'
                + '(Select count(*) as no from topiclabelannotation where isoriginal=1 and isselected=0 and mode=?) as fp,'
                + '(Select count(*) as no from topiclabelannotation where isoriginal=0 and isselected=1 and mode=?) as fn;', [mode, mode, mode, mode], function(err, rows, fields) {
            if (!err){
                if(rows){
                    fnCallback(rows[0]);
                }
            }
       });
    }else{
        db.query('Select (tp.no + tn.no)/(tp.no + tn.no + fp.no + fn.no) from (Select count(*) as no from topiclabelannotation where isoriginal=1 and isselected=1) as tp,'
                + '(Select count(*) as no from topiclabelannotation where isoriginal=0 and isselected=0) as tn,'
                + '(Select count(*) as no from topiclabelannotation where isoriginal=1 and isselected=0) as fp,'
                + '(Select count(*) as no from topiclabelannotation where isoriginal=0 and isselected=1) as fn;', function(err, rows, fields) {
            if (!err){
                if(rows){
                    fnCallback(rows[0]);
                }
            }else{
                console.log("Error while performing query");
            }
       });
    }

}


/**
 * Calculates Mean Avg Precision 
 * and takes as ranking either tf-idf value calculated by us
 * or the document-topic distribution given by llda
 * ignoring the annotations where the user did not select any entity 
 * 
 * @params mode, possible values: tfidf or llda
 * @returns meanAvgPrecision
 * 
 */
StatsEngine.prototype.calculateMAP = function(mode, onlyTop4, fnCallback){
    var db = this.db;
    var self = this;
    db.query('Select distinct documentid, timestamp from entityselectionannotation;', function(err, rows, fields) {
        if (!err){
          if(rows){
              var noDocs = rows.length;
              var avgPrecisions = [];
              console.log("Distinct documentids, timestamps from entityselectionannotation: ");
              // Loop only for logging. To be removed.
              for(var i in rows){
                  console.log(rows[i].documentid, rows[i].timestamp);
              }
              console.log("Number of documents: " + noDocs);
              console.log("Initial array of avg_precisions: " + avgPrecisions);
              //ASYNC
              async.map(
                    rows,
                    function(row, callback){
                        return (mode === "tfidf" ? self._calculateAVGPrecisionTfIdf(row.documentid, row.timestamp, onlyTop4, db, callback) : self._calculateAVGPrecisionLLDA(row.documentid, row.timestamp, onlyTop4, db, callback));
                    },
                    function(err, results){
                        for(avgPrecision in results){
                            if(results[avgPrecision] !== null) avgPrecisions.push(results[avgPrecision])
                        }
                        console.log("FINAL ARRAY OF AVG PRECISIONS: " + avgPrecisions);
                        var meanAvgPrecision = (avgPrecisions.length > 0 ? (avgPrecisions.reduce((a, b) => a + b, 0))/avgPrecisions.length : 0);
                        console.log("NUMBER OF AVG PRECISIONS: " + avgPrecisions.length);
                        console.log("MEAN AVG PRECISION: " + meanAvgPrecision);
                        fnCallback(meanAvgPrecision);
                    });
          }else{
              return 'No data returned.';
          }
        }
        else
          return 'Error while performing Query.';
    });
};


/**
 * Calculates AVGPrecision for one Document 
 * and takes as ranking the tf-idf value calculated by us
 * 
 * @params email_id, timestamp, db, callback
 * @returns avgPrecision
 * 
 */
StatsEngine.prototype._calculateAVGPrecisionTfIdf = function(email_id, timestamp, onlyTop4, db, callback){
    const self = this;
    db.query('select a.documentid, a.entitytitle, a.rank, d.tfidf as ourrank from entityselectionannotation a left outer join mv_tfidf d on (d.documentid = a.documentid and d.entitytitle = a.entitytitle)  where a.documentid =? and a.timestamp=?  order by ourrank desc, rank asc;', [email_id, timestamp], function(err, rows, fields) {
        if (!err){
            var allNull = rows.every(function(element) {
                if(element) return element.ourrank == null;
            });
            if(allNull) return callback(null, null);
            var avgPrecision = self._getAVGPrecision(rows, onlyTop4);
            console.log("-- AVG PRECISION FOR DOCUMENT: " + avgPrecision);
            return callback(null, avgPrecision);
        }else{
            res.json('Error while performing Query.');
        }
    });

};


/**
 * Calculates AVGPrecision for one Document 
 * and takes as ranking the document-topic distribution returned by llda
 * 
 * @params email_id, timestamp, db, callback
 * @returns avgPrecision
 * 
 */
StatsEngine.prototype._calculateAVGPrecisionLLDA = function(email_id, timestamp, onlyTop4, db, callback){
    const self = this;
    db.query('select a.documentid, a.entitytitle, a.rank, d.fraction as ourrank from entityselectionannotation a left outer join documenttopicdistribution d on (d.documentid = a.documentid and d.entitytitle = a.entitytitle)  where a.documentid =? and a.timestamp=?  order by ourrank desc, rank asc;', [email_id, timestamp], function(err, rows, fields) {
        if (!err){
            var allNull = rows.every(function(element) {
                if(element) return element.ourrank == null;
            });
            if(allNull) return callback(null, null);
            console.log("Query succeeded")
            var avgPrecision = self._getAVGPrecision(rows, onlyTop4);
            console.log("-- AVG PRECISION FOR DOCUMENT: " + avgPrecision);
            return callback(null, avgPrecision);
        }else{
            res.json('Error while performing Query.');
        }
    });

};


/**
 * Calculates AVGPrecision for one Document
 * 
 * @params rows, ranked rows
 * @returns AVGPrecision
 * 
 */
StatsEngine.prototype._getAVGPrecision = function(rows, onlyTop4){
    const isIrrelevant = 0;
    // if no single entity is picked by the user, ignore the doc
    var allIrrelevant = rows.every(function(element) {
        if(element) return element.rank == isIrrelevant;
    });
    if(allIrrelevant) return null;
    
    // take only the top 4 tfidf values if requested, otherwise the top 10, as they belong to the doc
    rows = (onlyTop4 ? rows.slice(0,4) : rows.slice(0,10));

    var countRelevant = 0;
    var countSeen = 0;
    precisions = [];
    console.log("-- Initial count of relevant entities: " + countRelevant);
    console.log("-- Initial count of seen entities: " + countSeen);
    console.log("-- Initial array of precisions: " + precisions);
    for(var row in rows){
        var entry = rows[row];
        countSeen++;
        console.log("---- Current entry: " + entry.email_id + " " + entry.entity_title + " rank: " + entry.rank);
        console.log("---- Count of seen entities: " + countSeen);
        if(entry.rank != isIrrelevant){
            console.log("---- Is relevant!");
            countRelevant++;
            precisions[row] = countRelevant/countSeen;
            console.log("---- Array of precisions: " + precisions);
            console.log("---- Count of relevant entities: " + countRelevant);
        }else{
            console.log("---- Is not relevant!");
            precisions[row] = 0;
            console.log("---- Array of precisions: " + precisions);
            console.log("---- Count of relevant entities: " + countRelevant);
        }
    }
    return (precisions.length > 0 && countRelevant !== 0) ? precisions.reduce((a, b) => a + b, 0)/countRelevant : 0;
}


/**
 * Factory function
 *
 * @param db
 * @returns {StatsEngine}
 */
function createStatsEngine(db) {
    return new StatsEngine(db);
}


module.exports = {
    createStatsEngine: createStatsEngine
};