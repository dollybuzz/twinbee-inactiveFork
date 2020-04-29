const clientRepo = require('../repositories/clientRepo.js');
const Client = require('../domain/entity/client.js');
//id, name, location, remainingHours, email, chargebeeObj, makers)
class ClientService {
    constructor(){};
    //TODO: handle chargebee, maker integration
    async getAllClients(){
        let clients = [];
        let repoResult = await clientRepo.getAllClients();
        repoResult.forEach(item => {
            let newObj = new Client(item.id, item.name, item.location, item.remaining_hours, item.email, null, null);

            clients.push(newObj);
        })
        return clients;
    }


    /**
     * Retrieves time all time sheets for a given client.
     * @param id    - id of the desired client
     * @returns {Promise<[]>} containing time_sheet objects
     */
    async getSheetsByClient(id){
        let sheets = [];

        return sheets;
    }

    async getClientById(id){

    }
}

module.exports = new ClientService();