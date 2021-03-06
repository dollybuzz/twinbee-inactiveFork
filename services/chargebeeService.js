var moment = require('moment');
var chargebee = require("chargebee");
chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY
});
const util = require('util');
const request = util.promisify(require('request'));
const {logCaughtError} = require('../util.js');


/**
 * Service that handles chargebee interaction (plans, subscriptions).
 *
 */
class ChargebeeService {

    /**
     * Note: no setup for the service is necessary. The ClientService object
     * is to be used as a singleton.
     */
    constructor() {
    };


    /**
     * Retrieves all plans from the environment as chargebee entries.
     * Note that in order to access meaningful data, an intermediate object is
     * accessed.  E.g, to access "pricing_model", given that "returnedValue" is the
     * result of this function, use:
     *  returnedValue[0].plan.pricing_model
     * @returns {Promise<[{entry:plan{}}]>}
     */
    async getAllPlans() {
        let listObject = await chargebee.plan.list({
            limit: 100
        }).request().catch(error => logCaughtError(error));
        let list = listObject.list;
        while (listObject.next_offset) {
            listObject = await chargebee.plan.list({
                limit: 100,
                offset: listObject.next_offset
            }).request().catch(error => logCaughtError(error));
            for (var item of listObject.list) {
                list.push(item);
            }
        }
        return list;
    }


    /**
     * Creates a new plan in the  environment.
     *
     * @param planId      - desired name of the plan
     * @param invoiceName   - desired name of the plan as displayed on an invoice
     * @param pricePerHour  - cost of each purchased hour
     * @param planDescription-plan description
     */
    createPlan(planId, invoiceName, pricePerHour, planDescription) {
        console.log(`Creating plan ${planId} with per hour cost of ${pricePerHour}...`);
        return new Promise((resolve, reject) => {
            planId = planId.replace(/\s+|\.|\,|'|"|&|\$|%|#|@|!/g, "-");
            chargebee.plan.create({
                id: planId,
                name: planId,
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
                    logCaughtError(error);
                    reject(error);
                } else {
                    console.log(`Plan ${planId} created. Rate: $${pricePerHour} per ` +
                        `hour. Description: ${planDescription}`);
                    var plan = result.plan;
                    resolve(plan);
                }
            });
        });
    }


