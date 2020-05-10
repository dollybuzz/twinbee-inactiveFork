var GOOGLE_USER = null;
var id_token = null;

//per google's spec at https://developers.google.com/identity/sign-in/web/sign-in
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        window.location.reload();
    });
}

/**
 * used by google's api.  Adds users to the database for wishlist use as a default.
 * @param googleUser a Google-api-specific object passed when a user uses a google
 * sign-in
 */
function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    GOOGLE_USER = googleUser;
    var id_token = GOOGLE_USER.getAuthResponse().id_token;
}


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