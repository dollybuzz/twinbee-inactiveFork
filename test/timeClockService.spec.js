const sinon = require('sinon');
const assert = require('assert');
const {expect} = require('chai');
const makerRepo = require('../repositories/makerRepo.js');
const clientRepo = require('../repositories/clientRepo.js');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const timeClockService = require('../services/TimeClockService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');


const timeSheetExtra1 = {id:1, first_name:'first', last_name: 'last', email: 'email',
    id: 1, maker_id: 1, client_id: 1, hourly_rate: 1.00, start_time: '2020-04-24 22:22:22',
    end_time: '2020-04-24 23:23:23', occupation:'worker', id: 1, location:'usa',
    remaining_hours: 20.00, email: 'clientEmail'};
const timeSheetExtra2 = {id:2, first_name:'first', last_name: 'last', email: 'email',
        id: 1, maker_id: 1, client_id: 1, hourly_rate: 1.00, start_time: '2020-04-24 22:22:22',
    end_time: '0000-00-00 00:00:00', occupation:'worker', id: 1, location:'usa',
    remaining_hours: 20.00, email: 'clientEmail'};
const timeSheetExtra3 = {id:3, first_name:'first', last_name: 'last', email: 'email',
    id: 1, maker_id: 1, client_id: 1, hourly_rate: 1.00, start_time: '2020-04-24 22:22:22',
    end_time: '2020-04-24 23:23:23', occupation:'worker', id: 1, location:'usa',
    remaining_hours: 20.00, email: 'clientEmail'};
const timeSheetExtra4 = {id:4, first_name:'first', last_name: 'last', email: 'email',
    id: 1, maker_id: 1, client_id: 1, hourly_rate: 1.00, start_time: '2019-04-24 22:22:22',
    end_time: '2019-04-24 23:23:23', occupation:'worker', id: 1, location:'usa',
    remaining_hours: 20.00, email: 'clientEmail'};
const timeSheetExtra5 = {id:5, first_name:'first', last_name: 'last', email: 'email',
    id: 1, maker_id: 1, client_id: 1, hourly_rate: 1.00, start_time: '2019-04-24 22:22:22',
    end_time: '2019-04-24 23:23:23', occupation:'worker', id: 1, location:'usa',
    remaining_hours: 20.00, email: 'clientEmail'};

const timeSheetBasic1 = {id: 1, maker_id: 1, client_id: 1, hourly_rate: 20.00, start_time: '2019-04-24 22:22:22',
                        end_time: '0000-00-00 00:00:00', occupation: 'worker'}
const timeSheetBasic2 = {id: 2, maker_id: 1, client_id: 1, hourly_rate: 20.00, start_time: '2019-04-23 22:22:22',
                        end_time: '2019-04-23 23:23:23', occupation: 'worker'}
const timeSheetBasic3 = {id: 3, maker_id: 2, client_id: 1, hourly_rate: 20.00, start_time: '2019-04-22 22:22:22',
                        end_time: '2019-04-22 23:23:23', occupation: 'worker'}


