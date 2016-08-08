define(function () {
    return{
        populateData: function(){
            showPleaseWait();
            var self = this;
            $.when($.getJSON( '/statsMAP?mode=tfidf'), 
                    $.getJSON( '/statsMAP?mode=llda'), 
                    $.getJSON('/statsAccuracy?mode=label_mode'), 
                    $.getJSON('/statsAccuracy?mode=term_mode'))
                .done(function(d1, d2, d3, d4){
                    $('#idMAPTfidf').text("Current Mean Average Precision for the ranking generated by Tf-Idf: " + d1[0]);
                    $('#idMAPLlda').text("Current Mean Average Precision for the ranking generated by L-LDA: " + d2[0]);
                    $('#idAccuracyLM').text("Current Accuracy for the Label Mode: " + d3[0]["(tp.no + tn.no)/(tp.no + tn.no + fp.no + fn.no)"]);
                    $('#idAccuracyTM').text("Current Accuracy for the Term Mode: " + d4[0]["(tp.no + tn.no)/(tp.no + tn.no + fp.no + fn.no)"]);
                    hidePleaseWait();
                });
        }
    }
});