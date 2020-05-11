
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
     *      "occupation": occupation of maker for time period
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
     *      "occupation": occupation of maker for time period
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
        let id = req.body.id;
        let clientTimeSheets = await timeSheetService.getSheetsByClient(id).catch(err=>{console.log(err)});
        res.send(clientTimeSheets)
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
     *      "occupation": occupation of maker for time period
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
     *     "hourlyRate": new hourly rate for this pay period,
     *     "timeIn": new clock-in time,
     *     "timeOut": new clock-out time,
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @returns {Promise<void>}
     */
    updateTimeSheetsById: async (req, res) =>{
        timeSheetService.updateTimesheet(req.body.id, req.body.hourlyRate,
            req.body.timeIn, req.body.timeOut);
    },

    /**
     * ENDPOINT: /api/deleteTimeSheet
     * Marks a timesheet for deletion. Looks for values in the body in the form:
     * {
     *     "id": id of timesheet to be marked for deletion,
     *     "auth": authentication credentials; either master or token
     * }
     */
    deleteTimeSheet: (req, res) => {
        timeSheetService.deleteTimeSheet(req.body.id);
        res.end();
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
     *      "occupation": occupation of maker for time period,
     *     "auth": authentication credentials; either master or token
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    createTimeSheet: async (req, res) => {
        let createdSheet = await timeSheetService.createTimeSheet(req.body.makerId, req.body.hourlyRate, req.body.clientId,
            req.body.timeIn, req.body.timeOut, req.body.occupation).catch(err=>{console.log(err)});
        res.send(createdSheet);
    }
};