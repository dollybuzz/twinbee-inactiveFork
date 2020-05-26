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
const as = require('./services/authService.js')

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
    authController.authorizeAdmin,
    authController.authorizeMaker,
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
app.post("/api/getSubscriptionsByClient",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    chargebeeRestController.getSubscriptionsByClient);
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
    authController.authorizeMaker,
    authController.authorizeMaster,
    timeClockRestController.clockIn);
app.post("/api/clockOut",
    authController.authorizeAdmin,
    authController.authorizeMaker,
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
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaker,
    authController.authorizeMaster,
    makerRestController.getClientsForMaker);
app.post("/api/getMakerIdByToken",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaker,
    authController.authorizeMaster,
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
    authController.authorizeMaker,
    authController.authorizeMaster,
    relationshipRestController.getRelationshipsByMakerId);
app.post("/api/getRelationshipsByClientId",
    authController.authorizeAdmin,
    authController.authorizeClient,
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
    authController.authorizeClient,
    authController.authorizeMaster,
    clientRestController.getClientPayInvoicesPage);
app.post("/api/tokenToEmail",
    authController.tokenToEmail);
app.post("/api/getClientName",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaker,
    authController.authorizeMaster,
    clientRestController.getClientName);
app.post("/api/subscriptionRenewed",
    clientRestController.subscriptionRenewed);

(async function() {
    console.log(await as.accessorIsAdmin('eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk2MGE3ZThlODM0MWVkNzUyZjEyYjE4NmZhMTI5NzMxZmUwYjA0YzAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNzYwMzQwOTE0MDc3LXBocGowc21raG9mc3BvMm52aDZvN2c0MGhxdnNicGhjLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNzYwMzQwOTE0MDc3LXBocGowc21raG9mc3BvMm52aDZvN2c0MGhxdnNicGhjLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE0NDg4NTIzMTQ3MjIzMzc3MTU1IiwiaGQiOiJjc3VtYi5lZHUiLCJlbWFpbCI6ImdyZWJyb3duQGNzdW1iLmVkdSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoidmt3alpwUVNnU00tTWtNcWVkNUtRdyIsIm5hbWUiOiJHcmVnb3J5IEJyb3duIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hLS9BT2gxNEdqbC1TdXVhbFJNX2owYzJEdmZvY3pTVVcwZFVQdTFKbURkVnp0dT1zOTYtYyIsImdpdmVuX25hbWUiOiJHcmVnb3J5IiwiZmFtaWx5X25hbWUiOiJCcm93biIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNTkwNDU5NTM5LCJleHAiOjE1OTA0NjMxMzksImp0aSI6IjJjMGQ5MDJjNTA3NmJlNDEwNDE0NTM4MTA5YzBkMGRjN2QyZGJlNjcifQ.BVkbcaf5uDD3PSLBDTxSH72lz9cOFX97-z40lAad0dsGQhJckn8MSnFqR8Qzb19g7r75HlMHXNBc6RGEFPIEloqsLBjFMPKZbrUGsyPr5l6__fqXjO-v-asXndFN9GQri6ky2q2AYerk6bZ9xqHT47AT_iwApvAhmT1y73Hpreee8lPZNo8a7YSQEPvrZ_uhQNxJ78f_49k7k3mikDX-CINXgSdJa7fyhXSmJN20mk0dJWOVEBmER0kySKZMVhcfsLAGnrFxPY-JRihylqhdwKg_zkuNlcziKZHA-ia6PuZdAUC33mlIcMGjPvmfvv533ZSHQeXw6ImI2o0InTd8Ew'))
})();

app.listen(app.get('port'), app.get('ip'),()=>{console.log(`Express Server is Running at ${app.get('ip')} on port ${app.get('port')}`);});
