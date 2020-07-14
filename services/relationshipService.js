const relationshipRepo = require('../repositories/relationshipRepo.js');
const Relationship = require('../domain/entity/relationship');
const emailService = require('./notificationService.js');

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
        let id = await relationshipRepo.createRelationship(makerId, clientId, planId, occupation, hourlyRate).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        return new Relationship(id, makerId, clientId, planId, occupation, hourlyRate);
    }

    async getAllRelationships() {
        console.log("Getting all relationships...");
        let repoResult = await relationshipRepo.getAllRelationships().catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        return await createRelationshipArrayFromDBSet(repoResult).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
    }

    async getRelationshipsByMakerId(makerId) {
        console.log(`Getting relationship data for maker ${makerId}... `);
        let result = await relationshipRepo.getRelationshipsByMakerId(makerId).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        return await createRelationshipArrayFromDBSet(result).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
    }

    async getRelationshipsByClientId(clientId) {
        console.log(`Getting relationship data for client ${clientId}...`);
        let result = await relationshipRepo.getRelationshipsByClientId(clientId).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        return await createRelationshipArrayFromDBSet(result).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
    }

    async getRelationshipById(id) {
        console.log(`Getting relationship data for relationship ${id}`);
        let result = await relationshipRepo.getRelationshipById(id).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        if (result[0]) {
            let relationship = result[0];
            return await createRelationshipFromRow(relationship);
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
            occupation, makerId).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        return this.getRelationshipById(relationshipId);
    }
}

module.exports = new RelationshipService();