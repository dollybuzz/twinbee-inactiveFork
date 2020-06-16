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
const relationshipRestController = require('./controllers/relationshipRestController.js');
const chargebeeRestController = require('./controllers/chargebeeRestController.js');
const authController = require('./controllers/authController.js');
const app = express();
const bodyParser = require('body-parser');
const makerService = require('./services/MakerService.js');
const es = require('./services/emailService.js');
const mr = require('./repositories/makerRepo.js');
const cs = require('./services/ClientService.js');
const chargebeeservice = require('./services/chargebeeService.js')
require('moment')().format('YYYY-MM-DD HH:mm:ss');
var chargebee = require("chargebee");
chargebee.configure({site : "freedom-makers-test",
    api_key : "test_uRyjE5xojHVh9DYAI0pjJbv2TS3LPYfV"});
app.set('view engine', 'ejs');
app.set('port',  process.env.PORT || "8080");
app.set('ip',  process.env.IP || "0.0.0.0");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//page routes (including to-be-removed dev routes)
app.get("/googlee47aeec58d0a4570.html", (req, res) => {res.render("googlee47aeec58d0a4570");});
app.get("/", landingPageController.renderLanding);
app.get("/home", landingPageController.renderLanding);
app.get("/landing", landingPageController.renderLanding);
app.get("/admin", adminPageController.renderLanding);
app.get("/administrator", adminPageController.renderLanding);
app.get("/client", clientPageController.renderLanding);
app.get("/freedom-maker", makerPageController.renderLanding);
app.get("/forbidden", landingPageController.renderForbidden);

//api routes
app.get("/login",
    authController.loginNavigation);
app.post("/api/getAllClients",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    clientRestController.getAllClients);
app.post("/api/getAllMakers",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    makerRestController.getAllMakers);
app.post("/api/getClient",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    clientRestController.getClientById);
app.post("/api/createClient",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    clientRestController.createClient);
app.post("/api/deleteClient",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    clientRestController.deleteClient);
app.post("/api/updateClientContact",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    clientRestController.updateClientContact);
app.post("/api/updateClientBilling",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    clientRestController.updateClientBilling);
app.post("/api/updateClientMetadata",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    clientRestController.updateClientMetadata);
app.post("/api/updateClientTimeBucket",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    clientRestController.updateClientTimeBucket);
app.post("/api/getMaker",
    authController.authorizeMaster,
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeClient,
    makerRestController.getMakerById);
app.post("/api/createMaker",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    makerRestController.createMaker);
app.post("/api/updateMaker",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    makerRestController.updateMaker);
app.post("/api/deleteMaker",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    makerRestController.deleteMaker);
app.post("/api/getTimeSheetsByClientId",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    authController.authorizeClient,
    timeSheetRestController.getTimeSheetsByClientId);
app.post("/api/getTimeSheetsByMakerId",
    authController.authorizeMaster,
    authController.authorizeMaker,
    authController.authorizeAdmin,
    timeSheetRestController.getTimeSheetsByMakerId);
app.post("/api/getAllTimeSheets",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    timeSheetRestController.getAllTimeSheets);
app.post("/api/updateTimeSheet",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    timeSheetRestController.updateTimeSheetsById);
app.post("/api/clearTimeSheet",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    timeSheetRestController.clearTimeSheet);
app.post("/api/createTimeSheet",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    timeSheetRestController.createTimeSheet);
app.post("/api/getOnlineMakers",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    makerRestController.getOnlineMakers);
app.post("/api/getAllPlans",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    chargebeeRestController.getAllPlans);
app.post("/api/createPlan",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    chargebeeRestController.createPlan);
app.post("/api/updatePlan",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    chargebeeRestController.updatePlan);
app.post("/api/getSubscriptionsByClient",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    authController.clientMatchesSubscription,
    chargebeeRestController.getSubscriptionsByClient);
app.post("/api/retrieveSubscriptionChanges",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    authController.authorizeClient,
    chargebeeRestController.retrieveSubscriptionChanges);
app.post("/api/undoSubscriptionChanges",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    authController.authorizeClient,
    chargebeeRestController.undoSubscriptionChanges);
app.post("/api/deletePlan",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    chargebeeRestController.deletePlan);
app.post("/api/retrievePlan",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    chargebeeRestController.retrievePlan);
app.post("/api/getAllSubscriptions",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    chargebeeRestController.getAllSubscriptions);
app.post("/api/createSubscription",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    chargebeeRestController.createSubscription);
app.post("/api/updateSubscription",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    authController.authorizeClient,
    chargebeeRestController.updateSubscription);
app.post("/api/cancelSubscription",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    chargebeeRestController.cancelSubscription);
app.post("/api/retrieveSubscription",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    authController.authorizeClient,
    chargebeeRestController.retrieveSubscription);
app.post("/api/clockIn",
    authController.authorizeMaster,
    authController.authorizeMaker,
    authController.authorizeAdmin,
    timeClockRestController.clockIn);
app.post("/api/clockOut",
    authController.authorizeMaster,
    authController.authorizeMaker,
    authController.authorizeAdmin,
    timeClockRestController.clockOut);
app.post("/api/creditNow",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    authController.authorizeClient,
    chargebeeRestController.chargeCustomerNow);
