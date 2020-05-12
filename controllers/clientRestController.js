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
        clientService.updateClientBilling(req.body.id, req.body.firstName, req.body.lastName,
            req.body.street, req.body.city, req.body.state, req.body.zip);
        res.end();
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
        console.log("this is before");
        clientService.updateClientContact(req.body.id, req.body.firstName, req.body.lastName, req.body.email, req.body.phone);
        res.send({});
        console.log("this is after");
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
    updateClientMetadata: (req, res) =>{
        clientService.updateClientMetadata(req.body.id, req.body.metadata);
        res.end();
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
    updateClientTimeBucket(req, res){
      clientService.updateClientRemainingMinutes(req.body.id, req.body.planName, parseInt(req.body.minutes));
      res.end();
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
     *     "city": customer's city,
     *     "state": customer's state,
     *     "zip": customer's zip,
     *     "auth": authentication credentials; either master or token
     * }
     * @returns customer{}
     */
    createClient: async (req, res) => {
        let client = await clientService.createNewClient(req.body.firstName, req.body.lastName,
            req.body.email, req.body.address, req.body.city, req.body.state, req.body.zip)
            .catch(err=>{console.log(err)});
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
        clientService.deleteClientById(req.body.id);
        res.end();
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
        res.send(await clientService.getAllClients().catch(err=>{console.log(err)}));
    }
};
