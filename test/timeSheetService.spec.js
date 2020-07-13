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
                        end_time: '0000-00-00 00:00:00', task: 'worker', admin_note: 'No details given.'};
const timeSheetBasic2 = {id: 2, maker_id: 1, client_id: 'b', hourly_rate: 20.00, start_time: '2019-04-23 22:22:22',
                        end_time: '2019-04-23 23:23:23', task: 'worker', admin_note: 'Added by admin: 1'};
const timeSheetBasic3 = {id: 3, maker_id: 2, client_id: 'a', hourly_rate: 20.00, start_time: '2019-04-22 22:22:22',
                        end_time: '2019-04-22 23:23:23', task: 'worker', admin_note: 'Added by admin: 2'};

const timeSheetRefined1 = new TimeSheet(1, 1, 20.00, 'a', '2019-04-24 22:22:22', '0000-00-00 00:00:00', 'worker', 'No details given.');
const timeSheetRefined2 = new TimeSheet(2, 1, 20.00, 'b', '2019-04-23 22:22:22', '2019-04-23 23:23:23', 'worker', 'Added by admin: 1');
const timeSheetRefined3 = new TimeSheet(3, 2, 20.00, 'a', '2019-04-22 22:22:22', '2019-04-22 23:23:23', 'worker', 'Added by admin: 2');



describe('Time Clock Service Test', function () {
    beforeEach(function () {
        let onlinesheetsstub = sinon.stub(timeSheetService, 'getOnlineSheets')
            .resolves([]);
        let scope = nock(process.env.TWINBEE_URL)
            .post('/api/getMakerIdByToken', {auth: process.env.TWINBEE_MASTER_AUTH, token: "asdf"})
            .reply(200,
                JSON.stringify({id: 5})
            );
        let scope2 = nock(process.env.TWINBEE_URL)
            .post('/api/getRelationshipById', {auth: process.env.TWINBEE_MASTER_AUTH, id: 5})
            .reply(200,
                JSON.stringify({id: 5, makerId: 5, clientId: 5, hourlyRate: "potato"})
            );
        let scope3 = nock(process.env.TWINBEE_URL)
            .post('/api/getTimeSheetsByMakerId', {auth: process.env.TWINBEE_MASTER_AUTH, id: 5})
            .reply(200,
                JSON.stringify([{
                    id: 5,
                    maker_id: 5,
                    client_id: 5,
                    hourly_rate: "potato",
                    timeIn: '2019-04-22 22:22:22',
                    timeOut: '2019-04-22 23:23:23',
                    task: 'worker',
                    admin_note: 'Added by admin: 2'
                }])
            );
        let scope4 = nock(process.env.TWINBEE_URL)
            .post('/api/createTimeSheet'
            )
            .reply(200,
                JSON.stringify({id: 1})
            );


    });

    afterEach(function () {
        sinon.restore();
    });


    it('Should clock in a user', async () => {

        let results = await timeSheetService.clockIn("asdf", "asdf", "5");
        expect(results).to.equal(true);
    });


    it('Should clock out a user', async function () {
        let actual = await timeSheetService.clockOut("asdf");

        expect(actual).to.equal(true);
    });


});

describe('Time Sheet Service Test', function () {
    beforeEach(function () {
        let getAllSheetsStub = sinon.stub(timeSheetRepo, 'getAllSheets')
            .resolves([timeSheetBasic1, timeSheetBasic2, timeSheetBasic3]);
        let getByMakerStub = sinon.stub(timeSheetRepo, 'getSheetsByMaker')
            .resolves([timeSheetBasic1, timeSheetBasic2]
            );
        let getByClientStub = sinon.stub(timeSheetRepo, 'getSheetsByClient')
            .resolves([timeSheetBasic1, timeSheetBasic3]);
        let createSheetStub = sinon.stub(timeSheetRepo, 'createSheet')
            .resolves(1);
        let deleteSheetStub = sinon.stub(timeSheetRepo, 'clearSheet')
            .resolves(()=>{
                console.log("Don't delete me bro!");
            });
    });

    afterEach(function () {
        sinon.restore();
    });

    it('Should mark a sheet as deleted', async function () {
        await timeSheetService.clearTimeSheet(25);
        sinon.assert.calledOnce(timeSheetRepo.clearSheet);
    });

    it('Should grab only the sheets for online users', async function () {
        let actual = await timeSheetService.getOnlineMakerSheets();
        expect(actual).to.deep.equal([timeSheetRefined1]);
        
    });
    
    it('Should grab all sheets for a given maker', async function () {
        let actual = await timeSheetService.getSheetsByMaker(1);
        expect(actual).to.deep.equal([timeSheetRefined1, timeSheetRefined2]);
    });

    it('Should grab all sheets for a given client', async function () {
        let actual = await timeSheetService.getSheetsByClient('a');
        expect(actual).to.deep.equal([timeSheetRefined1, timeSheetRefined3]);
    });

    it('Should grab  all timesheets', async function () {
        let actual = await timeSheetService.getAllTimeSheets();
        expect(actual).to.deep.equal([timeSheetRefined1, timeSheetRefined2, timeSheetRefined3]);
    });

    it('Should create a new valid timesheet', async function () {
        let actual = await timeSheetService.createTimeSheet(1, 20.00, 'a', '2019-04-24 22:22:22', '0000-00-00 00:00:00', 'worker', "", "");
        expect(actual).to.deep.equal(timeSheetRefined1);
        sinon.assert.calledOnce(timeSheetRepo.createSheet);
    });

});