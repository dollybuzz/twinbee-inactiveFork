const makerRepo = require('../repositories/makerRepo.js');
const moment = require('moment');
const util = require('util')
const request = util.promisify(require('request'));

class TimeClockService {
    constructor(){};

    async getCurrentMoment(){
        return await moment.utc().format('YYYY-MM-DD HH:mm:ss');
    }

    async clockIn(makerId, hourlyRate, clientId, occupation){
        await request({
            method: 'POST',
            uri: `http://${process.env.IP}:${process.env.PORT}/api/createTimeSheet`,
            form: {
                'makerId': makerId,
                'hourlyRate': hourlyRate,
                'clientId': clientId,
                timeIn: await this.getCurrentMoment(),
                timeOut: '0000-00-00 00:00:00',
                'occupation': occupation
            }
        })
    }

    /**
     * "Clocks out" a maker by id
     * NOTE: This assumes only one sheet should be 'online' at a time.
     * If multiple are online, all are clocked out.
     *
     * @param makerId   - id of maker to clock out
     */
    async clockOut(makerId){
        let result = await request(`http://${process.env.IP}:${process.env.PORT}/api/getTimeSheetsByMakerId?id=${makerId}`);
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
            request({
                method: 'POST',
                uri: `http://${process.env.IP}:${process.env.PORT}/api/updateTimeSheet`,
                form: {
                    id: currentSheet.id,
                    hourlyRate: currentSheet.hourlyRate,
                    timeIn: currentSheet.timeIn,
                    timeOut: await this.getCurrentMoment()
                }
            })
        }
    }

    async getRunningTime(makerId){
        let allSheetsForMaker = await timeSheetService.getSheetsByMaker(makerId);
        let targetSheet = null;
        let rightNow =await this.getCurrentMoment();
        for (var i = 0; i < allSheetsForMaker.length; ++i) {
            if (allSheetsForMaker[i]['end_time'] === '0000-00-00 00:00:00') {
                targetSheet = allSheetsForMaker[i];
                break;
            }
        }

        if (!targetSheet){
            targetSheet = {end_time: rightNow}
        }

        let exactSeconds = moment.duration(rightNow-moment(targetSheet.start_time)).asSeconds();
        let estimatedSeconds = exactSeconds.toFixed(0);
        return estimatedSeconds;
    }
}

module.exports = new TimeClockService();