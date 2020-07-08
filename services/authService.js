const util = require('util');
const request = util.promisify(require('request'));
const authRepo = require('../repositories/authRepo.js');const {OAuth2Client} = require('google-auth-library');
const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);
const compare = util.promisify(require('bcrypt').compare);
const emailService = require('./notificationService.js');
class AuthService {
    constructor() {
    };

    async accessorIsMaster(creds) {
        return creds === process.env.TWINBEE_MASTER_AUTH;
    }

    async accessorIsMaker(creds) {
        if (creds === process.env.TWINBEE_MASTER_AUTH) {
            return  false;
        }
        console.log("Let's see if you are a Freedom Maker...");
        let email = await this.getEmailFromToken(creds).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        let response = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllMakers`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        let body = response.body;
        let makers = JSON.parse(body);

        for (var i = 0; i < makers.length; ++i) {
            if (makers[i].email.toLowerCase() === email.toLowerCase()) {
                return true
            }
        }
        console.log("Not a Freedom Maker");
         return false;
    }

    async accessorIsClient(creds) {
        if (creds === process.env.TWINBEE_MASTER_AUTH) {
            return  false;
        }
        let email = await this.getEmailFromToken(creds).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        let response = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllClients`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        let body = response.body;
        let clients = JSON.parse(body);

        for (var i = 0; i < clients.length; ++i) {
            if (clients[i].customer.email.toLowerCase() === email.toLowerCase()) {
                return true
            }
        }
        return false;
    }

    async accessorIsAdmin(creds) {
        if (creds === process.env.TWINBEE_MASTER_AUTH) {
            return  false;
        }
        console.log("Is the accessor admin?");
        let adminList = await authRepo.getAdmins().catch(err => {
            console.log(err);
            console.log("Error grabbing admin list");
            emailService.notifyAdmin(err.toString());
            return false;
        });
        console.log("Who's token is this?");
        let email = await this.getEmailFromToken(creds).catch(err => {
            console.log(err);
            console.log("Error grabbing email from token");
            emailService.notifyAdmin(err.toString());
            return false;
        });
        console.log("Let's see if you're on the list...");
        for (var i = 0; i < adminList.length; ++i){
            let emailsMatch = await compare(email.toLowerCase(), adminList[i].admin).catch(err => {
               if (err.toString().includes("data and hash must be strings")){
                    console.log(`Bcrypt threw 'data and hash must be strings' with data: ${creds} `)
                }
                else{
                    console.log(err);
                    emailService.notifyAdmin(err.toString());
                }
                console.log("Error bcrypt.comapare'ing adminList[i] to the passed email");
                return false;
            });
            if (emailsMatch){
                console.log("Admin match");
                return true;
            }
        }
        console.log("No match for admin");
        return false;
    }

    async getEmailFromToken(token) {
        console.log("getting email from token:");
        if (token === process.env.TWINBEE_MASTER_AUTH){
            console.log("Master auth, no email associated.");
            return;
        }
        console.log(token);
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId
        }).catch(err => {
                console.log(err);
                emailService.notifyAdmin(err.toString());
        });
        const payload = ticket.getPayload();
        console.log(`Email was: ${payload['email']}`);
        return payload['email'];
    }
}


module.exports = new AuthService();