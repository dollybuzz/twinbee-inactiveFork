const timeClockService = require('../services/timeClockService.js');
const {notifyAdmin} = require("../services/notificationService");

let validatorMap = {
    "present": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate){
            if (!body[keyString]){
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "positiveIntegerOnly": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate){
            if (!body[keyString] || !Number.parseInt(body[keyString])
                || body[keyString].includes("-") || body[keyString].includes(" ") || body[keyString].includes(".")){
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "noSpaces": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate){
            if (!body[keyString] || body[keyString].includes(" ")){
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "positiveDecimalAllowed": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate){
            if (!body[keyString] || !Number.parseFloat(body[keyString])
                || body[keyString].includes("-")){
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "decimalAllowed": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate){
            if (!body[keyString] || !Number.parseFloat(body[keyString])){
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
async function validateParams(paramArrayMap, body){
    let validator = {isValid: true, message: ""};
    let paramsTypesToScan = ["present", "positiveIntegerOnly", "noSpaces", "positiveDecimalAllowed", "decimalAllowed"];
    for (var paramName of paramsTypesToScan){
        let keyArray = paramArrayMap[paramName];
        if (keyArray) {
            let result = await validatorMap[paramName](keyArray, body);
            if (!result.isValid) {
                validator.isValid = false;
                validator.message += result.message;
            }
        }
    }
    if (!validator.message){
        validator.message = "Valid";
    }
    return validator;
}

module.exports = {

    /**
     * ENDPOINT: /api/clockIn
     * "Clocks in" a given user. Initializes a new timesheet with the provided
     * client, hourly rate, and task. Looks for values in the body in the form:
     * {
     *     "relationshipId": id of relationship to clock into,
     *     "task": type of work performed for this period,
     *     "auth": authentication credentials; either master or token
     * }
     */
    clockIn: async (req, res) => {
        console.log('Attempting to clock in user from REST:');
        console.log(req.body);

        let validationResult = await validateParams({"present": ["auth", "relationshipId"]}, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await timeClockService.clockIn(req.body.auth, req.body.task,
                req.body.relationshipId).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
    },

    /**
     * ENDPOINT: /api/clockOut
     * "Clocks out" a given user. Completes any timesheets without valid "clock in"
     * values (ideally should only ever be one) with the current time. Looks for
     * values in the body in the form:
     * {
     *     "newTask": updated task (if desired)
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    clockOut: async (req, res) => {
        console.log('Attempting to clock out user from REST:');
        console.log(req.body);
        let validationResult = await validateParams({"present": ["auth"]}, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await timeClockService.clockOut(req.body.auth, req.body.newTask).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
    }
}