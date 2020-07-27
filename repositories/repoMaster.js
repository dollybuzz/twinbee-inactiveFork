/*
    To use this lovely tool, import where needed by doing as follows:

    const {query} = require("./repoMaster.js");

    let sql = "select ? from ?;";
    let sqlParams = [firstParameter, secondParameter];
    let result = query(sql, sqlParams);


    The result variable will then be a list populated by objects such that
    result[0] (and all subsequent elements) will have properties whose names are
    equivalent to the column names of the queried table. It plays nice with async functions as well.
    Simply add 'await' before the query like so:

    let result = await dbControl.query(sql, sqlParams);
 */

const mysql = require("mysql");
const util = require('util');
const {logCaughtError} = require('../util.js');
const dbOptions = {
    multipleStatements: true,
    host: process.env.TWINBEE_DB_HOST,
    port: process.env.TWINBEE_DB_PORT,
    user: process.env.TWINBEE_DB_USERNAME,
    password: process.env.TWINBEE_DB_PASS,
    database: process.env.TWINBEE_DB_SCHEMA
};

class RepoMaster {
    constructor() {
        this.conn = mysql.createConnection(dbOptions);
        this.query = util.promisify(this.conn.query).bind(this.conn);
        this.activateConnection(this, 5).catch(error => {
            if(error) { logCaughtError(error)}
        });
    }

    async activateConnection(dbMaster, numRetries) {
        logCaughtError("Activating dbconnection", false);
        return new Promise(async (resolve, reject) => {
            await dbMaster.conn.connect(function (err) {
                if (err && err.toString().includes("ECONNREFUSED")) {
                    logCaughtError(err);
                    if (numRetries === 0) {
                        logCaughtError("Failed all reconnect attempts.");
                        reject();
                    }
                    setTimeout(function () {
                        logCaughtError(`Retrying connection, ${numRetries} left...`);
                        dbMaster.activateConnection(dbMaster, numRetries - 1)
                    }, 5000)
                } else {
                    let message = `Error was: ${err} String: ${err ? err.toString() : ""}`;
                    reject(err);
                }
            });

            dbMaster.conn.on('error', function (err) {
                setTimeout(async function () {
                    logCaughtError(`Error occurred in dbMaster. Error Code: ${err.code}\nFull Error: ${err.toString()}`);
                    if (err.code.toString() === 'PROTOCOL_CONNECTION_LOST') {
                        logCaughtError("Attempting to recover.");
                        dbMaster.conn = await mysql.createConnection(dbOptions);
                        await dbMaster.activateConnection(dbMaster, numRetries).catch(error => {
                            if (error) {logCaughtError(error)}
                        });
                        dbMaster.query = util.promisify(dbMaster.conn.query).bind(dbMaster.conn);
                        let message = "Recovered successfully.";
                        await dbMaster.query("select * from admin", []).catch(error => {message = "Failed to recover.";});
                        logCaughtError(message);
                    } else {
                        logCaughtError("Unable to recover.");
                        throw new Error(err);
                    }
                }, 3000)
            })
        })
    }
}

module.exports = new RepoMaster();