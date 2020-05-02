const clientRepo = require('../repositories/clientRepo.js');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const Client = require('../domain/entity/client.js');
const request = require('request');


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

    async createClient(id, name, location, remainingHours, email, chargebeeObj, makers){
        return new Client(id, name, location, remainingHours, email, chargebeeObj, makers)
    }


    /**
     * Retrieves time all time sheets for a given client.
     * @param id    - id of the desired client
     * @returns {Promise<[]>} containing time_sheet objects
     */
    async getSheetsByClient(id){
        let sheets = [];

        request(`http://${process.env.IP}:${process.env.PORT}/api/getAllSheets`, function (err, response, body) {
            if (err){console.log(err)}
            let sheets = JSON.parse(body);


        });

        // get all sheets
        // filter sheets by id
        //


        return sheets;
    }

    async getMakersForClient(id){
        return [];
    }
    async getChargebeeObjFor(id){
        return null;
    }

    async getClientById(id){
        let clients = await  this.getAllClients();
        for (var i = 0; i < clients.length; ++i){
            if (clients[i].id == id)
                return new Client(clients[i].id, clients[i].name, clients[i].location,
                    clients[i].remainingHours, clients[i].email, this.getChargebeeObjFor(id), this.getMakersForClient(id));
        }
        return 'not found';
    }
}

module.exports = new ClientService();