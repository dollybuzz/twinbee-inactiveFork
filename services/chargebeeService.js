var chargebee = require("chargebee");
chargebee.configure({site : "freedom-makers-test",
    api_key : process.env.CHARGEBEE_TEST_API})


//TODO: Add validation
class ChargebeeService {
    constructor() {
    };


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
                console.log(result);
                var plan = result.plan;
            }
        });
    }

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
                    console.log(result);
                    var plan = result.plan;
                    resolve(plan);
                }
            });
        })
    }

    deletePlan(planId) {
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
                console.log(result);
                var subscription = result.subscription;
                var customer = result.customer;
                var card = result.card;
                var invoice = result.invoice;
                var unbilled_charges = result.unbilled_charges;
            }
        });
    }

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