define(function () {
    return{
        populateData: function(){
            showPleaseWait();
            var self = this;
            $.when($.getJSON( '/statsMAP?mode=tfidf&onlyTop4=false'), 
                    $.getJSON( '/statsMAP?mode=tfidf&onlyTop4=true'),
                    $.getJSON( '/statsMAP?mode=llda&onlyTop4=false'), 
                    $.getJSON('/statsAccuracy?mode=label_mode'), 
                    $.getJSON('/statsAccuracy?mode=term_mode'),
                    $.getJSON('/statsNumberOfDocumentsAnnotated?task=entity_selection'),
                    $.getJSON('/statsNumberOfAnnotations?task=entity_selection'),
                    $.getJSON('/statsNumberOfAnnotationsNothingSelected?task=entity_selection'),
                    $.getJSON('/statsNumberOfAnnotationsOnlyNoisySelected'),
                    $.getJSON('/statsAvgNumberOfEntitiesPicked'),
                    $.getJSON('/statsRecallOnUserSelection'),
                    $.getJSON('/statsTfidfPrecisionAtK?k=2'),
                    $.getJSON('/statsTfidfPrecisionAtK?k=3'),
                    $.getJSON('/statsTfidfPrecisionAtK?k=5'),
                    $.getJSON('/statsLLDAPrecision'),
                    $.getJSON('/statsNumberOfDocumentsAnnotated?task=topic_label_relation'),
                    $.getJSON('/statsNumberOfAnnotations?task=topic_label_relation'),
                    $.getJSON('/statsNumberOfAnnotationsNothingSelected?task=topic_label_relation'),
                    $.getJSON('/statsTfidfPrecisionAtK?k=4'),
                    $.getJSON('/statsTfidfRecallAtK?k=2'),
                    $.getJSON('/statsTfidfRecallAtK?k=3'),
                    $.getJSON('/statsTfidfRecallAtK?k=4'),
                    $.getJSON('/statsTfidfRecallAtK?k=5'),
                    $.getJSON('/statsNumberOfDocumentsAnnotated?task=topic_label_relation&mode=label_mode'),
                    $.getJSON('/statsNumberOfDocumentsAnnotated?task=topic_label_relation&mode=term_mode'),
                    $.getJSON('/statsNumberOfAnnotations?task=topic_label_relation&mode=label_mode'),
                    $.getJSON('/statsNumberOfAnnotations?task=topic_label_relation&mode=term_mode'),
                    $.getJSON('/statsNumberOfAnnotationsNothingSelected?task=topic_label_relation&mode=label_mode'),
                    $.getJSON('/statsNumberOfAnnotationsNothingSelected?task=topic_label_relation&mode=term_mode'),
                    $.getJSON('/statsNumberOfDocuments'))
                .done(function(d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30){
                    $('#idMAPTfidf').text("Mean Average Precision for the ranking generated by Tf-Idf (top 10 entities): " + d1[0]);
                    $('#idMAPTfidfTop4').text("Mean Average Precision for the ranking generated by Tf-Idf (top 4 entities): " + d2[0]);
                    $('#idMAPLlda').text("Mean Average Precision for the ranking generated by L-LDA: " + d3[0]);
                    $('#idAccuracyLM').text("Current Accuracy for the Label Mode: " + d4[0]["a"]);
                    $('#idAccuracyTM').text("Current Accuracy for the Term Mode: " + d5[0]["a"]);
                    $('#idNumberOfDocumentsEntitySelectionAnnotated').text("Number of annotated Documents: " + d6[0]["count"]);
                    $('#idNumberOfEntitySelectionAnnotations').text("Number of Entity Selection and Ranking Annotations: " + d7[0]["count"]);
                    $('#idNumberOfEntitySelectionAnnotationsNothingSelected').text("Number of Annotations in which the User did not select any Entity: " + d8[0]["count"]);
                    $('#idNumberOfAnnotationsOnlyNoisySelected').text("Number of Annotations in which the User selected only noisy Entities: " + d9[0]["count"]);
                    $('#idAvgNumberOfEntitiesPicked').text("Average Number of Entities picked by the Users: " + d10[0]["average"]);
                    $('#idUserPrecision').text("Recall on User Selection: " + d11[0]["r"]);
                    $('#idTfidfPrecisionAt2').text("Precision of the Tf-Idf Ranking @2: " + d12[0]["p"]);
                    $('#idTfidfPrecisionAt3').text("Precision of the Tf-Idf Ranking @3: " + d13[0]["p"]);
                    $('#idTfidfPrecisionAt5').text("Precision of the Tf-Idf Ranking @5: " + d14[0]["p"]);
                    $('#idLLDAPrecision').text("Precision of the L-LDA Ranking (@4): " + d15[0]["p"]);
                    $('#idNumberOfDocumentsTopicLabelAnnotated').text("Number of annotated Documents: " + d16[0]["count"]);
                    $('#idNumberOfTopicLabelAnnotations').text("Number of Topic-Label Relation Annotations: " + d17[0]["count"]);
                    $('#idNumberOfTopicLabelAnnotationsNothingSelected').text("Number of Annotations in which the User did select nothing: " + d18[0]["count"]);
                    $('#idTfidfPrecisionAt4').text("Precision of the Tf-Idf Ranking @4: " + d19[0]["p"]);
                    $('#idTfidfRecallAt2').text("Recall of the Tf-Idf Ranking @2: " + d20[0]["r"]);
                    $('#idTfidfRecallAt3').text("Recall of the Tf-Idf Ranking @3: " + d21[0]["r"]);
                    $('#idTfidfRecallAt4').text("Recall of the Tf-Idf Ranking @4: " + d22[0]["r"]);
                    $('#idTfidfRecallAt5').text("Recall of the Tf-Idf Ranking @5: " + d23[0]["r"]);
                    $('#idNumberOfDocumentsTopicLabelAnnotatedLabelMode').text("Number of annotated Documents in Label Mode: " + d24[0]["count"]);
                    $('#idNumberOfDocumentsTopicLabelAnnotatedTermMode').text("Number of annotated Documents in Term Mode: " + d25[0]["count"]);
                    $('#idNumberOfTopicLabelAnnotationsLabelMode').text("Number of Topic-Label Relation Annotations in Label Mode: " + d26[0]["count"]);
                    $('#idNumberOfTopicLabelAnnotationsTermMode').text("Number of Topic-Label Relation Annotations in Term Mode: " + d27[0]["count"]);
                    $('#idNumberOfTopicLabelAnnotationsNothingSelectedLabelMode').text("Number of Annotations in label mode in which the User did select nothing: " + d28[0]["count"]);
                    $('#idNumberOfTopicLabelAnnotationsNothingSelectedTermMode').text("Number of Annotations in term mode in which the User did select nothing: " + d29[0]["count"]);
                    $('#idNumberOfDocuments').text("Total Number of Documents: " + d30[0]["count"]);
                    hidePleaseWait();
                });
        }
    }
});