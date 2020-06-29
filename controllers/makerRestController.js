const makerService = require('../services/MakerService.js');
const authService = require('../services/authService.js');

module.exports ={

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
        let onliners = await makerService.getOnlineMakers().catch(err=>{console.log(err)});
        res.send(onliners);
    },

    /**
     * ENDPOINT: /api/getMyRelationshipBucket
     * Retrieves the bucket minutes for the bucket associated with
     * the given relationship. Looks for values in the body in the form:
     * {
     *     "token": requester's token,
     *     "relationshipId"1: id of the relationship with the desired plan
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getMyRelationshipBucket: async (req, res) => {
        console.log(`Attempting to get time bucket for relationship ${req.body.relationshipId} from REST`);
        console.log(req.body);
        let email = await authService.getEmailFromToken(req.body.token);
        let id = await makerService.getMakerIdByEmail(email);
        res.send(await makerService.getMyRelationshipBucket(id, req.body.relationshipId));
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
    getAllMyRelationships: async (req, res) =>{
      console.log(`Attempting to get all relationships for maker with token...\n${req.body.token}\n... from REST`);
      console.log(req.body);
      let email = await authService.getEmailFromToken(req.body.token);
      let id = await  makerService.getMakerIdByEmail(email);
          res.send(await makerService.getRelationshipsForMaker(id));
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
    getMyRelationship: async (req, res) =>{
        console.log(`Attempting to get "my" relationship for maker` +
            ` with token...\n${req.body.token}\n...with relationship id ${req.body.relationshipId} from REST`);
        console.log(req.body);
        let email = await authService.getEmailFromToken(req.body.token);
        let id = await makerService.getMakerIdByEmail(email);
        res.send(await makerService.getMyRelationship(id, req.body.relationshipId));
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
        let makers = await makerService.getAllMakers().catch(err=>{console.log(err)});
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
    getMakerById: async (req, res)=>{
        console.log("Attempting to get maker by ID from REST: ");
        console.log(req.body);
        let id = req.body.id;
        let result = await makerService.getMakerById(id).catch(err=>{console.log(err)});

        res.send(result);
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
    getMakerIdByToken: async (req, res)=>{
        console.log("Attempting to get maker by ID from REST: ");
        console.log(req.body);
        let email = await authService.getEmailFromToken(req.body.token);
        let result = await makerService.getMakerIdByEmail(email).catch(err=>{console.log(err)});
        res.send({id:result.toString()});
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
    getClientsForMaker: async (req, res) =>{
        console.log("Getting client list for maker from REST");
        console.log(req.body);
        res.send(await makerService.getClientListForMakerId(req.body.id));
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
    getMyClients: async (req, res) =>{
        console.log("Getting client list for maker from REST");
        console.log(req.body);
        let email = await authService.getEmailFromToken(req.body.token);
        let makerId = await makerService.getMakerIdByEmail(email);
        res.send(await makerService.getClientListForMakerId(makerId));
    },

    /**
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
    getMyTimeSheets: async(req, res)=>{
        console.log(`Maker with token...\n${req.body.token}\n...is requesting their timesheets from REST`);
        console.log(req.body);
        let email = await authService.getEmailFromToken(req.body.token);
        let id = await makerService.getMakerIdByEmail(email);
        res.send(await makerService.getSheetsByMaker(id));
    },

    /**
     * ENDPOINT: /api/createMaker
     * Creates a new maker and sends an updated object to the requester.
     * Looks for values in the body in the form:
     * {
     *     "firstName": maker's first name,
     *     "lastName": maker's last name,
     *     "email": maker's email,
     *     "auth": authentication credentials; either master or token
     * }
     * and returns values in the form:
     * {
     *     "id": maker's new database id,
     *     "firstName": maker's first name,
     *     "lastName": maker's last name,
     *     "email": maker's email
     * }
     * @returns {Promise<maker>}
     */
    createMaker: async (req, res) =>{
        console.log("Attempting to create a maker from REST: ");
        console.log(req.body);
        let newMaker = await makerService.createNewMaker(req.body.firstName, req.body.lastName, req.body.email)
            .catch(err=>{console.log(err)});
        res.send(newMaker);
    },

    /**
     * ENDPOINT: /api/updateMaker
     * Updates an existing maker with new values. Looks for data in the body in the form:
     * {
     *     "id": maker's database id,
     *     "firstName": maker's new first name,
     *     "lastName": maker's new last name,
     *     "email": maker's new email,
     *     "auth": authentication credentials; either master or token
     * }
     * and returns data in the form:
     * {
     *     "id": maker's database id,
     *     "firstName": maker's new first name,
     *     "lastName": maker's new last name,
     *     "email": maker's new email
     * }
     * @returns {Promise<maker>}
     */
    updateMaker: async (req, res) =>{
        console.log("Attempting to update a maker from REST: ");
        console.log(req.body);
        let maker = await makerService.updateMaker(req.body.id, req.body.firstName, req.body.lastName, req.body.email)
            .catch(err=>{console.log(err)});
        res.send(maker);
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
    deleteMaker: async (req, res) =>{
        console.log("Attempting to delete a maker from REST: ");
        console.log(req.body);
        makerService.deleteMaker(req.body.id);
        res.send({});
    }
};