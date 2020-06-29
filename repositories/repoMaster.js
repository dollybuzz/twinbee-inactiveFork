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

class DbMaster {
    constructor(){
        this.conn = mysql.createConnection({
            multipleStatements: true,
            host: process.env.TWINBEE_DB_HOST,
            port:process.env.TWINBEE_DB_PORT,
            user: process.env.TWINBEE_DB_USERNAME,
            password: process.env.TWINBEE_DB_PASS,
            database: process.env.TWINBEE_DB_SCHEMA
        });

        this.query = util.promisify(this.conn.query).bind(this.conn);
        this.conn.connect(function (err) {
            if (err) {
                console.log(err);
                notificationService.notifyAdmin(err);
            }
        });
    }
}

module.exports = new DbMaster();