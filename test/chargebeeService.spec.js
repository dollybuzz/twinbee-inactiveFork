const sinon = require('sinon');
const {expect} = require('chai');
const nock = require('nock');
const service = require('../services/chargebeeService.js');


describe('Authentication Tests', function () {
    beforeEach(function () {
    });

    afterEach(function () {
        sinon.restore();
    });

    it('Should use the subscription price per hour', async function () {
        let subStub = sinon.stub(service, "getSubscriptionsByClient").resolves(
            [{
                subscription: {
                    id: '16CHRwS26raK6Lqz',
                    customer_id: '16CHRwS26pv5rLVE',
                    plan_id: 'freedom-makers-40',
                    plan_quantity: 20,
                    plan_unit_price: 3000,
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
            ]);

        let planStub = sinon.stub(service, "retrievePlan").resolves({
            id: 'freedom-makers-40',
            name: 'freedom-makers-40',
            invoice_name: 'Freedom Makers 40',
            description: '$40 per hour plan',
            price: 4000,
            period: 1,
            period_unit: 'month',
            pricing_model: 'per_unit',
            free_quantity: 0,
            status: 'active',
            enabled_in_hosted_pages: true,
            enabled_in_portal: true,
            addon_applicability: 'all',
            is_shippable: false,
            updated_at: 1590091562,
            giftable: false,
            resource_version: 1590091562001,
            object: 'plan',
            charge_model: 'per_unit',
            taxable: true,
            currency_code: 'USD',
            show_description_in_invoices: false,
            show_description_in_quotes: false
        });

        let result = await service.chargeCustomerNow("freedom-makers-40", 1, "16CHRwS26pv5rLVE");
        expect(result).to.equal(3000);
        sinon.restore();
    });

    it('Should use the plan price per hour', async function () {
        let subStub = sinon.stub(service, "getSubscriptionsByClient").resolves([]);

        let planStub = sinon.stub(service, "retrievePlan").resolves({
            id: 'freedom-makers-40',
            name: 'freedom-makers-40',
            invoice_name: 'Freedom Makers 40',
            description: '$40 per hour plan',
            price: 4000,
            period: 1,
            period_unit: 'month',
            pricing_model: 'per_unit',
            free_quantity: 0,
            status: 'active',
            enabled_in_hosted_pages: true,
            enabled_in_portal: true,
            addon_applicability: 'all',
            is_shippable: false,
            updated_at: 1590091562,
            giftable: false,
            resource_version: 1590091562001,
            object: 'plan',
            charge_model: 'per_unit',
            taxable: true,
            currency_code: 'USD',
            show_description_in_invoices: false,
            show_description_in_quotes: false
        });

        let result = await service.chargeCustomerNow("freedom-makers-40", 1, "16CHRwS26pv5rLVE");
        expect(result).to.equal(4000);
        sinon.restore();
    });

});