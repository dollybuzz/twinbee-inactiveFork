const clientService = require('../services/ClientService.js');


//TODO Add validation before action
module.exports = {

    /**
     * Retrieves a chargebee customer object by their chargebee customer id. Looks for
     * values in the query in the form:
     * {
     *     "id": customer id
     * }
     * @returns customer{}
     */
    getClientById: async (req, res) => {
        let id = req.query.id;
        let client = clientService.getClientById(id);
        res.send(client);
    },

    /**
     * Creates a chargebee customer object. Once created, the object is sent back.
     * Looks for values in the body in the form:
     * {
     *     "firstName": customer's first name,
     *     "lastName": customer's last name,
     *     "email": customer's email,
     *     "address": customer's street address,
     *     "city": customer's city,
     *     "state": customer's state,
     *     "zip": customer's zip
     * }
     * @returns customer{}
     */
    createClient: async (req, res) => {
        let client = await clientService.createNewClient(req.body.firstName, req.body.lastName,
            req.body.email, req.body.address, req.body.city, req.body.state, req.body.zip)
        res.send(client);
    },

    /**
     * Marks a customer as deleted. Looks for values in the body in the form:
     * {
     *     "id": chargebee customer id for customer to be 'deleted'
     * }
     */
    deleteClient: (req, res) => {
        clientService.deleteClientById(req.body.id);
        res.end();
    },

    /**
     * Retrieves a list of entries containing all clients.
     * Note that in order to access meaningful data, an intermediate object is
     * accessed. E.g., to access a phone number, use resultList[0].customer.phone.
     * Returns data as follows
     *  [
     *      {
     *          "customer":{}
     *      },
     *      {
     *          "customer":{}
     *      }
     *  ]
     *
     * @returns [{customer:{}},...]
     */
    getAllClients: async (req, res) => {
        res.send(await clientService.getAllClients());
    }
}
