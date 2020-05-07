const makerRepo = require('../repositories/makerRepo.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const util = require('util')
const request = util.promisify(require('request'));

class TimeClockService {
    constructor(){};

    async getCurrentMoment(){
        return await moment(Date.now()).format('YYYY-MM-DD HH:MM:SS');
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

    async clockOut(makerId){

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