    /**
     * Retrieves a chargebee plan object by chargebee plan id.
     *
     * @param planId    - chargebee plan id
     * @returns {Promise<plan>}
     */
    retrievePlan(planId) {
        console.log(`Getting details for plan ${planId}`);
        return new Promise((resolve, reject) => {
            chargebee.plan.retrieve(planId).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                    reject(error);
                } else {
                    console.log(`Plan ${planId} retrieved`);
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
        console.log(`Updating plan ${planId}...`);
        return new Promise((resolve, reject) => {
            chargebee.plan.update(planId, {
                name: newName,
                invoice_name: planInvoiceName,
                price: planPrice
            }).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                    reject(error);
                } else {
                    console.log(`Plan ${planId} updated. New name: ${planId}, ` +
                        `invoice name ${planInvoiceName}, price ${planPrice}`);
                    var plan = result.plan;
                    resolve(plan);
                }
            });
        })
    }


    /**
     * Deletes a plan by chargebee plan id
     * @param planId
     */
    deletePlan(planId) {
        console.log(`Deleting plan ${planId}...`);
        chargebee.plan.delete(planId).request(function (error, result) {
            if (error) {
                logCaughtError(error);
            } else {
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
    async getAllSubscriptions() {
        console.log("Getting all subscriptions...");
        let listObject = await chargebee.subscription.list({
            limit: 100,
            include_deleted: true,
            "sort_by[desc]": "created_at"
        }).request().catch(error => logCaughtError(error));

        let list = listObject.list;
        while (listObject.next_offset) {
            listObject = await chargebee.subscription.list({
                limit: 100,
                include_deleted: true,
                "sort_by[desc]": "created_at",
                offset: listObject.next_offset
            }).request().catch(error => logCaughtError(error));

            for (var item of listObject.list) {
                list.push(item);
            }
        }
        return list;
    }


    /**
     * Creates a new subscription for an existing customer.
     * Note that auto_collection is ALWAYS ON. If a start date is omitted,
     * the request is processed immediately
     *
     * @param planId    - id of the plan to subscribe to
     * @param customerId- id of the customer that is subscribing
     * @param planQuantity- number of hours per month
     * @param startDate - desired start date in moment-readable format
     */
    createSubscription(planId, customerId, planQuantity, startDate) {
        console.log(`Creating subscription for customer ${customerId} with plan ${planId}...`);
        return new Promise((resolve, reject) => {
            let subscriptionConfig = {
                plan_id: planId,
                plan_quantity: planQuantity,
                auto_collection: "on"
            };
            if (startDate) {
                let startMoment = moment(startDate);
                subscriptionConfig.start_date = startMoment.unix();
            } else {
                subscriptionConfig.start_date = moment().unix();
            }
            chargebee.subscription.create_for_customer(customerId, subscriptionConfig).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                    reject(error);
                } else {
                    var subscription = result.subscription;
                    resolve(subscription);

                    console.log(`Subscription created for customer ${result.customer.id} with` +
                        `plan ${subscription.plan_id} and initial quantity ${subscription.plan_quantity}`);

                    let response = request({
                        method: 'POST',
                        uri: `${process.env.TWINBEE_URL}/api/updateClientTimeBucket`,
                        form: {
                            'id': result.customer.id,
                            'planId': planId,
                            'minutes': subscription.plan_quantity * 60,
                            'auth': process.env.TWINBEE_MASTER_AUTH
                        }
                    }).catch(error => logCaughtError(error));
                    console.log("Update time bucket due to purchase request sent")
                }
            });
        })
    }


    /**
     * Retrieves a subscription object by chargebee subscription id.
     * @param subscriptionId    - id of the subscription to retrieve
     * @returns {Promise<subscription>}
     */
    retrieveSubscription(subscriptionId) {
        console.log(`Retrieving details for subscription ${subscriptionId}`);
        return new Promise((resolve, reject) => {
            chargebee.subscription.retrieve(subscriptionId).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                    reject(error);
                } else {
                    var subscription = result.subscription;
                    console.log(`Subscription ${subscription.id} retrieved`);
                    resolve(subscription);
                }
            });
        })
    }

    /**
     * Retrieves a customer by email using chargebee's built in filtering.
     * Returns the most recent match.
     * @param email - email of customer to retrieve.
     * @returns {Promise<null|*>}
     */
    async getCustomerByEmail(email) {
        console.log(`Retrieving customer by email ${email}`);
        let err;
        let result = await chargebee.customer.list({"email[is]": email, "sort_by[desc]": "created_at"}).request()
            .catch(error => err = error);
        if (err) {
            logCaughtError(err);
            return null;
        }
        if (!result.list || result.list.length === 0) {
            return null;
        }
        return result.list[0].customer;
    }


    /**
     * Retrieves a subscription object by chargebee subscription id.
     * @param customerId
     * @param planId
     * @returns {Promise<subscription>}
     */
    async getPlanPriceForCustomer(customerId, planId) {
        console.log(`Retrieving price for customer ${customerId} with plan ${planId}`);
        let planPrice = null;
        let err = null;
        let listObject = await chargebee.subscription.list({
            limit: 2,
            "customer_id[is]": customerId,
            "plan_id[is]": planId,
            "sort_by[desc]": "created_at"
        }).request().catch(error => {
            logCaughtError();
            err = error;
        });
        if (err) {
            return null;
        }
        if (listObject && listObject.length && listObject.length > 0) {
            let assumedValidEntry = listObject[0];
            let subscription = assumedValidEntry.subscription;
            return subscription.plan_unit_price;
        } else {
            let plan = await this.retrievePlan(planId).catch(error => logCaughtError(error));
            return plan.price;
        }
    }


    /**
     * Revert's planned changes to a subscription.
     *
     * @param subscriptionId - subscription to be reverted
     */
    cancelScheduledChanges(subscriptionId) {
        return new Promise((resolve, reject) => {
            console.log(`Cancelling pending changes to subscription ${subscriptionId}...`)
            chargebee.subscription.remove_scheduled_changes(subscriptionId).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                    reject(error);
                } else {
                    var subscription = result.subscription;
                    console.log(`Changes reverted for subscription ${subscription.id}`)
                    resolve(subscription);
                }
            });
        })
    }


    /**
     * Retrieves a subscription object by chargebee subscription id, including
     * scheduled changes.
     *
     * @param subscriptionId    - id of the subscription to retrieve
     * @returns {Promise<subscription>}
     */
    retrieveSubscriptionWithChanges(subscriptionId) {
        console.log(`Retrieving details for subscription ${subscriptionId} with scheduled changes...`);
        return new Promise((resolve, reject) => {
            chargebee.subscription.retrieve_with_scheduled_changes(subscriptionId).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                    reject(error);
                } else {
                    var subscription = result.subscription;
                    console.log(`Subscription ${subscription.id} scheduled changes retrieved`);
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
     * @param subscriptionId - id of the subscription to modify
     * @param planId        - id of the new plan to be used
     * @param planQuantity  - number of hours to be used
     * @param pricePerHour  - custom price per hour - DEACTIVATED
     * @returns {Promise<subscription>}
     */
    updateSubscription(subscriptionId, planId, planQuantity, pricePerHour) {
        console.log(`Updating subscription ${subscriptionId}...`);
        return new Promise((resolve, reject) => {
            chargebee.subscription.update(subscriptionId, {
                plan_id: planId,
                end_of_term: true,
                plan_quantity: planQuantity,
                plan_unit_price: Math.floor(Number.parseFloat(pricePerHour) * 100)
            }).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                    reject(error);
                } else {
                    console.log("Subscription updated.");
                    var subscription = result.subscription;
                    resolve(subscription);
                }
            });
        })
    }


    updateSubscriptionForCustomer(subscriptionId, planQuantity) {
        console.log(`Updating subscription ${subscriptionId} for client...`);
        return new Promise((resolve, reject) => {
            chargebee.subscription.update(subscriptionId, {
                end_of_term: true,
                plan_quantity: planQuantity
            }).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                    reject(error);
                } else {
                    console.log("Subscription updated.");
                    var subscription = result.subscription;
                    resolve(subscription);
                }
            });
        })
    }


    /**
     * Updates a subscription with new values. Note that
     * the pricePerHour will override defaults. Created for use
     * by clients; no access to modify price
     * The revised subscription is returned
     *
     * @param subscriptionId - id of the subscription to modify
     * @param planId        - id of the new plan to be used
     * @param planQuantity  - number of hours to be used
     * @param pricePerHour  - custom price per hour - DEACTIVATED
     * @returns {Promise<subscription>}
     */
    customerUpdateSubscription(subscriptionId, planId, planQuantity) {
        console.log(`Updating subscription ${subscriptionId}...`);
        return new Promise((resolve, reject) => {
            chargebee.subscription.update(subscriptionId, {
                plan_id: planId,
                end_of_term: true,
                plan_quantity: planQuantity
            }).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                    reject(error);
                } else {
                    console.log("Subscription updated.");
                    var subscription = result.subscription;
                    resolve(subscription);
                }
            });
        })
    }


    /**
     * Gets all subscriptions (up to 100) for a given client. Looks
     * for values in the body in the form:
     * {
     *     "id": client's chargebee id,
     *     "auth": valid auth token
     * }
     * @param clientId
     * @returns {Promise<[subscription]>}
     */
    getSubscriptionsByClient(clientId) {
        console.log(`Getting subscription for client ${clientId}...`);
        return new Promise((resolve, reject) => {
            chargebee.subscription.list({
                limit: 100,
                "customer_id[is]": clientId
            }).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                    reject(error);
                } else {
                    resolve(result.list);
                }
            })
        });
    }


    getCustomerOfSubscription(subscriptionId) {
        console.log(`Getting subscription ${subscriptionId}...`);
        return new Promise(((resolve, reject) => {
            chargebee.subscription.retrieve(subscriptionId).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                    reject(error)
                } else {
                    var subscription = result.subscription;
                    var customer = result.customer;
                    var card = result.card;
                    resolve(customer);
                }
            });
        }))
    }


    /**
     * cancels a subscription by chargebee subscription id
     * @param subscriptionId    - subscription to be cancelled
     */
    cancelSubscription(subscriptionId) {
        console.log(`Cancelling subscription ${subscriptionId}...`);
        chargebee.subscription.cancel(subscriptionId, {
            end_of_term: false
        }).request(function (error, result) {
            if (error) {
                logCaughtError(error);
            } else {
                var subscription = result.subscription;
                var customer = result.customer;
                var unbilled_charges = result.unbilled_charges;
                console.log(`Cancellation complete for customer ${customer}, unbilled charges: ${unbilled_charges}`)
            }
        });
    }


    /**
     * Pauses a subscription at the end of the current term.
     *
     * @param subscriptionId to be paused.
     * @returns {Promise<>}
     */
    async pauseSubscription(subscriptionId) {
        console.log(`Pausing subscription ${subscriptionId}...`);
        return new Promise(((resolve, reject) => {
            chargebee.subscription.pause(subscriptionId, {
                pause_option: "end_of_term"
            }).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                } else {
                    const subscription = result.subscription;
                    resolve(subscription);
                }
            });
        }))
    }


    /**
     * Reverts a scheduled pause for a subscription immediately.
     *
     * @param subscriptionId to be paused.
     * @returns {Promise<>}
     */
    async undoPause(subscriptionId) {
        console.log(`Pausing subscription ${subscriptionId}...`);
        return new Promise(((resolve, reject) => {
            chargebee.subscription.remove_scheduled_pause(subscriptionId)
                .request(function (error, result) {
                    if (error) {
                        logCaughtError(error);
                    } else {
                        const subscription = result.subscription;
                        resolve(subscription);
                    }
                });
        }))
    }


    /**
     * Immediately resumes a paused subscription at the end of the current term.
     *
     * @param subscriptionId to be paused.
     * @returns {Promise<>}
     */
    async resumePausedSubscription(subscriptionId) {
        console.log(`Resuming subscription ${subscriptionId}...`);
        return new Promise(((resolve, reject) => {
            chargebee.subscription.resume(subscriptionId, {
                resume_option: "immediately"
            }).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                    reject(error);
                } else {
                    const subscription = result.subscription;
                    resolve(subscription);
                }
            });
        }))
    }


    /**
     * Pauses a subscription at the end of the current term.
     *
     * @param subscriptionId    - subscription to be paused.
     * @param clientId          - subscribed customer
     * @returns {Promise<>}
     */
    async pauseMySubscription(subscriptionId, clientId) {
        console.log(subscriptionId)
        console.log(clientId)
        let subscription = await this.retrieveSubscription(subscriptionId);
        if (subscription.customer_id !== clientId) {
            return false;
        }
        console.log(`Pausing subscription ${subscriptionId}...`);
        return new Promise(((resolve, reject) => {
            chargebee.subscription.pause(subscriptionId, {
                pause_option: "end_of_term"
            }).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                } else {
                    const subscription = result.subscription;
                    resolve(subscription);
                }
            });
        }))
    }


    /**
     * Reverts a scheduled pause for a subscription immediately.
     *
     * @param subscriptionId    - subscription to be paused.
     * @param clientId          - subscribed customer
     * @returns {Promise<>}
     */
    async undoMyPause(subscriptionId, clientId) {
        let subscription = await this.retrieveSubscription(subscriptionId);
        if (subscription.customer_id !== clientId) {
            return false;
        }
        console.log(`Pausing subscription ${subscriptionId}...`);
        return new Promise(((resolve, reject) => {
            chargebee.subscription.remove_scheduled_pause(subscriptionId)
                .request(function (error, result) {
                    if (error) {
                        logCaughtError(error);
                    } else {
                        const subscription = result.subscription;
                        resolve(subscription);
                    }
                });
        }))
    }


    /**
     * Immediately resumes a paused subscription at the end of the current term.
     *
     * @param subscriptionId    - subscription to be paused.
     * @param clientId          - subscribed customer
     * @returns {Promise<>}
     */
    async resumeMyPausedSubscription(subscriptionId, clientId) {

        let subscription = await this.retrieveSubscription(subscriptionId);
        if (subscription.customer_id !== clientId) {
            return false;
        }
        console.log(`Resuming subscription ${subscriptionId}...`);
        return new Promise(((resolve, reject) => {
            chargebee.subscription.resume(subscriptionId, {
                resume_option: "immediately"
            }).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                    reject(error);
                } else {
                    const subscription = result.subscription;
                    resolve(subscription);
                }
            });
        }))
    }


    /**
     * Retrieves all transactions from the environment as chargebee entries.
     * Note that in order to access meaningful data, an intermediate object is
     * accessed. E.g, to access "status", given that "returnedValue" is the
     * result of this function, use: returnedValue[0].transaction.status
     * @returns {Promise<*>}
     */
    async getAllTransactions() {
        let listObject = await chargebee.transaction.list({
            limit: 100,
            "status[is]": "success",
            "sort_by[asc]": "date"
        }).request().catch(error => logCaughtError(error));

        let list = listObject.list;
        while (listObject.next_offset) {
            listObject = await chargebee.transaction.list({
                limit: 100,
                offset: listObject.next_offset
            }).request().catch(error => logCaughtError(error));

            for (var item of listObject.list) {
                list.push(item);
            }
        }
        return list;
    }

    /**
     * Charges a customer's primary payment method to
     * add the given number of hours to the client's given
     * plan.
     *
     * @param plan      - id of plan for which to add hours
     * @param numHours  - number of hours to add
     * @param customerId- customer that is adding hours
     * @returns {Promise<>}
     */
    async chargeCustomerNow(plan, numHours, customerId, autoCollection) {

        if (!autoCollection) {
            autoCollection = "on";
        }

        let subscriptionEntries = await this.getSubscriptionsByClient(customerId).catch(error => logCaughtError(error));
        let pricePerHour;
        for (var entry of subscriptionEntries) {
            if (entry.subscription.plan_id.toString() === plan.toString()) {
                pricePerHour = entry.subscription.plan_unit_price;
                console.log(`Using subscription price of ${entry.subscription.plan_unit_price} instead of plan price.`);
                break;
            }
        }
        if (!pricePerHour) {
            let planObj = await this.retrievePlan(plan).catch(error => logCaughtError(error));
            pricePerHour = Number.parseFloat(planObj.price);
        }
        if (!pricePerHour) {
            logCaughtError(`No price found for plan ${plan} for customer ${customerId} for ${numHours} hours.`);
            return false;
        }

        let calculatedPrice = Math.floor(pricePerHour * Number.parseFloat(numHours));
        let minutesString = (Math.floor(Number.parseFloat(numHours) * 60)).toString();
        let hours = Math.floor(numHours);
        let minutes = Math.floor(Number.parseInt(minutesString) % 60);
        let message = "";
        if (hours > 0) {
            message += `${hours} hour(s) `;
        }
        if (minutes > 0) {
            message += `${minutes} minute(s) `;
        }


        chargebee.invoice.create({
            customer_id: customerId,
            charges: [{
                amount: calculatedPrice.toString(),
                description: `Buy ${message} for ${plan}`
            }],
            auto_collection: autoCollection
        }).request((error, result) => {
            if (error) {
                logCaughtError(error);
                if (error.api_error_code.toString() === "payment_method_not_present") {
                    let message = "Retrying without auto collection...";
                    logCaughtError(message);
                    return this.chargeCustomerNow(plan, numHours, customerId, "off");
                }
            } else {
                console.log(`Purchase complete for ${customerId}, attempting to update time bucket`);
                let response = request({
                    method: 'POST',
                    uri: `${process.env.TWINBEE_URL}/api/updateClientTimeBucket`,
                    form: {
                        'id': customerId,
                        'planId': plan,
                        'minutes': minutesString,
                        'auth': process.env.TWINBEE_MASTER_AUTH
                    }
                }).catch(error => logCaughtError(error));
                console.log("Update time bucket due to purchase request sent")
            }
        });
        return calculatedPrice;
    }

    /**
     * determines whether the given client has outstanding invoices.
     * @param clientId  - id of client in question
     * @returns {Promise<{invoicesPresent: (*|boolean)}>}
     */
    async doesCustomerHaveInvoices(clientId) {
        let invoices = await chargebee.invoice.list({
            limit: 100,
            "status[is]": "payment_due",
            "sort_by[asc]": "date",
            "customer_id[is]": clientId
        }).request().catch(error => logCaughtError(error));

        return {invoicesPresent: invoices.list && invoices.list.length > 0, numInvoices: invoices.list.length};
    }

    /**
     * Retrieves invoices for the given chargebee customer id.
     * @param clientId  - id of client owing on invoices
     * @returns {Promise<[chargebee invoice]>}
     */
    async getInvoicesForCustomer(clientId) {
        let invoices = await chargebee.invoice.list({
            limit: 100,
            "status[is]": "not_paid",
            "sort_by[asc]": "date",
            "customer_id[is]": clientId
        }).request().catch(error => logCaughtError(error));

        let list = invoices.list;
        let refinedList = [];

        for (var i = 0; i < list.length; i++) {
            refinedList.push(list[i].invoice);
        }

        while (invoices.next_offset) {
            invoices = await chargebee.invoice.list({
                limit: 100,
                "status[is]": "not_paid",
                "sort_by[asc]": "date",
                "customer_id[is]": clientId,
                "offset": invoices.next_offset
            }).request().catch(error => logCaughtError(error));

            for (var entry of invoices.list) {
                refinedList.push(entry.invoice);
            }
        }
        return refinedList;
    }
}

module.exports = new ChargebeeService();