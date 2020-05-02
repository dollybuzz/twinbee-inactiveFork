const clientRepo = require('../repositories/clientRepo.js');
const clientService = require('../services/ClientService.js');


//TODO Add validation befre action
module.exports = {
    getClientById: async (req, res) => {
        let id = req.query.id;
        let clients = await clientRepo.getAllClients();

        for (var i = 0; i < clients.length; ++i) {
            if (clients[i].id == id) {
                let client = await clientService.createClient(clients[i].id, clients[i].name, clients[i].remaining_hours,
                    clients[i].email, null, null);
            }
        }
        res.send(client);
    },

    createClient: (req, res) =>{

        //TODO integrate chargebee and makers
        let chargebeeObj = null;
        let makers = null;

        clientService.createClient(req.body.name, req.body.location, req.body.remainingHours,
            req.body.email, chargebeeObj, makers)

    },

    getAllClients: async (req, res) => {
        res.send(await clientService.getAllClients());
    }
}
