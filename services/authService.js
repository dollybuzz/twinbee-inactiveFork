const util = require('util');
const request = util.promisify(require('request'));
const {logCaughtError} = require('../util.js');
const authRepo = require('../repositories/authRepo.js');
const {OAuth2Client} = require('google-auth-library');
const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);
const compare = util.promisify(require('bcrypt').compare);


class AuthService {
    constructor() {
    };


    /**
     * Checks to see if the credentials belong to the master
     * @param creds - credentials to be checked
     * @returns {Promise<boolean>}
     */
    async accessorIsMaster(creds) {
        return creds === process.env.TWINBEE_MASTER_AUTH;
    }


    /**
     * Checks if the credentials belong to a maker
     * @param creds - credentials to be checked
     * @returns {Promise<boolean>}
     */
    async accessorIsMaker(creds) {
        if (creds === process.env.TWINBEE_MASTER_AUTH) {
            return  false;
        }
        console.log("Let's see if you are a Freedom Maker...");
        let email = await this.getEmailFromToken(creds).catch(err => logCaughtError(err));
        if (!email) {
            return false;
        }
        let response = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllMakers`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => logCaughtError(err));

        let makers;
        try{
            makers = JSON.parse(response.body);
        }
        catch (e) {
            let tracer = new Error();
            logCaughtError(e);
            logCaughtError(tracer.stack);
            return false;
        }

        for (var i = 0; i < makers.length; ++i) {
            if (makers[i].email.toLowerCase() === email.toLowerCase() && !makers[i].deleted) {
                return true
            }
        }
        console.log("Not a Freedom Maker");
         return false;
    }


    /**
     * Checks if the credentials belong to a client
     * @param creds - credentials to be checked
     * @returns {Promise<boolean>}
     */
    async accessorIsClient(creds) {
        if (creds === process.env.TWINBEE_MASTER_AUTH) {
            return  false;
        }
        let email = await this.getEmailFromToken(creds).catch(err => logCaughtError(err));
        if (!email) {
            return false;
        }
        let response = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllClients`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => logCaughtError(err));

        let clients;
        try{
            clients = JSON.parse(response.body);
        }
        catch (e) {
            let tracer = new Error();
            logCaughtError(e);
            logCaughtError(tracer.stack);
            return false;
        }

        for (var i = 0; i < clients.length; ++i) {
            if (clients[i].customer.email.toLowerCase() === email.toLowerCase()) {
                return true
            }
        }
        return false;
    }


    /**
     * Checks if the credentials belong to an admin
     * @param creds - credentials to check
     * @returns {Promise<boolean>}
     */
    async accessorIsAdmin(creds) {
        if (creds === process.env.TWINBEE_MASTER_AUTH) {
            return  false;
        }
        console.log("Is the accessor admin?");
        let adminList = await authRepo.getAdmins().catch(err => {
            logCaughtError(err);
            logCaughtError("Error grabbing admin list");
        });
        console.log("Who's token is this?");
        let email = await this.getEmailFromToken(creds).catch(err => {
            logCaughtError(err);
            logCaughtError("Error grabbing email from token");
        });
        if (!email) {
            return false;
        }
        console.log("Let's see if you're on the list...");
        for (var i = 0; i < adminList.length; ++i){
            let emailsMatch = await compare(email.toLowerCase(), adminList[i].admin).catch(err => {
               if (err.toString().includes("data and hash must be strings")){
                    console.log(`Bcrypt threw 'data and hash must be strings' with data: ${creds} `)
                }
                else{ logCaughtError(err)}
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


    /**
     *  Retrieves an email from a google token
     * @param token - google token to be dereferenced
     * @returns {Promise<string|boolean>}
     */
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
        }).catch(err => logCaughtError(err));
        if (ticket) {
            const payload = ticket.getPayload();
            console.log(`Email was: ${payload['email']}`);
            return payload['email'];
        }
        let message = `Failed to grab email from token. Google's result was ${JSON.stringify(ticket)}`;
        let tracer = new Error();

        logCaughtError(message);
        logCaughtError(tracer.stack);
        return false;
    }
}


module.exports = new AuthService();