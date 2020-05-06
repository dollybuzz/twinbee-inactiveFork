//TODO; have errors send us notifications rather than "throw"

const {query} = require("./repoMaster.js");
class MakerRepository {
    constructor() {
    };

    async createMaker(firstName, lastName, email) {
        let sql = 'INSERT INTO maker(first_name, last_name, email) VALUES (?, ?, ?)';
        let sqlParams = [firstName, lastName, email];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        })
    }

    updateMaker(id, firstName, lastName, email) {
        let sql = 'UPDATE maker SET first_name = ?, last_name = ?, email = ? WHERE id = ?';
        let sqlParams = [firstName, lastName, email, id];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        })
    }

    deleteMaker(id) {
        let sql = "DELETE FROM maker WHERE id = ?";
        let sqlParams = [id];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        })
    }


    async getOnlineMakers() {
        let sql = 'SELECT maker_id, first_name, last_name, maker.email ' +
            'FROM maker ' +
            'JOIN time_sheet ON maker.id = time_sheet.maker_id ' +
            'JOIN client ON time_sheet.client_id = client.chargebee_id ' +
            'WHERE end_time - start_time < 0 ' +
            'GROUP BY maker.id';
        let sqlParams = [];
        let result = await query(sql, sqlParams).catch(e => {
            console.log(e);
            result = [];
        });
        return result;
    }

    async getMakerById(id) {
        let sql = 'SELECT * FROM maker WHERE id = ?';
        let sqlParam = [id];
        let result = await query(sql, sqlParam).catch(e => {
            console.log(e);
            result = [];
        });
        return result;
    }

    async getAllMakers() {
        let sql = 'SELECT * FROM maker';
        let sqlParam = [];
        let result = await query(sql, sqlParam).catch(e => {
            console.log(e);
            result = [];
        });
        return result;
    }

    async getMakersByLastName(lastName) {
        let sql = 'SELECT * ' +
            'FROM maker ' +
            'WHERE last_name = ? ' +
            'GROUP BY maker.id';
        let sqlParam = [lastName];
        let result = await query(sql, sqlParam).catch(e => {
            console.log(e);
            result = [];
        });
        return result;
    }


    async getMakerIdByEmail(email) {
        let sql = 'SELECT id FROM maker WHERE email = ?';
        let sqlParam = [email];
        let result = await query(sql, sqlParam).catch(e => {
            console.log(e);
            result = [];
        });
        return result;
    }


    async getMakersByHourlyRate(rate) {
        let sql = 'SELECT * ' +
            'FROM maker ' +
            'JOIN time_sheet ON maker.id = time_sheet.maker_id ' +
            'WHERE hourly_rate = ? ' +
            'GROUP BY maker.id';
        let sqlParam = [client];
        let result = await query(sql, sqlParam).catch(e => {
            console.log(e);
            result = [];
        });
        return result;
    }

    async getMakersByNumShifts() {
        let sql = 'SELECT maker.id, first_name, last_name, email, count(time_sheet.end_time > 0) AS num_shifts ' +
            'FROM maker ' +
            'JOIN time_sheet ON maker.id = time_sheet.maker_id ' +
            'WHERE end_time > 0 ' +
            'GROUP BY maker.id ' +
            'ORDER BY num_shifts DESC';
        let sqlParam = [];
        let result = await query(sql, sqlParam).catch(e => {
            console.log(e);
            result = [];
        });
        return result;
    }
}


module.exports = new MakerRepository();