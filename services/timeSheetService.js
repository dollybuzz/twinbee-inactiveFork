require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const TimeSheet = require('../domain/entity/timeSheet.js');
const util = require('util');
const request = util.promisify(require('request'));
const {logCaughtError} = require('../util.js');

class TimeSheetService {
    constructor() {
    };

    /**
     * Instantiates and returns a timesheet object.
     *
     * @param makerId   - maker's database id
     * @param planId- maker's hourly rate
     * @param clientId  - client's chargebee id
     * @param timeIn    - time clocked in in form 'YYYY-MM-DD HH:MM:SS'
     * @param timeOut   - time clocked out in form 'YYYY-MM-DD HH:MM:SS'
     * @param task- maker's task for pay period
     * @param detail    - entry for admin note on add
     * @param relationshipId - id of the relationship binding the client and maker on the sheet
     * @returns {Promise<>}
     */
    async createTimeSheet(makerId, planId, clientId, timeIn, timeOut, task, detail, relationshipId) {
        if (!makerId || !planId || !clientId || !timeIn || !timeOut) {
            let error = {status: "failed to create timesheet\n", reason: ""};
            let tracer = new Error();
            error.reason += makerId ? "" : "makerId was invalid\n";
            error.reason += planId ? "" : "planId was invalid\n";
            error.reason += clientId ? "" : "clientId was invalid\n";
            error.reason += timeIn ? "" : "timeIn was invalid\n";
            error.reason += timeOut ? "" : "timeOut was invalid\n";

            logCaughtError(error.status + error.reason);
            return error;
        }
        let id = await timeSheetRepo.createSheet(makerId, clientId,
            planId, timeIn, timeOut, task, detail, relationshipId).catch(err => logCaughtError(err));
        return new TimeSheet(id, makerId, planId, clientId, timeIn, timeOut, task, detail, relationshipId);
    }

    /**
     * Updates the timesheet specified by id with new values
     *
     * @param id    - timesheet's database id
     * @param planId- associated plan rate, e.g, 'freedom-makers-32'
     * @param timeIn    - time clocked in in form 'YYYY-MM-DD HH:MM:SS'
     * @param timeOut   - time clocked out in form 'YYYY-MM-DD HH:MM:SS'
     * @param task      - entry for maker task
     * @param detail    - entry for admin note on mod change
     */
    async updateTimesheet(id, planId, timeIn, timeOut, task, detail) {
        if (detail) {
            detail = `${detail}`;
        }
        await timeSheetRepo.updateSheet(id, planId, timeIn, timeOut, task, detail).catch(err => logCaughtError(err));
        return await this.getTimeSheet(id).catch(err => logCaughtError(err));
    }

    /**
     * Clears a timesheet and replaces 'task' with a reason for clearing
     * @param id    id of sheet to be cleared
     * @param detail   reason for clearing
     */
    clearTimeSheet(id, detail) {
        if (!id) {
            return;
        }
        detail = `Cleared by admin: ${detail}`;
        return timeSheetRepo.clearSheet(id, detail);
    }

    /**
     *
     * @param makerId
     * @returns {Promise<[TimeSheet]>} all timesheets for the given maker where clock-out == 0000-00-00 00:00:00
     */
    async getOnlineSheets(makerId) {
        if (!makerId) {
            let message = "No id was passed to getOnlineSheets";
            logCaughtError(message);
            return false;
        }

        console.log(`Getting online sheets for maker ${makerId}`);
        let sheetsForMaker = await timeSheetRepo.getOnlineSheetsByMakerId(makerId).catch(error => logCaughtError(error));
        let onlineSheets = [];
        for (var sheet of sheetsForMaker) {
            let refinedSheet = await createSheetFromRow(sheet).catch(error => logCaughtError(error));
            onlineSheets.push(refinedSheet);
        }
        return onlineSheets;
    }

    /**
     * Retrieves timesheets for online makers
     * TODO: Revisit repo, have DB handle filtering
     * @returns {Promise<[timesheet]>}
     */
    async getOnlineMakerSheets() {
        let onlineUsers = [];
        let sheets = await timeSheetRepo.getAllSheets().catch(error => logCaughtError(error));

        for (var i = 0; i < sheets.length; ++i) {
            if (sheets[i].end_time === '0000-00-00 00:00:00') {
                let refinedSheet = await createSheetFromRow(sheets[i]).catch(error => logCaughtError(error));
                onlineUsers.push(refinedSheet);
            }
        }
        return onlineUsers;
    }

    /**
     * Retrieves all time sheets
     *
     * @returns {Promise<[timesheet]>}
     */
    async getAllTimeSheets() {
        let refinedSheets = [];
        let sheets = await timeSheetRepo.getAllSheets().catch(error => logCaughtError(error));

        for (var i = 0; i < sheets.length; ++i) {
            let refinedSheet = await createSheetFromRow(sheets[i]).catch(error => logCaughtError(error));
            refinedSheets.push(refinedSheet);
        }
        return refinedSheets;
    }

