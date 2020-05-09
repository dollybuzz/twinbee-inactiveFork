const sinon = require('sinon');
const assert = require('assert');
const {expect} = require('chai');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const timeSheetService = require('../services/timeSheetService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const nock = require('nock');
const TimeSheet = require('../domain/entity/timeSheet');

const timeSheetBasic1 = {id: 1, maker_id: 1, client_id: 'a', hourly_rate: 20.00, start_time: '2019-04-24 22:22:22',
                        end_time: '0000-00-00 00:00:00', occupation: 'worker'};
const timeSheetBasic2 = {id: 2, maker_id: 1, client_id: 'b', hourly_rate: 20.00, start_time: '2019-04-23 22:22:22',
                        end_time: '2019-04-23 23:23:23', occupation: 'worker'};
const timeSheetBasic3 = {id: 3, maker_id: 2, client_id: 'a', hourly_rate: 20.00, start_time: '2019-04-22 22:22:22',
                        end_time: '2019-04-22 23:23:23', occupation: 'worker'};

const timeSheetRefined1 = new TimeSheet(1, 1, 20.00, 'a', '2019-04-24 22:22:22', '0000-00-00 00:00:00', 'worker');
const timeSheetRefined2 = new TimeSheet(2, 1, 20.00, 'b', '2019-04-23 22:22:22', '2019-04-23 23:23:23', 'worker');
const timeSheetRefined3 = new TimeSheet(3, 2, 20.00, 'a', '2019-04-22 22:22:22', '2019-04-22 23:23:23', 'worker');

describe('Authentication Tests', function () {
    beforeEach(function () {
        let getAllSheetsStub = sinon.stub(timeSheetRepo, 'getAllSheets')
            .resolves([timeSheetBasic1, timeSheetBasic2, timeSheetBasic3]);
        let getByMakerStub = sinon.stub(timeSheetRepo, 'getSheetsByMaker')
            .resolves([timeSheetBasic1, timeSheetBasic2]
            )
        let getByClientStub = sinon.stub(timeSheetRepo, 'getSheetsByClient')
            .resolves([timeSheetBasic1, timeSheetBasic3]);
        let createSheetStub = sinon.stub(timeSheetRepo, 'createSheet')
            .resolves(1);
        let deleteSheetStub = sinon.stub(timeSheetRepo, 'deleteSheet')
            .resolves(()=>{
                console.log("Don't delete me bro!");
            });
    })

    afterEach(function () {
        sinon.restore();
    })
    it('Should return true only if email is client email', function () {
        let scope = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .get('/api/getAllClients')
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

    })
    it('Should return true only if email is admin email', function () {

    })
    it('Should return true only if email is maker email', function () {

    })

})