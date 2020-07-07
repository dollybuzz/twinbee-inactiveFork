var GOOGLE_USER = null;
var id_token = null;




//per google's spec at https://developers.google.com/identity/sign-in/web/sign-in
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        window.location.replace('/');
    });
}

//Google
onSignIn = function (googleUser) {
    id_token = TEST_ENVIRONMENT ? null : googleUser.getAuthResponse().id_token;
    GOOGLE_USER = googleUser;
    let profile = TEST_ENVIRONMENT ? null : googleUser.getBasicProfile();
    let name = TEST_ENVIRONMENT ? null : profile.getName();
    $("#googleUser").html(TEST_ENVIRONMENT ? "test" : name);
};

/**
 * Wrapper for the google token verification process. Limited use;
 * data will always be the id token and nothing else.
 *
 * @param route - api route to send token to
 * @param callback  - ajax "success" function taking 2 parameters; res and status
 */
function googleUserAction(route, callback = null,) {
    var id_token = GOOGLE_USER.getAuthResponse().id_token;

    $.ajax({
        type: "post",
        url: route,
        contentType: 'application/json',
        data: JSON.stringify({"idtoken": id_token}),
        success: function (res, status) {
            if (callback != null) {
                callback(res, status)
            }
        }
    })
}

function refreshGoogle() {
    gapi.auth2.getAuthInstance().currentUser.get().reloadAuthResponse()
        .then(function () {
            GOOGLE_USER = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse();
            id_token = GOOGLE_USER.id_token;
            setTimeout(refreshGoogle, 2400000);
        });
}


function init(){
    gapi.auth2.init().then(function () {
        console.log("Google initializing...");
        GOOGLE_USER = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse();
        id_token = GOOGLE_USER.id_token;

        //refresh tokens before timeout
        var timeToRefresh = Math.max((GOOGLE_USER.expires_in - 30) * 1000, 1000);
        setTimeout(refreshGoogle, timeToRefresh);
    });
}
