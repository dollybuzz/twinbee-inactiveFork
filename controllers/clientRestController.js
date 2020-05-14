const clientService = require('../services/ClientService.js');


//TODO Add validation before action
module.exports = {

    /**
     * ENDPOINT: /api/getClient
     * Retrieves a chargebee customer object by their chargebee customer id. Looks for
     * values in the body in the form:
     * {
     *     "id": customer id,
     *     "auth": authentication credentials; either master or token
     * }
     * @returns customer{}
     */
    getClientById: async (req, res) => {
        console.log("Attempting to get client by id from REST: ");
        console.log(req.body);
        let id = req.body.id;
        let client = await clientService.getClientById(id);
        res.send(client);
    },

    /**
     * ENDPOINT: /api/updateClientBilling
     * Updates a client's billing info. looks for data in the body in the form:
     * {
     *     "id": id of customer to update,
     *     "firstName": new first name for billing,
     *     "lastName": new last name for  billing,
     *     "street": new street number and name for billing,
     *     "city": new city for billing,
     *     "state": new state for billing,
     *     "zip": new zip for billing,
     *     "auth": authentication credentials; either master or token
     * }
     */
    updateClientBilling: (req, res) => {
        console.log("Attempting to update client billing from REST: ");
        console.log(req.body);
        clientService.updateClientBilling(req.body.id, req.body.firstName, req.body.lastName,
            req.body.street, req.body.city, req.body.state, req.body.zip);
        res.send({});
    },


    /**
     * ENDPOINT: /api/updateClientContact
     * Updates a client's contact info. looks for data in the body in the form:
     * {
     *     "id": id of customer to update,
     *     "firstName": new first name,
     *     "lastName": new last name,
     *     "email": new email,
     *     "phone": new phone,
     *     "auth": authentication credentials; either master or token
     * }
     */
    updateClientContact: (req, res) => {
        console.log("Attempting to update client contact info from REST: ");
        console.log(req.body);
        clientService.updateClientContact(req.body.id, req.body.firstName, req.body.lastName, req.body.email, req.body.phone);
        res.send({});
    },

    /**
     * ENDPOINT: /api/updateClientMetadata
     * Updates a client's metadata within chargebee.
     * Looks for data in the body in the form:
     * {
     *     "id": client's id,
     *     "metadata":  {
     *                      "customKey1": "value1",
     *                      "customKey2": "value2"...
     *                  }
     *     "auth": authentication credentials; either master or token,
     * }
     */
    updateClientMetadata: (req, res) => {
        console.log("Attempting to update client meta data from REST: ");
        console.log(req.body);
        clientService.updateClientMetadata(req.body.id, req.body.metadata);
        res.send({});
    },

    /**
     * ENDPOINT: /api/updateClientTimeBucket
     * Updates a client's time bucket for one plan with the given number
     * of minutes (adds or subtracts). Looks for data in the body in the form:
     * {
     *     "id": id of the client to update,
     *     "planName": name of the client's plan to update,
     *     "minutes": positive or negative integer of minutes to update with,
     *     "auth": authentication credentials; either master or token
     * }
     */
    updateClientTimeBucket(req, res) {
        console.log("Attempting to update client from REST: ");
        console.log(req.body);
        clientService.updateClientRemainingMinutes(req.body.id, req.body.planName, parseInt(req.body.minutes))
            .catch(error => {
                console.log(error)
            });
        res.send({});
    },

    /**
     * ENDPOINT: /api/createClient
     * Creates a chargebee customer object. Once created, the object is sent back.
     * Looks for values in the body in the form:
     * {
     *     "firstName": customer's first name,
     *     "lastName": customer's last name,
     *     "email": customer's email,
     *     "address": customer's street address,
     *     "phone": customer's phone,
     *     "city": customer's city,
     *     "state": customer's state,
     *     "zip": customer's zip,
     *     "billingFirst": customer's billing first name,
     *     "billingLast": customer's billing last name,
     *     "auth": authentication credentials; either master or token
     * }
     * @returns customer{}
     */
    createClient: async (req, res) => {
        console.log("Attempting to create a client from REST: ");
        console.log(req.body);
        let client = await clientService.createNewClient(req.body.firstName, req.body.lastName,
            req.body.email, req.body.address, req.body.city, req.body.state, req.body.zip,
            req.body.phone, req.body.billingFirst, req.body.billingLast)
            .catch(err => {
                console.log(err)
            });
        res.send(client);
    },

    /**
     * /api/deleteClient
     * Marks a customer as deleted. Looks for values in the body in the form:
     * {
     *     "id": chargebee customer id for customer to be 'deleted',
     *     "auth": authentication credentials; either master or token
     * }
     */
    deleteClient: (req, res) => {
        console.log("Attempting to delete a client from REST: ");
        console.log(req.body);
        clientService.deleteClientById(req.body.id);
        res.send({});
    },

    /**
     * /api/getAllClients
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
     *  Looks for authentication in the body as follows:
     *  {
     *     "auth": authentication credentials; either master or token
     *  }
     *
     * @returns [{customer:{}},...]
     */
    getAllClients: async (req, res) => {
        console.log("Attempting to grab all clients from REST");
        res.send(await clientService.getAllClients().catch(err => {
            console.log(err)
        }));
    },

    /**
     * ENDPOINT: /api/getMakersForClient
     * Retrieves a list of all makers for a given client.
     * Looks for data in the body in the form:
     * {
     *      "id": client's chargebee id,
     *      "auth": valid auth token
     * }
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getMakersForClient: async (req, res) => {
        console.log("Attempting to get makers for client from rest: ");
        console.log(req.body);
        res.send(await clientService.getMakersForClient(req.body.id));
    },

    /**
     * ENDPOINT: /api/getUpdatePaymentURL
     * {
     *     "id": client's chargebee id,
     *     "auth": valid auth token
     * }
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getUpdatePaymentPage: async (req, res) => {
        console.log("Attempting to get a hosted page for payment source update: ");
        console.log(req.body);
        res.send(await clientService.getUpdatePaymentPage(req.body.id));
    }
};
