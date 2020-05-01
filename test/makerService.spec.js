const sinon = require('sinon');
const assert = require('assert');
const {expect} = require('chai');
const makerRepo = require('../repositories/makerRepo.js');
const clientRepo = require('../repositories/clientRepo.js');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const clientService = require('../services/clientService.js');
const makerService = require('../services/makerService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const Client = require('../domain/entity/client.js');
const Maker = require('../domain/entity/maker.js');


const timeSheetExtra1 = {id:1, first_name:'first', last_name: 'last', email: 'email',
    id: 1, maker_id: 1, client_id: 1, hourly_rate: 1.00, start_time: '2020-04-24 22:22:22',
    end_time: '2020-04-24 23:23:23', occupation:'worker', id: 1, location:'usa',
    remaining_hours: 20.00, email: 'clientEmail'};
const timeSheetExtra2 = {id:2, first_name:'first', last_name: 'last', email: 'email',
        id: 1, maker_id: 1, client_id: 2, hourly_rate: 1.00, start_time: '2020-04-24 22:22:22',
    end_time: '0000-00-00 00:00:00', occupation:'worker', id: 1, location:'usa',
    remaining_hours: 20.00, email: 'clientEmail'};
const timeSheetExtra3 = {id:3, first_name:'first', last_name: 'last', email: 'email',
    id: 1, maker_id: 1, client_id: 3, hourly_rate: 1.00, start_time: '2020-04-24 22:22:22',
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

const client1 = new Client(1, 'name1', 'loc1', 'rem1', 'em1', null, null);
const client2 = new Client(2, 'name2', 'loc2', 'rem2', 'em2', null, null);
const client3 = new Client(3, 'name3', 'loc3', 'rem3', 'em3', null, null);

const maker1 = new Maker(1, 'first1', 'last1', 'email1', null, null);
const maker2 = new Maker(2, 'first2', 'last2', 'email2', null, null);
const maker3 = new Maker(3, 'first3', 'last3', 'email3', null, null);

describe('Maker Service Test', function () {

    beforeEach(function () {
        let getAllMakersStub = sinon.stub(makerRepo, 'getAllMakers')
            .callsFake(() => {
                return [
                    {
                        id: 1,
                        first_name: "first1",
                        last_name: "last1",
                        email: 'email1'
                    }, {
                        id: 2,
                        first_name: "first2",
                        last_name: "last2",
                        email: 'email2'
                    }, {
                        id: 3,
                        first_name: "first3",
                        last_name: "last3",
                        email: 'email3'
                    }
                ];
            });
    });

    afterEach(function () {
        sinon.restore();
    });


    it('Should grab all makers',  async () => {


        let results =  await makerService.getAllMakers();

        expect(results).to.deep.equal([maker1, maker2, maker3]);

    })

    it('Should grab only the maker specified by id', async function () {

        let actual = await makerService.getMakerById(1);

        expect(actual).to.deep.equal(maker1)

    })

    it('Should grab only the sheets for the specified maker (by id)', async function () {
    throw new Error("not implemented")
    })


    it("Should grab the correct chargebee object given a maker's id", async function f() {
        throw new Error("not implemented")
    })

    it("Should grab a list of associated clients given a maker's id", async function f() {
        throw new Error("not implemented")
    })

})