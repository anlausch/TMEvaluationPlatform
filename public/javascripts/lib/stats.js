define(function () {
    return{
        populateData: function(){
            showPleaseWait();
            var self = this;
            $.when($.getJSON( '/statsMAP?mode=tfidf&onlyTop5=false'), 
                    $.getJSON( '/statsMAP?mode=tfidf&onlyTop5=true'),
                    $.getJSON( '/statsMAP?mode=llda&onlyTop5=false'), 
                    $.getJSON('/statsAccuracy?mode=label_mode'), 
                    $.getJSON('/statsAccuracy?mode=term_mode'),
                    $.getJSON('/statsNumberOfDocumentsEntitySelectionAnnotated'),
                    $.getJSON('/statsNumberOfAnnotations'),
                    $.getJSON('/statsNumberOfAnnotationsNoEntitySelected'),
                    $.getJSON('/statsNumberOfAnnotationsOnlyNoisySelected'),
                    $.getJSON('/statsAvgNumberOfEntitiesPicked'),
                    $.getJSON('/statsUserPrecision'),
                    $.getJSON('/statsTfidfPrecisionAtN?n=2'),
                    $.getJSON('/statsTfidfPrecisionAtN?n=3'),
                    $.getJSON('/statsTfidfPrecisionAtN?n=5'),
                    $.getJSON('/statsLLDAPrecision'),
                    $.getJSON('/statsNumberOfDocumentsTopicLabelAnnotated'),
                    $.getJSON('/statsNumberOfDocuments'))
                .done(function(d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17){
                    $('#idMAPTfidf').text("Mean Average Precision for the ranking generated by Tf-Idf (top 10 entities): " + d1[0]);
                    $('#idMAPTfidfTop5').text("Mean Average Precision for the ranking generated by Tf-Idf (top 5 entities): " + d2[0]);
                    $('#idMAPLlda').text("Mean Average Precision for the ranking generated by L-LDA: " + d3[0]);
                    $('#idAccuracyLM').text("Current Accuracy for the Label Mode: " + d4[0]["(tp.no + tn.no)/(tp.no + tn.no + fp.no + fn.no)"]);
                    $('#idAccuracyTM').text("Current Accuracy for the Term Mode: " + d5[0]["(tp.no + tn.no)/(tp.no + tn.no + fp.no + fn.no)"]);
                    $('#idNumberOfDocumentsEntitySelectionAnnotated').text("Number of annotated Documents: " + d6[0]["count"]);
                    $('#idNumberOfAnnotations').text("Number of Annotations: " + d7[0]["count"]);
                    $('#idNumberOfAnnotationsNoEntitySelected').text("Number of Annotations in which the User did not select any Entity: " + d8[0]["count"]);
                    $('#idNumberOfAnnotationsOnlyNoisySelected').text("Number of Annotations in which the User selected only noisy Entities: " + d9[0]["count"]);
                    $('#idAvgNumberOfEntitiesPicked').text("Average Number of Entities picked by the Users: " + d10[0]["average"]);
                    $('#idUserPrecision').text("Precision of the User Input: " + d11[0]["p"]);
                    $('#idTfidfPrecisionAt2').text("Precision of the Tf-Idf Ranking @2: " + d12[0]["p"]);
                    $('#idTfidfPrecisionAt3').text("Precision of the Tf-Idf Ranking @3: " + d13[0]["p"]);
                    $('#idTfidfPrecisionAt5').text("Precision of the Tf-Idf Ranking @5: " + d14[0]["p"]);
                    $('#idLLDAPrecision').text("Precision of the L-LDA Ranking (@5): " + d15[0]["p"]);
                    $('#idNumberOfDocumentsTopicLabelAnnotated').text("Number of annotated Documents: " + d16[0]["count"]);
                    $('#idNumberOfDocuments').text("Total Number of Documents: " + d17[0]["count"]);
                    hidePleaseWait();
                });
        }
    }
});