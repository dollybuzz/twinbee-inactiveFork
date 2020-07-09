const notificationService = require('../services/notificationService.js');
const authService = require('../services/authService.js');
const {notifyAdmin} = require("../services/notificationService");

//TODO: find a home for the validator
let validatorMap = {
    "present": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate) {
            if (!body[keyString]) {
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "positiveIntegerOnly": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate) {
            if (!body[keyString] || !Number.parseInt(body[keyString])
                || body[keyString].includes("-") || body[keyString].includes(" ") || body[keyString].includes(".")) {
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "noSpaces": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate) {
            if (!body[keyString] || body[keyString].includes(" ")) {
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "positiveDecimalAllowed": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate) {
            if (!body[keyString] || !Number.parseFloat(body[keyString])
                || body[keyString].includes("-")) {
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "decimalAllowed": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate) {
            if (!body[keyString] || !Number.parseFloat(body[keyString])) {
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
};

/**
 *  validates parameters
 * @param paramArrayMap - object in form:
 * {
 *      present: array of string keys that should be present
 *      positiveIntegerOnly: array of string keys that should parse to positive integers only,
 *      noSpaces: array of string keys that should not have spaces
 * }
 *
 * @param body request body to validate
 * @returns object in the form:
 * {
 *      isValid: a boolean indicating whether or not the parameters were valid
 *      message: a string description of the result
 * }
 */
async function validateParams(paramArrayMap, body) {
    let validator = {isValid: true, message: ""};
    let paramsTypesToScan = ["present", "positiveIntegerOnly", "noSpaces", "positiveDecimalAllowed", "decimalAllowed"];
    for (var paramName of paramsTypesToScan) {
        let keyArray = paramArrayMap[paramName];
        if (keyArray) {
            let result = await validatorMap[paramName](keyArray, body);
            if (!result.isValid) {
                validator.isValid = false;
                validator.message += result.message;
            }
        }
    }
    if (!validator.message) {
        validator.message = "Valid";
    }
    if (!validator.isValid){
        console.log(`Failed to validate! \nParameters:\n${JSON.stringify(paramArrayMap)}\nBody:\n${JSON.stringify(body)}\nTrace:${JSON.stringify(tracer.stack)}`);
        notifyAdmin(`Failed to validate! \nParameters:\n${JSON.stringify(paramArrayMap)}\nBody:\n${JSON.stringify(body)}\nTrace:${JSON.stringify(tracer.stack)}`);
}
    return validator;
}


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