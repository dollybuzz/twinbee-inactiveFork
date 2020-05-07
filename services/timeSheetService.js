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
        let sheets = timeSheetRepo.getAllSheets();
        sheets.forEach(async row=>{
            if (row.end_time === '0000-00-00 00:00:00')
            {
                let refinedSheet = await createSheetFromRow(row);
                onlineUsers.push(refinedSheet);
            }
        })
        return onlineUsers;
    }

    async getAllTimeSheets(){
        let refinedSheets = [];
        let sheets = timeSheetRepo.getAllSheets();
        sheets.forEach(async row=>{
            let refinedSheet = await createSheetFromRow(row);
            refinedSheets.push(refinedSheet);
        })
        return refinedSheets;
    }

    /**
     * Retrieves time all time sheets for a given maker.
     * @param id    - id of the desired maker
     * @returns {Promise<[]>} containing time_sheet objects
     */
    async getSheetsByMaker(id){
        let sheets = await timeSheetRepo.getSheetsByMaker(id);
        let makerSheets = [];
        sheets.forEach(async row=>{
            let refinedSheet = await createSheetFromRow(row);
            makerSheets.push(refinedSheet);
        })
        return makerSheets;
    }
    /**
     * Retrieves time all time sheets for a given client.
     * @param id    - id of the desired client
     * @returns {Promise<[]>} containing timeSheet objects
     */
    async getSheetsByClient(id){
        let sheets = await timeSheetRepo.getSheetsByClient(id);
        let clientSheets = [];
        sheets.forEach(async row=>{
            let refinedSheet = await createSheetFromRow(row);
            clientSheets.push(refinedSheet);
        })
        return clientSheets;
    }

    /**
     *
     * @param maker
     * @param client
     * @returns {Promise<void>}
     */
    async initializeTimesheet(maker, client){

    }


}

//helper function
createSheetFromRow = async row => {
    return new TimeSheet(row.id, row.maker_id, row.hourly_rate,
        row.client_id, row.start_time, row.end_time, row.occupation);
}


module.exports = new TimeSheetService();