const makerService = require('../services/makerService.js');

module.exports ={
    /**
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
     * @returns {Promise<[{},...]>}
     */
    getOnlineMakers: async (req, res) => {
        let onliners = await makerService.getOnlineMakers().catch(err=>{console.log(err)});
        res.send(onliners);
    },

    /**
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
     * @returns {Promise<[{},...]>}
     */
    getAllMakers: async (req, res) => {
        let makers = await makerService.getAllMakers().catch(err=>{console.log(err)});
        res.send(makers);
    },

    /**
     * Retrieves a maker by their database id. Looks for data in the query in the form:
     * {
     *     "id": maker's database id
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
     * Creates a new maker and sends an updated object to the requester.
     * Looks for values in the body in the form:
     * {
     *     "firstName": maker's first name,
     *     "lastName": maker's last name,
     *     "email": maker's email
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
        let newMaker = await makerService.createNewMaker(req.body.firstName, req.body.lastName, req.body.email)
            .catch(err=>{console.log(err)});
        return newMaker;
    },

    /**
     * Updates an existing maker with new values. Looks for data in the body in the form:
     * {
     *     "id": maker's database id,
     *     "firstName": maker's new first name,
     *     "lastName": maker's new last name,
     *     "email": maker's new email
     * }
     * and returns data in the form:
     * {
     *     "id": maker's database id,
     *     "firstName": maker's new first name,
     *     "lastName": maker's new last name,
     *     "email": maker's new email
     * }
     * @returns {Promise<void>}
     */
    updateMaker: async (req, res) =>{

    },
    deleteMaker: async (req, res) =>{

    }
}