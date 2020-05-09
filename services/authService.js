const util = require('util');
const request = util.promisify(require('request'));

class AuthService {
    constructor() {
    };

    async accessorIsMaster(creds) {
        return creds === process.env.TWINBEE_MASTER_AUTH;
    }

    async accessorIsMaker(creds) {
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
            if ()

                }
        //TODO: implement
    }

    async accessorIsClient(creds) {
        //TODO: implement
    }

    async accessorIsAdmin(creds) {
        //TODO: implement
    }

    async getEmailFromToken(token) {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId,
        }).catch(err => {
            console.log(err)
        });
        const payload = ticket.getPayload();
        const email = payload['email'];
        return email;
    }
}


module.exports = new AuthService();