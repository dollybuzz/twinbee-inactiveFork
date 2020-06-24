const makerRepo = require('../repositories/makerRepo.js');
const util = require('util');
const request = util.promisify(require('request'));
const Maker = require('../domain/entity/maker.js');
const emailService = require('./emailService.js');

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
        let repoResult = await makerRepo.getAllMakers().catch(err=>{
            console.log(err);
            emailService.emailAdmin(err);
        });
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
        await makerRepo.createMaker(firstName, lastName, email).catch(err=>{
            console.log(err);
            emailService.emailAdmin(err);
        });
        let id = await makerRepo.getMakerIdByEmail(email).catch(err=>{
            console.log(err);
            emailService.emailAdmin(err);
        });
        console.log(id);
        emailService.sendWelcome(email);
        return new Maker(id, firstName, lastName, email);
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
        let retrieved = await makerRepo.getOnlineMakers().catch(err=>{
            console.log(err);
            emailService.emailAdmin(err);
        });
        retrieved.forEach(item => {
            let online = new Maker(item.maker_id, item.first_name, item.last_name, item.email);
            onliners.push(online);
        })
        return onliners;
    }

    /**
     * Retrieves a maker's id according to their email.
     *
     * @returns {Promise<unknown>}
     */
    async getMakerIdByEmail(email){
        return await makerRepo.getMakerIdByEmail(email).catch(err=>{console.log(err)});
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
        await makerRepo.updateMaker(id, firstName, lastName, email).catch(err=>{
            console.log(err);
            emailService.emailAdmin(err);
        });
        return this.getMakerById(id);
    }

    /**
     * Deletes a maker by their id
     * @param id    - maker to be deleted
     */
    async deleteMaker(id){
        console.log(`Deleting maker ${id}...`);
        await this.deleteAllRelationships(id);
        makerRepo.deleteMaker(id);
    }


    /**
     * Retrieves all relationships for a maker
     * @param makerId  -   maker whose relationships are to be retrieved
     * @returns {Promise<[Relationship]>}
     */
    async getRelationshipsForMaker(makerId){
        console.log(`Checking for relationships related to ${makerId}...`);
        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllRelationships`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });

        let relationshipList = JSON.parse(result.body);
        let newRelationshipList = [];
        for (var ship of relationshipList){
            if (ship.makerId == makerId){
                newRelationshipList.push(ship)
            }
        }
        relationshipList = newRelationshipList;
        let clients = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllClients`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });
        clients = JSON.parse(clients.body);
        let clientMap = {};

        for (var entry of clients){
            clientMap[entry.customer.id] = entry.customer;
        }
        for (var relationship of relationshipList){
            let clientName;
            if (clientMap[relationship.clientId]){
                clientName = `${clientMap[relationship.clientId].first_name} ${clientMap[relationship.clientId].last_name}`;
            }
            else{
                clientName = "Deleted Client";
            }
            relationship.clientName = clientName;
        }

        return relationshipList;
    }

    /**
     * Deletes all relationships associated with a maker
     *
     * @param maker  - maker whose relationships are to be deleted
     * @returns {Promise<void>}
     */
    async deleteAllRelationships(maker){
        console.log(`Attempting to delete relationships for ${maker}`);
        let relationshipList = await this.getRelationshipsForMaker(maker);
        console.log(relationshipList);
        for await (var relationship of relationshipList){
            console.log(relationship);
            if (relationship.makerId == maker){
                console.log("Relationship found.");
                request({
                    method: 'POST',
                    uri: `${process.env.TWINBEE_URL}/api/deleteRelationship`,
                    form: {
                        'auth': process.env.TWINBEE_MASTER_AUTH,
                        'id': relationship.id
                    }
                });
            }
        }
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
            uri: `${process.env.TWINBEE_URL}/api/getTimeSheetsByMakerId`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH,
                'id':id
            }
        }).catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });

        let sheets = JSON.parse(result.body);

        console.log(`Getting client list for maker ${id}...`);
        result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllClients`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });

        let clients = JSON.parse(result.body);
        let clientMap = {};

        for (var entry of clients){
            clientMap[entry.customer.id] = entry.customer;
        }
        for (var sheet of sheets){
            if (!clientMap[sheet.clientId]){
                sheet.clientName = "Deleted Client";
            }
            else {
                sheet.clientName = `${clientMap[sheet.clientId].first_name} ${clientMap[sheet.clientId].last_name}`;
            }
        }
        return sheets;
    }

    async getMyRelationship(makerId, relationshipId){
        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getRelationshipById`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH,
                'id': relationshipId
            }
        }).catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });
        let relationship = JSON.parse(result.body);
        if (relationship.makerId !== makerId){
            return false;
        }

        result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getClientName`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH,
                'relationshipObj': relationship
            }
        }).catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });
        let client = JSON.parse(result.body);
        relationship.clientName = client.name;
        return relationship;
    }

    async getMyRelationshipBucket(makerId, relationshipId){

        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getRelationshipById`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH,
                'id': relationshipId
            }
        }).catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });
        let body = JSON.parse(result.body);
        if (body.makerId !== makerId){
            return false;
        }
        let occupation = body.occupation;
        result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getTimeBucket`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH,
                'id':body.clientId,
                'planId': body.planId
            }
        }).catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });
        body = JSON.parse(result.body);
        body.occupation = occupation;
        return body;
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
            uri: `${process.env.TWINBEE_URL}/api/getAllClients`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });

        let clients = JSON.parse(result.body);

        result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllRelationships`,
            form: {
                'auth':process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });
        let relationships = JSON.parse(result.body);
        let clientMap = {};
        let alreadyOnList = {};
        let makersClients = [];

        for (var i = 0; i < clients.length; ++i){
            clientMap[clients[i].customer.id] = clients[i].customer;
        }

        for (var i = 0; i < relationships.length; ++i){
            let clientOnSheet = relationships[i].clientId;
            if (clientMap[clientOnSheet] && !alreadyOnList[clientOnSheet] && relationships[i].makerId == id){
                let client = clientMap[clientOnSheet];
                let censoredClient = {};
                censoredClient.first_name = client.first_name;
                censoredClient.last_name = client.last_name;
                censoredClient.id = client.id;
                censoredClient.phone = client.phone;
                censoredClient.email = client.email;
                makersClients.push(censoredClient);
                alreadyOnList[clientOnSheet] = true;
            }
        }
        console.log('List retrieved: ');
        console.log(makersClients);
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
        let result = await  makerRepo.getMakerById(id).catch(err=>{
            console.log(err);
            emailService.emailAdmin(err);
        });

        if (result[0]) {
            let maker = result[0];
            return new Maker(maker.id, maker.first_name, maker.last_name, maker.email, maker.deleted);
        }
        return 'not found';
    }
}

module.exports = new MakerService();