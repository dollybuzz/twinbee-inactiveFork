const chargebeeService = require('../services/chargebeeService.js');

module.exports = {

    createPlan: function(req, res){
        chargebeeService.createPlan(req.body.planName, req.body.invoiceName,
            req.body.pricePerHour, req.body.planDescription);
        res.end();
    },
    retrievePlan: async function(req, res){
        let planActual = await chargebeeService.retrievePlan(req.query.planName)
            .catch(err=>console.log(err));
        res.send({plan: planActual});
    },
    updatePlan: function(req, res){
        chargebeeService.updatePlan(req.body.planName, req.body.newName,
            req.body.planInvoiceName, req.body.planPrice);
        res.end();
    },
    deletePlan: function(req, res){
        chargebeeService.deletePlan(req.body.planName);
        res.end();
    },


    createSubscription: function(req, res){

    },
    retrieveSubscription: function(req, res){

    },
    updateSubscription: function(req, res){

    },
    deleteSubscription: function(req, res){

    },

}