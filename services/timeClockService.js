const moment = require('moment');
const util = require('util')
const request = util.promisify(require('request'));
const emailService = require('./notificationService.js');

class TimeClockService {
    constructor(){};

    /**
     *
     * @param makerId
     * @returns {Promise<[TimeSheet]>} all timesheets for the given maker where clock-out == 0000-00-00 00:00:00
     */
    async getOnlineSheets(makerId){
        let result = await request({
        method: 'POST',
        uri: `${process.env.TWINBEE_URL}/api/getTimeSheetsByMakerId`,
        form: {
            'auth':process.env.TWINBEE_MASTER_AUTH,
            'id':makerId.toString()
        }
    });

        let sheetsForMaker = JSON.parse(result.body);
        let onlineSheets = [];

        // get online sheets
        for (var i = 0; i < sheetsForMaker.length; ++i){
            let currentSheet = sheetsForMaker[i];
            if (currentSheet.timeIn[0].toString() !== "0" && currentSheet.timeOut[0].toString() === "0"){
                onlineSheets.push(currentSheet);
            }
        }
        return onlineSheets;
    }

    /**
     * Returns the current moment/date-time in the Twinbee standard format (YYYY-MM-DD HH:mm:ss)
     * @returns {Promise<Moment>} for the current instant
     */
    async getCurrentMoment(){
        return await moment.utc().format('YYYY-MM-DD HH:mm:ss');
    }

    /**
     * Clocks a given user in with the
     * @param token         - token of the requesting maker
     * @param relationshipId- relationship between maker and paying client
     * @param task          - maker's task for the session
     * @returns {Promise<boolean>} indicating whether the clock-in was received and processed successfully
     */
    async clockIn(token, task, relationshipId){
        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getMakerIdByToken`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH,
                'token':token
            }
        }).catch(err=>{
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        let idResponse = JSON.parse(result.body);

        result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getRelationshipById`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH,
                'id':relationshipId
            }
        }).catch(err=>{
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        let relationship = JSON.parse(result.body);

        if (idResponse.id.toString() !== relationship.makerId.toString()){
            console.log("Maker attempted to clock into external relationship.");
            emailService.notifyAdmin(`Maker attempted to clock into external relationship.
            Maker: ${idResponse.id}
            Relationship: ${relationshipId}
            Task: ${task}`);
            return false;
        }

        result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getTimeSheetsByMakerId`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH,
                'id':relationship.makerId.toString()
            }
        }).catch(err=>{
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        result = JSON.parse(result.body);

        for (var sheet of result){
            if (sheet.timeOut.toString() === '0000-00-00 00:00:00'){
                console.log(`User ${relationship.makerId} bad clock in attempt; already clocked in`);
                return true; //attempt successful, a clock-in exists.
            }
        }

        let rightNow = await this.getCurrentMoment();
        result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/createTimeSheet`,
            form: {
                'makerId': relationship.makerId,
                'hourlyRate': relationship.planId,
                'clientId': relationship.clientId,
                timeIn: await this.getCurrentMoment().catch(err=>{
                    console.log(err);
                    emailService.notifyAdmin(err.toString());
                }),
                timeOut: '0000-00-00 00:00:00',
                'task': task,
                'auth':process.env.TWINBEE_MASTER_AUTH
            }
        });
        let body = JSON.parse(result.body);

        console.log(`Clock-in request sent for ${relationship.makerId} at time ${rightNow}`);
        return Number.isInteger(body.id);
    }

    /**
     * "Clocks out" a maker by token
     * NOTE: This assumes only one sheet should be 'online' at a time.
     * If multiple are online, all are clocked out.
     *
     * @param token   - token of maker to clock out
     * @param newTask - updated task if any
     */
    async clockOut(token, newTask){

        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getMakerIdByToken`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH,
                'token':token
            }
        }).catch(err=>{
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        let idResponse = JSON.parse(result.body);
        let makerId = idResponse.id;

        let onlineSheets = await this.getOnlineSheets(makerId).catch(err=>{
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        //"clock out" online sheets
        for (var i = 0; i < onlineSheets.length; ++i){
            let currentSheet = onlineSheets[i];
            let rightNow = await this.getCurrentMoment().catch(err=>{
                console.log(err);
                emailService.notifyAdmin(err.toString());
            });
            request({
                method: 'POST',
                uri: `${process.env.TWINBEE_URL}/api/updateTimeSheet`,
                form: {
                    id: currentSheet.id,
                    hourlyRate: currentSheet.hourlyRate,
                    timeIn: currentSheet.timeIn,
                    timeOut: rightNow,
                    task: newTask ? newTask : currentSheet.task,
                    adminNote: currentSheet.adminNote,
                    'auth':process.env.TWINBEE_MASTER_AUTH
                }
            });
            console.log(`Clock-out timesheet request sent for ${makerId} at time ${rightNow}`);

            let shiftLength = await this.getMinutesBetweenMoments(moment(currentSheet.timeIn), rightNow).catch(err=>{
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
                    'auth':process.env.TWINBEE_MASTER_AUTH
                }
            });

            console.log("Update client bucket due do clock-out request sent");
        }

        console.log("Confirming sheets updated appropriately...");

        onlineSheets = await this.getOnlineSheets(makerId).catch(err=>{
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
    async getMinutesBetweenMoments(start, end){
        let exactSeconds = moment.duration(moment(end).diff(start)).asMinutes();
        let estimatedMinutes = exactSeconds.toFixed(0);
        return estimatedMinutes;
    }
}

module.exports = new TimeClockService();