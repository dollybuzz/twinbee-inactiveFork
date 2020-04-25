const {query} = require("./repoMaster.js");
class MakerRepository{
    constructor(){};
    async getOnlineMakers(){
        let sql = 'select * from maker join time_sheet on maker.id = time_sheet.maker_id ' +
            'join client on time_sheet.client_id = client.id where end_time - start_time < 0';
        let sqlParams = [];
        let results = await query(sql, sqlParams);
        return results;
    }
    async getAllMakers(){
        let sql = 'select * from maker';
        let sqlParam = [];
        let result = await query(sql, sqlParam);
        return result;
    }
}


module.exports = new MakerRepository();