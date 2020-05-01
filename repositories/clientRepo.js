const {query} = require('./repoMaster');
const request = require('request');
class ClientRepository{
    constructor(){};
    
    createClient(name, location, remainingHours, email){
        let sql = 'INSERT INTO client(name, location, remaining_hours, email) ' +
            'VALUES (?, ?, ?, ?)';
        let sqlParams = [name, location, remainingHours, email];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        })
    }

    updateClient(id, name, location, remainingHours, email){
        let sql = 'UPDATE client ' +
            'SET name = ?, location = ?, remaining_hours = ?, email = ? ' +
            'WHERE id = ?';
        let sqlParams = [name, location, remainingHours, email, id];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        })
    }




    deleteClient(id){
        let sql = 'DELETE FROM client WHERE id = ?';
        let sqlParams = [id];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        })
    }

    decrementHoursClient(id, hoursToSubtract){
        let sql = 'UPDATE client ' +
            'SET remaining_hours = remaining_hours - ? ' +
            'WHERE client.id = ?';
        let sqlParams = [hoursToSubtract, id];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        })
    }

    async getAllClients(){
        let sql = 'SELECT * FROM client';
        let sqlParam = [];
        let result = await query(sql, sqlParam).catch(e =>{
            console.log(e);
            result = [];});
        return result;
    }

    async getClientsByMaker(makerId){
        let sql = 'SELECT * ' +
            'FROM client ' +
            'JOIN time_sheet ON client.id = time_sheet.client_id ' +
            'WHERE maker_id = ? ' +
            'GROUB BY client_id ' +
            'ORDER BY end_time DESC';
        let sqlParams = [makerId];
        let result = await query(sql, sqlParam).catch(e =>{
            console.log(e);
            result = [];});
        return result;
    }

    async getClientIdByName(name){
        let sql = 'SELECT id FROM client WHERE name = ?';
        let sqlParam = [name];
        let result = await query(sql, sqlParam).catch(e =>{
            console.log(e);
            result = [];});
        return result;
    }
    async getClientNameById(id){
        let sql = 'SELECT name FROM client WHERE id = ?';
        let sqlParam = [id];
        let result = await query(sql, sqlParam).catch(e =>{
            console.log(id);
            result = [];});
        return result;
    }
}

module.exports = new ClientRepository();