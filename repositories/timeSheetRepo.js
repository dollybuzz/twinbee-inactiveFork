//TODO; have errors send us notifications rather than "throw"

const {query} = require("./repoMaster.js");
const notificationService = require('../services/notificationService.js');
class TimeSheetRepository {
    constructor() {
    };

    async createSheet(makerId, clientId, rate, startTime, endTime, task, adminNote) {
        let sql = 'INSERT INTO time_sheet(maker_id, client_id, hourly_rate, start_time, end_time, task, admin_note)' +
            ' VALUES (?, ?, ?, ?, ?, ?, ?)';
        let sqlParams = [makerId, clientId, rate, startTime, endTime, task, adminNote];
        let result = await query(sql, sqlParams).catch(e => {
            notificationService.notifyAdmin(e.toString());
            console.log(e);
            return('error; client or maker might not exist');
        });
        console.log(`Sheet ${result.insertId} successfully created`);
        return result.insertId;
    }

    updateSheet(id, rate, startTime, endTime, task, adminNote) {
        let sql = 'UPDATE time_sheet SET hourly_rate = ?, start_time = ?, end_time = ?, task = ?, admin_note = ? WHERE id = ?';
        let sqlParams = [rate, startTime, endTime, task, adminNote, id];
        query(sql, sqlParams, function (err, result) {
            if (err) {
                console.log(err);
                notificationService.notifyAdmin(err.toString());
            }
        });
        console.log(`Sheet ${id} successfully updated.`);
    }



    clearSheet(id, adminNote) {
        let sql = "UPDATE time_sheet SET start_time = '00:00:00', end_time = '00:00:00', " +
            "admin_note = ? WHERE id = ?";
        let sqlParams = [adminNote, id];
        query(sql, sqlParams, function (err, result) {
            if (err) {
                console.log(err);
                notificationService.notifyAdmin(err.toString());
            }
        });
        console.log(`Sheet ${id} cleared`)
    }


    async getSheetsByMaker(id) {
        let sql = 'SELECT * ' +
            'FROM time_sheet ' +
            'WHERE maker_id = ?';
        let sqlParams = [id];
        let result = await query(sql, sqlParams).catch(e => {
            notificationService.notifyAdmin(e.toString());
            console.log(e);
            result = [];
        });
        console.log(`Retrieved sheets for maker ${id}`);
        return result;
    }

    async getSheetsByClient(id) {
        let sql = 'SELECT * ' +
            'FROM time_sheet ' +
            'WHERE client_id = ?';
        let sqlParams = [id];
        let result = await query(sql, sqlParams).catch(e => {
            notificationService.notifyAdmin(e.toString());
            console.log(e);
            result = [];
        });
        console.log(`Sheets retrieved for client ${id}`);
        return result;
    }

    async getAllSheets() {
        let sql = 'SELECT * ' +
            'FROM time_sheet';
        let sqlParams = [];
        let result = await query(sql, sqlParams).catch(e => {
            notificationService.notifyAdmin(e.toString());
            console.log(e);
            result = [];
        });
        console.log(`All sheets retrieved`);
        return result;
    }
}

module.exports = new TimeSheetRepository();