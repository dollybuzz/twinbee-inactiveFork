var chargebee = require("chargebee");
chargebee.configure({site : "freedom-makers-test",
    api_key : process.env.CHARGEBEE_TEST_API})


//TODO: Add validation
class ChargebeeService {
    constructor(){};

    createPlan(planName, invoiceName, pricePerHour, planDescription){

        let planId = planName.replace(/\s+|\.|\,|'|"|&|\$|%|#|@|!/g,"-");
        chargebee.plan.create({
            id : planId,
            name : planName,
            invoice_name : invoiceName,
            description: planDescription,
            price : pricePerHour,
            pricing_model: "per_unit",
            currency_code: "USD",
            period: 1,
            period_unit: "month",

        }).request(function(error,result) {
            if(error){
                //handle error
                console.log(error);
            }else{
                console.log(result);
                var plan = result.plan;
            }
        });
    }
    retrievePlan(planName){

        return new Promise((resolve, reject)=>{
            let planId = planName.replace(/\s+|\.|\,|'|"|&|\$|%|#|@|!/g,"-");

            chargebee.plan.retrieve(planId).request(function(error,result) {
                if(error){
                    //handle error, email us?
                    //console.log(error);
                    reject(error);
                }else{
                    //console.log(result);
                    var plan = result.plan;
                    resolve(plan);
                }
            });
        })
    }
    updatePlan(planName, newName, planInvoiceName, planPrice) {

        return new Promise((resolve, reject) => {
            let planId = planName.replace(/\s+|\.|\,|'|"|&|\$|%|#|@|!/g, "-");

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
    deletePlan(planName){
        let planId = planName.replace(/\s+|\.|\,|'|"|&|\$|%|#|@|!/g, "-");

        chargebee.plan.delete(planId).request(function(error,result) {
            if(error){
                //handle error
                console.log(error);
            }else{
                //console.log(result);
                var plan = result.plan;
            }
        });
    }


    createSubscription(){

    }
    retrieveSubscription(){

    }
    updateSubscription(){

    }
    deleteSubscription(){

    }





}

module.exports = new ChargebeeService();