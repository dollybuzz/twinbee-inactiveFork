const {OAuth2Client} = require('google-auth-library');
const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);
const util = require('util');
const request = util.promisify(require('request'));

module.exports = {
    authorizeAdmin: async function(req, res, next){
        module.exports.authorizeEmail(req.body.idToken,
            (email)=>{
            //if email is admin,
            next();
        },
            (email)=>{
                console.log(`Error with ${email}`);
            })
    },
    authorizeMaker: async function(req, res, next){
        module.exports.authorizeEmail(req.body.idToken,
            (email)=>{
            //if email is admin,
             next();
        },
            (email)=>{
                console.log(`Error with ${email}`);
            })
    },
    authorizeClient: async function(req, res, next){
        module.exports.authorizeEmail(req.body.idToken,
            (email)=>{
            //if email is admin
            next();
        },
            (email)=>{
            console.log(`Error with ${email}`);
            })
    },



    /**
     *  Checks if a token is valid.  If so, runs a callback function with
     *  the user's email as the argument.
     *  If invalid, the callbackFail is called.
     * @param token - google token
     * @param callbackSuccess - callback on success, takes email as param
     * @param callbackFail - callback on fail, takes email as param
     */
    authorizeEmail: async function (token, callbackSuccess, callbackFail) {
        let requestURL = "https://oauth2.googleapis.com/tokeninfo?id_token=" + token;
        let response = await request(requestURL).catch(err=>{console.log(err)});
        let parsedData = JSON.parse(response.body);

        if (!error && parsedData["aud"] === clientId + ".apps.googleusercontent.com" && parsedData["email"] !== undefined) {
            callbackSuccess(parsedData["email"])
        } else {
            callbackFail(parsedData["email"]);
            console.log("email was " + parsedData["email"]);
            console.log("error if any was " + error);
            console.log("Aud match was " + parsedData["aud"] === clientId + ".apps.googleusercontent.com");
        }

    },

    testVerify: (req, res)=>{
        console.log(req.body);
        module.exports.verify(req.body.idtoken);
    },


    verify: async function (token) {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        }).catch(err=>{console.log(err)});
        const payload = ticket.getPayload();
        const email = payload['email'];
        console.log(`PAYLOAD: ${payload}`);
        console.log(`ID: ${email}`);
        // If request specified a G Suite domain:
        //const domain = payload['hd'];
    }

};

