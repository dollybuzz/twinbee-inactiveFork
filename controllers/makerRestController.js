const makerService = require('../services/MakerService.js');
const authService = require('../services/authService.js');
const timeSheetService = require('../services/timeSheetService.js');
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
            if (!body[keyString] || !Number.parseFloat(body[keyString])
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
            if (!body[keyString] || !Number.parseFloat(body[keyString])) {
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
        let tracer = new Error();
        console.log(`Failed to validate! \nParameters:\n${JSON.stringify(paramArrayMap)}\nBody:\n${JSON.stringify(body)}\nTrace:${JSON.stringify(tracer.stack)}`);
        notifyAdmin(`Failed to validate! \nParameters:\n${JSON.stringify(paramArrayMap)}\nBody:\n${JSON.stringify(body)}\nTrace:${JSON.stringify(tracer.stack)}`);
}
    return validator;
}


module.exports = {

    /**
     * ENDPOINT: /api/getOnlineMakers
     * Retrieves a list of online makers. Returns data in the form:
     * [
     *  {
     *      "id": maker's database id,
     *      "firstName": maker's first name,
     *      "lastName": maker's last name,
     *      "email": maker's email address
     *  },
     *  {
     *      "id": next maker's database id,
     *      "firstName": next maker's first name,
     *      "lastName": next maker's last name,
     *      "email": next maker's email address
     *  }
     * ]
     *
     * Looks for data in the body as follows:
     * {
     *     "auth": authentication credentials; either master or token
     * }
     * @returns {Promise<[{},...]>}
     */
    getOnlineMakers: async (req, res) => {
        console.log("Attempting to get online makers from REST");
        let onliners = await makerService.getOnlineMakers().catch(err => {
            console.log(err);
            notifyAdmin(err.toString());
        });
        res.send(onliners);
    },


    /**
     * ENDPOINT: /api/getMyRelationshipBucket
     * Retrieves the bucket minutes for the bucket associated with
     * the given relationship. Looks for values in the body in the form:
     * {
     *     "token": requester's token,
     *     "relationshipId": id of the relationship with the desired plan
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getMyRelationshipBucket: async (req, res) => {
        console.log(`Attempting to get time bucket for relationship ${req.body.relationshipId} from REST`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["token"],
                "positiveIntegerOnly": ["relationshipId"],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let email = await authService.getEmailFromToken(req.body.token).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            });
            let id = await makerService.getMakerIdByEmail(email).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            });
            res.send(await makerService.getMyRelationshipBucket(id, req.body.relationshipId).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
    },

    /**
     * ENDPOINT: /api/getAllMyRelationshipsMaker
     * Retrieves all relationships for the requester
     * Looks for values in the body in the form:
     * {
     *     "token": requester's token,
     *     "auth": valid authentication
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getAllMyRelationships: async (req, res) => {
        console.log(`Attempting to get all relationships for maker with token...\n${req.body.token}\n... from REST`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["token"],
                "positiveIntegerOnly": [],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let email = await authService.getEmailFromToken(req.body.token).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            });
            let id = await makerService.getMakerIdByEmail(email).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            });
            res.send(await makerService.getRelationshipsForMaker(id).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
    },

    /**
     * * ENDPOINT: /api/getMyRelationship
     * Retrieves the designated relationship associated with the requester.
     * Looks for values in the body in the form:
     * {
     *     "token": requester's token,
     *     "relationshipId": id of the desired relationship
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getMyRelationship: async (req, res) => {
        console.log(`Attempting to get "my" relationship for maker` +
            ` with token...\n${req.body.token}\n...with relationship id ${req.body.relationshipId} from REST`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["token"],
                "positiveIntegerOnly": ["relationshipId"],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let email = await authService.getEmailFromToken(req.body.token).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            });
            let id = await makerService.getMakerIdByEmail(email).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            });
            res.send(await makerService.getMyRelationship(id, req.body.relationshipId).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
    },

    /**
     * ENDPOINT: /api/getAllMakers
     * Retrieves a list of all makers. Returns data in the form:
     *
     * [
     *  {
     *      "id": maker's database id,
     *      "firstName": maker's first name,
     *      "lastName": maker's last name,
     *      "email": maker's email address
     *  },
     *  {
     *      "id": next maker's database id,
     *      "firstName": next maker's first name,
     *      "lastName": next maker's last name,
     *      "email": next maker's email address
     *  }
     * ]
     * Looks for data on the body as follows
     * {
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @returns {Promise<[{},...]>}
     */
    getAllMakers: async (req, res) => {
        console.log("Attempting to get all makers from REST");
        let makers = await makerService.getAllMakers().catch(err => {
            console.log(err);
            notifyAdmin(err.toString());
        });
        res.send(makers);
    },

    /**
     * ENDPOINT: /api/getMaker
     * Retrieves a maker by their database id. Looks for data in the body in the form:
     * {
     *     "id": maker's database id,
     *     "auth": authentication credentials; either master or token
     * }
     * and returns data in the form:
     * {
     *  {
     *      "id": maker's database id,
     *      "firstName": maker's first name,
     *      "lastName": maker's last name,
     *      "email": maker's email address
     *  }
     * }
     * @returns {Promise<maker>}
     */
    getMakerById: async (req, res) => {
        console.log("Attempting to get maker by ID from REST: ");
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
            let id = req.body.id;
            let result = await makerService.getMakerById(id).catch(err => {
                console.log(err)
            }).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            });
            res.send(result);
        }
    },


    /**
     * ENDPOINT: /api/getMakerIdByToken
     * Retrieves a maker by their database id. Looks for data in the body in the form:
     * {
     *     "token": maker's gmail token,
     *     "auth": authentication credentials; either master or token
     * }
     * and returns data in the form:
     *  {
     *      "id": maker's database id
     *  }
     * @returns {Promise<maker>}
     */
    getMakerIdByToken: async (req, res) => {
        console.log("Attempting to get maker by ID from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["token"],
                "positiveIntegerOnly": [],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let email = await authService.getEmailFromToken(req.body.token).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            });
            let result = await makerService.getMakerIdByEmail(email).catch(err => {
                console.log(err)
            }).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            });
            res.send({id: result.toString()});
        }
    },


    /**
     * ENDPOINT: /api/getClientsForMaker
     * Updates an existing maker with new values. Looks for data in the body in the form:
     * {
     *     "id": maker's database id,
     *     "auth": authentication credentials; either master or token
     * }
     * and returns data in the form:
     *  [
     *      customer object,
     *      customer object,...
     *  ]
     * @returns {Promise<maker>}
     */
    getClientsForMaker: async (req, res) => {
        console.log("Getting client list for maker from REST");
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
            res.send(await makerService.getClientListForMakerId(req.body.id).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
    },


    /**
     * ENDPOINT: /api/getMyClients
     * Retrieves clients for the requesting maker.
     * Looks for values in the body in the form:
     * {
     *     "token":requester's token,
     *     "auth": valid authentication
     * }
     * and returns data in the form:
     *  [
     *      customer object,
     *      customer object,...
     *  ]
     * @returns {Promise<maker>}
     */
    getMyClients: async (req, res) => {
        console.log("Getting client list for maker from REST");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["token"],
                "positiveIntegerOnly": [],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let email = await authService.getEmailFromToken(req.body.token).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            });
            let makerId = await makerService.getMakerIdByEmail(email).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            });
            res.send(await makerService.getClientListForMakerId(makerId).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
    },

    /**
     * ENDPOINT: /api/getMyTimeSheetsMaker
     * Retrieves timesheets for the requesting maker. Looks for data in the body in the
     * form:
     * {
     *     "token": requester's google token,
     *     "auth": valid authentication
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getMyTimeSheets: async (req, res) => {
        console.log(`Maker with token...\n${req.body.token}\n...is requesting their timesheets from REST`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["token"],
                "positiveIntegerOnly": [],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let email = await authService.getEmailFromToken(req.body.token).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            });
            let id = await makerService.getMakerIdByEmail(email).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            });
            res.send(await makerService.getSheetsByMaker(id).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
    },

    /**
     * ENDPOINT: /api/getMyCurrentTimeSheet
     * Retrieves the online timesheet for the requesting maker. Looks for data in the body in the
     * form:
     * {
     *     "token": requester's google token,
     *     "auth": valid authentication
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getMyCurrentTimeSheet: async (req, res) => {
        console.log(`Maker with token...\n${req.body.token}\n...is requesting their current/online timesheet from REST`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["token"],
                "positiveIntegerOnly": [],
                "noSpaces": [],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let email = await authService.getEmailFromToken(req.body.token).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            });
            let id = await makerService.getMakerIdByEmail(email).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            });
            res.send(await timeSheetService.getOnlineSheets(id).catch(err => {
                console.log(err);
                notifyAdmin(err.toString());
            }));
        }
    },

    /**
     * ENDPOINT: /api/createMaker
     * Creates a new maker and sends an updated object to the requester.
     * Looks for values in the body in the form:
     * {
     *     "firstName": maker's first name,
     *     "lastName": maker's last name,
     *     "unique" : identifying descriptor for maker,
     *     "email": maker's email,
     *     "auth": authentication credentials; either master or token
     * }
     * and returns values in the form:
     * {
     *     "id": maker's new database id,
     *     "firstName": maker's first name,
     *     "lastName": maker's last name,
     *     "unique" : identifying descriptor for maker,
     *     "email": maker's email
     * }
     * @returns {Promise<maker>}
     */
    createMaker: async (req, res) => {
        console.log("Attempting to create a maker from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["firstName", "lastName"],
                "positiveIntegerOnly": [],
                "noSpaces": ["email"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let newMaker = await makerService.createNewMaker(req.body.firstName, req.body.lastName,
                req.body.email, req.body.unique)
                .catch(err => {
                    console.log(err);
                    notifyAdmin(err.toString());
                });
            res.send(newMaker);
        }
    },

    /**
     * ENDPOINT: /api/updateMaker
     * Updates an existing maker with new values. Looks for data in the body in the form:
     * {
     *     "id": maker's database id,
     *     "firstName": maker's new first name,
     *     "lastName": maker's new last name,
     *     "unique" : identifying descriptor for maker,
     *     "email": maker's new email,
     *     "auth": authentication credentials; either master or token
     * }
     * and returns data in the form:
     * {
     *     "id": maker's database id,
     *     "firstName": maker's new first name,
     *     "lastName": maker's new last name,
     *     "unique" : identifying descriptor for maker,
     *     "email": maker's new email
     * }
     * @returns {Promise<maker>}
     */
    updateMaker: async (req, res) => {
        console.log("Attempting to update a maker from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["firstName", "lastName"],
                "positiveIntegerOnly": ["id"],
                "noSpaces": ["email"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            notifyAdmin({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let maker = await makerService.updateMaker(req.body.id, req.body.firstName,
                req.body.lastName, req.body.email, req.body.unique)
                .catch(err => {
                    console.log(err);
                    notifyAdmin(err.toString());
                });
            res.send(maker);
        }
    },

    /**
     * ENDPOINT: api/deleteMaker
     * deletes a maker from the database. Note that sheets are not deleted. Should
     * only be used to delete erroneous data. Looks for values in the body in the form:
     * {
     *     "id": id of maker to be deleted,
     *     "auth": authentication credentials; either master or token
     * }
     *
     */
    deleteMaker: async (req, res) => {
        console.log("Attempting to delete a maker from REST: ");
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
            makerService.deleteMaker(req.body.id);
            res.send({});
        }
    }
};