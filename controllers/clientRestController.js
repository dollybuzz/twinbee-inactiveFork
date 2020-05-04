const clientService = require('../services/ClientService.js');


//TODO Add validation before action
module.exports = {
    getClientById: async (req, res) => {
        let id = req.query.id;
        let client = clientService.getClientById(id);
        res.send(client);
    },

    createClient: (req, res) => {
        clientService.createNewClient(req.body.firstName, req.body.lastName, req.body.email, req.body.address,
            req.body.city, req.body.state, req.body.zip)
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
