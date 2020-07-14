const notificationService = require('../services/notificationService.js');
const authService = require('../services/authService.js');
const {notifyAdmin} = require("../services/notificationService");
const {validateParams} = require("../util.js");


module.exports = {

    /**
     * ENDPOINT: /api/notifyAdmin
     * Sends a notification to the developers. Looks for data in the body as follows:
     * {
     *     "auth": authentication credentials; either master or token,
     *     "token": token of the user requesting admin be notified,
     *     "message": message to be sent
     * }
     * @returns {Promise<[{},...]>}
     */
    restBugReport: async (req, res) => {
        console.log("Someone is trying to notify admin via rest!");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["token", "message"],
                "positiveIntegerOnly": [],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let email = await authService.getEmailFromToken(req.body.token);
            console.log(`${email} is trying to send a message!`);
            notificationService.notifyAdmin(`BUG REPORT:\nFrom:${email}\nMessage${req.body.message}`);
            res.send({status: "Request Sent"});
        }
    }
};