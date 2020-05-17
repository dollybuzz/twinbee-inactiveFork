const chargebeeService = require('../services/chargebeeService.js');

module.exports = {

    /**
     * ENDPOINT: /api/getAllPlans
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
     *
     *  Looks for data in the body in the form:
     *  {
     *     "auth": authentication credentials; either master or token
     *  }
     * @returns [{entry:plan{}},...]
     */
    getAllPlans: async function(req, res){
        console.log("Attempting to get all plans from REST: ");
        console.log(req.body);
        let plans = await chargebeeService.getAllPlans().catch(e=>console.log(e));
        res.send(plans);
    },

    /**
     * ENDPOINT: /api/createPlan
     * Creates a new plan in the {TEST} environment. looks for values in the body as follows:
     * {
     *     "planName": name of plan,
     *     "invoiceName": name as it should appear on an invoice,
     *     "pricePerHour": integer price per hour in cents,
     *     "planDescription": general description of plan,
     *     "auth": authentication credentials; either master or token
     * }
     */
    createPlan: function(req, res){
        console.log("Attempting to create a plan from REST: ");
        console.log(req.body);
        chargebeeService.createPlan(req.body.planName, req.body.invoiceName,
            req.body.pricePerHour, req.body.planDescription);
        res.send({});
    },

    /**
     * /api/retrievePlan
     * Retrieves a chargebee plan object by chargebee plan id. Looks for values
     * in the body as follows:
     * {
     *     "planId": chargebee plan id,
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @returns plan{}
     */
    retrievePlan: async function(req, res){
        console.log("Attempting to retrieve a plan from REST: ");
        console.log(req.body);
        let planActual = await chargebeeService.retrievePlan(req.body.planId)
            .catch(err=>console.log(err));
        res.send({plan: planActual});
    },

    /**
     * ENDPOINT: /api/updatePlan
     * Updates a plan with new values. Note that the plan id is
     * NOT updated on changing the plan's name. Looks for values in the body as follows;
     * {
     *      "planId": existing chargebee plan id,
     *      "newName": new desired name for plan,
     *      "planInvoiceName": new desired name as it should appear on an invoice,
     *      "planPrice": overridden plan price in cents as integer,
     *     "auth": authentication credentials; either master or token
     *
     * }
     */
    updatePlan: function(req, res){
        console.log("Attempting to update a plan from REST: ");
        console.log(req.body);
        chargebeeService.updatePlan(req.body.planId, req.body.newName,
            req.body.planInvoiceName, req.body.planPrice);
        res.send({});
    },

    /**
     * ENDPOINT: /api/deletePlan
     * Deletes a plan by chargebee plan id. Looks for values in the body as follows:
     * {
     *     "planId": chargebee plan id,
     *     "auth": authentication credentials; either master or token
     * }
     */
    deletePlan: function(req, res){
        console.log("Attempting to delete a plan from REST: ");
        console.log(req.body);
        chargebeeService.deletePlan(req.body.planId);
        res.send({});
    },

    /**
     * ENDPOINT: /api/getAllSubscriptions
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
     * ]
     * Looks for data in the body as follows
     * {
     *     "auth": authentication credentials; either master or token
     * }
     * @returns [{"customer":{},"subscription":{},"card":{}},...]
     */
    getAllSubscriptions: async function(req, res){
        console.log("Attempting to get all subscriptions from REST: ");
        console.log(req.body);
        let subscriptions = await chargebeeService.getAllSubscriptions().catch(e=>console.log(e))
            .catch(e=>console.log(e));
        res.send(subscriptions);
    },

    /**
     * /api/createSubscription
     * Creates a new subscription for an existing customer.
     * Note that auto_collection is ALWAYS on. Looks for values in the body as follows:
     * {
     *     "planId": id of the plan to subscribe to,
     *     "customerId": id of the subscribing customer,
     *     "planQuantity": initial number of hours to subscribe to,
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @returns subscription{}
     */
    createSubscription: async function(req, res){
        console.log("Attempting to create a subscription from REST: ");
        console.log(req.body);
        let sub = await chargebeeService.createSubscription(req.body.planId, req.body.customerId, req.body.planQuantity)
            .catch(e=>console.log(e));
        res.send(sub);
    },

    /**
     * /api/retrieveSubscription
     * Retrieves a subscription object by chargebee subscription id. Looks for values in the body
     * as follows:
     * {
     *     "subscriptionId": id of desired subscription,
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @returns subscription{}
     */
    retrieveSubscription: async function(req, res){
        console.log("Attempting to retrieve one subscription from REST: ");
        console.log(req.body);
        let subscription = await chargebeeService.retrieveSubscription(req.body.subscriptionId)
            .catch(e=>console.log(e));
        res.send(subscription);
    },

    /**
     * /api/updateSubscription
     * Updates a subscription with new values. Note that
     * the pricePerHour will override defaults. This can be used
     * to create "custom" subscriptions. Use caution when doing so.
     * The revised subscription is returned. Looks for values in the body as follows:
     * {
     *     "subscriptionId": id of subscription to be modified,
     *     "planId": new plan to use for subscription,
     *     "planQuantity": new number of hours to use,
     *     "pricePerHour": overridden price per hour for subscription, - DEACTIVATED
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @returns subscription{}
     */
    updateSubscription: async function(req, res){
        console.log("Attempting to update subscription from REST: ");
        console.log(req.body);
        let subscription = await chargebeeService.updateSubscription(req.body.subscriptionId, req.body.planId,
            req.body.planQuantity, req.body.pricePerHour);
        res.send(subscription);
    },

    /**
     * /api/cancelSubscription
     * cancels a subscription by chargebee subscription id. Looks for values in the
     * body as follows:
     * {
     *     "subscriptionId": subscription to be cancelled,
     *     "auth": authentication credentials; either master or token
     * }
     */
    cancelSubscription: function(req, res){
        console.log("Attempting to cancel subscription from REST: ");
        console.log(req.body);
        chargebeeService.cancelSubscription(req.body.subscriptionId);
        res.send({});
    },

    /**
     * /api/creditNow
     *
     * Charges a customer's default payment (or creates an invoice if not available)
     * for the given number of hours for the specified plan. Looks for data in the
     * body in the form:
     * {
     *     "planId": Chargebee plan id for the plan to be "refilled",
     *     "numHours": Number of hours to add to the clients associated bucket,
     *     "customerId": id of the customer to be updated,
     *     "auth": auth token
     * }
     *
     * @param req
     * @param res
     */
    chargeCustomerNow: function (req, res) {
        console.log("Attempting to charge customer from REST: ");
        console.log(req.body);
        chargebeeService.chargeCustomerNow(req.body.planId, req.body.numHours, req.body.customerId);
        res.send({});
    }


};