const moment = require('moment');
const util = require('util');
const request = util.promisify(require('request'));
const emailService = require('./notificationService.js');

class TimeReportingService {
    constructor() {
    };

    /**
     *
     * @returns
     *      {
     *          clientName: client's name,
     *          makerName: maker's name
     *          }
     *          sheets:[
     *              {
     *                  id: timesheet id,
     *                  duration: length of time worked
     *              },
     *              {
     *                  id: timesheet id,
     *                  duration: length of time worked
     *              },...
     *          ]
     *          totaL: total time of all timesheets
     *      }
     */
    async getReportForClientMakerPair(start, end, makerId, clientId){
        let totalTime = 0;
        let obj = {};
        let sheets = [];
        let preferredStart = moment(start);
        let preferredEnd = moment(end);

        let response = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getTimeSheetsByMakerId`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                id: makerId
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err);
        });

        let makerSheets = JSON.parse(response.body);

        response = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getClient`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                id: clientId
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err);
        });
        let client = JSON.parse(response.body);



        response = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getMaker`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                id: makerId
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err);
        });
        let maker = JSON.parse(response.body);

        for (var sheet of makerSheets){
            if (sheet.timeIn[0] != "0" && sheet.timeOut != "0" && sheet.clientId === clientId){

                    let startMoment = moment(sheet.timeIn);
                    let endMoment = moment(sheet.timeOut);

                    if (endMoment.isBetween(preferredStart, preferredEnd)){
                        let duration = await this.getMinutesBetweenMoments(startMoment, endMoment);
                        totalTime += duration;
                        sheets.push({id: sheet.id, duration: duration})
                    }
            }
        }

        obj.clientName = `${client.first_name} ${client.last_name}`;
        obj.makerName = `${maker.firstName} ${maker.lastName}`;
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