const makerRepo = require('../repositories/makerRepo.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');

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
            onlineUsers.push(newObj);
        })
        return onlineUsers;
    }
}

module.exports = new TimeClockService();