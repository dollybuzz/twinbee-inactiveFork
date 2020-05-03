const clientRepo = require('../repositories/clientRepo.js');
const Client = require('../domain/entity/client.js');
const util = require('util');
const request = util.promisify(require('request'));
const chargebee = require('chargebee');

/**
 * Service that works with client objects.  Client objects in form:
 * {
 *      id: database id,
 *      name: client name,
 *      location: client location,
 *      chargebeeObj: Chargebee "Customer" object,
 *      remainingHours: hours as float/double,
 *      email: client's email address,
 *      makers: list of all makers associated with this client
 * }
 */
class ClientService {

    /**
     * Note: no setup for the service is necessary. The ClientService object
     * is to be used as a singleton.
     */
    constructor() {
    };

    /**
     * TODO optimize chargebee calls
     *
     * Retrieves all clients as Client objects in a list.
     *
     * Calls: ClientService.getMakersForClient, ClientService.getChargebeeObjForClientByEmail, Client()
     * @returns {Promise<[all client objects]>}
     */
    async getAllClients() {
        let clients = [];
        let repoResult = await clientRepo.getAllClients();
        for (var i = 0; i < repoResult.length; ++i){
            let cbObj = await this.getChargebeeObjForClientByEmail(repoResult[i].email).catch(err=>{console.log(err)});
            let newObj = new Client(repoResult[i].id, repoResult[i].name, repoResult[i].location,
                repoResult[i].remaining_hours, repoResult[i].email,
                cbObj);
            clients.push(newObj);
        }
        return clients;
    }

    /**
     * Creates a newly acquired client and logs them to the database. An object
     * reference to the client is returned.
     *
     * @param name          - Client name
     * @param location      - Client location
     * @param remainingHours- Remaining hours in client's wallet
     * @param email         - Client's email address
     * @param chargebeeObj  - Chargebee "Customer" object for the client
     * @param makers        - Array of maker objects associated with the client
     * @returns {Promise<void>} that should resolve to a client object
     */
    async createNewClient(name, location, remainingHours, email, chargebeeObj) {
        clientRepo.createClient(name, location, remainingHours, email);
        let id = clientRepo.getClientIdByEmail(email);
        return new Client(id, name, location, remainingHours, email, chargebeeObj)
    }

    /**
     * Retrives a client by their database id.
     * @param id    - client's database id
     * @returns {Promise<void>} that should resolve to a client object
     */
    async getClientById(id) {
        let clientData = clientRepo.getClientById(id);
        let cbObj = await this.getChargebeeObjForClientByEmail(clientData.email).catch(err => {
            console.log(err)
        });
        let makers = await this.getMakersForClient(id).catch(err => {
            console.log(err)
        });
        let client = new Client(clientData.id, clientData.name, clientData.location,
            clientData.remaining_hours, clientData.email, cbObj, makers);
        return client;
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
            if (sheets[i].clientId == id) {
                clientSheets.push(sheets[i]);
            }
        }
        return clientSheets;
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
            if (!foundIds[sheets[i].makerId] && makersMap[sheets[i].makerId]) {
                foundIds[sheets[i].makerId] = true;
                clientMakers.push(makersMap[sheets[i].makerId]);
            }
        }
        return clientMakers;
    };

    /**
     * Retrieves the chargebee "Customer" object for the given client. Note that
     * the client is requested in whole; not by id.
     *
     * @param client    - a Client object for which to find a matching chargbee "Customer" object.
     * @returns {Promise<>} that should resolve to a chargebee "Customer" object. Throws a notifying
     *                      error if none is found.
     */
    getChargebeeObjForClient(client){
        chargebee.configure({site : "freedom-makers-test",
            api_key : "test_uRyjE5xojHVh9DYAI0pjJbv2TS3LPYfV"})

        return new Promise((resolve, reject)=> {
            chargebee.customer.list({
            }).request(function(error,result) {
                if(error){
                    //handle error
                    reject(error);
                }else{
                    for(var i = 0; i < result.list.length;i++){
                        var entry=result.list[i].customer
                        if (entry["email"] == client.email){
                            resolve(entry);
                        }
                    }
                    reject(/* TODO: enable when ready. new Error('No client match in chargebee')*/);
                }
            });
        })
    }

    /**
     * Retrieves the chargebee "Customer" object for a client given their email.
     *
     * @param email - Client's email address
     * @returns {Promise<>} that should resolve to a chargebee "Customer" object. Throws a notifying
     *                      error if none is found.
     */
    getChargebeeObjForClientByEmail(email){
        chargebee.configure({site : "freedom-makers-test",
            api_key : "test_uRyjE5xojHVh9DYAI0pjJbv2TS3LPYfV"})

        return new Promise((resolve, reject)=> {
            chargebee.customer.list({
            }).request(function(error,result) {
                if(error){
                    //handle error
                    reject(error);
                }else{
                    for(var i = 0; i < result.list.length;i++){
                        var entry=result.list[i].customer
                        if (entry["email"] == email){
                            resolve(entry);
                        }
                    }
                    reject(/*TODO: Enable this when ready new Error('No client match in chargebee' */"clientService enable when ready");
                }
            });
        })
    }
}

module.exports = new ClientService();