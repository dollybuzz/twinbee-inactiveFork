const makerRepo = require('../repositories/makerRepo.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');

class TimeSheetService {
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

    async getAllTimesheets(){
        console.log("Time Clock Service's getAllTimesheets still needs to be finalized, be careful!");

        return await timeSheetRepo.getAllSheets();
    }

    /**
     * Retrieves time all time sheets for a given maker.
     * @param id    - id of the desired maker
     * @returns {Promise<[]>} containing time_sheet objects
     */
    async getSheetsByMaker(id){
        let sheets = [];

        return sheets;
    }

    async initializeTimesheet(maker, client){

    }

    /**
     * Determines whether or not a maker is logged in
     * @param id
     * @returns {Promise<>} containing boolean login status
     */
    async makerIsOnline(maker){
        throw new Error('not yet implemented')
        //async hasEndTime();
    }

    /**
     * Retrieves a combination of user, client, and time sheet data for
     * a given logged in user
     * @param id    - id of the desired maker
     * @returns {Promise<>} containing object with the given data
     */
    async getDataForOnlineMaker(id){
        throw new Error('not yet implemented')
    }


    async getStartTime(id){}
    async getEndTime(id){}




}

module.exports = new TimeSheetService();