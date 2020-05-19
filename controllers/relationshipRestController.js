
const relationshipService = require('../services/relationshipService');

module.exports = {

    /**
     * ENDPOINT: /api/createRelationship
     * creates a new relationship
     * Looks for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "makerId": id of the freedom maker in the relationship,
     *     "clientId": id of the client in the relationship,
     *     "planId": plan id that defines relationship price,
     *     "occupation": maker's occupation for the relationship
     * }
     *
     * returns data in the form:
     * {
     *  "id": new relationship id,
     *  "makerId": id of the maker in the relationship,
     *  "clientId": id of the client in the relationship,
     *  "planId": id of the plan binding the relationship,
     *  "occupation": occupation of the maker in the relationship
     * }
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    createRelationship: async (req, res) =>{
        console.log(`Creating relationship for maker ${req.body.makerId} with`
            +` client ${req.body.clientId} from REST`);
        console.log(req.body);
        res.send(await relationshipService.createRelationship(req.body.makerId,
            req.body.clientId, req.body.planId, req.body.occupation));
    },

    /**
     * ENDPOINT: /api/getRelationshipsByMakerId
     * Retrieves all relationships for the given maker.
     * Looks for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "id": id of the maker in the relationships
     * }
     * @param req
     * @param res
     * @returns {Promise<[]>}
     */
    getRelationshipsByMakerId: async (req, res) =>{
        console.log(`Getting relationships for maker ${req.body.id}`);
        console.log(req.body);
        res.send(await relationshipService.getRelationshipsByMakerId(req.body.id));
    },

    /**
     * ENDPOINT: /api/getRelationshipsByClientId
     * Retrieves all relationships for the given client.
     * Looks for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "id": id of the client in the relationships
     * }
     * @param req
     * @param res
     * @returns {Promise<[]>}
     */
    getRelationshipsByClientId: async (req, res) =>{
        console.log(`Getting relationships for client ${req.body.id}`);
        console.log(req.body);
        res.send(await relationshipService.getRelationshipsByClientId(req.body.id));
    },

    /**
     * ENDPOINT: /api/getRelationshipById
     * Retrieves a relationship.
     * Looks for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "id": id of the relationships
     * }
     * returns data in the form:
     * {
     *  "id":  relationship id,
     *  "makerId": id of the maker in the relationship,
     *  "clientId": id of the client in the relationship,
     *  "planId": id of the plan binding the relationship,
     *  "occupation": occupation of the maker in the relationship
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getRelationshipById: async (req, res) =>{
        console.log(`Attempting to retrieve relationship ${req.body.id} from REST`);
        console.log(req.body);
        res.send(await relationshipService.getRelationshipById(req.body.id));
    },

    /**
     * ENDPOINT: /api/getAllRelationships
     * retrieves all relationships. Looks for data in the body in the form:
     * {
     *     "auth": valid authentication token,
     * }
     * returns data in the form:
     * [
     *      {
     *       "id":  relationship id,
     *       "makerId": id of the maker in the relationship,
     *       "clientId": id of the client in the relationship,
     *       "planId": id of the plan binding the relationship,
     *       "occupation": occupation of the maker in the relationship
     *      },
     *
     *      {
     *       "id":  relationship id,
     *       "makerId": id of the maker in the relationship,
     *       "clientId": id of the client in the relationship,
     *       "planId": id of the plan binding the relationship,
     *       "occupation": occupation of the maker in the relationship
     *      },...
     * ]
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getAllRelationships: async (req, res) =>{
        console.log("Attempting to get all relationships from REST");
        console.log(req.body);
        res.send(await relationshipService.getAllRelationships());
    },

    /**
     * ENDPOINT: /api/deleteRelationship
     * Deletes a relationship.
     * Looks for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "id": id of the relationships
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    deleteRelationship: async (req, res) =>{
        console.log(`Attempting to delete relationship ${req.body.id} from REST`);
        console.log(req.body);
        res.send(await relationshipService.deleteRelationship(req.body.id))
    },

    /**
     * ENDPOINT: /api/updateRelationship
     * Updates a relationship's associated plan and/or occupation.
     * Looks for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "id": id of the relationships,
     *     "planId": new plan id for relationship,
     *     "occupation": new occupation for relationship
     * }
     * returns data in the form:
     * {
     *  "id":  relationship id,
     *  "makerId": id of the maker in the relationship,
     *  "clientId": id of the client in the relationship,
     *  "planId": updated id of the plan binding the relationship,
     *  "occupation": updated occupation of the maker in the relationship
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    updateRelationship: async (req, res) =>{
        console.log(`Attempting to update relationship ${req.body.id} from REST`);
        console.log(req.body);
        res.send(await relationshipService.updateRelationship(req.body.id, req.body.planId, req.body.occupation));
    },
};