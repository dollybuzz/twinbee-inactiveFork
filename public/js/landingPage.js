

$(document).ready(function () {
    gapi.load('auth2', function() {
        gapi.auth2.init();
    });

    function signOut() {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
            console.log('User signed out.');
        });
    }


    //alters nav menu banner
    $("nav").css("background-color", "transparent");

    //shifts the landing logo
    $("#landingLogo").css("width", "100%");
    $("#landingLogo").css("text-align", "center");

    //Shifts the welcome text
    $("#welcome").css("color", "white");
})


