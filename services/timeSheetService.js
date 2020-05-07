const makerRepo = require('../repositories/makerRepo.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const TimeSheet = require('../domain/entity/timeSheet.js');

class TimeSheetService {
    constructor(){};

    async createTimeSheet(makerId, hourlyRate, clientId, timeIn, timeOut, occupation) {
        let id = await timeSheetRepo.createSheet(makerId, clientId,
            hourlyRate, timeIn, timeOut, occupation);
        return new TimeSheet(id, makerId, hourlyRate, clientId, timeIn, timeOut, occupation);
    }

    async getTimesheetById(id){
        let result = timeSheetRepo.getSheetsByMaker(id);

    }

    updateTimesheet(id, makerId, hourlyRate, timeIn, timeOut){
        timeSheetRepo.updateSheet(id, makerId, hourlyRate, timeIn, timeOut);
    }

    deleteTimeSheet(id){
        timeSheetRepo.deleteSheet(id);
    }

    async getOnlineMakers(){
        let onlineUsers = [];
       //getAllMakers, if in timesheet, dosomething
        return onlineUsers;
    }

    async getAllTimeSheets(){
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
    /**
     * Retrieves time all time sheets for a given client.
     * @param id    - id of the desired client
     * @returns {Promise<[]>} containing timeSheet objects
     */
    async getSheetsByClient(id){
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