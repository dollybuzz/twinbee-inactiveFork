const repoMaster = require('./repoMaster.js');
const {logCaughtError} = require('../util.js');
class AuthRepository {
    constructor() {
    };

    async getAdmins(numRetries) {
        if (!numRetries){
            numRetries = 1;
        }
        return new Promise(async (resolve, reject)=>{
            let sql = 'SELECT * FROM admin';
            let sqlParam = [];
            let result;
            console.log("getting admins");
            result = await repoMaster.query(sql, sqlParam).catch( async e => {
                if (numRetries === 0){
                    reject();
                }
                logCaughtError(e);
                result = [];
                if (e.toString().includes("Cannot enqueue Query after fatal error.")) {
                    await repoMaster.activateConnection(repoMaster, 3);
                    console.log(`Trying to get admin again, ${numRetries} retries left`);
                    resolve(await this.getAdmins(numRetries - 1));
                }
            });
            console.log("admins received");
            resolve(result);
        });
    }
}

module.exports = new AuthRepository();