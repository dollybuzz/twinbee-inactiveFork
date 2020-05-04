const chargebeeService = require('../services/chargebeeService.js');

module.exports = {

    getAllPlans: async function(req, res){
        let plans = await chargebeeService.getAllPlans().catch(e=>console.log(e));;
        res.send(plans);
    },

    createPlan: function(req, res){
        chargebeeService.createPlan(req.body.planName, req.body.invoiceName,
            req.body.pricePerHour, req.body.planDescription);
        res.end();
    },
    retrievePlan: async function(req, res){
        let planActual = await chargebeeService.retrievePlan(req.query.planId)
            .catch(err=>console.log(err));
        res.send({plan: planActual});
    },
    updatePlan: function(req, res){
        chargebeeService.updatePlan(req.body.planId, req.body.newName,
            req.body.planInvoiceName, req.body.planPrice);
        res.end();
    },
    deletePlan: function(req, res){
        chargebeeService.deletePlan(req.body.planId);
        res.end();
    },


    getAllSubscriptions: async function(req, res){
        let subscriptions = await chargebeeService.getAllSubscriptions().catch(e=>console.log(e));
        res.send(subscriptions);
    },

    createSubscription: function(req, res){
        chargebeeService.createSubscription(req.body.planId, req.body.customerId, req.body.planQuantity);
        res.end();
    },

    retrieveSubscription: async function(req, res){
        console.log(req)
        let subscription = await chargebeeService.retrieveSubscription(req.query.subscriptionId)
            .catch(e=>console.log(e));
        res.send(subscription);
    },
    updateSubscription: async function(req, res){
        console.log(req)
        let subscription = await chargebeeService.updateSubscription(req.body.subscriptionId, req.body.planId,
            req.body.planQuantity, req.body.pricePerHour);
        res.send(subscription);
    },
    cancelSubscription: function(req, res){
        chargebeeService.cancelSubscription(req.body.subscriptionId);
        res.end();
    }
}