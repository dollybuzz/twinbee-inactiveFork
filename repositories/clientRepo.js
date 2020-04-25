const {query} = require('./repoMaster');
class ClientRepository{
    constructor(){};
    async getAllClients(){
        let sql = 'select * from client';
        let sqlParam = [];
        let result = await query(sql, sqlParam);
        return result;
    }

}

module.exports = new ClientRepository();