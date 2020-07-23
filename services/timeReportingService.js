const moment = require('moment');
const util = require('util');
const request = util.promisify(require('request'));
const emailService = require('./notificationService.js');

class TimeReportingService {
    constructor() {
        this.clientMap = null;
        this.makerMap = null;
        this.setup().catch(err => catchNotification(err));
    };

    async setup(){
        this.makerMap = await getMakerMap().catch(err => catchNotification(err));
        this.clientMap = await getClientMap().catch(err => catchNotification(err));
    }

    async validateMaps(clientId, makerId) {
        if (!this.clientMap || !this.makerMap){
            await this.setup().catch(err => catchNotification(err));
        }
        if (!this.clientMap[clientId]) {
            console.log(`Couldn't find client ${clientId}. Double checking reporting service client map!`);
            this.clientMap = await getClientMap().catch(err=>{
                console.log(err);
                emailService.notifyAdmin(err);
                emailService.notifyAdmin("Failed to validate reporting maps.");
            });
        }
        if (!this.makerMap[makerId.toString()]) {
            console.log(`Couldn't find maker ${makerId} Double checking reporting service maker map!`);
            this.makerMap = await getMakerMap().catch(err=>{
                console.log(err);
                emailService.notifyAdmin(err);
                emailService.notifyAdmin("Failed to validate reporting maps.");
            });
        }
        return true;
    }

    /**
     * Converts two datetime strings into an object containing moments.
     * @param start - period start in form 'YYYY-MM-DD HH:mm:ss' INCLUSIVE
     * @param end   - period end in form 'YYYY-MM-DD HH:mm:ss' INCLUSIVE
     * @returns {Promise<{start: moment, end: moment}>}
     */
    async timePeriodToMoments(start, end) {
        if (!start) {
            start = "2020-01-01 00:00:00";
        }
        if (!end) {
            end = moment().add(1, "d");
        }
        let preferredStart = moment(start);
        let preferredEnd = moment(end).add(1, "d");
        return {start: preferredStart, end: preferredEnd};
    }


