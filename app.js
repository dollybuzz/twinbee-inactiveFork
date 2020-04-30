/*
Authors: Dalia Faria, Greg Brown

 */
const express = require("express");
const landingPageController = require('./controllers/landingPageController.js');
const adminPageController = require('./controllers/adminPageController.js');
const clientPageController = require('./controllers/clientPageController.js');
const makerPageController = require('./controllers/makerPageController.js');
const app = express();
const bodyParser = require('body-parser');
const chargebee = require('chargebee');
const timeSheetRepo = require('./repositories/timeSheetRepo.js');
const clientRepo = require('./repositories/clientRepo.js');

(async function() {
    // throw anything you want to "just run" in here. We'll remove this for the production build
    //e.g., the below
})();

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
app.post("/api/login", adminPageController.temporaryNavigateFunction);
app.post("/api/getAllClients", adminPageController.getAllClients);
app.post("/api/getAllMakers", adminPageController.getAllMakers);
app.post("/api/getAllTimesheets", adminPageController.getAllTimesheets);

app.listen(app.get('port'), app.get('ip'),()=>{console.log(`Express Server is Running at ${app.get('ip')} on port ${app.get('port')}`);});
