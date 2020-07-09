const timeSheetService = require('../services/timeSheetService.js');
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
            if (!body[keyString] || !Number.parseInt(body[keyString])
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
            if (!body[keyString] || !Number.parseInt(body[keyString])){
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
    if (!validator.isValid){
        console.log(`Failed to validate! \nParameters:\n`);
        console.log(paramArrayMap);
        console.log("\nBody:\n")
        console.log(paramArrayMap);
        notifyAdmin(`Failed to validate! \nParameters:\n`);
        notifyAdmin(paramArrayMap);
        notifyAdmin("\nBody:\n")
        notifyAdmin(paramArrayMap);
    }
    return validator;
}


module.exports = {

    /**
     * ENDPOINT: /api/getAllTimeSheets
     * Retrieves a list of all timesheets in form
     * {
     *      "id": sheet id,
     *      "makerId": id of owning maker,
     *      "hourlyRate": pay rate of owning maker,
     *      "clientId": id of client maker is assigned to for pay period,
     *      "timeIn": dateTime of "clock in" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *      "timeOut": dateTime of "clock out" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *      "task": task of maker for time period
     * }
     *
     * Looks for data in the body as follows:
     * {
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @returns {Promise<[timeSheet]>}
     */
    getAllTimeSheets: async (req, res) => {
        console.log("Attempting to get all timesheets from REST");
        let timeSheets = await timeSheetService.getAllTimeSheets().catch(err => {
            console.log(err);
            notifyAdmin(err.toString())
        });
        res.send(timeSheets);
    },

    /**
     * ENDPOINT: /api/getTimeSheetsByClientId
     * Retrieves a list of all timesheets for work performed for a given client in form
     * {
     *      "id": sheet id,
     *      "makerId": id of owning maker,
     *      "hourlyRate": pay rate of owning maker,
     *      "clientId": id of client maker is assigned to for pay period,
     *      "timeIn": dateTime of "clock in" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *      "timeOut": dateTime of "clock out" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *      "task": task of maker for time period
     * }
     * Looks for values in the body in form:
     * {
     *     "id": client's chargebee id,
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @returns {Promise<[timeSheet]>}
     */
    getTimeSheetsByClientId: async (req, res) => {
        console.log("Attempting to get sheets by client from REST");
        console.log(req.body);
        let validationResult = await validateParams({"present": ["id"]}, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let id = req.body.id;
            let clientTimeSheets = await timeSheetService.getSheetsByClient(id).catch(err => {
                console.log(err);
                notifyAdmin(err.toString())
            });
            res.send(clientTimeSheets);
        }
    },


    /**
     * ENDPOINT: /api/getTimeSheet
     * Retrieves a time sheet in the form
     * {
     *      "id": sheet id,
     *      "makerId": id of owning maker,
     *      "hourlyRate": pay rate of owning maker,
     *      "clientId": id of client maker is assigned to for pay period,
     *      "timeIn": dateTime of "clock in" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *      "timeOut": dateTime of "clock out" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *      "task": task of maker for time period
     * }
     * Looks for values in the body in form:
     * {
     *     "id": time sheet id,
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @returns {Promise<timeSheet>}
     */
    getTimeSheet: async (req, res) => {
        console.log("Attempting to get a time sheet from REST");
        console.log(req.body);
        let validationResult = await validateParams({"present": ["id"]}, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let id = req.body.id;
            let sheet = await timeSheetService.getTimeSheet(id).catch(err => {
                console.log(err);
                notifyAdmin(err.toString())
            });
            console.log(await timeSheetService.getTimeSheet(id).catch(err => {
                    console.log(err);
                    notifyAdmin(err.toString())
                })
            );
            res.send(sheet);
        }
    },

    /**
     * ENDPOINT: /api/getTimeSheetsByMakerId
     * Retrieves a list of all timesheets for a given maker in form
     * {
     *      "id": sheet id,
     *      "makerId": id of owning maker,
     *      "hourlyRate": pay rate of owning maker,
     *      "clientId": id of client maker is assigned to for pay period,
     *      "timeIn": dateTime of "clock in" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *      "timeOut": dateTime of "clock out" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *      "task": task of maker for time period
     * }
     * Looks for values in the body in form:
     * {
     *     "id": maker's database id,
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @returns {Promise<[timeSheet]>}
     */
    getTimeSheetsByMakerId: async (req, res) => {
        console.log("Attempting to get sheets by maker from REST");
        console.log(req.body);
        let validationResult = await validateParams({"present": ["id"]}, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let id = req.body.id;
            let makerTimeSheet = await timeSheetService.getSheetsByMaker(id).catch(err => {
                console.log(err);
                notifyAdmin(err.toString())
            });
            res.send(makerTimeSheet);
        }
    },

    /**
     * ENDPOINT: /api/updateTimeSheet
     * Updates the hourly rate, start time, and end time of the
     * timesheet with the given id. Looks for values in the body in the form:
     * {
     *     "id": database id of the timesheet,
     *     "hourlyRate": new associated plan rate, e.g, 'freedom-makers-32',
     *     "timeIn": new clock-in time,
     *     "timeOut": new clock-out time,
     *     "auth": authentication credentials; either master or token
     *     "detail" : entry for admin note on mod change
     * }
     *
     * @returns {Promise<void>}
     */
    updateTimeSheetsById: async (req, res) => {
        console.log("Attempting to update timesheet by id from REST");
        console.log(req.body);
        let validationResult = await validateParams({"present": ["id", "hourlyRate", "timeIn", "timeOut", "detail"]}, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            timeSheetService.updateTimesheet(req.body.id, req.body.hourlyRate,
                req.body.timeIn, req.body.timeOut, req.body.task, req.body.detail);
            res.send({});
        }
    },

    /**
     * ENDPOINT: /api/clearTimeSheet
     * Marks a timesheet for deletion. Looks for values in the body in the form:
     * {
     *     "id": id of timesheet to be marked for deletion,
     *     "auth": authentication credentials; either master or token,
     *     "detail": reason for timesheet alteration as a string
     * }
     */
    clearTimeSheet: async (req, res) => {
        console.log("Attempting to delete timesheet from REST");
        console.log(req.body);
        let validationResult = await validateParams({"present": ["id", "detail"]}, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            timeSheetService.clearTimeSheet(req.body.id, req.body.detail);
            res.send({});
        }
    },

    /**
     * ENDPOINT: /api/createTimeSheet
     * Creates a new timesheet based on the given data.  Looks for values in the body
     * in the form:
     * {
     *      "makerId": id of owning maker,
     *      "hourlyRate": pay rate of owning maker,
     *      "clientId": id of client maker is assigned to for pay period,
     *      "timeIn": dateTime of "clock in" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *      "timeOut": dateTime of "clock out" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *      "task": task of maker for time period,
     *      "auth": authentication credentials; either master or token
     *      "detail": entry for admin note on add
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    createTimeSheet: async (req, res) => {
        console.log("Attempting to create a timesheet");
        console.log(req.body);
        let validationResult = await validateParams({"present": ["makerId", "hourlyRate", "clientId", "timeIn", "timeOut"]}, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let createdSheet = await timeSheetService.createTimeSheet(req.body.makerId, req.body.hourlyRate, req.body.clientId,
                req.body.timeIn, req.body.timeOut, req.body.task, req.body.detail).catch(err => {
                console.log(err);
                notifyAdmin(err.toString())
            });
            if (!createdSheet.id) {
                res.send(undefined);
            }
            res.send(createdSheet);
        }
    },


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
            res.send(await timeSheetService.clockIn(req.body.auth, req.body.task,
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
            res.send(await timeSheetService.clockOut(req.body.auth, req.body.newTask).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
    }
};