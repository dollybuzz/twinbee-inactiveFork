var GOOGLE_USER = null;

$(document).ready(function () {

    //alters nav menu banner
    $("nav").css("background-color", "transparent");

    //shifts the landing logo
    $("#landingLogo").css("margin-left", "0");
    $("#landingLogo").css("text-align", "center");
    $("#landingLogo").css("padding", "15px");

    //Shifts the welcome text
    $("#welcome").css("color", "white");
})

function onSignIn(googleUser) {
    GOOGLE_USER = googleUser;
    var id_token = GOOGLE_USER.getAuthResponse().id_token;
    window.location.replace(`/login?token=${id_token}`);
}