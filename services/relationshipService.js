const relationshipRepo = require('../repositories/relationshipRepo.js');
const Relationship = require('../domain/entity/relationship');
const {logCaughtError} = require('../util.js');
const util = require('util');
const request = util.promisify(require('request'));

async function createRelationshipFromRow(row) {
    return new Relationship(row.id, row.maker_id, row.client_id, row.plan_id, row.occupation, row.hourly_rate);
}
async function createRelationshipArrayFromDBSet(result){
    let relationships = [];
    for (var item of result){
        let newObj = await createRelationshipFromRow(item);
        relationships.push(newObj);
    }
    return relationships;
    
}

class RelationshipService {
    constructor() {
    };

    async createRelationship(makerId, clientId, planId, occupation, hourlyRate) {
        console.log("Creating a relationship...");
        let id = await relationshipRepo.createRelationship(makerId, clientId, planId, occupation, hourlyRate).catch(err => logCaughtError(err));

        request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/updateClientTimeBucket`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'id': clientId,
                'planId' : planId,
                "minutes": 0
            }
        }).catch(error => logCaughtError(error));

        return new Relationship(id, makerId, clientId, planId, occupation, hourlyRate);
    }

    async getAllRelationships() {
        console.log("Getting all relationships...");
        let repoResult = await relationshipRepo.getAllRelationships().catch(err => logCaughtError(err));
        return await createRelationshipArrayFromDBSet(repoResult).catch(err => logCaughtError(err));
    }

    async getRelationshipsByMakerId(makerId) {
        console.log(`Getting relationship data for maker ${makerId}... `);
        let result = await relationshipRepo.getRelationshipsByMakerId(makerId).catch(err => logCaughtError(err));
        return await createRelationshipArrayFromDBSet(result).catch(err => logCaughtError(err));
    }

    async getRelationshipsByClientId(clientId) {
        console.log(`Getting relationship data for client ${clientId}...`);
        let result = await relationshipRepo.getRelationshipsByClientId(clientId).catch(err => logCaughtError(err));
        return await createRelationshipArrayFromDBSet(result).catch(err => logCaughtError(err));
    }

    async getRelationshipById(id) {
        console.log(`Getting relationship data for relationship ${id}`);
        let result = await relationshipRepo.getRelationshipById(id).catch(err => logCaughtError(err));
        if (result[0]) {
            let relationship = result[0];
            return await createRelationshipFromRow(relationship).catch(err => logCaughtError(err));
        }
        return 'not found';
    }

    async deleteRelationship(relationshipId) {
        console.log(`Deleting relationship ${relationshipId}...`);
        relationshipRepo.deleteRelationship(relationshipId);
        return ({});
    }

    async updateRelationship(relationshipId, planId, occupation, makerId) {
        console.log(`Updating relationship ${relationshipId}...`);
        await relationshipRepo.updateRelationship(relationshipId, planId,
            occupation, makerId).catch(err => logCaughtError(err));
        return await this.getRelationshipById(relationshipId).catch(err => logCaughtError(err));;
    }
}

module.exports = new RelationshipService();