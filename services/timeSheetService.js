const makerRepo = require('../repositories/makerRepo.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const TimeSheet = require('../domain/entity/timeSheet.js');
const emailService = require('./emailService.js');

class TimeSheetService {
    constructor(){};

    /**
     * Instantiates and returns a timesheet object.
     *
     * @param makerId   - maker's database id
     * @param hourlyRate- maker's hourly rate
     * @param clientId  - client's chargebee id
     * @param timeIn    - time clocked in in form 'YYYY-MM-DD HH:MM:SS'
     * @param timeOut   - time clocked out in form 'YYYY-MM-DD HH:MM:SS'
     * @param task- maker's task for pay period
     * @param detail    - entry for admin note on add
     * @returns {Promise<TimeSheet>}
     */
    async createTimeSheet(makerId, hourlyRate, clientId, timeIn, timeOut, task, detail) {
        detail = `Added by admin: ${detail}`;
        let id = await timeSheetRepo.createSheet(makerId, clientId,
            hourlyRate, timeIn, timeOut, task, detail).catch(err=>{
                console.log(err);
                emailService.emailAdmin(err);
            });
        return new TimeSheet(id, makerId, hourlyRate, clientId, timeIn, timeOut, task, detail);
    }

    /**
     * Updates the timesheet specified by id with new values
     *
     * @param id    - timesheet's database id
     * @param makerId   - id of the maker who owns the timesheet
     * @param hourlyRate- associated plan rate, e.g, 'freedom-makers-32'
     * @param timeIn    - time clocked in in form 'YYYY-MM-DD HH:MM:SS'
     * @param timeOut   - time clocked out in form 'YYYY-MM-DD HH:MM:SS'
     * @param task      - entry for maker task
     * @param detail    - entry for admin note on mod change
     */
    updateTimesheet(id, hourlyRate, timeIn, timeOut, task, detail){
        detail = `Modified by admin: ${detail}`;
        timeSheetRepo.updateSheet(id, hourlyRate, timeIn, timeOut,  task, detail);
    }

    /**
     * Clears a timesheet and replaces 'task' with a reason for clearing
     * @param id    id of sheet to be cleared
     * @param detail   reason for clearing
     */
    clearTimeSheet(id, detail){
        detail = `Cleared by admin: ${detail}`;
        return timeSheetRepo.clearSheet(id, detail);
    }

    /**
     * Retrieves timesheets for online makers
     *
     * @returns {Promise<[timesheet]>}
     */
    async getOnlineMakerSheets(){
        let onlineUsers = [];
        let sheets = await timeSheetRepo.getAllSheets().catch(err=>{console.log(err)});
        for (var i = 0; i < sheets.length; ++i){
            if (sheets[i].end_time === '0000-00-00 00:00:00')
            {
                let refinedSheet = await createSheetFromRow(sheets[i]).catch(err=>{console.log(err)});
                onlineUsers.push(refinedSheet);
            }
        }
        return onlineUsers;
    }

    /**
     * Retrieves all time sheets
     *
     * @returns {Promise<[timesheet]>}
     */
    async getAllTimeSheets(){
        let refinedSheets = [];
        let sheets = await timeSheetRepo.getAllSheets().catch(err=>{console.log(err)});
        for (var i = 0; i < sheets.length; ++i){
                let refinedSheet = await createSheetFromRow(sheets[i]).catch(err=>{
                    console.log(err);
                    emailService.emailAdmin(err);
                });
            refinedSheets.push(refinedSheet);
        }
        return refinedSheets;
    }

    /**
     * Retrieves a time sheet
     *
     * @returns {Promise<void>}
     */
    async getTimeSheet(id){
        console.log(`Getting timesheet ${id}...`);
        let sheets = await this.getAllTimeSheets();
        for (var i = 0; i < sheets.length; ++i){
            if (sheets[i].id == id){
                console.log(sheets[i]);
                return sheets[i];
            }
        }
    }

    /**
     * Retrieves time all time sheets for a given maker.
     * @param id    - id of the desired maker
     * @returns {Promise<[]>} containing time_sheet objects
     */
    async getSheetsByMaker(id){
        let sheets = await timeSheetRepo.getSheetsByMaker(id).catch(err=>{
            console.log(err);
            emailService.emailAdmin(err);
        });
        let makerSheets = [];
        await sheets.forEach(async row=>{
            let refinedSheet = await createSheetFromRow(row).catch(err=>{
                console.log(err);
                emailService.emailAdmin(err);
            });
            makerSheets.push(refinedSheet);
        });
        return makerSheets;
    }

    /**
     * Retrieves time all time sheets for a given client.
     * @param id    - id of the desired client
     * @returns {Promise<[]>} containing timeSheet objects
     */
    async getSheetsByClient(id){
        let sheets = await timeSheetRepo.getSheetsByClient(id).catch(err=>{
            console.log(err);
            emailService.emailAdmin(err);
        });
        let clientSheets = [];
        await sheets.forEach(async row=>{
            let refinedSheet = await createSheetFromRow(row).catch(err=>{
                console.log(err);
                emailService.emailAdmin(err);
            });
            clientSheets.push(refinedSheet);
        });
        return clientSheets;
    }
}

//helper function
createSheetFromRow = async row => {
    return new TimeSheet(row.id, row.maker_id, row.hourly_rate,
        row.client_id, row.start_time, row.end_time, row.task, row.admin_note);
};


module.exports = new TimeSheetService();