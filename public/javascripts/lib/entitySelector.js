define(function () {
    return{
        emailId: "",
        
        selectedTags: [],
        
        allTags: [],
        
        
        populateData: function(){
         // Empty content string
            var emailContent = '';
            var tagContent = '';
            var self=this;

            // jQuery AJAX call for JSON
            showPleaseWait();
            $.getJSON( '/dataEntitySelection', function( data ) {

                // For each item in our JSON, add a table row and cells to the content string
                self.emailId = data[0].email_id;
                emailContent = '<p>' + data[0].email_original + '</p>';
                data = self.fisherYates(data);
                $.each(data, function(){
                    console.log(this);
                    tagContent += '<li><a class="tag">' + this.entity_title.replace(/_/g, " "); + '</a></li>';
                    self.allTags.push(this.entity_title);
                });

                // Inject the whole content string into our existing HTML
                $('#email').html(emailContent);
                $('#taglist').html(tagContent);
                $('#counter')[0].textContent = "You have currently selected " + self.selectedTags.length + " words.";
                
                $('a').click(function(event){
                    var entityTitle = event.target.text.replace(/ /g, "_");
                    var index = $.inArray(entityTitle, self.selectedTags);
                    if(index > -1){
                        event.target.style.color = '#000000';
                        self.selectedTags.splice(index, 1);
                        $('#counter')[0].textContent = "You have currently selected " + self.selectedTags.length + " words.";
                    }else{
                        if(self.selectedTags.length < 5){
                            event.target.style.color = '#0d87e9';
                            self.selectedTags.push(entityTitle);
                            $('#counter')[0].textContent = "You have currently selected " + self.selectedTags.length + " words.";
                        }else{
                            alert("You can select max 5 Tags. Please deselect one tag if you would like to add another one.")
                        }
                    }

                });
                hidePleaseWait();
            });
        },
        
        
        next: function(event){
            var self = event.data.entitySelector;
            $.post( "/dataEntitySelection", {"emailId": self.emailId, "selectedTags": JSON.stringify(self.selectedTags), "allTags": JSON.stringify(self.allTags)}, function(data) {
                self.populateData();
                self.selectedTags = [];
                self.allTags = [];
            });
        },
        
        
        fisherYates: function(sourceArray){
            for (var i = 0; i < sourceArray.length - 1; i++) {
                var j = i + Math.floor(Math.random() * (sourceArray.length - i));

                var temp = sourceArray[j];
                sourceArray[j] = sourceArray[i];
                sourceArray[i] = temp;
            }
            return sourceArray;
        }
    }
});