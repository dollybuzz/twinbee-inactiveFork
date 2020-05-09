const sinon = require('sinon');
const assert = require('assert');
const {expect} = require('chai');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const timeSheetService = require('../services/timeSheetService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const nock = require('nock');
const TimeSheet = require('../domain/entity/timeSheet');
const authService = require('../services/authService.js');
const authRepo = require('../repositories/authRepo.js');

const maker1 = {id: '1', firstName: 'firstName1', lastName: 'lastName1', email: 'email1', clients: null, chargebeeObj: null};
const maker2 = {id: '2', firstName: 'firstName2', lastName: 'lastName2', email: 'email2', clients: null, chargebeeObj: null};
const maker3 = {id: '3', firstName: 'firstName3', lastName: 'lastName3', email: 'email3', clients: null, chargebeeObj: null};


describe('Authentication Tests', function () {
    beforeEach(function () {
        let authEmailStub = sinon.stub(authService, 'getEmailFromToken')
            .resolves('potatobucket@vacuum.speaker');
        let authrepostub = sinon.stub(authRepo, 'getAdmins')
            .resolves([
                {
                    id: 1,
                    admin: '$2a$10$/4AueTFsH8wu.G535mCGzeRPqdv1NIqfJ1r28Wt1MksCKou/CMLg2'
                }
            ])
    });

    afterEach(function () {
        sinon.restore();
    });

    it('Should match the client email', async function () {
        let scope = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .post('/api/getAllClients', {auth: process.env.TWINBEE_MASTER_AUTH})
            .reply(200,
                [
                    {
                        customer: {
                            id: 'AzqgtCRyKk3FHgJN',
                            first_name: 'new',
                            last_name: 'cust',
                            email: 'potatobucket@vacuum.speaker',
                            auto_collection: 'on',
                            net_term_days: 0,
                            allow_direct_debit: false,
                            created_at: 1588880832,
                            taxability: 'taxable',
                            updated_at: 1588880832,
                            pii_cleared: 'active',
                            resource_version: 1588880832994,
                            deleted: false,
                            object: 'customer',
                            billing_address: [Object],
                            card_status: 'no_card',
                            promotional_credits: 0,
                            refundable_credits: 0,
                            excess_payments: 0,
                            unbilled_charges: 0,
                            preferred_currency_code: 'USD'
                        }
                    }
                ]
            );

        let result = await authService.accessorIsClient("dummy");
        expect(result).to.equal(true);
    });

    it('Should not match the client email', async function () {
        let scope = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .post('/api/getAllClients', {auth: process.env.TWINBEE_MASTER_AUTH})
            .reply(200,
                [
                    {
                        customer: {
                            id: 'AzqgtCRyKk3FHgJN',
                            first_name: 'new',
                            last_name: 'cust',
                            email: 'nope@custom.cust',
                            auto_collection: 'on',
                            net_term_days: 0,
                            allow_direct_debit: false,
                            created_at: 1588880832,
                            taxability: 'taxable',
                            updated_at: 1588880832,
                            pii_cleared: 'active',
                            resource_version: 1588880832994,
                            deleted: false,
                            object: 'customer',
                            billing_address: [Object],
                            card_status: 'no_card',
                            promotional_credits: 0,
                            refundable_credits: 0,
                            excess_payments: 0,
                            unbilled_charges: 0,
                            preferred_currency_code: 'USD'
                        }
                    }
                ]
            );
        let actual = await authService.accessorIsClient("sdfafds");
        expect(actual).to.equal(false);
    });

    it('should match the admin email', async function () {
        let actual = await authService.accessorIsAdmin('asdf');
        expect(actual).to.equal(true);
    });

    it('should match the maker email', async function () {
        let scope = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .post('/api/getAllMakers', {auth: process.env.TWINBEE_MASTER_AUTH})
            .reply(200,
                [
                    {
                        id: '1',
                        firstName: 'first',
                        lastName: 'email',
                        email: 'potatobucket@vacuum.speaker'
                    }
                ]
            );
        let actual = await authService.accessorIsMaker('asdf');
        expect(actual).to.equal(true);
    });

    it('should not match the maker email', async function () {
        let scope = nock(`http://${process.env.IP}:${process.env.PORT}`)
            .post('/api/getAllMakers', {auth: process.env.TWINBEE_MASTER_AUTH})
            .reply(200,
                [
                    {
                        id: '1',
                        firstName: 'first',
                        lastName: 'email',
                        email: 'nope@vacuum.speaker'
                    }
                ]
            );
        let actual = await authService.accessorIsMaker('asdf');
        expect(actual).to.equal(false);
    });
});