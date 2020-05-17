const makerRepo = require('../repositories/makerRepo.js');
const util = require('util');
const request = util.promisify(require('request'));
const Maker = require('../domain/entity/maker.js');

class MakerService {
    constructor(){};

    /**
     * Retrives a list of all makers.
     *
     * @returns {Promise<[Maker]>}
     */
    async getAllMakers(){
        console.log("Getting all makers...");
        let makers = [];
        let repoResult = await makerRepo.getAllMakers();
        repoResult.forEach(item => {
            let newObj = new Maker(item.id, item.first_name, item.last_name, item.email, item.deleted);

            makers.push(newObj);
        });
        return makers;
    }

    /**
     * Creates a maker and saves to the database. The completed
     * Maker object is returned to the caller.
     *
     * @param firstName - first name of new maker
     * @param lastName  - last name of new maker
     * @param email     - email of new maker
     * @returns {Promise<maker>}
     */
    async createNewMaker(firstName, lastName, email){
        console.log("Creating new maker...");
        await makerRepo.createMaker(firstName, lastName, email).catch(err=>{console.log(err)});
        let id = await makerRepo.getMakerIdByEmail(email).catch(err=>{console.log(err)});
        return new Maker(id[0].id, firstName, lastName, email);
    }

    /**
     * Retrieves a list of all makers who have clocked in,
     * but not yet clocked out.
     *
     * @returns {Promise<[maker]>}
     */
    async getOnlineMakers() {
        console.log("Getting online makers...");
        let onliners = [];
        let retrieved = await makerRepo.getOnlineMakers().catch(err=>{console.log(err)});
        retrieved.forEach(item => {
            let online = new Maker(item.maker_id, item.first_name, item.last_name, item.email);
            onliners.push(online);
        })
        return onliners;
    }

    /**
     * Updates a single maker with new data.
     *
     * @param id    - database id of the maker to be updated
     * @param firstName - new first name of the maker
     * @param lastName  - new last name of the maker
     * @param email     - new email of the maker
     * @returns {Promise<maker>} or {Promise<"not found">}
     */
    async updateMaker(id, firstName, lastName, email){
        console.log(`Updating maker ${id}...`);
        await makerRepo.updateMaker(id, firstName, lastName, email).catch(err=>{console.log(err)});
        return this.getMakerById(id);
    }

    /**
     * Deletes a maker by their id
     * @param id    - maker to be deleted
     */
    deleteMaker(id){
        console.log(`Deleting maker ${id}...`);
        makerRepo.deleteMaker(id);
    }

    /**
     * Retrieves all time sheets for a given maker.
     * @param id    - id of the desired maker
     * @returns {Promise<[]>} containing timeSheet objects
     */
    async getSheetsByMaker(id){
        console.log(`Getting sheets for maker ${id}...`);
        let result =  await request({
            method: 'POST',
            uri: `http://${process.env.IP}:${process.env.PORT}/api/getAllTimeSheets`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err)
        });

        let sheets = JSON.parse(result.body);
        let makerSheets = [];
        for (var i = 0; i < sheets.length; ++i){
            if (sheets[i].makerId == id){
                makerSheets.push(sheets[i]);
            }
        }
        return makerSheets;
    }

    /**
     * Retrieves all clients a given maker has worked for.
     *
     * @param id - id of the maker to perform the search for
     * @returns {Promise<[Customer]>}
     */
    async getClientListForMakerId(id){
        console.log(`Getting client list for maker ${id}...`);
        let result = await request({
            method: 'POST',
            uri: `http://${process.env.IP}:${process.env.port}/api/getAllClients`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err)
        });
        let clients = JSON.parse(result.body);
        result = await request({
            method: 'POST',
            uri: `http://${process.env.IP}:${process.env.PORT}/api/getAllTimeSheets`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err)
        });
        let sheets = JSON.parse(result.body);
        let clientMap = {};
        let alreadyOnList = {};
        let makersClients = [];

        for (var i = 0; i < clients.length; ++i){
            clientMap[clients[i].customer.id] = {
                isPresent : true,
                object : clients[i].customer
            }
        }

        for (var i = 0; i < sheets.length; ++i){
            let clientOnSheet = sheets[i].clientId;
            if (clientMap[clientOnSheet].isPresent && !alreadyOnList[clientOnSheet]){
                makersClients.push(clientMap[clientOnSheet].object);
                alreadyOnList[clientOnSheet] = true;
            }
        }
        return makersClients;
    }

    /**
     * Retrieves a single maker by their database id
     *
     * @param id    - id of the desired maker
     * @returns {Promise<maker>} or {Promise<"not found">}
     */
    async getMakerById(id){
        console.log(`Getting maker data for maker ${id}`);
        let result = await  makerRepo.getMakerById(id).catch(err=>{console.log(err)});

        if (result[0]) {
            let maker = result[0];
            return new Maker(maker.id, maker.first_name, maker.last_name, maker.email, maker.deleted);
        }
        return 'not found';
    }
}

module.exports = new MakerService();