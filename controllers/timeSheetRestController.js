const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const timeSheetService = require('../services/timeSheetService.js');

module.exports = {
    getAllTimeSheets: async (req,res) => {
        //console.log(req);
        let timeSheets = await timeSheetRepo.getAllSheets();
        res.send(timeSheets);
    },

    getTimeSheetByClientId: async (req, res) => {
       // console.log(req);
        let id = req.query.id;
        let clientTimeSheet = await timeSheetRepo.getSheetsByClient(id);

        if(clientTimeSheet.id == id) {
            let timeSheet = await timeSheetService.createTimeSheet(clientTimeSheet.id, clientTimeSheet.firstName,
                clientTimeSheet.lastName, clientTimeSheet.email, clientTimeSheet.hourlyRate,
                clientTimeSheet.client, clientTimeSheet.timeIn, clientTimeSheet.timeOut);
            res.send(clientTimeSheet);
        }
    },

    getTimeSheetByMakerId: async (req, res) => {
      //  console.log(req);
        let id = req.query.id;
        let makerTimeSheet = await timeSheetRepo.getSheetsByMaker(id);

        if(makerTimeSheet.id == id) {
            let makerTimeSheet = await timeSheetService.createTimeSheet(makerTimeSheet.id, makerTimeSheet.firstName,
                makerTimeSheet.lastName,makerTimeSheet.email, makerTimeSheet.hourlyRate,
                makerTimeSheet.client, makerTimeSheet.timeIn, makerTimeSheet.timeOut);
            res.send(makerTimeSheet);
        }
    }
}