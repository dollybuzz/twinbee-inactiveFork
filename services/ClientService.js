const clientRepo = require('../repositories/clientRepo.js');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const Client = require('../domain/entity/client.js');
const request = require('request');
const chargebee = require('chargebee');

//id, name, location, remainingHours, email, chargebeeObj, makers)


class ClientService {
    constructor() {
    };


    //TODO: handle chargebee, maker integration
    async getAllClients() {
        let clients = [];
        let repoResult = await clientRepo.getAllClients();
        repoResult.forEach(item => {
            let newObj = new Client(item.id, item.name, item.location, item.remaining_hours, item.email, null, null);
            clients.push(newObj);
        })
        return clients;
    }

    async createNewClient(name, location, remainingHours, email, chargebeeObj, makers) {
        clientRepo.createClient(name, location, remainingHours, email);
        let id = clientRepo.getClientIdByEmail(email);
        return new Client(id, name, location, remainingHours, email, chargebeeObj, makers)
    }


    //TODO integrate chargebee and makers
    async getClientById(id) {
        let clientData = clientRepo.getClientById(id);
        let client = new Client(clientData.id, clientData.name, clientData.location,
            clientData.remaining_hours, clientData.email, null, null);
        return client;
    }

    /**
     * Retrieves time all time sheets for a given client.
     * @param id    - id of the desired client
     * @returns {Promise<[]>} containing time_sheet objects
     */
    async getSheetsByClient(id, fn) {
        let clientSheets = [];
        request(`http://${process.env.IP}:${process.env.PORT}/api/getAllTimesheets`, function (err, response, body) {
            if (err) {
                console.log(err)
            }
            let sheets = JSON.parse(body);
            for (var i = 0; i < sheets.length; ++i) {
                if (sheets[i].clientId == id) {
                    clientSheets.push(sheets[i]);
                }
            }
            fn(clientSheets);
        });
    }

    async getMakersForClient(id, fn) {
        let clientMakers = [];
        let me = this;
        request(`http://${process.env.IP}:${process.env.PORT}/api/getAllMakers`, function (err, response, body) {
            if (err) {
                console.log(err)
            }
            let makers = JSON.parse(body);
            let makersMap = {};
            let foundIds = {};
            for (var i = 0; i < makers.length; ++i) {
                makersMap[makers[i].id] = makers[i];
            }
            me.getSheetsByClient(id, function (sheets) {
                for (var i = 0; i < sheets.length; ++i) {
                    if (!foundIds[sheets[i].makerId] && makersMap[sheets[i].makerId]) {
                        foundIds[sheets[i].makerId] = true;
                        clientMakers.push(makersMap[sheets[i].makerId]);
                    }
                }
                fn(clientMakers);
            })
        })
    };

    getChargebeeObjForClient(client, fn){
        setTimeout(function () {
        }, 900)
        chargebee.configure({site : "freedom-makers-test",
            api_key : "test_uRyjE5xojHVh9DYAI0pjJbv2TS3LPYfV"})
        chargebee.customer.list({
        }).request(function(error,result) {
            if(error){
                //handle error
                console.log(error);
            }else{
                for(var i = 0; i < result.list.length;i++){
                    var entry=result.list[i]
                    if (entry["email"] == client.email){
                        fn(entry)
                    }
                }
            }
        });
    }
}

module.exports = new ClientService();