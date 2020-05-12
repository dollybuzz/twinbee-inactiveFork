const clientRepo = require('../repositories/clientRepo.js');
const util = require('util');
const request = util.promisify(require('request'));
var chargebee = require("chargebee");
chargebee.configure({site : "freedom-makers-test",
    api_key : process.env.CHARGEBEE_TEST_API})



let updateClient = (customerId, keyValuePairs)=>{
    chargebee.customer.update(customerId, keyValuePairs).request(function(error,result) {
        if(error){
            //handle error
            console.log(error);
        }else{
            console.log(result);
            var customer = result.customer;
            var card = result.card;
        }
    });
}


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
     * adds the keyValuePairs to the customer's metadata
     *
     * @param clientId  - client to update
     * @param keyValuePairs - key/value pairs to add
     */
    async updateClientMetadata(clientId, keyValuePairs){
        let customer = await this.getClientById(clientId);
        for (var key in keyValuePairs){
            customer.meta_data[key] = keyValuePairs[key];
        }
        updateClient(clientId, customer)
    }

    /**
     * Adds or removes minutes to/from a client's given planBucket.
     *
     * @param clientId  - chargebee id of the client to update
     * @param planBucket- planbucket whose minutes need adjusting
     * @param minuteChange- positive or negative change in minutes
     */
    async updateClientRemainingMinutes(clientId, planBucket, minuteChange) {
        let client = await this.getClientById(clientId);
        if (!client.meta_data[planBucket]) {
            console.log(client.meta_data[planBucket])
            client.meta_data[planBucket] = 0;
        }
        let newMinutes = minuteChange + client.meta_data[planBucket];
        let planMinutes = {};
        planMinutes[planBucket] = newMinutes;
        this.updateClientMetadata(clientId, planMinutes);
    }

    /**
     * Updates client contact information
     *
     * @param clientId  - id of client to be updated
     * @param newFirstName  - new first name of client
     * @param newLastName   - new last name of client
     * @param newPhone   - new phone number of client
     * @param newEmail  - new email of client
     * @returns {Promise<void>}
     */
    async updateClientContact(clientId, newFirstName, newLastName, newEmail, newPhone){
        let customer = await this.getClientById(clientId);
        customer.first_name = newFirstName;
        customer.last_name = newLastName;
        customer.email = newEmail;
        customer.phone = newPhone;
        updateClient(clientId, customer)
    }

    /**
     * Updates client billing information
     *
     * @param clientId - id of client to be updated
     * @param newFirstName  - new first name for billing
     * @param newLastName   - new last name for billing
     * @param newAddress    - new address for billing
     * @param newCity       - new city for billing
     * @param newState      - new state for billing
     * @param newZip        - new zip for billing
     */
    updateClientBilling(clientId, newFirstName, newLastName, newAddress, newCity, newState, newZip){
        chargebee.customer.update_billing_info(clientId,{
            billing_address : {
                first_name : newFirstName,
                last_name : newLastName,
                line1 : newAddress,
                city : newCity,
                state : newState,
                zip : newZip,
                country : "US"
            }
        }).request(function(error,result) {
            if(error){
                //handle error
                console.log(error);
            }else{
                //     console.log(result);
                var customer = result.customer;
                var card = result.card;
            }
        });
    }

    /**
     *
     * Retrieves all clients as Client objects in a list of entries. Note than intermediate
     * object must be accessed to obtain meaningful data.  E.g, to obtaina phone number
     * from the list, use resultList[0].customer.phone
     *
     * @returns {Promise<[entry]>}
     */
    async getAllClients() {
        return await clientRepo.getAllClients().catch(err=>{console.log(err)});
    }

    /**
     * Creates a newly acquired client and logs them to the database. An object
     * reference to the client is returned.
     * @param firstName     - customer first name
     * @param lastName      - customer last name
     * @param customerEmail - customer email
     * @param addressStreet - customer streed address
     * @param customerCity  - customer city
     * @param phoneNumber  - customer phone
     * @param customerStateFull - customer state typed fully
     * @param customerZip   - customer zip code
     * @param billingFirst  - customer billing address
     * @param billingLast   - customer billing address
     * @returns {Promise<chargebee customer object>}
     */
    async createNewClient(firstName, lastName, customerEmail, addressStreet,
                          customerCity, customerStateFull, customerZip, phoneNumber,
                          billingFirst, billingLast) {
        return await clientRepo.createClient(firstName, lastName, customerEmail, addressStreet,
            customerCity, customerStateFull, customerZip, phoneNumber, billingFirst, billingLast).catch(err=>{console.log(err)});
    }

    /**
     * Retrieves a client by their database id.
     * @param id    - client's chargebee id
     * @returns {Promise<chargebee customer object>}
     */
    async getClientById(id) {
        let clientData = await clientRepo.getClientById(id).catch(err=>{console.log(err)});
        return clientData;
    }


    /**
     * Retrieves time all time sheets for a given client.
     * @param id    - id of the desired client
     * @returns {Promise<[]>} containing time_sheet objects
     */
    async getSheetsByClient(id) {
        let clientSheets = [];
        let response = await request({
            method: 'POST',
            uri: `http://${process.env.IP}:${process.env.PORT}/api/getAllTimesheets`,
            form: {
                id: currentSheet.id,
                hourlyRate: currentSheet.hourlyRate,
                timeIn: currentSheet.timeIn,
                timeOut: await this.getCurrentMoment(),
                'auth':process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
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
        let response = await request({
            method: 'POST',
            uri: `http://${process.env.IP}:${process.env.PORT}/api/getAllMakers`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
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
       return await clientRepo.getClientByEmail(email).catch(err=>{console.log(err)});
    }
}

module.exports = new ClientService();