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
    clientRestController.updateClientContact);
app.post("/api/updateClientBilling",
    authController.authorizeAdmin,
    authController.authorizeMaster,
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
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    makerRestController.getMakerById);
app.post("/api/createMaker",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    makerRestController.createMaker);
app.post("/api/updateMaker",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    makerRestController.updateMaker);
app.post("/api/deleteMaker",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    makerRestController.deleteMaker);
app.post("/api/getTimeSheetsByClientId",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    timeSheetRestController.getTimeSheetsByClientId);
app.post("/api/getTimeSheetsByMakerId",
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.getTimeSheetsByMakerId);
app.post("/api/getAllTimeSheets",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.getAllTimeSheets);
app.post("/api/updateTimeSheet",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.updateTimeSheetsById);
app.post("/api/clearTimeSheet",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.clearTimeSheet);
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
app.post("/api/getSubscriptionsByClient",
    authController.authorizeAdmin,
    authController.clientMatchesSubscription,
    authController.authorizeMaster,
    chargebeeRestController.getSubscriptionsByClient);
app.post("/api/retrieveSubscriptionChanges",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    chargebeeRestController.retrieveSubscriptionChanges);
app.post("/api/undoSubscriptionChanges",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    chargebeeRestController.undoSubscriptionChanges);
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
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.createSubscription);
app.post("/api/updateSubscription",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    chargebeeRestController.updateSubscription);
app.post("/api/cancelSubscription",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.cancelSubscription);
app.post("/api/retrieveSubscription",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    chargebeeRestController.retrieveSubscription);
app.post("/api/clockIn",
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeClockRestController.clockIn);
app.post("/api/clockOut",
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeClockRestController.clockOut);
app.post("/api/creditNow",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    chargebeeRestController.chargeCustomerNow);
app.post("/api/getMakersForClient",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    clientRestController.getMakersForClient);
app.post("/api/getUpdatePaymentURL",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    clientRestController.getUpdatePaymentPage);
app.post("/api/getTimeSheet",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.getTimeSheet);
app.post("/api/getClientByToken",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    clientRestController.getClientByToken);
app.post("/api/getClientsForMaker",
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    makerRestController.getClientsForMaker);
app.post("/api/getMakerIdByToken",
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    makerRestController.getMakerIdByToken);
app.post("/api/getAllTimeBuckets",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.getAllTimeBuckets);
app.post("/api/getTimeBucketsByClientId",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    clientRestController.getTimeBucketsByClientId);
app.post("/api/getAllRelationships",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    relationshipRestController.getAllRelationships);
app.post("/api/createRelationship",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    relationshipRestController.createRelationship);
app.post("/api/getRelationshipsByMakerId",
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeMaster,
    relationshipRestController.getRelationshipsByMakerId);
app.post("/api/getRelationshipsByClientId",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    relationshipRestController.getRelationshipsByClientId);
app.post("/api/getRelationshipById",
    authController.authorizeAdmin,
    authController.authorizeMaker,
    authController.authorizeMaster,
    relationshipRestController.getRelationshipById);
app.post("/api/deleteRelationship",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    relationshipRestController.deleteRelationship);
app.post("/api/updateRelationship",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    relationshipRestController.updateRelationship);
app.post("/api/deleteBucket",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.deleteClientTimeBucket);
app.post("/api/getClientPayInvoicesPage",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    clientRestController.getClientPayInvoicesPage);
app.post("/api/tokenToEmail",
    authController.tokenToEmail);
app.post("/api/getClientName",
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    clientRestController.getClientName);
app.post("/api/clientWebHookHit",
    clientRestController.webHookHit);
app.post("/api/tokenToEmail",
    authController.authorizeMaster,
    authController.tokenToEmail);
app.post("/api/getTimeBucket",
    authController.authorizeClient,
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeMaster,
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
    //console.log((await chargebeeservice.getAllSubscriptions()).length);
})();

app.listen(app.get('port'), app.get('ip'),()=>{console.log(`Express Server is Running at ${app.get('ip')} on port ${app.get('port')}`);});
