define(function () {
    return{
        emailId: "",
        selectedEntityTitle: -1,
        originalEntityTitle: -1,
        entityTitles: [],
        next: function (event){
            var self = event.data.topicLabel;
            $.post( "/dataLabelTopic", {"emailId": self.emailId, "entityTitles": JSON.stringify(self.entityTitles), "selectedEntityTitle": self.entityTitles[self.selectedEntityTitle], "originalEntityTitle": self.entityTitles[self.originalEntityTitle], "mode" : "term_mode"}, function(data) {
                self.populateData();
                self.selectedEntityTitle = -1;
                self.originalEntityTitle = -1;
                self.entityTitles = [];
            });
        },
        
        populateData: function(){
            var self = this;
            $.getJSON( '/dataLabelTopic', function( data ) {
                var result = self.createDataStructure(data, self);
                
                // jetzt den ersten entity title nehmen und zeigen, und alle terms
                self.originalEntityTitle = Math.floor((Math.random() * 3));
                randomTerms = result[self.originalEntityTitle].terms;
                termsContent = "<ul>";
                for(i in randomTerms){
                    termsContent += "<li class='term'>" + randomTerms[i] + "</li>";
                }
                termsContent += "</ul>";
                label1Content = '<a id="0"><h4 class="">Option 1: ' + result[0].entityTitle.replace(/_/g, " ") + '</h4></a>';
                label2Content = '<a id="1"><h4 class="">Option 2: ' + result[1].entityTitle.replace(/_/g, " ") + '</h4></a>';
                label3Content = '<a id="2"><h4 class="">Option 3: ' + result[2].entityTitle.replace(/_/g, " ") + '</h4></a>';
                $('#terms').html(termsContent);
                $('#label1').html(label1Content);
                $('#label2').html(label2Content);
                $('#label3').html(label3Content);
                $('a').click(function(event){
                    console.log(self.entityTitles[event.currentTarget.id]);
                    if(self.selectedEntityTitle == event.currentTarget.id){
                        self.selectedEntityTitle = -1;
                        event.target.style.color = '#000000'
                    }else{
                        event.target.style.color = '#0d87e9';
                        if(self.selectedEntityTitle != -1){
                            $('#' + self.selectedEntityTitle).attr("style", "color:#000000");
                        }
                        self.selectedEntityTitle = event.currentTarget.id;
                    }
                });
            });
        },
        
        createDataStructure: function (data, self){
            self.emailId = data[0].email_id;
            self.entityTitles = self.getDistinctEntityTitles(data);
            var result = [];
            for (entityTitle in self.entityTitles){
                var obj = {
                    "entityTitle" : self.entityTitles[entityTitle],
                    "terms" : self.getTermsForEntityTitle(data, self.entityTitles[entityTitle])
                };
                result.push(obj);
            }
            return result;
        },
        
        getDistinctEntityTitles: function(data){
            var lookup = {};
            var result = [];

            for (var item, i = 0; item = data[i++];) {
              var entityTitle = item.entity_title;

              if (!(entityTitle in lookup)) {
                lookup[entityTitle] = 1;
                result.push(entityTitle);
              }
            }
            return result;
        },
        
        getTermsForEntityTitle: function(data, entityTitle){
            result = [];
            data.filter(function(obj) {
                ((obj.entity_title == entityTitle) && result.push(obj.term));
            });
            return result;
        },
    }
});