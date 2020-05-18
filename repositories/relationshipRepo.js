//TODO; have errors send us notifications rather than "throw"

const {query} = require("./repoMaster.js");
class RelationshipRepository {
    constructor() {
    };

    async createRelationship(makerId, clientId, planId, occupation) {
        let sql = 'INSERT INTO relationship(maker_id, client_id, plan_id, occupation)' +
            ' VALUES (?, ?, ?, ?)';
        let sqlParams = [makerId, clientId, planId, occupation];
        let result = await query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        });
        console.log(`Relationship ${result.insertId} successfully created`);
        return result.insertId;
    }

    async updateRelationship(id, makerId, clientId, planId, occupation) {
        let sql = 'UPDATE relationship SET maker_id = ?, client_id = ?, ' +
            'plan_id = ?, occupation = ? WHERE id = ?';
        let sqlParams = [makerId, clientId, planId, occupation, id];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        });
        console.log(`Relationship ${id} updated`);
    }

    deleteRelationship(id) {
        let sql = 'DELETE FROM relationship where id = ?';
        let sqlParams = [id];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        });
        console.log(`Relationship ${id}  deleted`);
    }


    async getAllRelationships() {
        let sql = 'SELECT * FROM relationship';
        let sqlParam = [];
        let result = await query(sql, sqlParam).catch(e => {
            console.log(e);
            result = [];
        });
        console.log("All relationships retrieved from database");
        return result;
    }

    async getRelationshipsByMakerId(makerId) {
        let sql = 'SELECT * ' +
            'FROM relationship ' +
            'WHERE maker_id = ? ';
        let sqlParam = [makerId];
        let result = await query(sql, sqlParam).catch(e => {
            console.log(e);
            result = [];
        });
        console.log(`Relationships retrieved for maker ${makerId}`);
        return result;
    }

    async getRelationshipsByClientId(clientId) {
        let sql = 'SELECT * FROM relationship WHERE client_id = ?';
        let sqlParam = [clientId];
        let result = await query(sql, sqlParam).catch(e => {
            console.log(e);
            result = [];
        });
        console.log(`Relationship ID retrieved for client ${clientId}`);
        return result;
    }
}


module.exports = new RelationshipRepository();