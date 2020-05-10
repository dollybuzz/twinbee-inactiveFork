const sinon = require('sinon');
const assert = require('assert');
const {expect} = require('chai');
const makerRepo = require('../repositories/makerRepo.js');
const makerService = require('../services/makerService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const Maker = require('../domain/entity/maker.js');
const nock = require('nock');

const timeSheetBasic1 = {id: "1", maker_id: "1", client_id: "169yOXRy3SPY9s7n", hourly_rate: "20.00",
    start_time: '2019-04-24 22:22:22', end_time: '0000-00-00 00:00:00', occupation: ''}
const timeSheetBasic2 = {id: "2", maker_id: "1", client_id: "169yOXRy3SPY9s7n", hourly_rate: "20.00",
    start_time: '2019-04-23 22:22:22', end_time: '2019-04-23 23:23:23', occupation: ''}
const timeSheetBasic3 = {id: "3", maker_id: "2", client_id: "169yOXRy3SPY9s7n", hourly_rate: "20.00",
    start_time: '2019-04-22 22:22:22', end_time: '2019-04-22 23:23:23', occupation: ''}

const maker1 = new Maker(1, 'first1', 'last1', 'email1');
const maker2 = new Maker(2, 'first2', 'last2', 'email2');
const maker3 = new Maker(3, 'first3', 'last3', 'email3');



describe('Maker Service Test', function () {

    beforeEach(function () {
        let makerIdByEmailStub = sinon.stub(makerRepo, 'getMakerIdByEmail')
            .resolves([{id:5}]);
        let getMakerByIdStub = sinon.stub(makerRepo, 'getMakerById')
            .onFirstCall()
            .resolves([{
                id: 1,
                first_name: "first1",
                last_name: "last1",
                email: 'email1'
            }]);
        getMakerByIdStub.onSecondCall()
            .resolves([]);
        let getAllMakersStub = sinon.stub(makerRepo, 'getAllMakers')
            .resolves([
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
                ]);

        let createMakerStub = sinon.stub(makerRepo, 'createMaker')
            .resolves(()=>{
                console.log("Don't actually call the repo's createMaker!");
            })

    });

    afterEach(function () {
        sinon.restore();
    });


    it('Should return a newly created valid maker object', async function () {
        let maker = await makerService.createNewMaker('first', 'last', 'email');
        expect(maker).to.deep.equal(new Maker(5, 'first', 'last', 'email'));
    })


    it('Should grab all makers',  async () => {


        let results =  await makerService.getAllMakers();

        expect(results).to.deep.equal([maker1, maker2, maker3]);

    })

    it('Should grab only the maker specified by id', async function () {

        let actual = await makerService.getMakerById(1);

        expect(actual).to.deep.equal(maker1)

    })
    it('Should not find any maker with the supplied id', async function () {
        makerService.getMakerById(1); //discard
        let actual = await makerService.getMakerById(-1);

        console.log(actual)
        expect(actual).to.deep.equal('not found')

    })

//All Test files
//turn all gets into .post and pass the mock body and
//send key of auth and value of process.env.EnvironmentVariable.TWINBEE_MASTER_AUTH
    it('Should grab only the sheets for the specified maker (by id)', async function () {
        let scope = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .post('/api/getAllTimeSheets', {auth:process.env.TWINBEE_MASTER_AUTH})
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

        let actual = await makerService.getSheetsByMaker(1);

        expect(actual).to.deep.equal(
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
                }
            ]
        );
    });



    it("INTEGRATION: Should grab a list of associated clients given a maker's id", async function f() {
        let scope = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .post('/api/getAllClients', {auth:process.env.TWINBEE_MASTER_AUTH}).reply(200,

            [
                {
                    "customer": {
                        "id": "169yOXRy3SPY9s7n",
                        "first_name": "firstname4",
                        "last_name": "lastname4",
                        "email": "client4@twinbee.com",
                        "auto_collection": "on",
                        "net_term_days": 0,
                        "allow_direct_debit": false,
                        "created_at": 1588625431,
                        "taxability": "taxable",
                        "updated_at": 1588625431,
                        "pii_cleared": "active",
                        "resource_version": 1588625431110,
                        "deleted": false,
                        "object": "customer",
                        "billing_address": {
                            "first_name": "firstname4",
                            "last_name": "lastname4",
                            "line1": "1 test st",
                            "city": "testCity",
                            "state": "testState",
                            "country": "US",
                            "zip": "11111",
                            "validation_status": "not_validated",
                            "object": "billing_address"
                        },
                        "card_status": "no_card",
                        "promotional_credits": 0,
                        "refundable_credits": 0,
                        "excess_payments": 0,
                        "unbilled_charges": 0,
                        "preferred_currency_code": "USD"
                    }
                },
                {
                    "customer": {
                        "id": "16CHLFRxyBngJCvR",
                        "first_name": "firstname4",
                        "last_name": "lastname4",
                        "email": "client4@twinbee.com",
                        "auto_collection": "on",
                        "net_term_days": 0,
                        "allow_direct_debit": false,
                        "created_at": 1588547590,
                        "taxability": "taxable",
                        "updated_at": 1588547590,
                        "pii_cleared": "active",
                        "resource_version": 1588547590622,
                        "deleted": false,
                        "object": "customer",
                        "billing_address": {
                            "first_name": "firstname4",
                            "last_name": "lastname4",
                            "line1": "1 test st",
                            "city": "testCity",
                            "state": "testState",
                            "country": "US",
                            "zip": "11111",
                            "validation_status": "not_validated",
                            "object": "billing_address"
                        },
                        "card_status": "no_card",
                        "promotional_credits": 0,
                        "refundable_credits": 0,
                        "excess_payments": 0,
                        "unbilled_charges": 0,
                        "preferred_currency_code": "USD"
                    }
                },
                {
                    "customer": {
                        "id": "16CHLFRxyBSyGCtM",
                        "first_name": "firstname4",
                        "last_name": "lastname4",
                        "email": "client4@twinbee.com",
                        "auto_collection": "on",
                        "net_term_days": 0,
                        "allow_direct_debit": false,
                        "created_at": 1588547511,
                        "taxability": "taxable",
                        "updated_at": 1588547511,
                        "pii_cleared": "active",
                        "resource_version": 1588547511011,
                        "deleted": false,
                        "object": "customer",
                        "billing_address": {
                            "first_name": "firstname4",
                            "last_name": "lastname4",
                            "line1": "1 test st",
                            "city": "testCity",
                            "state": "testState",
                            "country": "US",
                            "zip": "11111",
                            "validation_status": "not_validated",
                            "object": "billing_address"
                        },
                        "card_status": "no_card",
                        "promotional_credits": 0,
                        "refundable_credits": 0,
                        "excess_payments": 0,
                        "unbilled_charges": 0,
                        "preferred_currency_code": "USD"
                    }
                },
                {
                    "customer": {
                        "id": "16CHLFRxyBHonCsd",
                        "first_name": "firstname4",
                        "last_name": "lastname4",
                        "email": "client4@twinbee.com",
                        "auto_collection": "on",
                        "net_term_days": 0,
                        "allow_direct_debit": false,
                        "created_at": 1588547468,
                        "taxability": "taxable",
                        "updated_at": 1588547468,
                        "pii_cleared": "active",
                        "resource_version": 1588547468144,
                        "deleted": false,
                        "object": "customer",
                        "billing_address": {
                            "first_name": "firstname4",
                            "last_name": "lastname4",
                            "line1": "1 test st",
                            "city": "testCity",
                            "state": "testState",
                            "country": "US",
                            "zip": "11111",
                            "validation_status": "not_validated",
                            "object": "billing_address"
                        },
                        "card_status": "no_card",
                        "promotional_credits": 0,
                        "refundable_credits": 0,
                        "excess_payments": 0,
                        "unbilled_charges": 0,
                        "preferred_currency_code": "USD"
                    }
                }]);
        let scope2 = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .post('/api/getAllTimeSheets', {auth:process.env.TWINBEE_MASTER_AUTH})
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
                    }
                ]
            );

        let actual = await makerService.getClientListForMakerId(1);

        expect(actual).to.deep.equal([
            {
                "id": "169yOXRy3SPY9s7n",
                "first_name": "firstname4",
                "last_name": "lastname4",
                "email": "client4@twinbee.com",
                "auto_collection": "on",
                "net_term_days": 0,
                "allow_direct_debit": false,
                "created_at": 1588625431,
                "taxability": "taxable",
                "updated_at": 1588625431,
                "pii_cleared": "active",
                "resource_version": 1588625431110,
                "deleted": false,
                "object": "customer",
                "billing_address": {
                    "first_name": "firstname4",
                    "last_name": "lastname4",
                    "line1": "1 test st",
                    "city": "testCity",
                    "state": "testState",
                    "country": "US",
                    "zip": "11111",
                    "validation_status": "not_validated",
                    "object": "billing_address"
                },
                "card_status": "no_card",
                "promotional_credits": 0,
                "refundable_credits": 0,
                "excess_payments": 0,
                "unbilled_charges": 0,
                "preferred_currency_code": "USD"
            }
        ]);
    })
});