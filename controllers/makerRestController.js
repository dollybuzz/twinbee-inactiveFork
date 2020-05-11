const makerService = require('../services/MakerService.js');

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
        let onliners = await makerService.getOnlineMakers().catch(err=>{console.log(err)});
        res.send(onliners);
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
        let makers = await makerService.getAllMakers().catch(err=>{console.log(err)});
        res.send(makers);
    },

    /**
     * ENDPOINT: /api/getMaker
     * Retrieves a maker by their database id. Looks for data in the query in the form:
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
        let id = req.query.id;
        let result = await makerService.getMakerById(id).catch(err=>{console.log(err)});

        res.send(result);
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
        console.log(req)
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
        let maker = await makerService.updateMaker(req.body.id, req.body.firstName, req.body.lastName, req.body.email)
            .catch(err=>{console.log(err)});
        res.end();
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
        makerService.deleteMaker(req.body.id);
        res.end();
    }
}