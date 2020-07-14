const moment = require('moment');
const util = require('util');
const request = util.promisify(require('request'));
const emailService = require('./notificationService.js');

class TimeReportingService {
    constructor() {
        this.setup();
    };

    async setup(){
        this.makerMap = await getMakerMap();
        this.clientMap = await getClientMap();
    }
    async validateMaps(clientId, makerId) {
        if (!this.clientMap[clientId]) {
            console.log(`Couldn't find client ${clientId}. Double checking reporting service client map!`);
            this.clientMap = await getClientMap();
        }
        if (!this.makerMap[makerId.toString()]) {
            console.log(`Couldn't find maker ${makerId} Double checking reporting service maker map!`);
            this.makerMap = await getMakerMap();
        }
        return true;
    }

    async timePeriodToMoments(start, end) {
        if (!start) {
            start = "2020-01-01 00:00:00";
        }
        if (!end) {
            end = moment();
        }
        let preferredStart = moment(start);
        let preferredEnd = moment(end);
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
            emailService.notifyAdmin(err.toString());
        });

        let {id} = JSON.parse(response.body);

        return await this.getReportForClientMakerPair(start, end, id, client);
    }


    async getTimeReport(start, end, relationshipList) {
        let rollupRows = [];

        for (var relationship of relationshipList) {
            await this.validateMaps(relationship.clientId, relationship.makerId);

            let hoursReport = await this.getReportForRelationship(start, end, relationship.id);
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
     * @param start - start time (inclusive) for the report in a moment.js readable format
     * @param end   - end time (exlusive) for the report in a moment.js readable format
     * @returns {Promise<[]>}
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

        return await this.getTimeReport(start, end, relationships);
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
     * @returns {Promise<{sheets:[], duration: total time logged}>}
     */
    async getReportForClientMakerPair(start, end, makerId, clientId) {
        if (!makerId) {
            makerId = "";
        }
        if (!clientId) {
            clientId = "";
        }
        let totalTime = 0;
        let obj = {};
        let sheets = [];
        let timePeriod = await this.timePeriodToMoments(start, end);
        let timeSheets = await getAllSheets();

        for (var sheet of timeSheets) {
            let filter = await makerIdFilter(makerId, sheet.makerId).catch(err => {
                console.log(err);
                emailService.notifyAdmin(err.toString());
            });

            if (await sheetIsClosed(sheet) && sheet.clientId.includes(clientId) && filter) {
                let endMoment = moment(sheet.timeOut);
                if (endMoment.isBetween(timePeriod.start, timePeriod.end)) {
                    let details = await this.getSheetDetails(sheet);
                    sheets.push({
                        id: sheet.id,
                        duration: details.duration,
                        timeIn: sheet.timeIn,
                        timeOut: sheet.timeOut,
                        clientName: details.clientName,
                        company: details.clientCompany,
                        makerName: details.makerName,
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
        let timePeriod = await this.timePeriodToMoments(start, end);
        let timeSheets = await getAllSheets();
        let response = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getRelationshipById`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'id': relationshipId
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        let relationship = JSON.parse(response.body);
        for (var sheet of timeSheets) {
            if (await sheetIsClosed(sheet) && await sheetRelationshipMatches(sheet, relationshipId)) {
                let endMoment = moment(sheet.timeOut);
                if (endMoment.isBetween(timePeriod.start, timePeriod.end)) {
                    let details = await this.getSheetDetails(sheet, endMoment);
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

        let startMoment = moment(sheet.timeIn);
        let endMoment = moment(sheet.timeOut);

        let duration = await getMinutesBetweenMoments(startMoment, endMoment).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        await this.validateMaps(sheet.clientId, sheet.makerId);

        let client = this.clientMap[sheet.clientId];
        let maker = this.makerMap[sheet.makerId];
        let clientName = this.clientMap[sheet.clientId] ? `${client.first_name} ${client.last_name}` : `Deleted client ${sheet.clientId}`;
        let clientCompany = this.clientMap[sheet.clientId] ? `${client.company || "No Company"}` : `Deleted Client`;
        let makerName = this.makerMap[sheet.makerId] ? `${maker.firstName} ${maker.lastName}` : `Deleted maker ${sheet.makerId}`;
        return {duration: duration, clientName: clientName, clientCompany: clientCompany, makerName: makerName};
    }
}


async function makerIdFilter(makerId, sheetMakerId) {
    return makerId === "" || makerId.toString() === sheetMakerId.toString();
}

async function sheetIsClosed(sheet) {
    return sheet.timeIn[0].toString() !== "0" && sheet.timeOut.toString() !== "0";
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
    }).catch(err => {
        console.log(err);
        emailService.notifyAdmin(err.toString());
    });
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
    }).catch(err => {
        console.log(err);
        emailService.notifyAdmin(err.toString());
    })
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
    }).catch(err => {
        console.log(err);
        emailService.notifyAdmin(err.toString());
    });
    return JSON.parse(response.body);
}


module.exports = new TimeReportingService();