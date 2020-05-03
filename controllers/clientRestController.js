const clientService = require('../services/ClientService.js');


//TODO Add validation before action
module.exports = {
    getClientById: async (req, res) => {
        let id = req.query.id;
        let client = clientService.getClientById(id);
        res.send(client);
    },

    createClient: (req, res) => {

        //TODO integrate chargebee and makers
        let chargebeeObj = null;
        let makers = null;
        clientService.createNewClient(req.body.name, req.body.location, req.body.remainingHours,
            req.body.email, chargebeeObj)
        res.end();
    },

    deleteClient: (req, res) => {
        clientService.deleteClientById(req.body.id);
        res.end();
    },

    getAllClients: async (req, res) => {
        res.send(await clientService.getAllClients());
    }
}
