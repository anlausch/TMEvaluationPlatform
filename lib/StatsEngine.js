"use strict;"

const async = require('async');

var StatsEngine = function(db){
    this.db = db;
}



StatsEngine.prototype.calculateAccuracy = function(fnCallback){
    var db = this.db;
    var self = this;
}



StatsEngine.prototype.calculateMAP = function(fnCallback){
    var db = this.db;
    var self = this;
    db.query('Select distinct email_id, timestamp from annotation;', function(err, rows, fields) {
        if (!err){
          if(rows){
              var no_docs = rows.length;
              var avg_precisions = [];
              console.log("Distinct email_ids, timestamps from annotation: ");
              // Loop only for logging. To be removed.
              for(var i in rows){
                  console.log(rows[i].email_id, rows[i].timestamp);
              }
              console.log("Number of documents: " + no_docs);
              console.log("Initial array of avg_precisions: " + avg_precisions);
              //ASYNC
              async.map(
                    rows,
                    function(row, callback){
                        return self._calculateAVGPrecision(row.email_id, row.timestamp, db, callback);
                    },
                    function(err, results){
                        avg_precisions = results;
                        console.log("FINAL ARRAY OF AVG PRECISIONS: " + avg_precisions);
                        var mean_avg_precision = (avg_precisions.reduce((a, b) => a + b, 0))/avg_precisions.length;
                        console.log("NUMBER OF AVG PRECISIONS: " + avg_precisions.length);
                        console.log("MEAN AVG PRECISION: " + mean_avg_precision);
                        fnCallback(mean_avg_precision);
                    });
          }else{
              return 'No data returned.';
          }
        }
        else
          return 'Error while performing Query.';
    });
};


StatsEngine.prototype._calculateAVGPrecision = function(email_id, timestamp, db, callback){
    const is_irrelevant = 0;
    db.query('select m.email_id, m.entity_title, a.rank, m.tf_idf, a.timestamp from emailforensics.mv_tfidf m, emailforensics.annotation a where m.email_id =? and a.timestamp=? and m.entity_title = a.entity_title and m.email_id = a.email_id order by tf_idf desc;', [email_id, timestamp], function(err, rows, fields) {
        if (!err){
            var count_relevant = 0;
            var count_seen = 0;
            precisions = [];
            console.log("-- Initial count of relevant entities: " + count_relevant);
            console.log("-- Initial count of seen entities: " + count_seen);
            console.log("-- Initial array of precisions: " + precisions);
            for(var row in rows){
                var entry = rows[row];
                count_seen++;
                console.log("---- Current entry: " + entry.email_id + " " + entry.entity_title + " rank: " + entry.rank + " tf_idf: " + entry.tf_idf);
                console.log("---- Count of seen entities: " + count_seen);
                if(entry.rank != is_irrelevant){
                    console.log("---- Is relevant!");
                    count_relevant++;
                    precisions[row] = count_relevant/count_seen;
                    console.log("---- Array of precisions: " + precisions);
                    console.log("---- Count of relevant entities: " + count_relevant);
                }else{
                    console.log("---- Is not relevant!");
                    precisions[row] = 0;
                    console.log("---- Array of precisions: " + precisions);
                    console.log("---- Count of relevant entities: " + count_relevant);
                }
            }
            var avg_precision = (precisions.reduce((a, b) => a + b, 0))/count_relevant;
            console.log("-- AVG PRECISION FOR DOCUMENT: " + avg_precision);
            return callback(null, avg_precision);
        }else{
            res.json('Error while performing Query.');
        }
    });

};



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