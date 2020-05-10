var GOOGLE_USER = null;

$(document).ready(function () {

    //alters nav menu banner
    $("nav").css("background-color", "transparent");

    //shifts the landing logo
    $("#landingLogo").css("width", "100%");
    $("#landingLogo").css("text-align", "center");

    //shifts the time and date
    $("#time").css("top", "150px");

    //Shifts the welcome text
    $("#welcome").css("color", "white");
})



var id_token = null;
function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    GOOGLE_USER = googleUser;
    var id_token = GOOGLE_USER.getAuthResponse().id_token;
    window.location.replace(`/login?token=${id_token}`);
}