    /**
     * Retrieves a time sheet
     *
     * @returns {Promise<void>}
     */
    async getTimeSheet(id) {
        console.log(`Getting timesheet ${id}...`);
        let sheet = await timeSheetRepo.getTimeSheet(id).catch(error => logCaughtError(error));
        return await createSheetFromRow(sheet).catch(error => logCaughtError(error));
    }

    /**
     * Retrieves time all time sheets for a given maker.
     * @param id    - id of the desired maker
     * @returns {Promise<[]>} containing time_sheet objects
     */
    async getSheetsByMaker(id) {
        if (!id) {
            let message = "No id was passed to getSheetsByMaker";
            logCaughtError(message);
            return false;
        }
        let sheets = await timeSheetRepo.getSheetsByMaker(id).catch(error => logCaughtError(error));
        let makerSheets = [];
        for (let row of sheets) {
            let refinedSheet = await createSheetFromRow(row).catch(error => logCaughtError(error));
            makerSheets.push(refinedSheet);
        }
        return makerSheets;
    }

    /**
     * Retrieves time all time sheets for a given client.
     * @param id    - id of the desired client
     * @returns {Promise<[]>} containing timeSheet objects
     */
    async getSheetsByClient(id) {
        let sheets = await timeSheetRepo.getSheetsByClient(id).catch(error => logCaughtError(error));
        let clientSheets = [];
        for (let row of sheets) {
            let refinedSheet = await createSheetFromRow(row).catch(error => logCaughtError(error));
            clientSheets.push(refinedSheet);
        }
        return clientSheets;
    }


