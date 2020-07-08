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


describe('Client Service Test', function () {
    beforeEach(function () {
        let getBucketsStub = sinon.stub(clientService, "getTimeBucketsByClientId")
            .resolves({
                first_name: 'Dalia',
                last_name: 'Client',
                id: '16CHRwS26pv5rLVE',
                buckets: {
                    'freedom-makers-40': 20,
                    'freedom-makers-32': 1648,
                    'twinbee-new-plan2': 3000,
                    'freedom-makers-100': 300,
                    'freedom-makers-75': 720
                }
            });
        let getForClientStub = sinon.stub(clientService, "getSubscriptionsForClient")
            .resolves(
                [
                    {
                        subscription: {
                            id: '16CHRwS26rdg6Lro',
                            customer_id: '16CHRwS26pv5rLVE',
                            plan_id: 'freedom-makers-32',
                            plan_quantity: 12,
                            plan_unit_price: 3500,
                            plan_amount: 42000,
                            billing_period: 1,
                            billing_period_unit: 'month',
                            plan_free_quantity: 0,
                            status: 'active',
                            current_term_start: 1592340303,
                            current_term_end: 1594932303,
                            next_billing_at: 1594932303,
                            created_at: 1592340303,
                            started_at: 1592340303,
                            activated_at: 1592340303,
                            updated_at: 1592441076,
                            has_scheduled_changes: true,
                            auto_collection: 'on',
                            resource_version: 1592441076243,
                            deleted: false,
                            object: 'subscription',
                            currency_code: 'USD',
                            due_invoices_count: 0,
                            mrr: 42000,
                            exchange_rate: 1,
                            base_currency_code: 'USD'
                        },
                        customer: {
                            id: '16CHRwS26pv5rLVE',
                            first_name: 'Dalia',
                            last_name: 'Client',
                            email: 'dalia@ossolarecruiting.com',
                            phone: '1234567890',
                            auto_collection: 'on',
                            net_term_days: 0,
                            allow_direct_debit: false,
                            created_at: 1592339894,
                            taxability: 'taxable',
                            updated_at: 1593554209,
                            pii_cleared: 'active',
                            resource_version: 1593554209077,
                            deleted: false,
                            object: 'customer',
                            card_status: 'valid',
                            primary_payment_source_id: 'pm_AzqgsPS26rH6vNBJ',
                            payment_method: [Object],
                            promotional_credits: 0,
                            refundable_credits: 0,
                            excess_payments: 0,
                            unbilled_charges: 0,
                            preferred_currency_code: 'USD',
                            meta_data: [Object]
                        },
                        card: {
                            status: 'valid',
                            gateway: 'chargebee',
                            gateway_account_id: 'gw_Hu7pMoFRcvXHF5158O',
                            iin: '411111',
                            last4: '1111',
                            card_type: 'visa',
                            funding_type: 'credit',
                            expiry_month: 12,
                            expiry_year: 2021,
                            created_at: 1592340217,
                            updated_at: 1592340217,
                            resource_version: 1592340217192,
                            object: 'card',
                            masked_number: '************1111',
                            customer_id: '16CHRwS26pv5rLVE',
                            payment_source_id: 'pm_AzqgsPS26rH6vNBJ'
                        }
                    },
                    {
                        subscription: {
                            id: '16CHRwS26raK6Lqz',
                            customer_id: '16CHRwS26pv5rLVE',
                            plan_id: 'freedom-makers-40',
                            plan_quantity: 20,
                            plan_unit_price: 4000,
                            plan_amount: 80000,
                            billing_period: 1,
                            billing_period_unit: 'month',
                            plan_free_quantity: 0,
                            status: 'active',
                            current_term_start: 1592340291,
                            current_term_end: 1594932291,
                            next_billing_at: 1594932291,
                            created_at: 1592340291,
                            started_at: 1592340291,
                            activated_at: 1592340291,
                            updated_at: 1592441064,
                            has_scheduled_changes: false,
                            auto_collection: 'on',
                            resource_version: 1592441064103,
                            deleted: false,
                            object: 'subscription',
                            currency_code: 'USD',
                            due_invoices_count: 0,
                            mrr: 80000,
                            exchange_rate: 1,
                            base_currency_code: 'USD'
                        },
                        customer: {
                            id: '16CHRwS26pv5rLVE',
                            first_name: 'Dalia',
                            last_name: 'Client',
                            email: 'dalia@ossolarecruiting.com',
                            phone: '1234567890',
                            auto_collection: 'on',
                            net_term_days: 0,
                            allow_direct_debit: false,
                            created_at: 1592339894,
                            taxability: 'taxable',
                            updated_at: 1593554209,
                            pii_cleared: 'active',
                            resource_version: 1593554209077,
                            deleted: false,
                            object: 'customer',
                            card_status: 'valid',
                            primary_payment_source_id: 'pm_AzqgsPS26rH6vNBJ',
                            payment_method: [Object],
                            promotional_credits: 0,
                            refundable_credits: 0,
                            excess_payments: 0,
                            unbilled_charges: 0,
                            preferred_currency_code: 'USD',
                            meta_data: [Object]
                        },
                        card: {
                            status: 'valid',
                            gateway: 'chargebee',
                            gateway_account_id: 'gw_Hu7pMoFRcvXHF5158O',
                            iin: '411111',
                            last4: '1111',
                            card_type: 'visa',
                            funding_type: 'credit',
                            expiry_month: 12,
                            expiry_year: 2021,
                            created_at: 1592340217,
                            updated_at: 1592340217,
                            resource_version: 1592340217192,
                            object: 'card',
                            masked_number: '************1111',
                            customer_id: '16CHRwS26pv5rLVE',
                            payment_source_id: 'pm_AzqgsPS26rH6vNBJ'
                        }
                    }
                ]
            )
    });

    afterEach(function () {
        sinon.restore();
    });

    it('Should get a time bucket and corresponding subscriptionId', async function () {

        let actual = await clientService.getTimeBucket("16CHRwS26pv5rLVE", "freedom-makers-32");

        expect(actual).to.deep.equal({
            minutes: 1648,
            subscriptionId: "16CHRwS26rdg6Lro"

        });
    })
});