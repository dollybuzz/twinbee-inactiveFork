const clientService = require('../services/ClientService.js');
const authService = require('../services/authService.js');

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
     * ENDPOINT: /api/getClientName
     * Retrieves a client with only name and id exposed. Looks for
     * values in the body in the form:
     * {
     *     "relationshipObj": relationship object for client,
     *     "auth": authentication credentials; either master or token
     * }
     * returns values in the form:
     * {
     *      "id": client's id,
     *      "relId": relationship id,
     *      "name": client's first and last name space separated
     * }
     *
     * @returns customer{}
     */
    getClientName: async (req, res) => {
        console.log("Attempting to get client by id from REST: ");
        console.log(req.body);

        let censoredClient = {};
        let id = req.body['relationshipObj[clientId]'];
        let client = await clientService.getClientById(id);
        censoredClient.id = client.id;
        censoredClient.name = client.first_name + " " + client.last_name;
        censoredClient.relId = req.body['relationshipObj[id]'];
        res.send(censoredClient);
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
     * ENDPOINT: /api/getAllTimeBuckets
     * Retrieves all time buckets for clients/customers.
     * Looks for data in the body in the form:
     * {
     *     "auth": valid auth token
     * }
     * Returns data in the form:
     * [
     *  {
     *      "first_name": customer contact first name,
     *      "last_name": customer contact last name,
     *      "id": customer's chargebee id
     *      "buckets":
     *              {
     *                  "planName1": minutes left in plan 1,
     *                  "planName2": minutes left in plan 2,
     *                  "planName3": minutes left in plan 3,...
     *              }
     *  },...
     * ]
     * @param req
     * @param res
     */
    async getAllTimeBuckets(req, res) {
      console.log("Attempting to get all time buckets from REST");
      console.log(req.body);
      res.send(await clientService.getAllTimeBuckets());
    },


    /**
     * ENDPOINT: /api/getTimeBucketByClientId
     * Retrieves all time buckets for clients/customers.
     * Looks for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "id": client's id
     * }
     * Returns data in the form:
     *  {
     *      "first_name": customer contact first name,
     *      "last_name": customer contact last name,
     *      "id": customer's chargebee id
     *      "buckets":
     *              {
     *                  "planName1": minutes left in plan 1,
     *                  "planName2": minutes left in plan 2,
     *                  "planName3": minutes left in plan 3,...
     *              }
     *  }
     * @param req
     * @param res
     */
    async getTimeBucketByClientId(req, res) {
        console.log(`Attempting to get a time bucket for client ${req.body.id} from REST`);
        console.log(req.body);
        res.send(await clientService.getTimeBucketByClientId(req.body.id));
    },

    /**
     * ENDPOINT: /api/updateClientTimeBucket
     * Updates a client's time bucket for one plan with the given number
     * of minutes (adds or subtracts). Looks for data in the body in the form:
     * {
     *     "id": id of the client to update,
     *     "planName": id of the client's plan to update,
     *     "minutes": positive or negative integer of minutes to update with,
     *     "auth": authentication credentials; either master or token
     * }
     */
    async updateClientTimeBucket(req, res) {
        console.log("Attempting to update client from REST: ");
        console.log(req.body);

        res.send(await clientService.updateClientRemainingMinutes(req.body.id, req.body.planName, parseInt(req.body.minutes))
            .catch(error => {
                console.log(error)
            }));
    },

    /**
     * ENDPOINT: /api/deleteBucket
     * Deletes the designated time bucket for the designated client. Looks for
     * data in the body in the form:
     * {
     *     "id": Client id,
     *     "bucket": plan name of time bucket to delete,
     *     "auth": valid auth creds
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    async deleteClientTimeBucket(req, res){
        console.log(`Attempting to delete client ${req.body.id} time bucket ${req.body.bucket} from REST: `);
        console.log(req.body);

        res.send(await clientService.deleteTimeBucket(req.body.id, req.body.bucket)
            .catch(error => {
                console.log(error)
            }));
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
    deleteClient: async (req, res) => {
        console.log("Attempting to delete a client from REST: ");
        console.log(req.body);
        await clientService.deleteClientById(req.body.id);
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
     * ENDPOINT: /api/getClientByToken
     * Retrieves a client object associated with a gmail token.
     * Looks for data in the body in the form:
     * {
     *      "token": client's token,
     *      "auth": valid auth token
     * }
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getClientByToken: async (req, res) => {
        console.log("Attempting to get client by token from REST: ");
        console.log(req.body);
        let email = await authService.getEmailFromToken(req.body.token);
        res.send(await clientService.getClientByEmail(email));
    },

    /**
     * ENDPOINT: /api/subscriptionRenewed
     *
     * Updates client bucket on subscription renewal.
     * For use with chargebee webhook, not to be independently called.
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    subscriptionRenewed: async (req, res)=>{
        console.log(`Webhook hit for ${req.body.event_type}`);
        if (req.body.event_type == "subscription_renewed"){
        console.log("Client subscription renewed; updating from REST");
        console.log(req.body);
        res.send(await clientService.subscriptionRenewed(req.body));
        }
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
        let page = await clientService.getUpdatePaymentPage(req.body.id);
        res.send({url: page.url});
    },

    /**
     * ENDPOINT: /api/getClientPayInvoicesPage
     * {
     *     "id": client's chargebee id,
     *     "auth": valid auth token
     * }
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getClientPayInvoicesPage: async (req, res) =>{
        console.log("Attempting to get a hosted page for client pay invoices from REST");
        console.log(req.body);
        let page = await clientService.getOutstandingPaymentsPage(req.body.id);
        res.send({url: page.url});
    }
};
