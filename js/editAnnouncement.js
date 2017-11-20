/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(document).ready(function(){ 
    $.getJSON("https://fyp-postgrest.herokuapp.com/announcements?a_id=eq." + getParameterByName('a_id'),
        function(json){
     
            $("#editor").append(
                    "<label>Title: </label><input id=\"title\" class=\"uk-width-medium-1-4\" type=\"text\" style=\"display: inline;\">" +
                    "<div><textarea id=\"content\" data-uk-htmleditor>" + json[0].content +"</textarea></div>\n"+
                    "<div id=\"btnSubmit\" class=\"uk-button uk-button-primary\" style=\"float: right;\">Submit</div>\n" +
                    "<a href=\"announcement.html\" class=\"uk-button uk-button-danger\" style=\"float: right;\">Cancel</div>\n"
            );
            document.getElementById("title").value = json[0].title;
        });
});

$(document).on('click', '#btnSubmit', function(){
    var content = document.getElementById("content").value;
    var title = document.getElementById("title").value;
    
    var now = new Date();
    var date = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
    var time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
  
    $.ajax({
       type: "PATCH",
       url: "https://fyp-postgrest.herokuapp.com/announcements?a_id=eq." + getParameterByName('a_id'),
       data: JSON.stringify({
           "title": title,
           "lastModDate": date,
           "timestamp" : time,
           "content":content.replace(/&lt;/g,'<').replace(/&gt;/g,'>')
       }),
       dataType: "json",
       contentType: "application/json",
       success: function(json){
           console.log(json);
           alert("Announcement has been successfully edited.");
           window.location.replace("announcement.html");
       }
    });
});

function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}