
const relationshipService = require('../services/relationshipService');
const {notifyAdmin} = require("../services/notificationService");

//TODO: find a home for the validator
let validatorMap = {
    "present": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate) {
            if (!body[keyString]) {
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "positiveIntegerOnly": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate) {
            if (!body[keyString] || !Number.parseInt(body[keyString])
                || body[keyString].includes("-") || body[keyString].includes(" ") || body[keyString].includes(".")) {
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "noSpaces": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate) {
            if (!body[keyString] || body[keyString].includes(" ")) {
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "positiveDecimalAllowed": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate) {
            if (!body[keyString] || !Number.parseInt(body[keyString])
                || body[keyString].includes("-")) {
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "decimalAllowed": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate) {
            if (!body[keyString] || !Number.parseInt(body[keyString])) {
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
};

/**
 *  validates parameters
 * @param paramArrayMap - object in form:
 * {
 *      present: array of string keys that should be present
 *      positiveIntegerOnly: array of string keys that should parse to positive integers only,
 *      noSpaces: array of string keys that should not have spaces
 * }
 *
 * @param body request body to validate
 * @returns object in the form:
 * {
 *      isValid: a boolean indicating whether or not the parameters were valid
 *      message: a string description of the result
 * }
 */
async function validateParams(paramArrayMap, body) {
    let validator = {isValid: true, message: ""};
    let paramsTypesToScan = ["present", "positiveIntegerOnly", "noSpaces", "positiveDecimalAllowed", "decimalAllowed"];
    for (var paramName of paramsTypesToScan) {
        let keyArray = paramArrayMap[paramName];
        if (keyArray) {
            let result = await validatorMap[paramName](keyArray, body);
            if (!result.isValid) {
                validator.isValid = false;
                validator.message += result.message;
            }
        }
    }
    if (!validator.message) {
        validator.message = "Valid";
    }
    if (!validator.isValid){
        console.log(`Failed to validate! \nParameters: ${paramArrayMap.toString()} \nBody: ${paramArrayMap.toString()}`);
        notifyAdmin(`Failed to validate! \nParameters: ${paramArrayMap.toString()} \nBody: ${paramArrayMap.toString()}`);
    }
    return validator;
}

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

        let validationResult = await validateParams(
            {
                "present": ["occupation"],
                "positiveIntegerOnly": ["makerId"],
                "noSpaces": ["clientId", "planId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await relationshipService.createRelationship(req.body.makerId,
                req.body.clientId, req.body.planId, req.body.occupation).catch(err => {
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
     *    "occupation": occupation of the maker in the relationship
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
     *    "occupation": occupation of the maker in the relationship
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
     *  "occupation": occupation of the maker in the relationship
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
     *  "occupation": updated occupation of the maker in the relationship
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
                "noSpaces": ["clientId", "planId"],
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