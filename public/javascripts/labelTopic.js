define(function () {
    return{
        emailId: "",
        selectedEntityTitle: -1,
        originalEntityTitle: -1,
        entityTitles: [],
        populateData: function(){
            var self = this;
            $.getJSON( '/dataLabelTopic', function( data ) {
                var result = self.createDataStructure(data, self);
                
                self.originalEntityTitle = Math.floor((Math.random() * 3));
                randomEntityTitle = result[self.originalEntityTitle].entityTitle;
                labelContent = '<h3 class="">Label: ' + randomEntityTitle.replace(/_/g, " ") + '</h3>';
                terms1Content = self.createTermsContent(result, 0);
                terms2Content = self.createTermsContent(result, 1);
                terms3Content = self.createTermsContent(result, 2);
                $('#label').html(labelContent);
                $('#terms1').html(terms1Content);
                $('#terms2').html(terms2Content);
                $('#terms3').html(terms3Content);
                $('a').click(function(event){
                    console.log(self.entityTitles[event.currentTarget.id]);
                    if(self.selectedEntityTitle == event.currentTarget.id){
                        self.selectedEntityTitle = -1;
                        event.currentTarget.style.color = '#000000'
                    }else{
                        event.currentTarget.style.color = '#18bc9c';
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
        
        createTermsContent: function(data, option){
            var content = "<a id='" + option + "'><ul>";
            for(i in data[option].terms){
                content += "<li class='term'>" + data[option].terms[i] + "</li>";
            }
            content += "</ul></a>";
            return content;
        },
        
        next: function (event){
            var self = event.data.labelTopic;
            $.post( "/dataLabelTopic", {"emailId": self.emailId, "entityTitles": JSON.stringify(self.entityTitles), "selectedEntityTitle": self.entityTitles[self.selectedEntityTitle], "originalEntityTitle": self.entityTitles[self.originalEntityTitle], "mode" : "label_mode"}, function(data) {
                self.populateData();
                self.selectedEntityTitle = -1;
                self.originalEntityTitle = -1;
                self.entityTitles = [];
            });
        }
    }
});