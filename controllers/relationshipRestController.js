const relationshipService = require('../services/relationshipService');
const {notifyAdmin} = require("../services/notificationService");
const {validateParams} = require("../util.js");

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
     *     "occupation": maker's occupation for the relationship,
     *     "hourlyRate": maker's hourly rate in cents (integer)
     * }
     *
     * returns data in the form:
     * {
     *  "id": new relationship id,
     *  "makerId": id of the maker in the relationship,
     *  "clientId": id of the client in the relationship,
     *  "planId": id of the plan binding the relationship,
     *  "occupation": occupation of the maker in the relationship,
     *  "hourlyRate": maker's hourly rate in cents (integer)
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

        let validationResult = await validateParams(
            {
                "present": ["occupation"],
                "positiveIntegerOnly": ["makerId"],
                "noSpaces": ["clientId", "planId"],
                "positiveDecimalAllowed": ["hourlyRate"],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await relationshipService.createRelationship(req.body.makerId,
                req.body.clientId, req.body.planId, req.body.occupation, req.body.hourlyRate).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
    },

    /**
     * ENDPOINT: /api/getRelationshipsByMakerId
     * Retrieves all relationships for the given maker.
     * Looks for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "id": id of the maker in the relationships
     * }
     * returns data in the form:
     * [
     *   {
     *    "id":  relationship id,
     *    "makerId": id of the maker in the relationship,
     *    "clientId": id of the client in the relationship,
     *    "planId": id of the plan binding the relationship,
     *    "occupation": occupation of the maker in the relationship,
     *    "hourlyRate": maker's hourly rate in cents (integer)
     *   },...
     * ]
     * @param req
     * @param res
     * @returns {Promise<[]>}
     */
    getRelationshipsByMakerId: async (req, res) =>{
        console.log(`Getting relationships for maker ${req.body.id}`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": ["id"],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await relationshipService.getRelationshipsByMakerId(req.body.id).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
    },

    /**
     * ENDPOINT: /api/getRelationshipsByClientId
     * Retrieves all relationships for the given client.
     * Looks for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "id": id of the client in the relationships
     * }
     * Returns data in the form:
     * [
     *   {
     *    "id":  relationship id,
     *    "makerId": id of the maker in the relationship,
     *    "clientId": id of the client in the relationship,
     *    "planId": id of the plan binding the relationship,
     *    "occupation": occupation of the maker in the relationship,
     *    "hourlyRate": maker's hourly rate in cents (integer)
     *   },...
     * ]
     * @param req
     * @param res
     * @returns {Promise<[]>}
     */
    getRelationshipsByClientId: async (req, res) =>{
        console.log(`Getting relationships for client ${req.body.id}`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["id"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await relationshipService.getRelationshipsByClientId(req.body.id).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
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
     *  "occupation": occupation of the maker in the relationship,
     *  "hourlyRate": maker's hourly rate in cents (integer)
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getRelationshipById: async (req, res) =>{
        console.log(`Attempting to retrieve relationship ${req.body.id} from REST`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": ["id"],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await relationshipService.getRelationshipById(req.body.id).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
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
     *       "occupation": occupation of the maker in the relationship,
     *       "hourlyRate": maker's hourly rate in cents (integer)
     *      },
     *
     *      {
     *       "id":  relationship id,
     *       "makerId": id of the maker in the relationship,
     *       "clientId": id of the client in the relationship,
     *       "planId": id of the plan binding the relationship,
     *       "occupation": occupation of the maker in the relationship,
     *       "hourlyRate": maker's hourly rate in cents (integer)
     *      },...
     * ]
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getAllRelationships: async (req, res) =>{
        console.log("Attempting to get all relationships from REST");
        console.log(req.body);
        res.send(await relationshipService.getAllRelationships().catch(err => {
            console.log(err);
            notifyAdmin(err.toString());
        }));
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
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": ["id"],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await relationshipService.deleteRelationship(req.body.id).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
    },

    /**
     * ENDPOINT: /api/updateRelationship
     * Updates a relationship's associated plan and/or occupation.
     * Looks for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "id": id of the relationships,
     *     "makerId": id of the maker in the relationship,
     *     "planId": new plan id for relationship,
     *     "occupation": new occupation for relationship
     * }
     * returns data in the form:
     * {
     *  "id":  relationship id,
     *  "makerId": id of the maker in the relationship,
     *  "clientId": id of the client in the relationship,
     *  "planId": updated id of the plan binding the relationship,
     *  "occupation": updated occupation of the maker in the relationship,
     *  "hourlyRate": maker's hourly rate in cents (integer)
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    updateRelationship: async (req, res) =>{
        console.log(`Attempting to update relationship ${req.body.id} from REST`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["occupation"],
                "positiveIntegerOnly": ["id", "makerId"],
                "noSpaces": ["planId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await relationshipService.updateRelationship(req.body.id, req.body.planId, req.body.occupation, req.body.makerId).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
    },
};