
const timeSheetService = require('../services/timeSheetService.js');

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
    getAllTimeSheets: async (req,res) => {
        console.log("Attempting to get all timesheets from REST");
        let timeSheets = await timeSheetService.getAllTimeSheets().catch(err=>{console.log(err)});
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
        let id = req.body.id;
        let clientTimeSheets = await timeSheetService.getSheetsByClient(id).catch(err=>{console.log(err)});
        res.send(clientTimeSheets)
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
        let id = req.body.id;
        let sheet = await timeSheetService.getTimeSheet(id).catch(err=>{console.log(err)});
        console.log(await timeSheetService.getTimeSheet(id));
        res.send(sheet)
    },

    /**
     * ENDPOINT: /getTimeSheetsByMakerId
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
        let id = req.body.id;
        let makerTimeSheet = await timeSheetService.getSheetsByMaker(id).catch(err=>{console.log(err)});
        res.send(makerTimeSheet);
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
     * }
     *
     * @returns {Promise<void>}
     */
    updateTimeSheetsById: async (req, res) =>{
        console.log("Attempting to update timesheet by id from REST");
        console.log(req.body);
        timeSheetService.updateTimesheet(req.body.id, req.body.hourlyRate,
            req.body.timeIn, req.body.timeOut);
        res.send({});
    },

    /**
     * ENDPOINT: /api/clearTimeSheet
     * Marks a timesheet for deletion. Looks for values in the body in the form:
     * {
     *     "id": id of timesheet to be marked for deletion,
     *     "auth": authentication credentials; either master or token
     * }
     */
    clearTimeSheet: (req, res) => {
        console.log("Attempting to delete timesheet from REST");
        console.log(req.body);
        timeSheetService.clearTimeSheet(req.body.id);
        res.send({});
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
     *     "auth": authentication credentials; either master or token
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    createTimeSheet: async (req, res) => {
        console.log("Attempting to create a timesheet");
        console.log(req.body);
        let createdSheet = await timeSheetService.createTimeSheet(req.body.makerId, req.body.hourlyRate, req.body.clientId,
            req.body.timeIn, req.body.timeOut, req.body.task).catch(err=>{console.log(err)});
        if (!createdSheet.id){
            res.send(undefined);
        }
        res.send(createdSheet);
    }
};