require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const TimeSheet = require('../domain/entity/timeSheet.js');
const emailService = require('./notificationService.js');
const util = require('util');
const request = util.promisify(require('request'));

class TimeSheetService {
    constructor() {
    };

    /**
     * Instantiates and returns a timesheet object.
     *
     * @param makerId   - maker's database id
     * @param hourlyRate- maker's hourly rate
     * @param clientId  - client's chargebee id
     * @param timeIn    - time clocked in in form 'YYYY-MM-DD HH:MM:SS'
     * @param timeOut   - time clocked out in form 'YYYY-MM-DD HH:MM:SS'
     * @param task- maker's task for pay period
     * @param detail    - entry for admin note on add
     * @returns {Promise<TimeSheet>}
     */
    async createTimeSheet(makerId, hourlyRate, clientId, timeIn, timeOut, task, detail, relationshipId) {
        let id = await timeSheetRepo.createSheet(makerId, clientId,
            hourlyRate, timeIn, timeOut, task, detail).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        return new TimeSheet(id, makerId, hourlyRate, clientId, timeIn, timeOut, task, detail, relationshipId);
    }

    /**
     * Updates the timesheet specified by id with new values
     *
     * @param id    - timesheet's database id
     * @param hourlyRate- associated plan rate, e.g, 'freedom-makers-32'
     * @param timeIn    - time clocked in in form 'YYYY-MM-DD HH:MM:SS'
     * @param timeOut   - time clocked out in form 'YYYY-MM-DD HH:MM:SS'
     * @param task      - entry for maker task
     * @param detail    - entry for admin note on mod change
     */
    async updateTimesheet(id, hourlyRate, timeIn, timeOut, task, detail) {
        if (detail) {
            detail = `Modified by admin: ${detail}`;
        }
        return await timeSheetRepo.updateSheet(id, hourlyRate, timeIn, timeOut, task, detail);
    }

    /**
     * Clears a timesheet and replaces 'task' with a reason for clearing
     * @param id    id of sheet to be cleared
     * @param detail   reason for clearing
     */
    clearTimeSheet(id, detail) {
        detail = `Cleared by admin: ${detail}`;
        return timeSheetRepo.clearSheet(id, detail);
    }

