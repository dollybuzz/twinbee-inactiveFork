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

    async clockIn(){

    }
    async clockOut(){

    }
    async getRunningTime(){

    }
}

module.exports = new TimeClockService();