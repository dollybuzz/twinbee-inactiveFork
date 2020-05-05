var chargebee = require("chargebee");
chargebee.configure({site : "freedom-makers-test",
    api_key : process.env.CHARGEBEE_TEST_API})


//TODO: Add validation
/**
 * Service that handles chargebee interaction (plans, subscriptions)
 */
class ChargebeeService {
    constructor() {
    };

    /**
     * Retrieves all plans from the {TEST} environment as chargebee entries.
     * Note that in order to access meaningful data, an intermediate object is
     * accessed.  E.g, to access "pricing_model", given that "returnedValue" is the
     * result of this funciton, use:
     *  returnedValue[0].plan.pricing_model
     * @returns {Promise<[{entry:plan{}}]>}
     */
    getAllPlans(){
        return new Promise((resolve, reject) => {
            chargebee.plan.list({
            }).request(function(error,result) {
                if(error){
                    //handle error
                    console.log(error);
                    reject(error);
                }else{
                    resolve(result.list);
                }
            });
        })
    }

    /**
     * Creates a new plan in the {TEST} environment.
     *
     * @param planName      - desired name of the plan
     * @param invoiceName   - desired name of the plan as displayed on an invoice
     * @param pricePerHour  - cost of each purchased hour
     * @param planDescription-plan description
     */
    createPlan(planName, invoiceName, pricePerHour, planDescription) {

        let planId = planName.replace(/\s+|\.|\,|'|"|&|\$|%|#|@|!/g, "-");
        chargebee.plan.create({
            id: planId,
            name: planName,
            invoice_name: invoiceName,
            description: planDescription,
            price: pricePerHour,
            pricing_model: "per_unit",
            currency_code: "USD",
            period: 1,
            period_unit: "month",

        }).request(function (error, result) {
            if (error) {
                //handle error
                console.log(error);
            } else {
                //console.log(result);
                var plan = result.plan;
            }
        });
    }

    /**
     * Retrieves a chargebee plan object by chargebee plan id.
     *
     * @param planId    - chargebee plan id
     * @returns {Promise<plan>}
     */
    retrievePlan(planId) {
        return new Promise((resolve, reject) => {
            chargebee.plan.retrieve(planId).request(function (error, result) {
                if (error) {
                    //handle error, email us?
                    //console.log(error);
                    reject(error);
                } else {
                    //console.log(result);
                    var plan = result.plan;
                    resolve(plan);
                }
            });
        })
    }

    /**
     * Updates a plan with new values. Note that the plan id is
     * NOT updated on changing the plan's name.
     *
     * @param planId    - plans chargebee ID
     * @param newName   - new desired name for the plan
     * @param planInvoiceName- new desired name of the plan as displayed on an invoice
     * @param planPrice - new desired price per hour for the plan
     * @returns {Promise<unknown>}
     */
    updatePlan(planId, newName, planInvoiceName, planPrice) {
        return new Promise((resolve, reject) => {
            chargebee.plan.update(planId, {
                name: newName,
                invoice_name: planInvoiceName,
                price: planPrice
            }).request(function (error, result) {
                if (error) {
                    //handle error
                    console.log(error);
                    reject(error);
                } else {
                    //console.log(result);
                    var plan = result.plan;
                    resolve(plan);
                }
            });
        })
    }

    /**
     * When implemented, will delete a plan entirely
     * @param planId
     */
    deletePlan(planId) {
        throw new Error("Not implemented")
        chargebee.plan.delete(planId).request(function (error, result) {
            if (error) {
                //handle error
                console.log(error);
            } else {
                //console.log(result);
                var plan = result.plan;
            }
        });
    }

    /**
     * Retrieves all subscriptions as entries as follows:
     * {
     *     subscription: {subscription data},
     *     customer: {customer to whom the subscription belongs}
     * }
     * @returns {Promise<entry>}
     */
    getAllSubscriptions(){
        return new Promise((resolve, reject) => {
            chargebee.subscription.list({
            }).request(function(error,result) {
                if(error){
                    //handle error
                    console.log(error);
                    reject(error);
                }else{
                    resolve(result.list);
                }
            });
        })
    }

    /**
     * Creates a new subscription for an existing customer.
     * Note that auto_collection is ALWAYS off.
     *
     * @param planId    - id of the plan to subscribe to
     * @param customerId- id of the customer that is subscribing
     * @param planQuantity- number of hours per month
     */
    createSubscription(planId, customerId, planQuantity) {
        chargebee.subscription.create_for_customer(customerId, {
            plan_id: planId,
            plan_quantity: planQuantity,
            auto_collection: "off"
        }).request(function (error, result) {
            if (error) {
                //handle error
                console.log(error);
            } else {
                //console.log(result);
                var subscription = result.subscription;
                var customer = result.customer;
                var card = result.card;
                var invoice = result.invoice;
                var unbilled_charges = result.unbilled_charges;
            }
        });
    }

    /**
     * Retrieves a subscription object by chargebee subscription id.
     * @param subscriptionId    - id of the subscription to retrieve
     * @returns {Promise<subscription>}
     */
    retrieveSubscription(subscriptionId) {
        return new Promise((resolve, reject) => {
            console.log(subscriptionId)
            chargebee.subscription.retrieve(subscriptionId).request(function(error,result) {
                if(error){
                    //handle error
                    console.log(error);
                    reject(error);
                }else{
                 //   console.log(result);
                    var subscription = result.subscription;
                    resolve(subscription);
                }
            });
        })
    }

    /**
     * Updates a subscription with new values. Note that
     * the pricePerHour will override defaults. This can be used
     * to create "custom" subscriptions. Use caution when doing so.
     * The revised subscription is returned
     *
     * @param suscriptionId - id of the subscription to modify
     * @param planId        - id of the new plan to be used
     * @param planQuantity  - number of hours to be used
     * @param pricePerHour  - custom price per hour
     * @returns {Promise<subscription>}
     */
    updateSubscription(suscriptionId, planId, planQuantity, pricePerHour) {
        return new Promise((resolve, reject) => {
            chargebee.subscription.update(suscriptionId,{
                plan_id : planId,
                end_of_term : true,
                plan_quantity: planQuantity,
                plan_unit_price: pricePerHour
            }).request(function(error,result) {
                if(error){
                    //handle error
                    console.log(error);
                    reject(error);
                }else{
                 //   console.log(result);
                    var subscription = result.subscription;
                    resolve(subscription);
                }
            });
        })
    }

    /**
     * cancels a subscription by chargebee subscription id
     * @param subscriptionId    - subscription to be cancelled
     */
    cancelSubscription(subscriptionId) {
        chargebee.subscription.cancel(subscriptionId,{
            end_of_term : true
        }).request(function(error,result) {
            if(error){
                //handle error
                console.log(error);
            }else{
             //   console.log(result);
                var subscription = result.subscription;
                var customer = result.customer;
                var card = result.card;
                var invoice = result.invoice;
                var unbilled_charges = result.unbilled_charges;
                var credit_notes = result.credit_notes;
            }
        });
    }
}

module.exports = new ChargebeeService();