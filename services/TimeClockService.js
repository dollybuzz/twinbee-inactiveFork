const makerRepo = require('../repositories/makerRepo.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const timeSheetService = require('../services/TimeSheetService.js');

class TimeClockService {
    constructor(){};
    async getOnlineMakers(){
        let onlineUsers = [];
        let repoResult = await makerRepo.getOnlineMakers();
        repoResult.forEach(item => {
            let newObj = {};
            newObj.id = item.id;
            newObj.first_name = item.first_name;
            newObj.last_name = item.last_name;
            newObj.email = item.email;
            newObj.time_online = moment.duration(moment(Date.now())-moment(item.start_time)).asMinutes();
            onlineUsers.push(newObj);
        })
        return onlineUsers;
    }

    async getCurrentMoment(){
        return moment(Date.now());
    }

    async clockIn(maker){

    }
    async clockOut(maker){

    }
    async getRunningTime(maker){
        let allSheetsForMaker = await timeSheetService.getSheetsByMaker(maker.id);
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