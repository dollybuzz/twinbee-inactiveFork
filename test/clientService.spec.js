const sinon = require('sinon');
const assert = require('assert');
const {expect} = require('chai');
const clientRepo = require('../repositories/clientRepo.js');
const clientService = require('../services/clientService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const Client = require('../domain/entity/client.js');
const nock = require('nock');
const request = require('request');

const timeSheetObject1 = {id: '1',makerId: '1', email: 'email1', hourlyRate: 'hourlyRate1',
    clientId: '1', timeIn: '2019-04-23 22:22:22', timeOut: '0000-00-00 00:00:00'};
const timeSheetObject2 = {id: '2',makerId: '2', email: 'email2', hourlyRate: 'hourlyRate2',
    clientId: '1', timeIn: '2019-04-23 22:22:22', timeOut: '2019-04-22 23:23:23'};
const timeSheetObject3 = {id: '3',makerId: '3', email: 'email3', hourlyRate: 'hourlyRate3',
    clientId: '2', timeIn: '2019-04-23 22:22:22', timeOut: '2019-04-22 23:23:23'};

const maker1 = {id: '1', firstName: 'firstName1', lastName: 'lastName1', email: 'email1', clients: null, chargebeeObj: null};
const maker2 = {id: '2', firstName: 'firstName2', lastName: 'lastName2', email: 'email2', clients: null, chargebeeObj: null};
const maker3 = {id: '3', firstName: 'firstName3', lastName: 'lastName3', email: 'email3', clients: null, chargebeeObj: null};


const client1 = new Client('1', 'name1', 'loc1', 'rem1', 'em1', null, null);
const client2 = new Client('2', 'name2', 'loc2', 'rem2', 'em2', null, null);
const client3 = new Client('3', 'name3', 'loc3', 'rem3', 'em3', null, null);

describe('Client Service Test', function () {


    beforeEach(function () {

        let getAllClientsStub = sinon.stub(clientRepo, 'getAllClients')
            .callsFake(()=>{return [
                {
                    id: '1',
                    name: "name1",
                    location: "loc1",
                    remaining_hours: 'rem1',
                    email: 'em1'

                },{
                    id: '2',
                    name: "name2",
                    location: "loc2",
                    remaining_hours: 'rem2',
                    email: 'em2'
                },{
                    id: '3',
                    name: "name3",
                    location: "loc3",
                    remaining_hours: 'rem3',
                    email: 'em3'
                }
            ];});

        let getByIdStub = sinon.stub(clientRepo, 'getClientById')
            .callsFake(()=>{
                return {

                    id: '1',
                    name: 'name1',
                    location: 'loc1',
                    remaining_hours: 'rem1',
                    email: 'em1'
                };
        })
    });

    afterEach(function () {
        sinon.restore();
    });


    it ('Should grab a client via rest', function () {
        let scope = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .get('/api/getClient?id=1')
            .reply(200, {
                    id: '1',
                    name: 'clientName',
                    remainingHours: '20',
                    email: 'clientEmail',
                    chargebeeObj: null,
                    makers: null
                });


        request(`http://${process.env.IP}:${process.env.PORT}/api/getClient?id=1`, function (err, response, body) {
            if (err){console.log(err)}
            let actual = JSON.parse(body);

            expect(actual).to.deep.equal({
                id: '1',
                name: 'clientName',
                remainingHours: '20',
                email: 'clientEmail',
                chargebeeObj: null,
                makers: null
            });
        });
    })

    it("Should get all sheets for a given client by client id", async function () {
        let scope = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .get('/api/getAllTimesheets')
            .reply(200, [timeSheetObject1, timeSheetObject2, timeSheetObject3]);

        clientService.getSheetsByClient(1, function (sheets) {
            expect(sheets).to.deep.equal([timeSheetObject1, timeSheetObject2]);
        })
    })


    it("Should get makers assigned to a given client by client id", async function () {
        let scope = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .get('/api/getAllTimesheets')
            .reply(200, [timeSheetObject1, timeSheetObject2, timeSheetObject3]);

        clientService.getMakersForClient(1, function (makers) {
            expect(makers).to.deep.equal([maker1, maker2]);
        })
    })



    it('Should grab all clients',  async () => {
        let results =  await clientService.getAllClients();

        expect(results).to.deep.equal([client1, client2, client3]);

    })

    it('Should grab only the client specified by id', async function () {
        let actual = await clientService.getClientById(1);

        expect(actual).to.deep.equal(client1);
    })

    it('Should grab only the sheets for the specified client (by id)', async function () {
        let actual = await clientService.getClientById(1);

        expect(actual).to.deep.equal(client1);
    })

    it("Should return the correct chargebee object for a client given the client's id", function () {
        throw new Error("not implemented")
    })
})