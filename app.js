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
    authController.authorizeAdmin,
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
    timeSheetRestController.getTimeSheetsByClientId);
app.post("/api/getTimeSheetsByMakerId",
    authController.authorizeMaster,
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
app.post("/api/deleteTimeSheet",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    timeSheetRestController.deleteTimeSheet);
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
    chargebeeRestController.getSubscriptionsByClient);
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
    chargebeeRestController.updateSubscription);
app.post("/api/cancelSubscription",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    chargebeeRestController.cancelSubscription);
app.post("/api/retrieveSubscription",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    chargebeeRestController.retrieveSubscription);
app.post("/api/clockIn",
    authController.authorizeMaster,
    authController.authorizeAdmin,
    authController.authorizeMaker,
    timeClockRestController.clockIn);
app.post("/api/clockOut",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeMaker,
    timeClockRestController.clockOut);
app.post("/api/creditNow",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeClient,
    chargebeeRestController.chargeCustomerNow);
app.post("/api/getMakersForClient",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeClient,
    clientRestController.getMakersForClient);
app.post("/api/getUpdatePaymentURL",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeClient,
    clientRestController.getUpdatePaymentPage);
app.post("/api/getTimeSheet",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.getTimeSheet);
app.post("/api/getClientByToken",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeClient,
    clientRestController.getClientByToken);
app.post("/api/getClientsForMaker",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeClient,
    makerRestController.getClientsForMaker);
app.post("/api/getMakerIdByToken",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeClient,
    makerRestController.getMakerIdByToken);
app.post("/api/getAllTimeBuckets",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.getAllTimeBuckets);
app.post("/api/getTimeBucketByClientId",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    clientRestController.getTimeBucketByClientId);
app.post("/api/getAllRelationships",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    relationshipRestController.getAllRelationships);
app.post("/api/createRelationship",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    relationshipRestController.createRelationship);
app.post("/api/getRelationshipsByMakerId",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    relationshipRestController.getRelationshipsByMakerId);
app.post("/api/getRelationshipsByClientId",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    relationshipRestController.getRelationshipsByClientId);
app.post("/api/getRelationshipById",
    authController.authorizeAdmin,
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
app.post("/api/getClientPayInvoicesPage",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeClient,
    clientRestController.getClientPayInvoicesPage);
app.post("/api/tokenToEmail",
    authController.tokenToEmail);
app.post("/api/getClientName",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    authController.authorizeClient,
    authController.authorizeMaker,
    clientRestController.getClientName);
app.post("/api/subscriptionRenewed",
    clientRestController.subscriptionRenewed);

(async function() {
})();

app.listen(app.get('port'), app.get('ip'),()=>{console.log(`Express Server is Running at ${app.get('ip')} on port ${app.get('port')}`);});
