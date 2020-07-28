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
            notificationService.bugReport(`BUG REPORT:\nFrom: ${email}\nMessage: ${req.body.message}`);
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
            notificationService.notifyAdmin(req.body.message);
            res.send({status: "Request Sent"});
        }
    },


    /**
     * ENDPOINT: /api/welcomeClient
     * Sends a welcome email to the given client. Looks for data in the body in the form:
     * {
     *     "auth": authentication credentials; either master or token,
     *     "clientEmail": email address of client to welcome
     * }
     * @returns {Promise<[{},...]>}
     */
    sendClientWelcome: async (req, res) =>{
        console.log("Welcoming client via rest!");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["clientEmail", "auth"],
                "positiveIntegerOnly": [],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            notificationService.sendClientWelcome(req.body.clientEmail);
            res.send({status: "Request Sent"});
        }
    },


    /**
     * ENDPOINT: /api/welcomeMaker
     * Sends a welcome email to the given maker. Looks for data in the body in the form:
     * {
     *     "auth": authentication credentials; either master or token,
     *     "makerEmail": email address of maker to welcome
     * }
     * @returns {Promise<[{},...]>}
     */
    sendMakerWelcome: async (req, res) =>{
        console.log("Welcoming maker via rest!");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["makerEmail", "auth"],
                "positiveIntegerOnly": [],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            notificationService.sendMakerWelcome(req.body.makerEmail);
            res.send({status: "Request Sent"});
        }
    },


    /**
     * ENDPOINT: /api/notifyClientOutOfCredits
     * Notifies client that they are out of credits:
     * {
     *     "auth": authentication credentials; either master or token,
     *     "email": email of client to be notified
     * }
     * @returns {Promise<[{},...]>}
     */
    notifyClientOutOfCredits: async (req, res) =>{
        console.log("Notifying client of empty bucket via rest!");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["email", "auth"],
                "positiveIntegerOnly": [],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            notificationService.notifyClientOutOfCredits(req.body.email);
            res.send({status: "Request Sent"});
        }
    },


    /**
     * ENDPOINT: /api/notifyClientLowCredits
     * Notifies client that they are low on credits:
     * {
     *     "auth": authentication credentials; either master or token,
     *     "email": email of client to be notified
     * }
     * @returns {Promise<[{},...]>}
     */
    notifyClientOutOfCredits: async (req, res) =>{
        console.log("Notifying client of low bucket via rest!");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["email", "auth"],
                "positiveIntegerOnly": [],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            notificationService.notifyClientLowCredits(req.body.email);
            res.send({status: "Request Sent"});
        }
    },



    /**
     * ENDPOINT: /api/notifyFMAdminPaymentSourceAdded
     * Notifies admin that a payment source has been added:
     * {
     *     "auth": authentication credentials; either master or token,
     *     "customerName": name of customer that added a payment source,
     *     "paymentType": type of payment added
     * }
     * @returns {Promise<[{},...]>}
     */
    notifyFMAdminPaymentSourceAdded: async (req, res) =>{
        console.log("Notifying app admin of client purchase via rest!");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["customerName","paymentType", "auth"],
                "positiveIntegerOnly": [],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            notificationService.notifyFMAdminPaymentSourceAdded(req.body.customerName, req.body.paymentType);
            res.send({status: "Request Sent"});
        }
    },


    /**
     * ENDPOINT: /api/notifyAdminClientUpdate
     * Notifies app admins of a client's purchase details:
     * {
     *     "auth": authentication credentials; either master or token,
     *     "planId": plan for which hours were purchased,
     *     "numHours": number of hours purchased,
     *     "clientName": name of purchasing client
     * }
     * @returns {Promise<[{},...]>}
     */
    notifyAdminClientUpdate: async (req, res) =>{
        console.log("Notifying app admin of client purchase via rest!");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["planId", "auth", "clientName"],
                "positiveIntegerOnly": ["numHours"],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            notificationService.emailFMAdminClientUpdate(req.body.planId, req.body.numHours, req.body.clientName);
            res.send({status: "Request Sent"});
        }
    }
};