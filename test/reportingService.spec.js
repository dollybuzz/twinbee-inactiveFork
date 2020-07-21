const sinon = require('sinon');
const {expect} = require('chai');
const nock = require('nock');
const reportingService = require('../services/timeReportingService.js');

describe('Get Sheet Details Test', function () {

    beforeEach(function () {

        reportingService.clientMap = {
            "1": {
                id: "1",
                first_name: "clientFirst1",
                last_name: "clientLast1",
                company: "clientCompany1"
            },
            "2": {
                id: "2",
                first_name: "clientFirst2",
                last_name: "clientLast2",
            }
        };
        reportingService.makerMap = {
            "1": {
                id: "1",
                firstName: "makerFirst1",
                lastName: "makerLast1"
            },
            "2": {
                id: "2",
                firstName: "makerFirst2",
                lastName: "makerLast2",
            }
        }
    });

    afterEach(function () {
        sinon.restore();
    });


    it('Should successfully grab the sheet details normally', async function () {
        let validateStub = sinon.stub(reportingService, "validateMaps").resolves(true)
        let actual = await reportingService.getSheetDetails(
            {
                id: 1,
                makerId: 1,
                planId: "asdf",
                clientId: 1,
                timeIn: "2020-01-01 01:00:00",
                timeOut: "2020-01-01 02:00:00",
                task: "some task",
                adminNote: "created normally",
                relationshipId: 4
            }
        );
        expect(actual).to.deep.equal({
            duration: 60,
            clientName: "clientFirst1 clientLast1",
            clientCompany: "clientCompany1",
            makerName: "makerFirst1 makerLast1"
        });
    });


    it('Should successfully indicate a deleted sheet', async function () {
        let validateStub = sinon.stub(reportingService, "validateMaps").resolves(true)
        let actual = await reportingService.getSheetDetails(
            {
                id: 1,
                makerId: 1,
                planId: "asdf",
                clientId: 1,
                timeIn: "00:00:00",
                timeOut: "00:00:00",
                task: "some task",
                adminNote: "deleted",
                relationshipId: 4
            }
        );
        expect(actual).to.deep.equal(
            {
                duration: 0,
                clientName: "Deleted Sheet",
                clientCompany: "Deleted Sheet",
                makerName: "Deleted Sheet"
            }
        );
    });

    it('Should successfully grab the sheet details with a deleted client', async function () {
        let validateStub = sinon.stub(reportingService, "validateMaps").resolves(true)
        let clientId = 5;
        let makerId = 1
        let actual = await reportingService.getSheetDetails(
            {
                id: 1,
                makerId: makerId,
                planId: "asdf",
                clientId: clientId,
                timeIn: "2020-01-01 01:00:00",
                timeOut: "2020-01-01 02:00:00",
                task: "some task",
                adminNote: "created normally",
                relationshipId: 4
            }
        );
        expect(actual).to.deep.equal({
            duration: 60,
            clientName: "Deleted client " + clientId,
            clientCompany: "Deleted Client",
            makerName: "makerFirst1 makerLast1"
        });
    });

    it('Should successfully grab the sheet details with a deleted maker', async function () {
        let validateStub = sinon.stub(reportingService, "validateMaps").resolves(true)
        let clientId = 1;
        let makerId = 5;
        let actual = await reportingService.getSheetDetails(
            {
                id: 1,
                makerId: makerId,
                planId: "asdf",
                clientId: clientId,
                timeIn: "2020-01-01 01:00:00",
                timeOut: "2020-01-01 02:00:00",
                task: "some task",
                adminNote: "created normally",
                relationshipId: 4
            }
        );
        expect(actual).to.deep.equal({
            duration: 60,
            clientName: "clientFirst1 clientLast1",
            clientCompany: "clientCompany1",
            makerName: `Deleted maker ${makerId}`
        });
    });

    it('Should fail on moment.js failure', async function () {
        sinon.stub(reportingService, "validateMaps").callsFake(function () {
            return new Promise((resolve, reject) => {
                reject();
            })
        });
        let clientId = 1;
        let makerId = 1;
        let actual = await reportingService.getSheetDetails(
            {
                id: 1,
                makerId: makerId,
                planId: "asdf",
                clientId: clientId,
                timeIn: "2020-01-01 01:00:00",
                timeOut: "2020-01-01 02:00:00",
                task: "some task",
                adminNote: "created normally",
                relationshipId: 4
            }
        );
        expect(actual).to.equal(false);
    });

    it('Should fail on validation failure', function () {
        throw new Error("Not tested")
    });

});

describe('Reporting Map Setup Test', function () {
    beforeEach(function () {
        let scopeClient = nock(process.env.TWINBEE_URL)
            .post('/api/getAllClients', {auth: process.env.TWINBEE_MASTER_AUTH})
            .reply(200,
                JSON.stringify([
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
                            card_status: 'no_card',
                            promotional_credits: 0,
                            refundable_credits: 0,
                            excess_payments: 0,
                            unbilled_charges: 0,
                            preferred_currency_code: 'USD'
                        }
                    },
                    {
                        customer: {
                            id: 'AzqgtCRyKs3FHgJN',
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
                            card_status: 'no_card',
                            promotional_credits: 0,
                            refundable_credits: 0,
                            excess_payments: 0,
                            unbilled_charges: 0,
                            preferred_currency_code: 'USD'
                        }
                    }
                ])
            );
        let scopeMaker = nock(process.env.TWINBEE_URL)
            .post('/api/getAllMakers', {auth: process.env.TWINBEE_MASTER_AUTH})
            .reply(200,
                JSON.stringify([
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
                            card_status: 'no_card',
                            promotional_credits: 0,
                            refundable_credits: 0,
                            excess_payments: 0,
                            unbilled_charges: 0,
                            preferred_currency_code: 'USD'
                        }
                    },
                    {
                        customer: {
                            id: 'AzqgtCRyKs3FHgJN',
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
                            card_status: 'no_card',
                            promotional_credits: 0,
                            refundable_credits: 0,
                            excess_payments: 0,
                            unbilled_charges: 0,
                            preferred_currency_code: 'USD'
                        }
                    }
                ])
            );
    });

    afterEach(function () {
        sinon.restore();
    });

    it('Should have the right number of clients without nesting them', async function () {
        await reportingService.setup();
        expect(reportingService.clientMap).to.deep.equal({
            'AzqgtCRyKk3FHgJN': {
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
                card_status: 'no_card',
                promotional_credits: 0,
                refundable_credits: 0,
                excess_payments: 0,
                unbilled_charges: 0,
                preferred_currency_code: 'USD'
            },
            'AzqgtCRyKs3FHgJN': {
                id: 'AzqgtCRyKs3FHgJN',
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
                card_status: 'no_card',
                promotional_credits: 0,
                refundable_credits: 0,
                excess_payments: 0,
                unbilled_charges: 0,
                preferred_currency_code: 'USD'
            }

        });
    });
    it('Should have the right number of makers without nesting them', async function () {
        await reportingService.setup();
        expect(reportingService.clientMap).to.deep.equal({
            'AzqgtCRyKk3FHgJN': {
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
                card_status: 'no_card',
                promotional_credits: 0,
                refundable_credits: 0,
                excess_payments: 0,
                unbilled_charges: 0,
                preferred_currency_code: 'USD'
            },
            'AzqgtCRyKs3FHgJN': {
                id: 'AzqgtCRyKs3FHgJN',
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
                card_status: 'no_card',
                promotional_credits: 0,
                refundable_credits: 0,
                excess_payments: 0,
                unbilled_charges: 0,
                preferred_currency_code: 'USD'
            }

        });
    });
});