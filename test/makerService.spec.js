const sinon = require('sinon');
const assert = require('assert');
const {expect} = require('chai');
const makerRepo = require('../repositories/makerRepo.js');
const makerService = require('../services/makerService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const Maker = require('../domain/entity/maker.js');
const nock = require('nock');

const timeSheetBasic1 = {id: "1", maker_id: "1", client_id: "1", hourly_rate: "20.00",
    start_time: '2019-04-24 22:22:22', end_time: '0000-00-00 00:00:00', occupation: ''}
const timeSheetBasic2 = {id: "2", maker_id: "1", client_id: "1", hourly_rate: "20.00",
    start_time: '2019-04-23 22:22:22', end_time: '2019-04-23 23:23:23', occupation: ''}
const timeSheetBasic3 = {id: "3", maker_id: "2", client_id: "1", hourly_rate: "20.00",
    start_time: '2019-04-22 22:22:22', end_time: '2019-04-22 23:23:23', occupation: ''}

const maker1 = new Maker(1, 'first1', 'last1', 'email1');
const maker2 = new Maker(2, 'first2', 'last2', 'email2');
const maker3 = new Maker(3, 'first3', 'last3', 'email3');



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
        let scope = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .get('/api/getAllSheets')
            .reply(200,
                [
                        {
                            id: '1',
                            makerId: '1',
                            clientId: "1",
                            hourlyRate: '20.00',
                            timeIn: '2019-04-24 22:22:22',
                            timeOut: '0000-00-00 00:00:00',
                            occupation: ''
                        },
                        {
                            id: '2',
                            makerId: '1',
                            clientId: "1",
                            hourlyRate: '20.00',
                            timeIn: '2019-04-23 22:22:22',
                            timeOut: '2019-04-23 23:23:23',
                            occupation: ''
                        },
                        {
                            id: '3',
                            makerId: '2',
                            clientId: "1",
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
                    clientId: "1",
                    hourlyRate: '20.00',
                    timeIn: '2019-04-24 22:22:22',
                    timeOut: '0000-00-00 00:00:00',
                    occupation: ''
                },
                {
                    id: '2',
                    makerId: '1',
                    clientId: "1",
                    hourlyRate: '20.00',
                    timeIn: '2019-04-23 22:22:22',
                    timeOut: '2019-04-23 23:23:23',
                    occupation: ''
                }
            ]
        );
    })



    it("INTEGRATION: Should grab a list of associated clients given a maker's id", async function f() {
        throw new Error("not implemented")
    })
})