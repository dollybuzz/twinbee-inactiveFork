const timeSheetService = require('../services/timeSheetService.js');
const {logCaughtError} = require('../util.js');
const {validateParams} = require("../util.js");

module.exports = {

    /**
     * ENDPOINT: /api/getAllTimeSheets
     * Retrieves a list of all timesheets in form
     * [
     *      {
     *          "id": sheet id,
     *          "makerId": id of owning maker,
     *          "planId": pay rate of owning maker,
     *          "clientId": id of client maker is assigned to for pay period,
     *          "timeIn": dateTime of "clock in" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *          "timeOut": dateTime of "clock out" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *          "task": task of maker for time period,
     *          "relationshipId": id of relationship binding sheet entities
     *      }...
     *  ]
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
        let timeSheets = await timeSheetService.getAllTimeSheets().catch(err => logCaughtError(err));
        res.send(timeSheets);
    },

    /**
     * ENDPOINT: /api/getTimeSheetsByClientId
     * Retrieves a list of all timesheets for work performed for a given client in form
     *  [
     *      {
     *          "id": sheet id,
     *          "makerId": id of owning maker,
     *          "planId": pay rate of owning maker,
     *          "clientId": id of client maker is assigned to for pay period,
     *          "timeIn": dateTime of "clock in" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *          "timeOut": dateTime of "clock out" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *          "task": task of maker for time period,
     *          "relationshipId": id of relationship binding sheet entities
     *      },...
     *  ]
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
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let id = req.body.id;
            let clientTimeSheets = await timeSheetService.getSheetsByClient(id).catch(err => logCaughtError(err));
            res.send(clientTimeSheets);
        }
    },


    /**
     * ENDPOINT: /api/getTimeSheet
     * Retrieves a time sheet in the form
     * {
     *      "id": sheet id,
     *      "makerId": id of owning maker,
     *      "planId": pay rate of owning maker,
     *      "clientId": id of client maker is assigned to for pay period,
     *      "timeIn": dateTime of "clock in" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *      "timeOut": dateTime of "clock out" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *      "task": task of maker for time period,
     *      "relationshipId": id of relationship binding sheet entities
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
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let id = req.body.id;
            let sheet = await timeSheetService.getTimeSheet(id).catch(err => logCaughtError(err));
            console.log(await timeSheetService.getTimeSheet(id).catch(err => logCaughtError(err))
            );
            res.send(sheet);
        }
    },

    /**
     * ENDPOINT: /api/getTimeSheetsByMakerId
     * Retrieves a list of all timesheets for a given maker in form
     * [
     *      {
     *          "id": sheet id,
     *          "makerId": id of owning maker,
     *          "planId": pay rate of owning maker,
     *          "clientId": id of client maker is assigned to for pay period,
     *          "timeIn": dateTime of "clock in" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *          "timeOut": dateTime of "clock out" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *          "task": task of maker for time period,
     *          "relationshipId": id of relationship binding sheet entities
     *      }...
     * ]
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
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let id = req.body.id;
            let makerTimeSheet = await timeSheetService.getSheetsByMaker(id).catch(err => logCaughtError(err));
            res.send(makerTimeSheet);
        }
    },

    /**
     * ENDPOINT: /api/updateTimeSheet
     * Updates the hourly rate, start time, and end time of the
     * timesheet with the given id. Looks for values in the body in the form:
     * {
     *     "id": database id of the timesheet,
     *     "planId": new associated plan rate, e.g, 'freedom-makers-32',
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
        let validationResult = await validateParams({"present": ["id", "planId", "timeIn", "timeOut"]}, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            timeSheetService.updateTimesheet(req.body.id, req.body.planId,
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
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
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
     *      "planId": pay rate of owning maker,
     *      "clientId": id of client maker is assigned to for pay period,
     *      "timeIn": dateTime of "clock in" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *      "timeOut": dateTime of "clock out" in form 'YYYY-MM-DDTHH:MM:SS.000Z',
     *      "relationshipId": id of relationship ,
     *      "task": task of maker for time period,
     *      "auth": authentication credentials; either master or token.
     *      "detail": entry for admin note on add,
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    createTimeSheet: async (req, res) => {
        console.log("Attempting to create a timesheet");
        console.log(req.body);
        let validationResult = await validateParams({"present": ["makerId", "planId", "clientId", "timeIn", "timeOut", "relationshipId"]}, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let createdSheet = await timeSheetService.createTimeSheet(req.body.makerId, req.body.planId, req.body.clientId,
                req.body.timeIn, req.body.timeOut, req.body.task, req.body.detail, req.body.relationshipId).catch(err => logCaughtError(err));
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
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await timeSheetService.clockIn(req.body.auth, req.body.task,
                req.body.relationshipId).catch(err => logCaughtError(err)));
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
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await timeSheetService.clockOut(req.body.auth, req.body.newTask).catch(err => logCaughtError(err)));
        }
    },

    /**
     * ENDPOINT: /api/getMakerCurrentTimeSheet
     * Retrieves the current time sheet for an online maker:
     * {
     *     "makerId": id of requesting maker
     *     "auth": valid authentication
     * }
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getOnlineSheet: async (req, res) => {
        console.log('Retrieving the most current time sheet for maker:');
        console.log(req.body);
        let validationResult = await validateParams({"present": ["auth", "makerId"]}, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await timeSheetService.getLastOnlineSheet(req.body.makerId).catch(err => logCaughtError(err)));
        }
    },


    /**
     * ENDPONT: /api/makerOnTheGo
     *
     * Logs a preset amount of time for the requesting maker.
     * Provides all time-bucket and time-sheet automation that clockOut and clockIn offer.
     * Looks for values in the body in the form:
     * {
     *     "auth": authentication credentials,
     *     "token": requester's token,
     *     "relationshipId": id of the relationship to log time against,
     *     "minutes": number of minutes to log,
     *     "task": on the go task
     * }
     * returns the created timeSheet
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    makerOnTheGo: async (req, res) =>{
        console.log("Attempting to log On The Go time for a maker from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["auth", "token", "task"],
                "positiveIntegerOnly": ["relationshipId", "minutes"],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await timeSheetService.makerOnTheGo(req.body.token, req.body.relationshipId, req.body.minutes, req.body.task));
        }
    },


    /**
     * ENDPONT: /api/onTheGo
     *
     * Logs a preset amount of time for the maker in the given relationship.
     * Provides all time-bucket and time-sheet automation that clockOut and clockIn offer.
     * Looks for values in the body in the form:
     * {
     *     "auth": authentication credentials,
     *     "relationshipId": id of the relationship to log time against,
     *     "minutes": number of minutes to log,
     *     "task": on the go task
     * }
     * returns the created timeSheet
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    onTheGo: async (req, res) =>{
        console.log("Attempting to log On The Go time for a maker from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["auth", "task"],
                "positiveIntegerOnly": ["relationshipId", "minutes"],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await timeSheetService.logOnTheGo(req.body.relationshipId, req.body.minutes, req.body.task));
        }
    }
};