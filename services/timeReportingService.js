const moment = require('moment');
const util = require('util');
const request = util.promisify(require('request'));
const emailService = require('./notificationService.js');


async function makerIdFilter(makerId, sheetMakerId) {
    return makerId === "" || makerId.toString() === sheetMakerId.toString();
}

async function getMaker(id) {
    let response = await request({
        method: 'POST',
        uri: `${process.env.TWINBEE_URL}/api/getMaker`,
        form: {
            'auth': process.env.TWINBEE_MASTER_AUTH,
            id: id
        }
    }).catch(err => {
        console.log(err);
        emailService.notifyAdmin(err.toString());
    });
    return JSON.parse(response.body);
}

async function getClient(id) {
    let response = await request({
        method: 'POST',
        uri: `${process.env.TWINBEE_URL}/api/getClient`,
        form: {
            'auth': process.env.TWINBEE_MASTER_AUTH,
            id: id
        }
    }).catch(err => {
        console.log(err);
        emailService.notifyAdmin(err.toString());
    });
    return JSON.parse(response.body);
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
    });
    let makers = JSON.parse(response.body);
    let makerMap = {};
    for (var maker of makers) {
        makerMap[maker.id] = maker;
    }
    return makerMap;
}

class TimeReportingService {
    constructor() {
    };

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
        if (!start) {
            start = "2020-01-01 00:00:00";
        }
        if (!end) {
            end = moment();
        }
        let totalTime = 0;
        let obj = {};
        let sheets = [];
        let preferredStart = moment(start);
        let preferredEnd = moment(end);

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

        let timeSheets = JSON.parse(response.body);

        let clientMap = await getClientMap();
        let makerMap = await getMakerMap();

        console.log(timeSheets.length);
        for (var sheet of timeSheets) {
            let filter = await makerIdFilter(makerId, sheet.makerId).catch(err => {
                console.log(err);
                emailService.notifyAdmin(err.toString());
            });
            if (sheet.timeIn[0].toString() !== "0" && sheet.timeOut.toString() !== "0"
                && sheet.clientId.includes(clientId) && filter) {

                let startMoment = moment(sheet.timeIn);
                let endMoment = moment(sheet.timeOut);


                if (endMoment.isBetween(preferredStart, preferredEnd)) {
                    let duration = await this.getMinutesBetweenMoments(startMoment, endMoment).catch(err => {
                        console.log(err);
                        emailService.notifyAdmin(err.toString());
                    });
                    totalTime += duration;
                    let client = clientMap[sheet.clientId];
                    let maker = makerMap[sheet.makerId];

                    let clientName = clientMap[sheet.clientId] ? `${client.first_name} ${client.last_name}` : `Deleted client ${sheet.clientId}`;
                    let makerName = makerMap[sheet.makerId] ? `${maker.firstName} ${maker.lastName}` : `Deleted maker ${sheet.makerId}`;
                    sheets.push({
                        id: sheet.id,
                        duration: duration,
                        clientName: clientName,
                        makerName: makerName,
                        plan: sheet.hourlyRate
                    });
                }
            }
        }

        obj.sheets = sheets;
        obj.duration = totalTime;
        return obj;
    }


    /**
     * Returns the number of minutes between two moment objects
     * @param start - starting moment
     * @param end   - ending moment
     * @returns {Promise<string>} string representation of an integer between two moments
     */
    async getMinutesBetweenMoments(start, end) {
        let exactMinutes = moment.duration(moment(end).diff(start)).asMinutes();
        return Number.parseInt(exactMinutes.toString());
    }

}

module.exports = new TimeReportingService();