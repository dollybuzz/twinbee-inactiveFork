//TODO; have errors send us notifications rather than "throw"

const {query} = require("./repoMaster.js");
class TimeSheetRepository {
    constructor() {
    };

    createSheet(makerId, clientId, rate, startTime, endTime, occupation) {
        let sql = 'INSERT INTO time_sheet(maker_id, client_id, hourly_rate, start_time, end_time, occupation)' +
            ' VALUES (?, ?, ?, ?, ?, ?)';
        let sqlParams = [makerId, clientId, rate, startTime, endTime, occupation];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        })
    }

    updateSheet(id, rate, startTime, endTime) {
        let sql = 'UPDATE time_sheet SET hourly_rate = ?, start_time = ?, end_time = ? WHERE id = ?';
        let sqlParams = [rate, startTime, endTime, id];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        })
    }



    deleteSheet(id) {
        let sql = "UPDATE time_sheet SET start_time = '00:00:00', end_time = '00:00:00', " +
            "occupation = 'removedByAdmin' WHERE id = ?";
        let sqlParams = [id];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        })
    }


    async getSheetsByMaker(id) {
        let sql = 'SELECT * ' +
            'FROM time_sheet ' +
            'WHERE maker_id = ?';
        let sqlParams = [id];
        let result = await query(sql, sqlParams).catch(e => {
            console.log(e);
            result = [];
        });
        return result;
    }

    async getSheetsByClient(id) {
        let sql = 'SELECT * ' +
            'FROM time_sheet ' +
            'WHERE maker_id = ?';
        let sqlParams = [id];
        let result = await query(sql, sqlParams).catch(e => {
            console.log(e);
            result = [];
        });
        return result;
    }

    async getAllSheets() {
        let sql = 'SELECT * ' +
            'FROM time_sheet';
        let sqlParams = [];
        let result = await query(sql, sqlParams).catch(e => {
            console.log(e);
            result = [];
        });
        return result;
    }
}


module.exports = new TimeSheetRepository();