app.post("/api/getMakersForClient",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    authController.authorizeClient,
    clientRestController.getMakersForClient);
app.post("/api/getUpdatePaymentURL",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    authController.authorizeClient,
    clientRestController.getUpdatePaymentPage);
app.post("/api/getTimeSheet",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    timeSheetRestController.getTimeSheet);
app.post("/api/getClientByToken",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    authController.authorizeClient,
    clientRestController.getClientByToken);
app.post("/api/getClientsForMaker",
    authController.authorizeMaster,
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeClient,
    makerRestController.getClientsForMaker);
app.post("/api/getMakerIdByToken",
    authController.authorizeMaster,
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeClient,
    makerRestController.getMakerIdByToken);
app.post("/api/getAllTimeBuckets",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    clientRestController.getAllTimeBuckets);
app.post("/api/getTimeBucketsByClientId",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    authController.authorizeClient,
    clientRestController.getTimeBucketsByClientId);
app.post("/api/getAllRelationships",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    relationshipRestController.getAllRelationships);
app.post("/api/createRelationship",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    relationshipRestController.createRelationship);
app.post("/api/getRelationshipsByMakerId",
    authController.authorizeMaster,
    authController.authorizeMaker,
    authController.authorizeAdmin,
    relationshipRestController.getRelationshipsByMakerId);
app.post("/api/getRelationshipsByClientId",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    authController.authorizeClient,
    relationshipRestController.getRelationshipsByClientId);
app.post("/api/getRelationshipById",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    authController.authorizeMaker,
    relationshipRestController.getRelationshipById);
app.post("/api/deleteRelationship",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    relationshipRestController.deleteRelationship);
app.post("/api/updateRelationship",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    relationshipRestController.updateRelationship);
app.post("/api/deleteBucket",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    clientRestController.deleteClientTimeBucket);
app.post("/api/getClientPayInvoicesPage",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    authController.authorizeClient,
    clientRestController.getClientPayInvoicesPage);
app.post("/api/tokenToEmail",
    authController.tokenToEmail);
app.post("/api/getClientName",
    authController.authorizeMaster,
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeClient,
    clientRestController.getClientName);
app.post("/api/clientWebHookHit",
    clientRestController.webHookHit);
app.post("/api/tokenToEmail",
    authController.authorizeMaster,
    authController.tokenToEmail);
app.post("/api/getTimeBucket",
    authController.authorizeMaster,
    authController.authorizeClient,
    authController.authorizeMaker,
    authController.authorizeAdmin,
    clientRestController.getTimeBucket);

app.post("/api/getMyTimeSheetsMaker",
    authController.authorizeMaker,
    makerRestController.getMyTimeSheets);
app.post("/api/getMyRelationshipBucket",
    authController.authorizeMaker,
    makerRestController.getMyRelationshipBucket);
app.post("/api/getMyRelationship",
    authController.authorizeMaker,
    makerRestController.getMyRelationship);
app.post("/api/getAllMyRelationshipsMaker",
    authController.authorizeMaker,
    makerRestController.getAllMyRelationships);
app.post("/api/getMyClients",
    authController.authorizeMaker,
    makerRestController.getMyClients);

app.post("/api/getAllMyRelationshipsClient",
    authController.authorizeClient,
    clientRestController.getAllMyRelationships);
app.post("/api/getMyTimeSheetsClient",
    authController.authorizeClient,
    clientRestController.getMyTimeSheets);
app.post("/api/getMySubscriptions",
    authController.authorizeClient,
    clientRestController.getMySubscriptions);
app.post("/api/getMySubscriptionChanges",
    authController.authorizeClient,
    clientRestController.getMySubscriptionChanges);
app.post("/api/undoMySubscriptionChanges",
    authController.authorizeClient,
    clientRestController.undoMySubscriptionChanges);
app.post("/api/retrieveMySubscription",
    authController.authorizeClient,
    clientRestController.retrieveMySubscription);
app.post("/api/getMyPayInvoicesPage",
    authController.authorizeClient,
    clientRestController.getMyPayInvoicesPage);
app.post("/api/chargeMeNow",
    authController.authorizeClient,
    clientRestController.chargeMeNow);
app.post("/api/getMyUpdatePaymentPage",
    authController.authorizeClient,
    clientRestController.getMyUpdatePaymentPage);
app.post("/api/getMyTimeBucket",
    authController.authorizeClient,
    clientRestController.getMyTimeBucket);
app.post("/api/updateMySubscription",
    authController.authorizeClient,
    clientRestController.updateMySubscription);
app.post("/api/getMyMakers",
    authController.authorizeClient,
    clientRestController.getMyMakers);
app.post("/api/getAllMyTimeBuckets",
    authController.authorizeClient,
    clientRestController.getAllMyTimeBuckets);

app.get("/api/getEnvironment",
    (req, res)=>{res.send(process.env.TWINBEE_ENVIRONMENT_FLAG === 'test')});

(async function() {
    console.log((await chargebeeservice.getAllSubscriptions()).length);
})();

app.listen(app.get('port'), app.get('ip'),()=>{console.log(`Express Server is Running at ${app.get('ip')} on port ${app.get('port')}`);});
