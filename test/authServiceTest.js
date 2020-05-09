const sinon = require('sinon');
const assert = require('assert');
const {expect} = require('chai');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const timeSheetService = require('../services/timeSheetService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const nock = require('nock');
const TimeSheet = require('../domain/entity/timeSheet');
const authService = require('../services/authService.js')

describe('Authentication Tests', function () {
    beforeEach(function () {
        let authEmailStub = sinon.stub()
    });

    afterEach(function () {
        sinon.restore();
    });
    it('Should return true only if email is client email', function () {
        let scope = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .post('/api/getAllClients', {auth: process.env.TWINBEE_MASTER_AUTH})
            .reply(200,
                [
                    {
                        id: '1',
                        makerId: '1',
                        clientId: "169yOXRy3SPY9s7n",
                        hourlyRate: '20.00',
                        timeIn: '2019-04-24 22:22:22',
                        timeOut: '0000-00-00 00:00:00',
                        occupation: ''
                    },
                    {
                        id: '2',
                        makerId: '1',
                        clientId: "169yOXRy3SPY9s7n",
                        hourlyRate: '20.00',
                        timeIn: '2019-04-23 22:22:22',
                        timeOut: '2019-04-23 23:23:23',
                        occupation: ''
                    },
                    {
                        id: '3',
                        makerId: '2',
                        clientId: "169yOXRy3SPY9s7n",
                        hourlyRate: '20.00',
                        timeIn: '2019-04-22 22:22:22',
                        timeOut: '2019-04-22 23:23:23',
                        occupation: ''
                    },
                ]
            );
        authService.accessorIsClient("sdfafds")
    })
    it('Should return true only if email is admin email', function () {

    })
    it('Should return true only if email is maker email', function () {

    })

})