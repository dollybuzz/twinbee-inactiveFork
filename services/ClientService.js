const clientRepo = require('../repositories/clientRepo.js');
const util = require('util');
const request = util.promisify(require('request'));
var chargebee = require("chargebee");
chargebee.configure({site : "freedom-makers-test",
    api_key : process.env.CHARGEBEE_TEST_API})

//TODO: Add validation
/**
 * Service that works with chargebee's customer objects
 *
 */
class ClientService {

    /**
     * Note: no setup for the service is necessary. The ClientService object
     * is to be used as a singleton.
     */
    constructor() {
    };



    /**
     *
     * Retrieves all clients as Client objects in a list of entries. Note than intermediate
     * object must be accessed to obtain meaningful data.  E.g, to obtaina phone number
     * from the list, use resultList[0].customer.phone
     *
     * @returns {Promise<[entry]>}
     */
    async getAllClients() {
        return await clientRepo.getAllClients();
    }

    /**
     * Creates a newly acquired client and logs them to the database. An object
     * reference to the client is returned.
     * @param firstName     - customer first name
     * @param lastName      - customer last name
     * @param customerEmail - customer email
     * @param addressStreet - customer streed address
     * @param customerCity  - customer city
     * @param customerStateFull - customer state typed fully
     * @param customerZip   - customer zip code
     * @returns {Promise<chargebee customer object>}
     */
    async createNewClient(firstName, lastName, customerEmail, addressStreet,
                          customerCity, customerStateFull, customerZip, phoneNumber) {
        return await clientRepo.createClient(firstName, lastName, customerEmail, addressStreet,
            customerCity, customerStateFull, customerZip, phoneNumber);
    }

    /**
     * Retrieves a client by their database id.
     * @param id    - client's chargebee id
     * @returns {Promise<chargebee customer object>}
     */
    async getClientById(id) {
        let clientData = await clientRepo.getClientById(id);
        return clientData;
    }


    /**
     * Retrieves time all time sheets for a given client.
     * @param id    - id of the desired client
     * @returns {Promise<[]>} containing time_sheet objects
     */
    async getSheetsByClient(id) {
        let clientSheets = [];
        let response = await request(`http://${process.env.IP}:${process.env.PORT}/api/getAllTimesheets`)
            .catch(err => {
                console.log(err)
            });
        let body = response.body;
        let sheets = JSON.parse(body);

        for (var i = 0; i < sheets.length; ++i) {
            if (sheets[i].client_id == id) {
                clientSheets.push(sheets[i]);
            }
        }
        return clientSheets;
    }

    /**
     * Removes a client from the database. TODO: remove from chargebee
     * @param id    - Id of client to be removed
     */
    deleteClientById(chargebeeId){
        clientRepo.deleteClient(chargebeeId);
    }

    /**
     * Retrieves all makers associated with a given client given the client's id.
     * "Associated with" is identified as having a timesheet (open or not) linked to
     * the client.
     * @param id    - Id of the client for which to find makers
     * @returns {Promise<[maker objects]>}
     */
    async getMakersForClient(id) {
        let clientMakers = [];
        let me = this;
        let response = await request(`http://${process.env.IP}:${process.env.PORT}/api/getAllMakers`)
            .catch((err) => {
                console.log(err)
            });
        let body = response.body;
        let makers = JSON.parse(body);
        let makersMap = {};
        let foundIds = {};

        for (var i = 0; i < makers.length; ++i) {
            makersMap[makers[i].id] = makers[i];
        }

        let sheets = await this.getSheetsByClient(id).catch(err => {
            console.log(err)
        });

        for (var i = 0; i < sheets.length; ++i) {
            if (!foundIds[sheets[i].maker_id] && makersMap[sheets[i].maker_id]) {
                foundIds[sheets[i].maker_id] = true;
                clientMakers.push(makersMap[sheets[i].maker_id]);
            }
        }
        return clientMakers;
    };


    /**
     * Retrieves the chargebee "Customer" object for a client given their email.
     *
     * @param email - Client's email address
     * @returns {Promise<>} that should resolve to a chargebee "Customer" object. Throws a notifying
     *                      error if none is found.
     */
    async getClientByEmail(email){
       return await clientRepo.getClientByEmail(email);
    }
}

module.exports = new ClientService();