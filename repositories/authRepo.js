const {query} = require('./repoMaster');
const request = require('request');
class AuthRepository {
    constructor() {
    };

    async getAdmins() {
        let sql = 'SELECT * FROM admin';
        let sqlParam = [];
        let result = await query(sql, sqlParam).catch(e => {
            console.log(e);
            result = [];
        });
        return result;
    }
}

module.exports = new AuthRepository();