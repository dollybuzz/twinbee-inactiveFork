const {query} = require('./repoMaster');
const request = require('request');
const notificationService = require('../services/notificationService.js');
class AuthRepository {
    constructor() {
    };

    async getAdmins() {
        let sql = 'SELECT * FROM admin';
        let sqlParam = [];
        let result;
        result = await query(sql, sqlParam).catch(e => {
            console.log(e);
            result = [];
            notificationService.notifyAdmin(e);
        });
        return result;
    }
}

module.exports = new AuthRepository();