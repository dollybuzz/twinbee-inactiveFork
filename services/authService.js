const util = require('util');
const request = util.promisify(require('request'));
const authRepo = require('../repositories/authRepo.js');
const compare = util.promisify(require('bcrypt').compare);

class AuthService {
    constructor() {
    };

    async accessorIsMaster(creds) {
        return creds === process.env.TWINBEE_MASTER_AUTH;
    }

    async accessorIsMaker(creds) {
        let email = this.getEmailFromToken(creds);
        let response = await request({
            method: 'POST',
            uri: `http://${process.env.IP}:${process.env.PORT}/api/getAllMakers`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err)
        });

        let body = response.body;
        let makers = JSON.parse(body);

        for (var i = 0; i < makers.length; ++i) {
            if (maker[i].email === email) {
                return true
            }
        }
         return false;
    }

    async accessorIsClient(creds) {
        let email = this.getEmailFromToken(creds);
        let response = await request({
            method: 'POST',
            uri: `http://${process.env.IP}:${process.env.PORT}/api/getAllClients`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
        });

        let body = response.body;
        let clients = JSON.parse(body);

        for (var i = 0; i < clients.length; ++i) {
            if (clients[i].email === email) {
                return true
            }
        }
        return false;
    }

    async accessorIsAdmin(creds) {
        let adminList = await authRepo.getAdmins();
        let email = this.getEmailFromToken(creds);
        for (var i = 0; i < adminList.length; ++i){
            if (await compare(email, adminList[i].admin)){
                return true;
            }
        }
        return false;
    }

    async getEmailFromToken(token) {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId,
        }).catch(err => {
            console.log(err)
        });
        const payload = ticket.getPayload();
        return payload['email'];
    }
}


module.exports = new AuthService();