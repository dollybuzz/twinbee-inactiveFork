const timeReportingService = require('../services/timeReportingService.js');
const {notifyAdmin} = require("../services/notificationService.js");
const authService = require('../services/authService.js');
const {validateParams} = require("../util.js");

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
     *     "adminNote": filter constraint (sheet admin note must contain this value if passed),
     *     "relationshipId":filter constraint (sheet admin note must match this value if passed),
     *     "end": exclusive ending of reporting time,
     *     "auth": authentication credentials; either master or token
     * }
     * Returns data in the form:
     *      {
     *          sheets:[
     *              {
     *                   id: timesheet id,
     *                   duration: length of time worked
     *                   timeIn: sheet clock in time,
     *                   timeOut: sheet clock out time,
     *                   clientName: client's name,
     *                   company: client's company name,
     *                   makerName: maker's name,
     *                   task: task on timesheet,
     *                   plan: plan on timesheet
     *              },
     *              {
     *                   id: timesheet id,
     *                   duration: length of time worked
     *                   timeIn: sheet clock in time,
     *                   timeOut: sheet clock out time,
     *                   clientName: client's name,
     *                   company: client's company name,
     *                   makerName: maker's name,
     *                   task: task on timesheet,
     *                   plan: plan on timesheet
     *              },...
     *          ]
     *          total: total time of all timesheets
     *      }
     */
    getTimeForMakerClientPair: async (req, res)=>{
        console.log("Attempting to grab time report for client/maker pair from REST...");
        console.log(req.body);
        res.send(await timeReportingService
            .getReportForClientMakerPair(req.body.start, req.body.end, req.body.makerId,
                req.body.clientId, req.body.adminNote, req.body.relationshipId)
            .catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
    },


    /**
     * ENDPOINT: /api/getMakerTimeReport
     * Retrieves a "report" for a maker. The report
     * contains a list of sheet id's with durations, total duration, and names of
     * those present on the sheets.
     * Looks for data in the body in the form:
     * {
     *     "start": inclusive beginning of reporting time, (wildcard if none specified)
     *     "end": exclusive ending of reporting time,  (wildcard if none specified)
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
    },


    /**
     * ENDPOINT: /api/getTimeRollup
     * Retrieves a "report" for all maker/client relationships.
     * Looks for data in the body in the form:
     * {
     *     "start": inclusive beginning of reporting time, (wildcard if none specified)
     *     "end": exclusive ending of reporting time,  (wildcard if none specified)
     *     "auth": authentication credentials; either master or token
     * }
     * Returns data in the form:
     *      {
     *          sheets:[
     *              {
     *                  relationshipId: id of relationship binding entities,
     *                  freedomMaker: name of freedom maker in relationship,
     *                  client: name of client in relationship,
     *                  occupation: freedom maker's occupation for relationship,
     *                  totalTime: freedom maker's total logged minutes for the period,
     *                  penniesOwed: amount owed to freedom maker in cents (rate * time worked)
     *              },
     *              {
     *                  relationshipId: id of relationship binding entities,
     *                  freedomMaker: name of freedom maker in relationship,
     *                  client: name of client in relationship,
     *                  occupation: freedom maker's occupation for relationship,
     *                  totalTime: freedom maker's total logged minutes for the period,
     *                  penniesOwed: amount owed to freedom maker in cents (rate * time worked)
     *              },...
     *          ]
     *          total: total time of all timesheets
     *      }
     */
    getTimeRollup: async (req, res)=>{
        console.log("Attempting to grab time rollup from REST...");
        console.log(req.body);

        res.send(await timeReportingService
            .getTimeRollup(req.body.start, req.body.end)
            .catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
    }
};