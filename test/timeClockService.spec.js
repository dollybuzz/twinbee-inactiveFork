const sinon = require('sinon');
const assert = require('assert');
const nock = require('nock');
const {expect} = require('chai');
const timeClockService = require('../services/timeClockService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');


describe('Time Clock Service Test', function () {
    beforeEach(function () {
        let onlinesheetsstub = sinon.stub(timeClockService, 'getOnlineSheets')
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

        let results = await timeClockService.clockIn("asdf", "asdf", "5");

        expect(results).to.equal(true);
    });


    it('Should clock out a user', async function () {
        let actual = await timeClockService.clockOut("asdf");

        expect(actual).to.equal(true);
    });


})