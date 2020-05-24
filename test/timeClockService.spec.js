const sinon = require('sinon');
const assert = require('assert');
const {expect} = require('chai');
const makerRepo = require('../repositories/makerRepo.js');
const clientRepo = require('../repositories/clientRepo.js');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const timeSheetService = require('../services/timeSheetService.js');
const timeClockService = require('../services/timeClockService.js');
const makerService = require('../services/MakerService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');


describe('Time Clock Service Test', function () {
    /*

        beforeEach(function () {


            let getOnlineStub = sinon.stub(makerRepo, 'getOnlineMakers')
                .callsFake(() => {
                    return [timeSheetExtra2];
                });
            let getAllSheetsStub = sinon.stub(timeSheetRepo, 'getAllSheets')
                .callsFake(() => {
                    return [timeSheetBasic1, timeSheetBasic2, timeSheetBasic3]
                });
            let getAllStub = sinon.stub(makerRepo, 'getAllMakers')
                .callsFake(() => {
                    return [{id: 1, first_name: 'first', last_name: 'last'},
                        {id: 2, first_name: 'first2', last_name: 'last2'}]
                });

            //maker 1
            let sheetByMakerStub2 = sinon.stub(timeSheetService, 'getSheetsByMaker')
                .callsFake(() => {
                    return [timeSheetBasic1, timeSheetBasic2];
                });
            let sheetByMakerStub = sinon.stub(timeSheetRepo, 'getSheetsByMaker')
                .callsFake(() => {
                    return [timeSheetBasic1, timeSheetBasic2];
                });
            let makerByIdStub = sinon.stub(makerRepo, 'getMakerById')
                .callsFake(() => {
                    return {id: 1, first_name: 'first', last_name: 'last', email: 'email'}
                });
            let getClientNameStub = sinon.stub(clientRepo, 'getClientNameById')
                .callsFake(() => {
                    return [{name: 'client'}]
                });
        });

        afterEach(function () {
            sinon.restore();
        });



        it('Should grab only online users', async () => {
            let results = await timeClockService.getOnlineMakers();

            expect(results[0].id).to.equal(1);
            expect(results[0].email).to.equal('clientEmail');
            assert(results[0].time_online > 0);
        })



        it('Should grab all timesheets', function () {
            throw new Error("Not yet implemented")
        })

        it ("Should get the maker's current logged in time in seconds", async function () {
            let actual = await timeClockService.getRunningTime(maker1);
            console.log ('actual is ' + actual)
            assert(actual > 536493)
        })

        it('Should grab timesheets for a given maker', async function () {

            let actual = await timeClockService.getSheetsByMaker(1);

            expect(actual).to.deep.equal(
                [{
                    id: 1,
                    maker_name: 'first last',
                    client: 'client',
                    hourly_rate: 20.00,
                    start_time: '2019-04-24 22:22:22',
                    end_time: '2019-04-24 23:23:23',
                    task: 'worker',
                    duration: '1 hour 1 minute',
                    cost: 23.33
                }])
        })



        it('Should confirm a maker IS clocked in anywhere', async function () {
            let actual = await timeClockService.userIsOnline(1);

            expect(actual).to.equal(true);
        })



        it('Should confirm a maker IS NOT clocked in anywhere', async function () {
            let actual = await timeClockService.userIsOnline(2);

            expect(actual).to.equal(false);
        })



        it("Should grab the clocked in maker's data", async function () {
            let actual = await timeClockService.getDataForOnlineMaker(1);

            expect(actual).to.deep.equal(
                [{
                    id: 1,
                    maker_name: 'first last',
                    client: 'client',
                    hourly_rate: 20.00,
                    start_time: '2019-04-24 22:22:22',
                    task: 'worker',
                    time_sheet_id: 1
                }]);

        })

     */
})