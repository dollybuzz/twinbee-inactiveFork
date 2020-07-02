const timeClockService = require('../services/timeClockService.js');
module.exports = {

    /**
     * ENDPOINT: /api/clockIn
     * "Clocks in" a given user. Initializes a new timesheet with the provided
     * client, hourly rate, and task. Looks for values in the body in the form:
     * {
     *      "relationshipId": id of relationship to clock into,
     *     "task": type of work performed for this period,
     *     "auth": authentication credentials; either master or token
     * }
     */
    clockIn: async (req, res) => {
        console.log('Attempting to clock in user from REST:');
        console.log(req.body);
        res.send(await timeClockService.clockIn(req.body.auth, req.body.task,
            req.body.relationshipId).catch(error => {
            console.log(err);
            notifyAdmin(err.toString());
        }));
    },

    /**
     * ENDPOINT: /api/clockOut
     * "Clocks out" a given user. Completes any timesheets without valid "clock in"
     * values (ideally should only ever be one) with the current time. Looks for
     * values in the body in the form:
     * {
     *     "makerId": id of the maker to clock out,
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
        res.send(await timeClockService.clockOut(req.body.auth, req.body.newTask).catch(error => {
            console.log(err);
            notifyAdmin(err.toString());
        }));
    }
}