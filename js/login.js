/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function(){ 
    checkCookie();
  
    if(getCookie("rememberMe") == "true"){
      document.getElementById("username").value = getCookie("savedUsername");
      $("#rememberMe").attr("checked", "");
    }
});

$(document).on('click', '#btnLogin', function(){
    if(document.getElementById("username").value == null || document.getElementById("username").value == "")
        document.getElementById("RFVusername").innerHTML = "* Username cannot be empty!";
    else if (document.getElementById("password").value == null || document.getElementById("password").value == "")
        document.getElementById("RFVpassword").innerHTML = "* Password cannot be empty!";
    else
        login(document.getElementById("username").value, document.getElementById("password").value, document.getElementById("rememberMe").checked);
});

$(document).on('click', '#btnRecoverPassword', function(){
    alert("An email containing your password reset has been sent to your email.");
});

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var loggedin = getCookie("loggedIn");
    var user = getCookie("username");
    if (loggedin !== "") {
        document.getElementById("loginInfo").innerHTML = "Logged in as: " + user;
        $("#navList").append(
            "<li>\n" +
                    "<a href=\"logout.html\">Log Out</a>" +
                "</li>\n"
            );
        $("#offcanvasNavList").append(
            "<li>\n" +
                    "<a href=\"logout.html\">Log Out</a>" +
                "</li>\n"
            );
    } else {
        $("#navList").append(
            "<li>\n" +
                    "<a href=\"login.html\">Login</a>" +
                "</li>\n"
            );
        $("#offcanvasNavList").append(
            "<li>\n" +
                    "<a href=\"login.html\">Login</a>" +
                "</li>\n"
            );
    }
}

function login(username, password, rememberMe){
    $.getJSON("https://fyp-postgrest.herokuapp.com/users",
            function(json){
                $.each(json, function(i){
                    if(username == json[i].username)
                        if(password == json[i].password){
                            setCookie("username", username, 7);
                            setCookie("rememberMe", rememberMe, 365);
                            if(rememberMe === true)
                                setCookie("savedUsername", username, 365);
                            else{
                                setCookie("savedUsername", "", -1);
                                setCookie("rememberMe", "", -1);
                            }

                            setCookie("loggedIn", true, 7);
                            window.location.replace("index.html");
                        }
                });
                if(!getCookie("loggedIn"))
                    alert("Username or password is incorrect!");
            });
            
    
}
