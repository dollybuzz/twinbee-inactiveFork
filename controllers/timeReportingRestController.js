const timeReportingService = require('../services/timeReportingService.js');
const {notifyAdmin} = require("../services/notificationService.js");
const authService = require('../services/authService.js')


module.exports = {

    /**
     * ENDPOINT: /api/getTimeForMakerClientPair
     * Retrieves a "report" for a given pair of client and maker. The report
     * contains a list of sheet id's with durations, total duration, and names of
     * the pair "members".
     * Looks for data in the body in the form:
     * {
     *     "makerId": id of maker to retrieve report on,
     *     "clientId": id of client to retrieve report on,
     *     "start": inclusive beginning of reporting time,
     *     "end": exclusive ending of reporting time,
     *     "auth": authentication credentials; either master or token
     * }
     * Returns data in the form:
     *      {
     *          sheets:[
     *              {
     *                  id: timesheet id,
     *                  duration: length of time worked
     *                  clientName: client's name,
     *                  makerName: maker's name,
     *                  occupation: maker's occupation
     *              },
     *              {
     *                  id: timesheet id,
     *                  duration: length of time worked
     *                  clientName: client's name,
     *                  makerName: maker's name,
     *                  makerName: maker's occupation
     *              },...
     *          ]
     *          total: total time of all timesheets
     *      }
     */
    getTimeForMakerClientPair: async (req, res)=>{
        console.log("Attempting to grab time report for client/maker pair from REST...");
        console.log(req.body);
        res.send(await timeReportingService
            .getReportForClientMakerPair(req.body.start, req.body.end, req.body.makerId, req.body.clientId)
            .catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
    },


    /**
     * ENDPOINT: /api/getMyTimeSheetsMaker
     * Retrieves a "report" for a maker. The report
     * contains a list of sheet id's with durations, total duration, and names of
     * those present on the sheets.
     * Looks for data in the body in the form:
     * {
     *     "start": inclusive beginning of reporting time,
     *     "end": exclusive ending of reporting time,
     *     "auth": authentication credentials; either master or token
     *     "token": requester's token,
     *     "clientId": id of client to request report for (wildcard if none specified)
     * }
     * Returns data in the form:
     *      {
     *          sheets:[
     *              {
     *                  id: timesheet id,
     *                  duration: length of time worked
     *                  clientName: client's name,
     *                  makerName: maker's name,
     *                  occupation: maker's occupation
     *              },
     *              {
     *                  id: timesheet id,
     *                  duration: length of time worked
     *                  clientName: client's name,
     *                  makerName: maker's name,
     *                  makerName: maker's occupation
     *              },...
     *          ]
     *          total: total time of all timesheets
     *      }
     */
    getMakerTimeReport: async (req, res)=>{
        console.log("Attempting to grab time report for client/maker pair from REST...");
        console.log(req.body);

        res.send(await timeReportingService
            .getMyTimeReportMaker(req.body.start, req.body.end, req.body.token, req.body.clientId)
            .catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
    }
};