    async getReportForClientTransactions(start, end, clientId) {
        if (!clientId) {
            clientId = "";
        }
        let timePeriod = await this.timePeriodToMoments(start, end);
        let obj = {
            list: [],
            total: 0
        };

        let response = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllTransactions`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        let entries = JSON.parse(response.body);

        for (var entry of entries) {
            let transaction = entry.transaction;
            let date = moment.unix(transaction.date);
            if (date.isBetween(timePeriod.start, timePeriod.end) && transaction.customer_id.includes(clientId)) {
                obj.list.push(transaction);
                obj.total += transaction.amount;
            }
        }
        return obj;
    }


    /**
     * Retrieves a time report for the maker with the passed token. Optionally constrains report to time
     * period and specific client.
     *
     * @param start - (optional) period start in form 'YYYY-MM-DD HH:mm:ss' INCLUSIVE
     * @param end   - (optional) period end in form 'YYYY-MM-DD HH:mm:ss' INCLUSIVE
     * @param token - token of requesting maker
     * @param client- (optional) id of client to constrain report to
     * @returns {Promise<void>}
     */
    async getMyTimeReportMaker(start, end, token, client) {
        let response = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getMakerIdByToken`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'token': token
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(`Failure in getMyTimeReportMaker, contents were: Start: ${start}, End: ${end}, Token: ${token}, Client: ${client}`);
            emailService.notifyAdmin(err);
        });

        let {id} = JSON.parse(response.body);

        return await this.getReportForClientMakerPair(start, end, id, client).catch(err => catchNotification(err));
    }


    /**
     * Retrieves a rollup report for the given relationships.
     *
     * @param start             - (optional) period start in form 'YYYY-MM-DD HH:mm:ss' INCLUSIVE
     * @param end               - (optional) period end in form 'YYYY-MM-DD HH:mm:ss' INCLUSIVE
     * @param relationshipList  - list of relationships to retrieve report for
     * @returns {Promise<[{relationshipId, freedomMaker, client, occupation, totalTime, penniesOwed},...]>}
     */
    async getTimeReport(start, end, relationshipList) {
        let rollupRows = [];

        for (var relationship of relationshipList) {
            await this.validateMaps(relationship.clientId, relationship.makerId).catch(error => catchCatastrophe(error));

            let hoursReport = await this.getReportForRelationship(start, end, relationship.id).catch(err => catchNotification(err));
            let makerName = this.makerMap[relationship.makerId] ? `${this.makerMap[relationship.makerId].firstName} ${this.makerMap[relationship.makerId].lastName}`
                : `Deleted Maker ${relationship.makerId}`;
            let clientName = this.clientMap[relationship.clientId] ? `${this.clientMap[relationship.clientId].first_name} ${this.clientMap[relationship.clientId].last_name}`
                : `Deleted Client ${relationship.clientId}`;

            let rollupRow = {};
            rollupRow.relationshipId = relationship.id;
            rollupRow.freedomMaker = makerName;
            rollupRow.client = clientName;
            rollupRow.occupation = relationship.occupation;
            rollupRow.totalTime = hoursReport.total;
            rollupRow.penniesOwed = hoursReport.penniesOwed;
            rollupRows.push(rollupRow);
        }
        return rollupRows;
    }


    //TODO: Optimize.  This is an initial knowingly-naive approach.
    /**
     *
     * Retrieves a list of relationship details for a set time period including
     * relationship members and logged time for the time period. Each element of the returned
     * array contains the data for a single relationship.
     *
     * @param start             - (optional) period start in form 'YYYY-MM-DD HH:mm:ss' INCLUSIVE
     * @param end               - (optional) period end in form 'YYYY-MM-DD HH:mm:ss' INCLUSIVE
     * @returns {Promise<void>}
     */
    async getTimeRollup(start, end) {
        let response = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllRelationships`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        let relationships = JSON.parse(response.body);

        return await this.getTimeReport(start, end, relationships).catch(err => catchNotification(err));
    }

    /**
     * Retrieves reporting data for a client/maker combo. If no client or maker is passed,
     * the value is treated as a wildcard (retrieve all). Reporting data is constrained to the given
     * timeframes. If no start time is provided, 2020-01-01 is used. If no end time is provided, "now" is used.
     *
     * @param start - first day of report
     * @param end - first day excluded from report
     * @param makerId - id of maker to use as constraint
     * @param clientId - id of client to use as constraint
     * @param adminNote - admin note to use as constraint
     * @param relationshipId - relationshipId to use as constraint
     * @returns {Promise<{sheets:[], duration: total time logged}>}
     */
    async getReportForClientMakerPair(start, end, makerId, clientId, adminNote, relationshipId) {
        if (!makerId) {
            makerId = "";
        }
        if (!clientId) {
            clientId = "";
        }
        if (!adminNote) {
            adminNote = "";
        }
        if (!relationshipId) {
            relationshipId = "";
        }
        let totalTime = 0;
        let obj = {};
        let sheets = [];
        let timePeriod = await this.timePeriodToMoments(start, end).catch(err => catchNotification(err));
        let timeSheets = await getAllSheets().catch(err => catchNotification(err));

        for (var sheet of timeSheets) {
            let makerIdIsGood = makerId === "" || (sheet.makerId && makerId.toString() === sheet.makerId.toString());
            let relationshipIdIsGood = relationshipId === "" || (sheet.relationshipId && relationshipId.toString() === sheet.relationshipId.toString());
            let adminNoteIsGood = adminNote === "" || (sheet.adminNote && sheet.adminNote.toString().toLowerCase().includes(adminNote.toString().toLowerCase()));


            if (await sheetIsClosed(sheet) && sheet.clientId.includes(clientId)
                && makerIdIsGood && adminNoteIsGood && relationshipIdIsGood) {
                let endMoment = moment(sheet.timeOut);
                if (endMoment.isBetween(timePeriod.start, timePeriod.end)) {
                    let details = await this.getSheetDetails(sheet).catch(err => catchNotification(err));
                    sheets.push({
                        id: sheet.id,
                        duration: details.duration,
                        timeIn: sheet.timeIn,
                        timeOut: sheet.timeOut,
                        clientName: details.clientName,
                        company: details.clientCompany,
                        makerName: details.makerName,
                        adminNote: sheet.adminNote,
                        task: sheet.task,
                        plan: sheet.planId
                    });
                    totalTime += details.duration;
                }
            }
        }
        obj.sheets = sheets;
        obj.total = totalTime;
        return obj;
    }

    /**
     * Retrieves reporting data for a client/maker combo. If no client or maker is passed,
     * the value is treated as a wildcard (retrieve all). Reporting data is constrained to the given
     * timeframes. If no start time is provided, 2020-01-01 is used. If no end time is provided, "now" is used.
     *
     * @param start - first day of report
     * @param end - first day excluded from report
     * @param relationshipId - id of relationship ot be used as a filter
     * @returns {Promise<{sheets:[], duration: total time logged}>}
     */
    async getReportForRelationship(start, end, relationshipId) {
        if (!relationshipId) {
            relationshipId = "";
        }
        let totalTime = 0;
        let obj = {};
        let sheets = [];
        let timePeriod = await this.timePeriodToMoments(start, end).catch(err => catchNotification(err));
        let timeSheets = await getAllSheets().catch(err => catchNotification(err));
        let response = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getRelationshipById`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'id': relationshipId
            }
        }).catch(err => catchNotification(err));
        let relationship = JSON.parse(response.body);
        for (var sheet of timeSheets) {
            if (await sheetIsClosed(sheet) && await sheetRelationshipMatches(sheet, relationshipId)) {
                let endMoment = moment(sheet.timeOut);
                if (endMoment.isBetween(timePeriod.start, timePeriod.end)) {
                    let details = await this.getSheetDetails(sheet, endMoment).catch(err => catchNotification(err));
                    sheets.push({
                        id: sheet.id,
                        duration: details.duration,
                        clientName: details.clientName,
                        company: details.clientCompany,
                        makerName: details.makerName,
                        occupation: relationship.occupation,
                        plan: sheet.planId
                    });
                    totalTime += details.duration;
                }
            }
        }
        obj.sheets = sheets;
        obj.penniesOwed = Math.floor((totalTime / 60) * relationship.hourlyRate);
        obj.total = totalTime;
        return obj;
    }

    async getSheetDetails(sheet) {

        if (sheet.timeIn.toString() === "00:00:00") //deleted sheet
        {
            return {duration: 0, clientName: "Deleted Sheet", clientCompany: "Deleted Sheet", makerName: "Deleted Sheet"};
        }

        let startMoment = moment(sheet.timeIn);
        let endMoment = moment(sheet.timeOut);

        let duration = await getMinutesBetweenMoments(startMoment, endMoment).catch(err => catchNotification(err));

        await this.validateMaps(sheet.clientId, sheet.makerId).catch(error => catchCatastrophe(error));
        let client = this.clientMap[sheet.clientId];
        let maker = this.makerMap[sheet.makerId];
        let clientName = this.clientMap[sheet.clientId] ? `${client.first_name} ${client.last_name}` : `Deleted client ${sheet.clientId}`;
        let clientCompany = this.clientMap[sheet.clientId] ? `${client.company || "No Company"}` : `Deleted Client`;
        let makerName = this.makerMap[sheet.makerId] ? `${maker.firstName} ${maker.lastName}` : `Deleted maker ${sheet.makerId}`;
        return {duration: duration, clientName: clientName, clientCompany: clientCompany, makerName: makerName};
    }
}

