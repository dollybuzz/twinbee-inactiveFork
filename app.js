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
const timeClockRestController = require('./controllers/timeClockRestController.js');
const chargebeeRestController = require('./controllers/chargebeeRestController.js');
const authController = require('./controllers/authController.js');
const app = express();
const bodyParser = require('body-parser');
const chargebee = require('chargebee');

require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const util = require('util')
const request = util.promisify(require('request'));
const ts = require('./services/timeClockService.js');
const timeClockService = require('./services/timeClockService.js');

app.set('view engine', 'ejs');
app.set('port',  process.env.PORT || "8080");
app.set('ip',  process.env.IP || "0.0.0.0");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//page routes (including to-be-removed dev routes)
app.get("/", landingPageController.renderLanding);
app.get("/home", landingPageController.renderLanding);
app.get("/landing", landingPageController.renderLanding);
app.get("/admin", adminPageController.renderLanding);
app.get("/administrator", adminPageController.renderLanding);
app.get("/client", clientPageController.renderLanding);
app.get("/maker", makerPageController.renderLanding);

//api routes
app.post("/api/login",  landingPageController.temporaryNavigateFunction);
app.post("/api/getAllClients",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.getAllClients);
app.post("/api/getAllMakers",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    makerRestController.getAllMakers);
app.post("/api/getClient",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.getClientById);
app.post("/api/createClient",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.createClient);
app.post("/api/deleteClient",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.deleteClient);
app.post("/api/updateClientContact",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeSelfService,
    clientRestController.updateClientContact);
app.post("/api/updateClientBilling",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeSelfService,
    clientRestController.updateClientBilling);
app.post("/api/updateClientMetadata",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.updateClientMetadata);
app.post("/api/updateClientTimeBucket",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.updateClientTimeBucket);
app.post("/api/getMaker",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    makerRestController.getMakerById);
app.post("/api/createMaker",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    makerRestController.createMaker);
app.post("/api/updateMaker",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeSelfService,
    makerRestController.updateMaker);
app.post("/api/deleteMaker",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    makerRestController.deleteMaker);
app.post("/api/getTimeSheetsByClientId",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeSelfService,
    timeSheetRestController.getTimeSheetsByClientId);
app.post("/api/getTimeSheetsByMakerId",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeSelfService,
    timeSheetRestController.getTimeSheetsByMakerId);
app.post("/api/getAllTimeSheets",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.getAllTimeSheets);
app.post("/api/updateTimeSheet",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.updateTimeSheetsById);
app.post("/api/deleteTimeSheet",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.deleteTimeSheet);
app.post("/api/createTimeSheet",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.createTimeSheet);
app.post("/api/getOnlineMakers",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    makerRestController.getOnlineMakers);
app.post("/api/getAllPlans",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.getAllPlans);
app.post("/api/createPlan",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.createPlan);
app.post("/api/updatePlan",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.updatePlan);
app.post("/api/deletePlan",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.deletePlan);
app.post("/api/retrievePlan",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.retrievePlan);
app.post("/api/getAllSubscriptions",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.getAllSubscriptions);
app.post("/api/createSubscription",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.createSubscription);
app.post("/api/updateSubscription",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.updateSubscription);
app.post("/api/cancelSubscription",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.cancelSubscription);
app.post("/api/retrieveSubscription",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.retrieveSubscription);
app.post("/api/clockIn",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeMaker,
    timeClockRestController.clockIn);
app.post("/api/clockOut",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeMaker,
    timeClockRestController.clockOut);


(async function() {
})();

app.listen(app.get('port'), app.get('ip'),()=>{console.log(`Express Server is Running at ${app.get('ip')} on port ${app.get('port')}`);});
