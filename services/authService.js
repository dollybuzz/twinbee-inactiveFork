const util = require('util');
const request = util.promisify(require('request'));
const authRepo = require('../repositories/authRepo.js');const {OAuth2Client} = require('google-auth-library');
const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);
const compare = util.promisify(require('bcrypt').compare);

class AuthService {
    constructor() {
    };

    async accessorIsMaster(creds) {
        return creds === process.env.TWINBEE_MASTER_AUTH;
    }

    async accessorIsMaker(creds) {
        let email = await this.getEmailFromToken(creds).catch(err => {
            console.log("ERROR IN GET EMAIL FROM TOKEN\n\n\n")
            console.log(err)
        });
        let response = await request({
            method: 'POST',
            uri: `https://www.freedom-makers-hours.com/api/getAllMakers`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log("ERROR IN ACCESSOR IS MAKER REQUEST \n\n\n\n")
            console.log(err)
        });

        console.log("!!!!!\n\n\n")
        console.log(response)

        let body = response.body;
        let makers = JSON.parse(body);

        for (var i = 0; i < makers.length; ++i) {
            if (makers[i].email === email) {
                return true
            }
        }
         return false;
    }

    async accessorIsClient(creds) {
        let email = await this.getEmailFromToken(creds).catch(err => {
            console.log(err)
        });
        let response = await request({
            method: 'POST',
            uri: `https://www.freedom-makers-hours.com/api/getAllClients`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
        });

        let body = response.body;
        let clients = JSON.parse(body);

        for (var i = 0; i < clients.length; ++i) {
            if (clients[i].customer.email === email) {
                return true
            }
        }
        return false;
    }

    async accessorIsAdmin(creds) {
        console.log("Is the accessor admin?");
        let adminList = await authRepo.getAdmins().catch(err => {
            console.log(err);
            console.log("Error grabbing admin list");
            return false;
        });
        console.log("Who's token is this?");
        let email = await this.getEmailFromToken(creds).catch(err => {
            console.log(err);
            console.log("Error grabbing email from token");
            return false;
        });
        console.log("Let's see if you're on the list...");
        console.log(email);
        for (var i = 0; i < adminList.length; ++i){
            let emailsMatch = await compare(email, adminList[i].admin).catch(err => {
                console.log(err);
                console.log("Error bcrypt.comapare'ing adminList[i] to the passed email");
                return false;
            });
            if (emailsMatch){
                return true;
            }
        }
        return false;
    }

    async getEmailFromToken(token) {
        console.log("getting email from token:")
        console.log(token)
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId
        }).catch(err => {
            console.log(err)
        });
        const payload = ticket.getPayload();
        return payload['email'];
    }
}


module.exports = new AuthService();