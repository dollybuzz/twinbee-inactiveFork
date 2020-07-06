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
const notificationService = require('../services/notificationService.js');
const {notifyAdmin} = require("../services/notificationService");
const dbOptions = {
    multipleStatements: true,
    host: process.env.TWINBEE_DB_HOST,
    port: process.env.TWINBEE_DB_PORT,
    user: process.env.TWINBEE_DB_USERNAME,
    password: process.env.TWINBEE_DB_PASS,
    database: process.env.TWINBEE_DB_SCHEMA
};

class DbMaster {
    constructor() {
        this.conn = mysql.createConnection(dbOptions);
        this.query = util.promisify(this.conn.query).bind(this.conn);
        this.activateConnection(this, 20).catch(error => {
            console.log(error);
            notificationService.notifyAdmin(error.toString());
        });
    }

    async activateConnection(dbMaster, numRetries) {
        notificationService.notifyAdmin("Activating dbconnection");
        return new Promise((resolve, reject) => {
            dbMaster.conn.connect(function (err) {
                if (err && err.toString().includes("ECONNREFUSED")) {
                    console.log(err);
                    notificationService.notifyAdmin(err.toString());
                    if (numRetries === 0) {
                        console.log("Failed all reconnect attempts.");
                        notificationService.notifyAdmin("Failed all reconnect attempts!");
                        reject();
                    }
                    setTimeout(function () {
                        notificationService.notifyAdmin(`Retrying connection, ${numRetries} left...`);
                        dbMaster.activateConnection(dbMaster, numRetries - 1)
                    }, 5000)
                } else {
                    resolve();
                }
            });
            dbMaster.conn.on('error', function (err) {
                notifyAdmin(`Error occurred in dbMaster. Error Code: ${err.code}\nFull Error: ${err.toString()}`);
                console.log(`Error occurred in dbMaster. Error Code: ${err.code}\nFull Error: ${err.toString()}`);
                if (err.code.toString() === 'PROTOCOL_CONNECTION_LOST') {
                    notifyAdmin("Attempting to recover.");
                    console.log("Attempting to recover.");
                    dbMaster.conn = mysql.createConnection(dbOptions);
                    dbMaster.activateConnection(dbMaster, numRetries);
                    dbMaster.query = util.promisify(dbMaster.conn.query).bind(dbMaster.conn);
                } else {
                    notifyAdmin("Unable to recover.");
                    console.log("Unable to recover.");
                    throw new Error(err);
                }
            })
        })
    }
}

module.exports = new DbMaster();