    /**
     * Retrieves timesheets for online makers
     *
     * @returns {Promise<[timesheet]>}
     */
    async getOnlineMakerSheets() {
        let onlineUsers = [];
        let sheets = await timeSheetRepo.getAllSheets().catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        for (var i = 0; i < sheets.length; ++i) {
            if (sheets[i].end_time === '0000-00-00 00:00:00') {
                let refinedSheet = await createSheetFromRow(sheets[i]).catch(err => {
                    console.log(err);
                    emailService.notifyAdmin(err.toString());
                });
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
        let sheets = await timeSheetRepo.getAllSheets().catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        for (var i = 0; i < sheets.length; ++i) {
            let refinedSheet = await createSheetFromRow(sheets[i]).catch(err => {
                console.log(err);
                emailService.notifyAdmin(err.toString());
            });
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
        let sheets = await this.getAllTimeSheets();
        for (var i = 0; i < sheets.length; ++i) {
            if (sheets[i].id.toString() === id.toString()) {
                return sheets[i];
            }
        }
    }

    /**
     * Retrieves time all time sheets for a given maker.
     * @param id    - id of the desired maker
     * @returns {Promise<[]>} containing time_sheet objects
     */
    async getSheetsByMaker(id) {
        let sheets = await timeSheetRepo.getSheetsByMaker(id).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        let makerSheets = [];
        await sheets.forEach(async row => {
            let refinedSheet = await createSheetFromRow(row).catch(err => {
                console.log(err);
                emailService.notifyAdmin(err.toString());
            });
            makerSheets.push(refinedSheet);
        });
        return makerSheets;
    }

    /**
     * Retrieves time all time sheets for a given client.
     * @param id    - id of the desired client
     * @returns {Promise<[]>} containing timeSheet objects
     */
    async getSheetsByClient(id) {
        let sheets = await timeSheetRepo.getSheetsByClient(id).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        let clientSheets = [];
        await sheets.forEach(async row => {
            let refinedSheet = await createSheetFromRow(row).catch(err => {
                console.log(err);
                emailService.notifyAdmin(err.toString());
            });
            clientSheets.push(refinedSheet);
        });
        return clientSheets;
    }


    /**
     *
     * @param makerId
     * @returns {Promise<[TimeSheet]>} all timesheets for the given maker where clock-out == 0000-00-00 00:00:00
     */
    async getOnlineSheets(makerId) {
        console.log(`Getting online sheets for maker ${makerId}`);
        let sheetsForMaker = await this.getSheetsByMaker(makerId).catch(error => {
            console.log(error);
            emailService.notifyAdmin(error.toString())
        });
        let onlineSheets = [];
        // get online sheets
        for (var i = 0; i < sheetsForMaker.length; ++i) {
            let currentSheet = sheetsForMaker[i];
            if (currentSheet.timeIn[0].toString() !== "0" && currentSheet.timeOut[0].toString() === "0") {
                onlineSheets.push(currentSheet);
            }
        }
        return onlineSheets;
    }

    /**
     * Returns the current moment/date-time in the Twinbee standard format (YYYY-MM-DD HH:mm:ss)
     * @returns {Promise<Moment>} for the current instant
     */
    async getCurrentMoment() {
        return await moment().utcOffset("-08:00").format('YYYY-MM-DD HH:mm:ss');
    }

    /**
     * Clocks a given user in with the
     * @param token         - token of the requesting maker
     * @param relationshipId- relationship between maker and paying client
     * @param task          - maker's task for the session
     * @returns {Promise<boolean>} indicating whether the clock-in was received and processed successfully
     */
    async clockIn(token, task, relationshipId) {
        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getMakerIdByToken`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'token': token
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        let idResponse = JSON.parse(result.body);

        result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getRelationshipById`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'id': relationshipId
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        let relationship = JSON.parse(result.body);

        if (idResponse.id.toString() !== relationship.makerId.toString()) {
            console.log("Maker attempted to clock into external relationship.");
            emailService.notifyAdmin(`Maker attempted to clock into external relationship.
            Maker: ${idResponse.id}
            Relationship: ${relationshipId}
            Task: ${task}`);
            return false;
        }

        let sheets = await this.getSheetsByMaker(relationship.makerId);
        for (var sheet of sheets) {
            if (sheet.timeOut.toString() === '0000-00-00 00:00:00') {
                console.log(`User ${relationship.makerId} bad clock in attempt; already clocked in`);
                return true; //attempt successful, a clock-in exists.
            }
        }

        let rightNow = await this.getCurrentMoment().catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        let newSheet = await this.createTimeSheet(relationship.makerId, relationship.planId, relationship.clientId,
            rightNow, '0000-00-00 00:00:00', task);
        console.log(`Clock-in request sent for ${relationship.makerId} at time ${rightNow}`);

        return Number.isInteger(newSheet.id);
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

        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getMakerIdByToken`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'token': token
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        let idResponse = JSON.parse(result.body);
        let makerId = idResponse.id;

        let onlineSheets = await this.getOnlineSheets(makerId).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        //"clock out" online sheets
        for (var i = 0; i < onlineSheets.length; ++i) {
            let currentSheet = onlineSheets[i];
            let rightNow = await this.getCurrentMoment().catch(err => {
                console.log(err);
                emailService.notifyAdmin(err.toString());
            });

            await this.updateTimesheet(currentSheet.id, currentSheet.hourlyRate, currentSheet.timeIn, rightNow,
                newTask ? newTask : currentSheet.task, currentSheet.adminNote);
            console.log(`Clock-out timesheet request sent for ${makerId} at time ${rightNow}`);

            let shiftLength = await this.getMinutesBetweenMoments(moment(currentSheet.timeIn), rightNow).catch(err => {
                console.log(err);
                emailService.notifyAdmin(err.toString());
            });
            request({
                method: 'POST',
                uri: `${process.env.TWINBEE_URL}/api/updateClientTimeBucket`,
                form: {
                    id: currentSheet.clientId,
                    planId: currentSheet.hourlyRate,
                    minutes: shiftLength * -1,
                    'auth': process.env.TWINBEE_MASTER_AUTH
                }
            });

            console.log("Update client bucket due do clock-out request sent");
        }

        console.log("Confirming sheets updated appropriately...");

        onlineSheets = await this.getOnlineSheets(makerId).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        console.log("Remaining online sheets: ");
        console.log(onlineSheets);

        return onlineSheets.length === 0;
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