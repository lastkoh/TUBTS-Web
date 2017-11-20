/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function() {
  var accordion = UIkit.accordion($('.uk-accordion'), {
    showfirst: false
  });

  var loggedIn = getCookie("loggedIn");

  var load_announcements = function() {
    $.getJSON("https://fyp-postgrest.herokuapp.com/announcements?order=lastModDate.desc,timestamp.desc",
      function(json) {
        if (jQuery.isEmptyObject(json))
          document.getElementById("debug").innerHTML += "No announcements yet.";
        else {
          document.getElementById("announcementList").innerHTML = "";
          var $container = $("#announcementList");
          //                     var $container = $(".announcement-area").find("[data-uk-sortable]");
          $.each(json, function(i) {
            var htmlString = "<div class=\"uk-margin\" a_id=\"" + json[i].a_id + "\">\n" +
              "<div class=\"uk-panel uk-panel-box uk-accordion-title\">" + json[i].title + "\n" +
              "<div>\n" +
              "<p style=\"display: inline; color: gray; font-size: 70%;\">Last Updated: " + json[i].lastModDate + " at " + json[i].timestamp + "\tCreated on: " + json[i].createDate + "</p>\n";

            if (loggedIn)
              htmlString +=
              "<button class=\"delete-btn uk-button uk-button-danger uk-button-mini\" style=\"display: inline-block; float: right;\">\n" +
              "<i class=\"uk-icon-remove\"></i>\n" +
              "</button>\n" +
              "<button class=\"edit-btn uk-button uk-button-primary uk-button-mini\" style=\"display: inline-block; float: right;\">\n" +
              "<i class=\"uk-icon-edit\"></i>\n" +
              "</button>\n";

            htmlString += "</div>\n</div>\n" +
              "<div class=\"uk-accordion-content\">" + json[i].content + "</div>\n"
            "</div>\n";
            $container.append(htmlString);
          });
          accordion.update();
        }
      });

    var now = new Date();
    document.getElementById("lastRefresh").innerHTML = "Last Refesh: " +
      ((now.getHours() < 10) ? ("0" + now.getHours()) : now.getHours()) + ":" +
      ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : now.getMinutes()) + ":" +
      ((now.getSeconds() < 10) ? ("0" + now.getSeconds()) : now.getSeconds());
  };

  var submit_announcement = function() {
    var content = document.getElementById("content").value;
    var title = document.getElementById("title").value;

    var now = new Date();
    var date = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
    var time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
    var newAid = null;

    //Submit new entry to database
    $.ajax({
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Prefer', 'return=representation');
      },
      type: "POST",
      url: "https://fyp-postgrest.herokuapp.com/announcements",
      data: JSON.stringify({
        "title": title,
        "createDate": date,
        "lastModDate": date,
        "timestamp": time,
        "content": content.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      }),
      dataType: "json",
      contentType: "application/json",
      success: function(json) {
        console.log(json);
        newAid = json.a_id;

        //Push Notification
        $.ajax({
          beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Basic NDdjNDExMDQtZGMyZS00MzQ2LTlkZjUtYzIyM2UyMTIzYTk1');
            xhr.setRequestHeader('Content-Type', 'application/json');
          },
          type: "POST",
          url: "https://onesignal.com/api/v1/notifications",
          data: JSON.stringify({
            "app_id": "b5f5568e-e6ad-4142-9b74-3eb457650597",
            "included_segments": ["All"],
            "data": {
              "a_id": newAid
            },
            "contents": {
              "en": "A new announcement has been posted."
            }
          }),
          dataType: "json",
          contentType: "application/json",
          success: function(json) {
            console.log(json);
          }
        });
      }
    });

    setTimeout(function() {
      alert("Announcement has been successfully created.");
      window.location.replace("announcement.html");
    }, 1500);

  };

  if (loggedIn) {
    $('#buttons').append(
      "<div id=\"btnAdd\" class=\"uk-button uk-button-success\" data-uk-modal=\"{target:'#newAnnouncementModal'}\" style=\"float: right\"><i class=\"uk-icon-plus\"></i> Create New</div>"
    );
  }


  $(document).ready(load_announcements);
  $('#btnLoad').click(load_announcements);
  $('#btnSubmit').click(submit_announcement);
});

$(document).on('click', '.edit-btn', function() {
  window.location = 'editAnnouncement.html?a_id=' + $(this).closest(".uk-margin").attr("a_id");
});

$(document).on('click', '.delete-btn', function() {
  if (confirm("Are you sure you want to delete this announcement?")) {
    $.ajax({
      type: "DELETE",
      url: "https://fyp-postgrest.herokuapp.com/announcements?a_id=eq." + $(this).closest(".uk-margin").attr("a_id"),
      dataType: "json",
      contentType: "application/json",
      success: function(json) {
        alert("Announcement has been deleted.");
      }
    });

    $(this).closest(".uk-margin").fadeOut(400, function() {
      $(this).remove();
    });
  }
  //    var string = $(this).attr("content");
  //    
  //    $('#debug').html(string.replace(/&lt;/g,'<').replace(/&gt;/g,'>')); 
  //    
  //    alert(document.getElementById("debug").innerHTML);
});

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}