const authService = require('../services/authService.js');
const {notifyAdmin} = require("../services/notificationService");
const {validateParams} = require("../util.js");

module.exports = {

    /**
     * ENDPOINT: /api/getEmailFromToken
     * Dereferences a token. Only callable with master auth
     *
     * @returns {Promise<[timeSheet]>}
     */
    getEmailFromToken: async (req, res) => {
        console.log("Dereferencing token...");

        let validationResult = await validateParams(
            {
                "present": ["auth", "token"]
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let email = await authService.getEmailFromToken(req.body.token).catch(err => {
                console.log(err);
                notifyAdmin(err.toString())
            });
            res.send(email);
        }
    }
};