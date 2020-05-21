var GOOGLE_USER = null;





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
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    console.log(`ID token: ${id_token}`);
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


function init() {
    gapi.load('auth2', function() {
        signOut = ()=>{
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
                console.log('User signed out.');
                window.location.reload();
            });
        }

        GoogleAuth.then(function () {
            console.log('auth success')
        }, ()=>{
            console.log('auth failure')
        })
    });
    console.log("Google init success")


}