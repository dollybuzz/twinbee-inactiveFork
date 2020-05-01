const sinon = require('sinon');
const assert = require('assert');
const {expect} = require('chai');
const makerRepo = require('../repositories/makerRepo.js');
const clientRepo = require('../repositories/clientRepo.js');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const clientService = require('../services/clientService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const Client = require('../domain/entity/client.js');


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

describe('Client Service Test', function () {


    beforeEach(function () {
        let getAllMakersStub = sinon.stub(makerRepo, 'getAllMakers')
            .callsFake(()=>{
                return [
                    {
                        id: 1,
                        first_name: 'first1',
                        last_name: 'last1',
                        email: 'email1'
                    },
                    {
                        id: 2,
                        first_name: 'first2',
                        last_name: 'last2',
                        email: 'email2'
                    },
                    {
                        id: 3,
                        first_name: 'first3',
                        last_name: 'last3',
                        email: 'email3'
                    },
                ]
            })
        
        let getAllClientsStub = sinon.stub(clientRepo, 'getAllClients')
            .callsFake(()=>{return [
                {
                    id: 1,
                    name: "name1",
                    location: "loc1",
                    remaining_hours: 'rem1',
                    email: 'em1'

                },{
                    id: 2,
                    name: "name2",
                    location: "loc2",
                    remaining_hours: 'rem2',
                    email: 'em2'
                },{
                    id: 3,
                    name: "name3",
                    location: "loc3",
                    remaining_hours: 'rem3',
                    email: 'em3'
                }
            ];});

        let getAllSheetsStub = sinon.stub(timeSheetRepo, 'getAllSheets')
            .callsFake(()=>{
                return [timeSheetBasic1, timeSheetBasic2, timeSheetBasic3];
            })
    });

    afterEach(function () {
        sinon.restore();
    });



    it('Should grab all clients',  async () => {
        let results =  await clientService.getAllClients();

        expect(results).to.deep.equal([client1, client2, client3]);

    })

    it('Should grab only the client specified by id', async function () {
        let actual = await clientService.getClientById(1);

        expect(actual).to.deep.equal(client1)
    })

    it('Should grab only the sheets for the specified client (by id)', async function () {
        let actual = await clientService.getClientById(1);

        expect(actual).to.deep.equal(client1)
    })

    it("Should return the correct chargebee object for a client given the client's id", function () {
        throw new Error("not implemented")
    })

    it("Should return a list of the client's makers given the client's id", function () {
        
        let actual = clientService.getMakersForClient(1)
        expect(actual).to.equal()
        throw new Error("not implemented")
    })

})