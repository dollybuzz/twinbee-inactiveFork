//TODO; have errors send us notifications rather than "throw"

const {query} = require("./repoMaster.js");
class RelationshipRepository {
    constructor() {
    };

    createRelationship(makerId, clientId, planId, occupation) {
        return new Promise((resolve, reject) => {

            let sql = 'INSERT INTO relationship(maker_id, client_id, plan_id, occupation)' +
                ' VALUES (?, ?, ?, ?)';
            let sqlParams = [makerId, clientId, planId, task];
            query(sql, sqlParams, function (err, result) {
                if (err) {
                    console.log(err);
                    reject(err)
                }
                console.log(`Relationship ${result.insertId} successfully created`);
                resolve(result.insertId);
            });
        })
    }

    async updateRelationship(id, planId, occupation, makerId) {
        let sql = 'UPDATE relationship SET ' +
            'plan_id = ?, occupation = ?, maker_id = ? WHERE id = ?';
        let sqlParams = [planId, occupation, makerId, id];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
            console.log(`Relationship ${id} updated`);
        });
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

    async getRelationshipById(id){
        let sql = 'SELECT * FROM relationship where id = ?';
        let sqlParam = [id];
        let result = await query(sql, sqlParam).catch(e => {
            console.log(e);
            result = [];
        });
        console.log(`Relationship ID retrieved for relationship ${id}`);
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