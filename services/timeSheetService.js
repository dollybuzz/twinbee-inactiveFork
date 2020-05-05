const makerRepo = require('../repositories/makerRepo.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const TimeSheet = require('../domain/entity/timeSheet.js');

class TimeSheetService {
    constructor(){};

    async createTimeSheet(id, makerId, hourlyRate, clientId, timeIn, timeOut, occupation) {
        return new TimeSheet(id, makerId, hourlyRate, clientId, timeIn, timeOut, occupation);
    }

    async getOnlineMakers(){
        let onlineUsers = [];
       //getAllMakers, if in timesheet, dosomething
        return onlineUsers;
    }

    async getAllTimeSheets(){
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