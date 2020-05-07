/*
Authors: Dalia Faria, Greg Brown

 */
const express = require("express");
const landingPageController = require('./controllers/landingPageController.js');
const adminPageController = require('./controllers/adminPageController.js');
const clientPageController = require('./controllers/clientPageController.js');
const makerPageController = require('./controllers/makerPageController.js');
const clientRestController = require('./controllers/clientRestController.js');
const makerRestController = require('./controllers/makerRestController.js');
const timeSheetRestController = require('./controllers/timeSheetRestController.js');
const chargebeeRestController = require('./controllers/chargebeeRestController.js');
const app = express();
const bodyParser = require('body-parser');
const chargebee = require('chargebee');

require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const request = require('request');


app.set('view engine', 'ejs');
app.set('port',  process.env.PORT || "8080");
app.set('ip',  process.env.IP || "0.0.0.0");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.get("/", landingPageController.renderLanding);
app.get("/home", landingPageController.renderLanding);
app.get("/landing", landingPageController.renderLanding);
app.get("/admin", adminPageController.renderLanding);
app.get("/administrator", adminPageController.renderLanding);
app.get("/client", clientPageController.renderLanding);
app.get("/maker", makerPageController.renderLanding);
app.post("/api/login", landingPageController.temporaryNavigateFunction);
app.get("/api/getAllClients", clientRestController.getAllClients);
app.get("/api/getAllMakers", makerRestController.getAllMakers);
app.get("/api/getAllTimeSheets", timeSheetRestController.getAllTimeSheets);
app.get("/api/getClient", clientRestController.getClientById);
app.post("/api/createClient", clientRestController.createClient);
app.post("/api/deleteClient", clientRestController.deleteClient);
app.get("/api/getMaker", makerRestController.getMakerById);
app.post("/api/createMaker", makerRestController.createMaker);
app.post("/api/updateMaker", makerRestController.updateMaker);
app.post("/api/deleteMaker", makerRestController.deleteMaker);
app.get("/api/getTimeSheetsByClientId", timeSheetRestController.getTimeSheetsByClientId);
app.get("/api/getTimeSheetsByMakerId", timeSheetRestController.getTimeSheetsByMakerId);
app.get("/api/getAllTimeSheets", timeSheetRestController.getAllTimeSheets);
app.post("/api/updateTimeSheet", timeSheetRestController.updateTimeSheetsById);
app.post("/api/deleteTimeSheet", timeSheetRestController.deleteTimeSheet);
app.post("/api/createTimeSheet", timeSheetRestController.createTimeSheet);
app.get("/api/getOnlineMakers", makerRestController.getOnlineMakers);
app.get("/api/getAllPlans", chargebeeRestController.getAllPlans);
app.post("/api/createPlan", chargebeeRestController.createPlan);
app.post("/api/updatePlan", chargebeeRestController.updatePlan);
app.post("/api/deletePlan", chargebeeRestController.deletePlan);
app.get("/api/retrievePlan", chargebeeRestController.retrievePlan);
app.get("/api/getAllSubscriptions", chargebeeRestController.getAllSubscriptions);
app.post("/api/createSubscription", chargebeeRestController.createSubscription);
app.post("/api/updateSubscription", chargebeeRestController.updateSubscription);
app.post("/api/cancelSubscription", chargebeeRestController.cancelSubscription);
app.get("/api/retrieveSubscription", chargebeeRestController.retrieveSubscription);

(async function() {
})();

app.listen(app.get('port'), app.get('ip'),()=>{console.log(`Express Server is Running at ${app.get('ip')} on port ${app.get('port')}`);});