    /**
     *
     * @param makerId
     * @returns {Promise<[TimeSheet]>} all the most recent time sheet
     * for the given maker where clock-out == 0000-00-00 00:00:00
     */
    async getLastOnlineSheet(makerId) {
        console.log(`Getting the most recent online sheet for maker ${makerId}`);
        let sheetsForMaker = await this.getOnlineSheets(makerId).catch(error => logCaughtError(error));
        if (!sheetsForMaker.length)
        {
            return null;
        }
        let currentSheet = sheetsForMaker[sheetsForMaker.length - 1];

        let inMoment = moment(currentSheet.timeIn);
        currentSheet.secondsOnline = await this.getSecondsSince(inMoment).catch(error => logCaughtError(error));

        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getClient`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'id': currentSheet.clientId
            }
        }).catch(error => logCaughtError(error));

        let client = JSON.parse(result.body);
        currentSheet.clientName = client.deleted ? "Deleted Client" : `${client.first_name} ${client.last_name}`;
        return currentSheet;
    }

    async getSecondsSince(startMoment){
        let now = await this.getCurrentMoment().catch(error => logCaughtError(error));
        return moment.duration(moment(now).diff(startMoment)).asSeconds();
    }

    /**
     * Returns the current moment/date-time in the Twinbee standard format (YYYY-MM-DD HH:mm:ss)
     * @returns {Promise<string>} for the current instant
     */
    async getCurrentMoment() {
        return await moment().utc().utcOffset("-07:00").format('YYYY-MM-DD HH:mm:ss');
    }


    async openTimeSheet(relationship, startMoment, task) {
        let newSheet = await this.createTimeSheet(relationship.makerId, relationship.planId, relationship.clientId,
            moment(startMoment).format('YYYY-MM-DD HH:mm:ss'), '0000-00-00 00:00:00', task, "Live Clock", relationship.id)
            .catch(error => logCaughtError(error));
        console.log(`Clock-in request sent for ${relationship.makerId} at time ${moment(startMoment).format('YYYY-MM-DD HH:mm:ss')}`);
        return newSheet;
    }

    async closeTimeSheet(sheet, endMoment, changedTask) {
        console.log(`Close timesheet request sent for maker ${sheet.makerId} at time ${moment(endMoment).format('YYYY-MM-DD HH:mm:ss')}`);

        sheet = await this.updateTimesheet(sheet.id, sheet.planId, sheet.timeIn, moment(endMoment).format('YYYY-MM-DD HH:mm:ss'),
            changedTask ? changedTask : sheet.task, sheet.adminNote).catch(error => logCaughtError(error));
        return sheet;
    }

    async makerOnTheGo(token, relationshipId, minutes, task) {
        let relationship = await this.extractRelationship(relationshipId).catch(error => logCaughtError(error));
        if (!(await this.tokenIsInSheetRelationship(token, relationship).catch(error => logCaughtError(error)))){
            return false;
        }
        return await this.logOnTheGo(relationship.id, minutes, task);
    }


    async logOnTheGo(relationshipId, minutes, task) {
        let relationship = await this.extractRelationship(relationshipId).catch(error => logCaughtError(error));
        let now = moment();
        let year = now.year();
        let month = now.month();
        let day = now.date();
        let startTime = moment().year(year).month(month).date(day).hour(12).minute(0).second(0);
        let sheet = await this.openTimeSheet(relationship, startTime, task).catch(error => logCaughtError(error));
        let endTime = startTime.add(minutes, 'm');
        sheet = await this.closeTimeSheet(sheet, endTime).catch(error => logCaughtError(error));
        await this.updateBucketWithSheet(sheet).catch(error => logCaughtError(error));
        sheet = await this.updateTimesheet(sheet.id, sheet.planId, sheet.timeIn, sheet.timeOut, sheet.task, "On the Go!")
            .catch(error => logCaughtError(error));
        return sheet;
    }

    async updateBucketWithSheet(sheet) {
        let shiftLength = await this.getMinutesBetweenMoments(moment(sheet.timeIn), moment(sheet.timeOut))
            .catch(error => logCaughtError(error));
        request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/updateClientTimeBucket`,
            form: {
                id: sheet.clientId,
                planId: sheet.planId,
                minutes: shiftLength * -1,
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        });
    }

    async tokenIsInSheetRelationship(token, relationship) {
        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getMakerIdByToken`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'token': token
            }
        }).catch(error => logCaughtError(error));

        let idResponse = JSON.parse(result.body);
        let match = idResponse.id.toString() === relationship.makerId.toString();

        if (!match) {
            logCaughtError(`Requester did not match maker in relationship.
            Maker: ${idResponse.id}
            Relationship: ${relationship.id}`);
        }
        return match;
    }

    async extractRelationship(relationshipId) {
        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getRelationshipById`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'id': relationshipId
            }
        }).catch(error => logCaughtError(error));
        return  JSON.parse(result.body);
    }

    /**
     * Clocks a given user in with the
     * @param token         - token of the requesting maker
     * @param relationshipId- relationship between maker and paying client
     * @param task          - maker's task for the session
     * @returns {Promise<void>} indicating whether the clock-in was received and processed successfully
     */
    async clockIn(token, task, relationshipId) {
        let relationship = await this.extractRelationship(relationshipId).catch(error => logCaughtError(error));

        if (!(await this.tokenIsInSheetRelationship(token, relationship).catch(error => logCaughtError(error)))) {
            return false;
        }
        if (await this.makerIsOnline(relationship.makerId).catch(error => logCaughtError(error))) {
            console.log("Maker is already online!");
            return await this.getLastOnlineSheet(relationship.makerId).catch(error => logCaughtError(error));
        }

        let rightNow = await this.getCurrentMoment().catch(error => logCaughtError(error));
        let newSheet = await this.openTimeSheet(relationship, rightNow, task).catch(error => logCaughtError(error));

        console.log(`Clock-in request sent for ${relationship.makerId} at time ${rightNow}`);
        return await this.getLastOnlineSheet(relationship.makerId).catch(error => logCaughtError(error));
    }

    /**
     * "Clocks out" a maker by token
     * NOTE: This assumes only one sheet should be 'online' at a time.
     * If multiple are online, all are clocked out.
     *
     * @param token   - token of maker to clock out
     * @param newTask - updated task if any
     */
    async clockOut(token, newTask) {
        if (!token){
            let message = "No token (or a bad token) was passed to clockOut";
            logCaughtError(message);
            return false;
        }

        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getMakerIdByToken`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'token': token
            }
        }).catch(error => logCaughtError(error));

        let idResponse;

        try {
            idResponse = JSON.parse(result.body);
        }
        catch (e) {
            logCaughtError(e);
            return false;
        }

        let makerId = idResponse.id;
        let onlineSheets = await this.getOnlineSheets(makerId).catch(error => logCaughtError(error));

        //"clock out" online sheets
        for (var i = 0; i < onlineSheets.length; ++i) {
            let currentSheet = onlineSheets[i];
            let rightNow = await this.getCurrentMoment().catch(error => logCaughtError(error));
            let closedSheet = await this.closeTimeSheet(currentSheet, rightNow, newTask).catch(error => logCaughtError(error));
            this.updateBucketWithSheet(closedSheet);
            console.log("Update client bucket due do clock-out request sent");
        }

        return !(await this.makerIsOnline(makerId).catch(error => logCaughtError(error)));
    }


    /**
     *
     * @param makerId
     * @returns {Promise<boolean>}
     */
    async makerIsOnline(makerId) {
        let sheets = await this.getSheetsByMaker(makerId).catch(error => logCaughtError(error));

        for (var sheet of sheets) {
            if (sheet.timeIn[0].toString() !== "0" && sheet.timeOut[0].toString() === "0") {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns the number of minutes between two moment objects
     * @param start - starting moment
     * @param end   - ending moment
     * @returns {Promise<string>} string representation of an integer between two moments
     */
    async getMinutesBetweenMoments(start, end) {
        let exactSeconds = moment.duration(moment(end).diff(start)).asMinutes();
        let estimatedMinutes = exactSeconds.toFixed(0);
        return estimatedMinutes;
    }
}

//helper function
createSheetFromRow = async row => {
    return new TimeSheet(row.id, row.maker_id, row.hourly_rate,
        row.client_id, row.start_time, row.end_time, row.task, row.admin_note, row.relationship_id);
};


module.exports = new TimeSheetService();