async function sheetIsClosed(sheet) {
    if (!sheet || !sheet.timeIn.length || !sheet.timeOut.length)
        return false;
    return sheet.timeIn[0].toString() !== "0" && sheet.timeOut[0].toString() !== "0";
}

async function sheetRelationshipMatches(sheet, relationshipId) {
    return sheet.relationshipId && sheet.relationshipId.toString().includes(relationshipId);
}

/**
 * Returns the number of minutes between two moment objects
 * @param start - starting moment
 * @param end   - ending moment
 * @returns {Promise<number>} string representation of an integer between two moments
 */
async function getMinutesBetweenMoments(start, end) {
    let exactMinutes = moment.duration(moment(end).diff(start)).asMinutes();
    return Number.parseInt(exactMinutes.toString());
}

async function getClientMap() {
    let response = await request({
        method: 'POST',
        uri: `${process.env.TWINBEE_URL}/api/getAllClients`,
        form: {
            'auth': process.env.TWINBEE_MASTER_AUTH
        }
    }).catch(err => catchNotification(err));
    let clients = JSON.parse(response.body);
    let clientMap = {};
    for (var entry of clients) {
        clientMap[entry.customer.id] = entry.customer;
    }
    return clientMap;
}

async function getMakerMap() {
    let response = await request({
        method: 'POST',
        uri: `${process.env.TWINBEE_URL}/api/getAllMakers`,
        form: {
            'auth': process.env.TWINBEE_MASTER_AUTH
        }
    }).catch(err => catchNotification(err));
    let makers = JSON.parse(response.body);
    let makerMap = {};
    for (var maker of makers) {
        makerMap[maker.id] = maker;
    }
    return makerMap;
}

async function getAllSheets() {
    let response = await request({
        method: 'POST',
        uri: `${process.env.TWINBEE_URL}/api/getAllTimeSheets`,
        form: {
            'auth': process.env.TWINBEE_MASTER_AUTH
        }
    }).catch(err => catchNotification(err));
    return JSON.parse(response.body);
}

function catchNotification(err){
    console.log(err);
    emailService.notifyAdmin(err);
}
function catchCatastrophe(err){
    console.log(err);
    emailService.notifyAdmin(err);
    emailService.notifyAdmin(`Catastrophic failure in reports; maps failed to validate.`);
}
module.exports = new TimeReportingService();
