var GOOGLE_USER = null;

$(document).ready(function () {

    //alters nav menu banner
    $("nav").css("background-color", "transparent");

    //shifts the landing logo
    $("#landingLogo").css("width", "100%");
    $("#landingLogo").css("text-align", "center");

    //Shifts the welcome text
    $("#welcome").css("color", "white");
})



function onSignIn(googleUser) {
    GOOGLE_USER = googleUser;
    var id_token = GOOGLE_USER.getAuthResponse().id_token;
    window.location.replace(`/login?token=${id_token}`);
}