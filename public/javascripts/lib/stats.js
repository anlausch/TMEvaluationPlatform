define(function () {
    return{
        populateData: function(){
            showPleaseWait();
            var self = this;
            $.when($.getJSON( '/statsMAP?mode=tfidf&onlyTop5=false'), 
                    $.getJSON( '/statsMAP?mode=tfidf&onlyTop5=true'),
                    $.getJSON( '/statsMAP?mode=llda&onlyTop5=false'), 
                    $.getJSON('/statsAccuracy?mode=label_mode'), 
                    $.getJSON('/statsAccuracy?mode=term_mode'))
                .done(function(d1, d2, d3, d4, d5){
                    $('#idMAPTfidf').text("Current Mean Average Precision for the ranking generated by Tf-Idf (top 10 entities): " + d1[0]);
                    $('#idMAPTfidfTop5').text("Current Mean Average Precision for the ranking generated by Tf-Idf (top 5 entities): " + d2[0]);
                    $('#idMAPLlda').text("Current Mean Average Precision for the ranking generated by L-LDA: " + d3[0]);
                    $('#idAccuracyLM').text("Current Accuracy for the Label Mode: " + d4[0]["(tp.no + tn.no)/(tp.no + tn.no + fp.no + fn.no)"]);
                    $('#idAccuracyTM').text("Current Accuracy for the Term Mode: " + d5[0]["(tp.no + tn.no)/(tp.no + tn.no + fp.no + fn.no)"]);
                    hidePleaseWait();
                });
        }
    }
});