describe('Time Clock Service Test', function () {

    it('Should grab only online users',  async () => {

            let stub = sinon.stub(makerRepo, 'getOnlineMakers')
                .callsFake(()=>{return [timeSheetExtra2];});

        let results =  await timeClockService.getOnlineMakers();

        expect(results[0].id).to.equal(1);
        expect(results[0].email).to.equal('clientEmail');
        assert(results[0].time_online > 0);

        after(function () {
            stub.restore();
        })
    })

    it('Should grab timesheets for a given maker', async function () {

        before(function () {
            let sheetByMakerStub = sinon.stub(timeSheetRepo, 'getSheetsByMaker')
                .callsFake(()=>{return[timeSheetBasic1]})
            let makerByIdStub = sinon.stub(makerRepo, 'getMakerById')
                .callsFake(()=>{return {id:1,first_name:'first', last_name:'last', email:'email'}});
            let clientNameById = sinon.stub(clientRepo, 'getClientNameById')
                .callsFake(()=>{return {name: 'client'}})
        })
        let actual = await timeClockService.getSheetsByMaker(1);

        expect(actual).to.deep.equal(
            [{id: 1, maker_name: 'first last', client: 'client', hourly_rate: 20.00, start_time: '2019-04-24 22:22:22',
            end_time: '2019-04-24 23:23:23', occupation: 'worker', duration: '1 hour 1 minute', cost: 23.33}])

        after(function () {
            sheetByMakerStub.restore();
            makerByIdStub.restore();
            clientNameById.restore();
        })
    })

    it('Should confirm a maker IS clocked in anywhere', async function () {

        before(function () {
            let getOnlineStub = sinon.stub(timeClockService, 'getOnlineMakers')
                .callsFake(()=>{return[{id: 1, first_name: 'first', last_name: 'last'}]});
            let getAllStub = sinon.stub(makerRepo, 'getAllMakers')
                .callsFake(()=>{return[{id: 1, first_name: 'first', last_name: 'last'},
                    {id: 2, first_name: 'first2', last_name: 'last2'}]});
            let getAllSheetsStub = sinon.stub(timeSheetRepo, 'getAllSheets')
                .callsFake(()=>{return[timeSheetBasic1, timeSheetBasic2, timeSheetBasic3]});
        })
        let actual = await timeClockService.userIsOnline(1);

        expect(actual).to.equal(true);

        after(function () {
            getOnlineStub.restore();
            getAllStub.restore();
            getAllSheetsStub.restore();
        })
    })

    it('Should confirm a maker IS NOT clocked in anywhere', async function () {
        before(function () {
            let getOnlineStub = sinon.stub(timeClockService, 'getOnlineMakers')
                .callsFake(()=>{return[{id: 1, first_name: 'first', last_name: 'last'}]});
            let getAllStub = sinon.stub(makerRepo, 'getAllMakers')
                .callsFake(()=>{return[{id: 1, first_name: 'first', last_name: 'last'},
                    {id: 2, first_name: 'first2', last_name: 'last2'}]});
            let getAllSheetsStub = sinon.stub(timeSheetRepo, 'getAllSheets')
                .callsFake(()=>{return[timeSheetBasic1, timeSheetBasic2, timeSheetBasic3]});
        })

        let actual = await timeClockService.userIsOnline(2);

        expect(actual).to.equal(false);

        after(function () {
            getOnlineStub.restore();
            getAllStub.restore();
            getAllSheetsStub.restore();
        })
    })

    it("Should grab the clocked in maker's data", async function () {

        before(function () {
            let getOnlineStub = sinon.stub(timeClockService, 'getOnlineMakers')
                .callsFake(()=>{return[{id: 1, first_name: 'first', last_name: 'last'}]});
            let getAllStub = sinon.stub(makerRepo, 'getAllMakers')
                .callsFake(()=>{return[{id: 1, first_name: 'first', last_name: 'last'},
                    {id: 2, first_name: 'first2', last_name: 'last2'}]});
            let getAllSheetsStub = sinon.stub(timeSheetRepo, 'getAllSheets')
                .callsFake(()=>{return[timeSheetBasic1, timeSheetBasic2, timeSheetBasic3]});
            let getClientNameStub = sinon.stub(clientRepo, 'getClientNameById')
                .callsFake(()=>{return [{name: 'client'}]})
        })

        let actual = await timeClockService.getDataForOnlineMaker(1);

        expect(actual).to.deep.equal(
            [{id: 1, maker_name: 'first last', client: 'client', hourly_rate: 20.00, start_time: '2019-04-24 22:22:22',
                occupation: 'worker', time_sheet_id: 1}]);

        after(function () {
            getOnlineStub.restore();
            getAllStub.restore();
            getAllSheetsStub.restore();
            getClientNameStub.restore();
        })
    })
})