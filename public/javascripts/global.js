requirejs.config({
    baseUrl: 'javascripts/lib'
});

requirejs(["entitySelector", "labelTopic", "topicLabel"], function(entitySelector, labelTopic, topicLabel) {
    if(window.location.pathname == "/entitySelection" && $('#taglist').length > 0){
        entitySelector.populateData();
        $('#idNextEntitySelection').click({"entitySelector": entitySelector}, entitySelector.next);
    }else if (window.location.pathname == "/labelTopic"){
        labelTopic.populateData();
        $('#idNextLabelTopic').click({"labelTopic": labelTopic}, labelTopic.next);
    }else if (window.location.pathname == "/topicLabel"){
        topicLabel.populateData();
        $('#idNextTopicLabel').click({"topicLabel": topicLabel}, topicLabel.next);
    }
});


// Global Functions =============================================================
function logout(){
    selectedTags = [];
    emailId="";
    $.get("/logout");
    window.location.reload();
}

function showPleaseWait(){
    var pleaseWaitDiv = $('#pleaseWaitDialog');
    pleaseWaitDiv.modal('show');
}

function hidePleaseWait() {
    var pleaseWaitDiv = $('#pleaseWaitDialog');
    pleaseWaitDiv.modal('hide');
}