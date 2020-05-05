const chargebeeService = require('../services/chargebeeService.js');

module.exports = {

    /**
     * Retrieves all plans from the {TEST} environment as chargebee entries.
     * Note that in order to access meaningful data, an intermediate object is
     * accessed.  E.g, to access "pricing_model", given that "returnedValue" is the
     * result of this funciton, use:
     *  returnedValue[0].plan.pricing_model
     *  returns data as follows:
     *  [
     *      {
     *          "plan":{}
     *      },
     *      {
     *          "plan":{}
     *      }
     *  ]
     * @returns [{entry:plan{}},...]
     */
    getAllPlans: async function(req, res){
        let plans = await chargebeeService.getAllPlans().catch(e=>console.log(e));
        res.send(plans);
    },

    /**
     * Creates a new plan in the {TEST} environment. looks for values in the body as follows:
     * {
     *     "planName": name of plan,
     *     "invoiceName": name as it should appear on an invoice,
     *     "pricePerHour": integer price per hour in cents,
     *     "planDescription": general description of plan
     * }
     */
    createPlan: function(req, res){
        chargebeeService.createPlan(req.body.planName, req.body.invoiceName,
            req.body.pricePerHour, req.body.planDescription);
        res.end();
    },

    /**
     * Retrieves a chargebee plan object by chargebee plan id. Looks for values
     * in the query as follows:
     * {
     *     "planId": chargebee plan id
     * }
     *
     * @returns plan{}
     */
    retrievePlan: async function(req, res){
        let planActual = await chargebeeService.retrievePlan(req.query.planId)
            .catch(err=>console.log(err));
        res.send({plan: planActual});
    },

    /**
     * Updates a plan with new values. Note that the plan id is
     * NOT updated on changing the plan's name. Looks for values in the body as follows;
     * {
     *      "planId": existing chargebee plan id,
     *      "newName": new desired name for plan,
     *      "planInvoiceName": new desired name as it should appear on an invoice,
     *      "planPrice": overridden plan price in cents as integer
     *
     * }
     */
    updatePlan: function(req, res){
        chargebeeService.updatePlan(req.body.planId, req.body.newName,
            req.body.planInvoiceName, req.body.planPrice);
        res.end();
    },

    /**
     * Deletes a plan by chargebee plan id. Looks for values in the body as follows:
     * {
     *     "planId": chargebee plan id
     * }
     */
    deletePlan: function(req, res){
        chargebeeService.deletePlan(req.body.planId);
        res.end();
    },

    /**
     * Retrieves all subscriptions.
     * Returns values as follows:
     * [
     *      {
     *          "customer": {
     *              ...
     *          },
     *          "subscription": {
     *              ...
     *          },
     *          "card": {
     *              ...
     *          }
     *      },...
     * @returns [{"customer":{},"subscription":{},"card":{}},...]
     */
    getAllSubscriptions: async function(req, res){
        let subscriptions = await chargebeeService.getAllSubscriptions().catch(e=>console.log(e))
            .catch(e=>console.log(e));
        res.send(subscriptions);
    },

    /**
     * Creates a new subscription for an existing customer.
     * Note that auto_collection is ALWAYS off. Looks for values in the body as follows:
     * {
     *     "planId": id of the plan to subscribe to,
     *     "customerId": id of the subscribing customer,
     *     "planQuantity": initial number of hours to subscribe to
     * }
     *
     * @returns subscription{}
     */
    createSubscription: async function(req, res){
        let sub = await chargebeeService.createSubscription(req.body.planId, req.body.customerId, req.body.planQuantity)
            .catch(e=>console.log(e));
        res.send(sub);
    },

    /**
     * Retrieves a subscription object by chargebee subscription id. Looks for values in the query
     * as follows:
     * {
     *     "subscriptionId": id of desired subscription
     * }
     *
     * @returns subscription{}
     */
    retrieveSubscription: async function(req, res){
        console.log(req)
        let subscription = await chargebeeService.retrieveSubscription(req.query.subscriptionId)
            .catch(e=>console.log(e));
        res.send(subscription);
    },

    /**
     * Updates a subscription with new values. Note that
     * the pricePerHour will override defaults. This can be used
     * to create "custom" subscriptions. Use caution when doing so.
     * The revised subscription is returned. Looks for values in the body as follows:
     * {
     *     "subscriptionId": id of subscription to be modified,
     *     "planId": new plan to use for subscription,
     *     "planQuantity": new number of hours to use,
     *     "pricePerHour": overridden price per hour for subscription
     * }
     *
     * @returns subscription{}
     */
    updateSubscription: async function(req, res){
        console.log(req)
        let subscription = await chargebeeService.updateSubscription(req.body.subscriptionId, req.body.planId,
            req.body.planQuantity, req.body.pricePerHour);
        res.send(subscription);
    },

    /**
     * cancels a subscription by chargebee subscription id. Looks for values in the
     * body as follows:
     * {
     *     "subscriptionId": subscription to be cancelled
     * }
     */
    cancelSubscription: function(req, res){
        chargebeeService.cancelSubscription(req.body.subscriptionId);
        res.end();
    }
}