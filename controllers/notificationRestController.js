const notificationService = require('../services/notificationService.js');
const {notifyAdmin} = require("../services/notificationService");
const {validateParams} = require("../util.js");
const getEmailFromToken = require("../util.js").dereferenceToken;


module.exports = {

    /**
     * ENDPOINT: /api/technicalHelp
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
            let email = await getEmailFromToken(req.body.token);
            console.log(`${email} is trying to send a message!`);
            notificationService.notifyAdmin(`BUG REPORT:\nFrom:${email}\nMessage${req.body.message}`);
            res.send({status: "Request Sent"});
        }
    },

    /**
     * ENDPOINT: /api/notifyAdmin
     * Sends a notification to the developers. Looks for data in the body as follows:
     * {
     *     "auth": authentication credentials; either master or token,
     *     "message": message to be sent
     * }
     * @returns {Promise<[{},...]>}
     */
    notifyAdmin: async (req, res) => {
        console.log("Attempting to notify admin via rest!");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["message", "auth"],
                "positiveIntegerOnly": [],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {

            let message = null;
            try{
                message = JSON.parse(req.body.message)
            }
            catch (e) {
                console.log(e);
            }
            notificationService.notifyAdmin(message ? message : req.body.message);
            res.send({status: "Request Sent"});
        }
    }
};