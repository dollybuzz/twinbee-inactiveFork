const relationshipRepo = require('../repositories/relationshipRepo.js');
const Relationship = require('../domain/entity/relationship');
const emailService = require('./notificationService.js');

class RelationshipService {
    constructor(){};

    async createRelationship(makerId, clientId, planId, occupation){
        console.log("Creating a relationship...");
        let id = await relationshipRepo.createRelationship(makerId, clientId, planId, occupation).catch(err=>{
            console.log(err);
            emailService.notifyAdmin(err);
        });
        return new Relationship(id, makerId, clientId, planId, occupation);
    }

    async getAllRelationships(){
        console.log("Getting all relationships...");
        let relationships = [];
        let repoResult = await relationshipRepo.getAllRelationships().catch(err=>{
            console.log(err);
            emailService.notifyAdmin(err);
        });
        repoResult.forEach(item => {
            let newObj = new Relationship(item.id, item.maker_id, item.client_id, item.plan_id, item.occupation);
            relationships.push(newObj);
        });
        return relationships;
    }

    async getRelationshipsByMakerId(makerId){
        console.log(`Getting relationship data for maker ${makerId}... `);
        let result = await relationshipRepo.getRelationshipsByMakerId(makerId).catch(err=>{
            console.log(err);
            emailService.notifyAdmin(err);
        });
        let relationships = [];
        result.forEach(item => {
            let newObj = new Relationship(item.id, item.maker_id, item.client_id, item.plan_id, item.occupation);
            relationships.push(newObj);
        });
        return relationships;
    }

    async getRelationshipsByClientId(clientId){
        console.log(`Getting relationship data for client ${clientId}...`);
        let result = await relationshipRepo.getRelationshipsByClientId(clientId).catch(err=>{
            console.log(err);
            emailService.notifyAdmin(err);
        });
        let relationships = [];
        result.forEach(item => {
            let newObj = new Relationship(item.id, item.maker_id, item.client_id, item.plan_id, item.occupation);
            relationships.push(newObj);
        });
        return relationships;
    }

    async getRelationshipById(id){
        console.log(`Getting relationship data for relationship ${id}`);
        let result = await  relationshipRepo.getRelationshipById(id).catch(err=>{
            console.log(err);
            emailService.notifyAdmin(err);
        });
        if (result[0]) {
            let relationship = result[0];
            return new Relationship(relationship.id, relationship.maker_id, relationship.client_id,
                relationship.plan_id, relationship.occupation);
        }
        return 'not found';
    }

    async deleteRelationship(relationshipId){
        console.log(`Deleting relationship ${relationshipId}...`);
        relationshipRepo.deleteRelationship(relationshipId);
        return({});
    }

    async updateRelationship(relationshipId, planId, occupation, makerId){
        console.log(`Updating relationship ${relationshipId}...`);
        await relationshipRepo.updateRelationship(relationshipId, planId,
            occupation, makerId).catch(err=>{
            console.log(err);
            emailService.notifyAdmin(err);
        });
        return this.getRelationshipById(relationshipId);
    }
}

module.exports = new RelationshipService();