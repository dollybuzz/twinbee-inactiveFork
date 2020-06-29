
const timeReportingService = require('../services/timeReportingService.js');

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
     *          clientName: client's name,
     *          makerName: maker's name
     *          }
     *          sheets:[
     *              {
     *                  id: timesheet id,
     *                  duration: length of time worked
     *              },
     *              {
     *                  id: timesheet id,
     *                  duration: length of time worked
     *              },...
     *          ]
     *          totaL: total time of all timesheets
     *      }
     */
    getTimeForMakerClientPair: async (req, res)=>{
        console.log("Attempting to grab time report for client/maker pair from REST...");
        console.log(req.body);
        res.send(await timeReportingService
            .getReportForClientMakerPair(req.body.start, req.body.end, req.body.makerId, req.body.clientId));
    }
};