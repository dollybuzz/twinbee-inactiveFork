const sinon = require('sinon');
const assert = require('assert');
const {expect} = require('chai');
const clientRepo = require('../repositories/clientRepo.js');
const clientService = require('../services/clientService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const nock = require('nock');
const util = require('util');
const request = util.promisify(require('request'));

const timeSheetObject1 = {id: '1',makerId: '1', email: 'email1', hourlyRate: 'hourlyRate1',
    clientId: '1', timeIn: '2019-04-23 22:22:22', timeOut: '0000-00-00 00:00:00'};
const timeSheetObject2 = {id: '2',makerId: '2', email: 'email2', hourlyRate: 'hourlyRate2',
    clientId: '1', timeIn: '2019-04-23 22:22:22', timeOut: '2019-04-22 23:23:23'};
const timeSheetObject3 = {id: '3',makerId: '3', email: 'email3', hourlyRate: 'hourlyRate3',
    clientId: '2', timeIn: '2019-04-23 22:22:22', timeOut: '2019-04-22 23:23:23'};

const maker1 = {id: '1', firstName: 'firstName1', lastName: 'lastName1', email: 'email1', clients: null, chargebeeObj: null};
const maker2 = {id: '2', firstName: 'firstName2', lastName: 'lastName2', email: 'email2', clients: null, chargebeeObj: null};
const maker3 = {id: '3', firstName: 'firstName3', lastName: 'lastName3', email: 'email3', clients: null, chargebeeObj: null};



describe('Client Service Test', function () {
    beforeEach(function () {
      /*  let scope = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .get('/api/getAllClients')
            .reply(200, [client1, client2, client3]);
        let scope2 = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .get('/api/getAllMakers')
            .reply(200, [maker1, maker2, maker3]);
        let scope3 = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .get('/api/getAllTimesheets')
            .reply(200, [timeSheetObject1, timeSheetObject2, timeSheetObject3]);

        let getAllClientsStub = sinon.stub(clientRepo, 'getAllClients')
            .callsFake(()=>{return [
                {
                    id: '1',
                    name: "name1",
                    location: "loc1",
                    remaining_hours: 'rem1',
                    email: 'client1@twinbee.com'

                },{
                    id: '2',
                    name: "name2",
                    location: "loc2",
                    remaining_hours: 'rem2',
                    email: 'client2@twinbee.com'
                },{
                    id: '3',
                    name: "name3",
                    location: "loc3",
                    remaining_hours: 'rem3',
                    email: 'client3@twinbee.com'
                }
            ];});

        let getByIdStub = sinon.stub(clientRepo, 'getClientById')
            .callsFake(()=>{
                return {

                    id: '1',
                    name: 'name1',
                    location: 'loc1',
                    remaining_hours: 'rem1',
                    email: 'client1@twinbee.com'
                };
        })
       */
    });

    afterEach(function () {
        sinon.restore();
    });

    it("Needs a rewrite in the form of integration tests now that chargebee has taken over client functionality",
        function () {
            throw new Error("No work has been done towards this yet.")
        })
/*
    it("INTEGRATION: Chargebee. Should return the correct chargebee object for a client given the client object",
        async function () {

            client1.chargebeeObj = await clientService.getChargebeeObjForClient(client1)
            client2.chargebeeObj = await clientService.getChargebeeObjForClient(client2)
            client3.chargebeeObj = await clientService.getChargebeeObjForClient(client3)
            expect(client1.email).to.equal(client1.chargebeeObj.email);
            expect(client2.email).to.equal(client2.chargebeeObj.email);
            expect(client3.email).to.equal(client3.chargebeeObj.email);


        })

    it ('Should grab a client via rest', async function () {
        let scope = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .get('/api/getClient?id=1')
            .reply(200, {
                id: '1',
                name: 'clientName',
                remainingHours: '20',
                email: 'client3@twinbee.com',
                chargebeeObj: null,
                makers: null
            });

        let response = await request(`http://${process.env.IP}:${process.env.PORT}/api/getClient?id=1`)
            .catch(err => {
                console.log(err)
            })
        let body = response.body;
        let actual = JSON.parse(body);

        expect(actual).to.deep.equal({
            id: '1',
            name: 'clientName',
            remainingHours: '20',
            email: 'client3@twinbee.com',
            chargebeeObj: null,
            makers: null
        });
    })

    it("Should get all sheets for a given client by client id", async function () {
        let scope = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .get('/api/getAllTimesheets')
            .reply(200, [timeSheetObject1, timeSheetObject2, timeSheetObject3]);

        let sheets = await clientService.getSheetsByClient(1);
        expect(sheets).to.deep.equal([timeSheetObject1, timeSheetObject2]);
    })

    it("Should get makers assigned to a given client by client id", async function () {
        let makers = await clientService.getMakersForClient(1);
        expect(makers).to.deep.equal([maker1, maker2]);

    })

    it('Should grab all clients',  async () => {
        let results =  await clientService.getAllClients();
        expect(results).to.deep.equal([client1, client2, client3]);

    })

    it('Should grab only the client specified by id', async function () {
        let actual = await clientService.getClientById(1);

        expect(actual).to.deep.equal(client1);
        expect(Object.keys(actual.chargebeeObj)).to.deep.equal(Object.keys(client1.chargebeeObj))
    })

 */
})