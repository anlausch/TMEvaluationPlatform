"use strict;"
const async = require('async');

var StatsEngine = function(db){
    this.db = db;
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
        db.query('Select (tp.no + tn.no)/(tp.no + tn.no + fp.no + fn.no) from (Select count(*) as no from `EmailForensics`.`TopicLabelAnnotation` where original=1 and selected=1 and mode=?) as tp,'
                + '(Select count(*) as no from `EmailForensics`.`TopicLabelAnnotation` where original=0 and selected=0 and mode=?) as tn,'
                + '(Select count(*) as no from `EmailForensics`.`TopicLabelAnnotation` where original=1 and selected=0 and mode=?) as fp,'
                + '(Select count(*) as no from `EmailForensics`.`TopicLabelAnnotation` where original=0 and selected=1 and mode=?) as fn;', [mode, mode, mode, mode], function(err, rows, fields) {
            if (!err){
                if(rows){
                    fnCallback(rows[0]);
                }
            }
       });
    }else{
        db.query('Select (tp.no + tn.no)/(tp.no + tn.no + fp.no + fn.no) from (Select count(*) as no from `EmailForensics`.`TopicLabelAnnotation` where original=1 and selected=1) as tp,'
                + '(Select count(*) as no from `EmailForensics`.`TopicLabelAnnotation` where original=0 and selected=0) as tn,'
                + '(Select count(*) as no from `EmailForensics`.`TopicLabelAnnotation` where original=1 and selected=0) as fp,'
                + '(Select count(*) as no from `EmailForensics`.`TopicLabelAnnotation` where original=0 and selected=1) as fn;', function(err, rows, fields) {
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
 * 
 * @params mode, possible values: tfidf or llda
 * @returns meanAvgPrecision
 * 
 */
StatsEngine.prototype.calculateMAP = function(mode, fnCallback){
    var db = this.db;
    var self = this;
    db.query('Select distinct email_id, timestamp from annotation;', function(err, rows, fields) {
        if (!err){
          if(rows){
              var noDocs = rows.length;
              var avgPrecisions = [];
              console.log("Distinct email_ids, timestamps from annotation: ");
              // Loop only for logging. To be removed.
              for(var i in rows){
                  console.log(rows[i].email_id, rows[i].timestamp);
              }
              console.log("Number of documents: " + noDocs);
              console.log("Initial array of avg_precisions: " + avgPrecisions);
              //ASYNC
              async.map(
                    rows,
                    function(row, callback){
                        return (mode === "tfidf" ? self._calculateAVGPrecisionTfIdf(row.email_id, row.timestamp, db, callback) : self._calculateAVGPrecisionLLDA(row.email_id, row.timestamp, db, callback));
                    },
                    function(err, results){
                        avgPrecisions = results;
                        console.log("FINAL ARRAY OF AVG PRECISIONS: " + avgPrecisions);
                        // TODO: Avoid division by 0
                        var meanAvgPrecision = (avgPrecisions.reduce((a, b) => a + b, 0))/avgPrecisions.length;
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
StatsEngine.prototype._calculateAVGPrecisionTfIdf = function(email_id, timestamp, db, callback){
    const self = this;
    db.query('select m.email_id, m.entity_title, a.rank, m.tf_idf, a.timestamp from emailforensics.mv_tfidf m, emailforensics.annotation a where m.email_id =? and a.timestamp=? and m.entity_title = a.entity_title and m.email_id = a.email_id order by tf_idf desc, rank asc;', [email_id, timestamp], function(err, rows, fields) {
        if (!err){
            var avgPrecision = self._getAVGPrecision(rows);
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
StatsEngine.prototype._calculateAVGPrecisionLLDA = function(email_id, timestamp, db, callback){
    const self = this;
    db.query('select d.email_id, d.entity_title, a.rank, d.fraction, a.timestamp from distribution d, annotation a where d.email_id =? and a.timestamp=? and d.entity_title = a.entity_title and d.email_id = a.email_id order by fraction desc, rank asc;', [email_id, timestamp], function(err, rows, fields) {
        if (!err){
            var avgPrecision = self._getAVGPrecision(rows);
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
StatsEngine.prototype._getAVGPrecision = function(rows){
    const isIrrelevant = 0;
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