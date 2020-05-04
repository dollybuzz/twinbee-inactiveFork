const makerService = require('../services/makerService.js');

module.exports ={
    getOnlineMakers: async (req, res) => {
        let onliners = await makerService.getOnlineMakers();
        res.send(onliners);
    },

    getAllMakers: async (req, res) => {
    //    console.log(req);
        let makers = await makerService.getAllMakers();
        res.send(makers);
    },

    getMakerById: async (req, res)=>{
    //    console.log(req)
        let id = req.query.id;
        let maker = await makerService.getMakerById(id);

        if(maker.id == id)
        {
            let maker = await makerService.createMaker(maker.id, maker.firstName, maker.lastName, maker.email,
                maker.chargebeeObj, maker.clients);
            res.send(maker);
        }
    }
}