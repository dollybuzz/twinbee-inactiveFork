const makerRepo = require('../repositories/makerRepo.js');
const moment = require('moment');
const util = require('util')
const request = util.promisify(require('request'));

class TimeClockService {
    constructor(){};

    async getCurrentMoment(){
        return await moment.utc().format('YYYY-MM-DD HH:mm:ss');
    }

    async clockIn(makerId, hourlyRate, clientId, task){
        let result = await request({
            method: 'POST',
            uri: `https://www.freedom-makers-hours.com/api/getTimeSheetsByMakerId`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH,
                'id':makerId.toString()
            }
        });
        result = JSON.parse(result.body);
        for (var sheet of result){
            if (sheet.timeOut == '0000-00-00 00:00:00'){
                console.log(`User ${makerId} bad clock in attempt; already clocked in`);
                return true; //attempt successful, a clock-in exists.
            }
        }

        let rightNow = await this.getCurrentMoment();
        result = await request({
            method: 'POST',
            uri: `https://www.freedom-makers-hours.com/api/createTimeSheet`,
            form: {
                'makerId': makerId,
                'hourlyRate': hourlyRate,
                'clientId': clientId,
                timeIn: await this.getCurrentMoment(),
                timeOut: '0000-00-00 00:00:00',
                'task': task,
                'auth':process.env.TWINBEE_MASTER_AUTH
            }
        });
        let body = JSON.parse(result.body);

        console.log(`Clock-in request sent for ${makerId} at time ${rightNow}`);
        return Number.isInteger(body.id);
    }

    /**
     * "Clocks out" a maker by id
     * NOTE: This assumes only one sheet should be 'online' at a time.
     * If multiple are online, all are clocked out.
     *
     * @param makerId   - id of maker to clock out
     */
    async clockOut(makerId){
        let result = await request({
            method: 'POST',
            uri: `https://www.freedom-makers-hours.com/api/getTimeSheetsByMakerId`,
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
            if (currentSheet.timeIn[0] != "0" && currentSheet.timeOut[0] == "0"){
                onlineSheets.push(currentSheet);
            }
        }

        //"clock out" online sheets
        for (var i = 0; i < onlineSheets.length; ++i){
            let currentSheet = onlineSheets[i];
            let rightNow = await this.getCurrentMoment();
            request({
                method: 'POST',
                uri: `https://www.freedom-makers-hours.com/api/updateTimeSheet`,
                form: {
                    id: currentSheet.id,
                    hourlyRate: currentSheet.hourlyRate,
                    timeIn: currentSheet.timeIn,
                    timeOut: rightNow,
                    'auth':process.env.TWINBEE_MASTER_AUTH
                }
            });
            console.log(`Clock-out timesheet request sent for ${makerId} at time ${rightNow}`);

            let shiftLength = await this.getMinutesBetweenMoments(moment(currentSheet.timeIn), rightNow);
            request({
                method: 'POST',
                uri: `https://www.freedom-makers-hours.com/api/updateClientTimeBucket`,
                form: {
                    id: currentSheet.clientId,
                    planId: currentSheet.hourlyRate,
                    minutes: shiftLength * -1,
                    'auth':process.env.TWINBEE_MASTER_AUTH
                }
            });

            console.log("Update client bucket due do clock-out request sent");
        }
        return onlineSheets.length > 0;
    }

    async getMinutesBetweenMoments(start, end){
        let exactSeconds = moment.duration(moment(end).diff(start)).asMinutes();
        let estimatedMinutes = exactSeconds.toFixed(0);
        return estimatedMinutes;
    }
}

module.exports = new TimeClockService();