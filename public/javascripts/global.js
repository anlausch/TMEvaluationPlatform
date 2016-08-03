// emaildata
var emailId = "";

var selectedTags = [];
var allTags = [];

var selectedEntityTitle = -1;
var originalEntityTitle = -1;
var entityTitles = [];

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the email table on initial page load
    if(window.location.pathname == "/tag" && $('#taglist').length > 0){
        populateEmail();
    }else if (window.location.pathname == "/topicLabel"){
        populateTopicLabel();
    }
});

// Functions =============================================================

// Fill tag screen with data
function populateEmail() {

    // Empty content string
    var emailContent = '';
    var tagContent = '';

    // jQuery AJAX call for JSON
    showPleaseWait();
    $.getJSON( '/annotation', function( data ) {

        // For each item in our JSON, add a table row and cells to the content string
        emailId = data[0].email_id;
        emailContent = '<p>' + data[0].email_original + '</p>';
        data = fisherYates(data);
        $.each(data, function(){
            console.log(this);
            tagContent += '<li><a class="tag">' + this.entity_title.replace(/_/g, " "); + '</a></li>';
            allTags.push(this.entity_title);
        });

        // Inject the whole content string into our existing HTML
        $('#email').html(emailContent);
        $('#taglist').html(tagContent);
        $('#counter')[0].textContent = "You have currently selected " + selectedTags.length + " words.";
        
        $('a').click(function(event){
            var entityTitle = event.target.text.replace(/ /g, "_");
            var index = $.inArray(entityTitle, selectedTags);
            if(index > -1){
                event.target.style.color = '#000000'
                selectedTags.splice(index, 1);
                $('#counter')[0].textContent = "You have currently selected " + selectedTags.length + " words.";
            }else{
                if(selectedTags.length < 5){
                    event.target.style.color = '#18bc9c';
                    selectedTags.push(entityTitle);
                    $('#counter')[0].textContent = "You have currently selected " + selectedTags.length + " words.";
                }else{
                    alert("You can select max 5 Tags. Please deselect one tag if you would like to add another one.")
                }
            }

        });
        hidePleaseWait();
    });
};


function populateTopicLabel(){
    $.getJSON( '/dataTopicLabel', function( data ) {
        emailId = data[0].email_id;
        entityTitles = getDistinctEntityTitles(data);
        var result = [];
        for (entityTitle in entityTitles){
            var obj = {
                "entityTitle" : entityTitles[entityTitle],
                "terms" : getTermsforEntityTitle(data, entityTitles[entityTitle])
            };
            result.push(obj);
        }
        // jetzt den ersten entity title nehmen und zeigen, und alle terms
        originalEntityTitle = Math.floor((Math.random() * 3));
        randomEntityTitle = result[originalEntityTitle].entityTitle;
        labelContent = '<h3 class="">Label: ' + randomEntityTitle.replace(/_/g, " ") + '</h3>';
        terms1Content = createTermsContent(result, 0);
        terms2Content = createTermsContent(result, 1);
        terms3Content = createTermsContent(result, 2);
        $('#label').html(labelContent);
        $('#terms1').html(terms1Content);
        $('#terms2').html(terms2Content);
        $('#terms3').html(terms3Content);
        $('a').click(function(event){
            console.log(entityTitles[event.currentTarget.id]);
            if(selectedEntityTitle == event.currentTarget.id){
                selectedEntityTitle = -1;
                event.currentTarget.style.color = '#000000'
            }else{
                event.currentTarget.style.color = '#18bc9c';
                if(selectedEntityTitle != -1){
                    $('#' + selectedEntityTitle).attr("style", "color:#000000");
                }
                selectedEntityTitle = event.currentTarget.id;
            }

        });
    });
}

function createTermsContent(data, option){
    var content = "<a id='" + option + "'><ul>";
    for(i in data[option].terms){
        content += "<li class='term'>" + data[option].terms[i] + "</li>";
    }
    content += "</ul></a>";
    return content;
}


function getTermsforEntityTitle(data, entityTitle){
    result = [];
    data.filter(function(obj) {
        ((obj.entity_title == entityTitle) && result.push(obj.term));
    });
    return result;
}

function getDistinctEntityTitles(data){
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
}



function next(){
    $.post( "/annotation", {"emailId": emailId, "selectedTags": JSON.stringify(selectedTags), "allTags": JSON.stringify(allTags)}, function(data) {
    });
    populateEmail();
    selectedTags = [];
    allTags = [];
}


function nextTopicLabelRelation(){
    $.post( "/dataTopicLabel", {"emailId": emailId, "entityTitles": JSON.stringify(entityTitles), "selectedEntityTitle": entityTitles[selectedEntityTitle], "originalEntityTitle": entityTitles[originalEntityTitle]}, function(data) {
    });
    populateTopicLabel();
    selectedEntityTitle = -1;
    originalEntityTitle = -1;
    entityTitles = [];
}


function logout(){
    selectedTags = [];
    emailId="";
    $.get("/logout");
    window.location.reload();
}

function fisherYates(sourceArray) {
    for (var i = 0; i < sourceArray.length - 1; i++) {
        var j = i + Math.floor(Math.random() * (sourceArray.length - i));

        var temp = sourceArray[j];
        sourceArray[j] = sourceArray[i];
        sourceArray[i] = temp;
    }
    return sourceArray;
}

function showPleaseWait(){
    var pleaseWaitDiv = $('#pleaseWaitDialog');
    pleaseWaitDiv.modal('show');
}

function hidePleaseWait() {
    var pleaseWaitDiv = $('#pleaseWaitDialog');
    pleaseWaitDiv.modal('hide');
}