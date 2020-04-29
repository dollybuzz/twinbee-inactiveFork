/*
Authors: Dalia Faria, Greg Brown

 */
const express = require("express");
const landingPageController = require('./controllers/landingPageController.js');
const app = express();
const bodyParser = require('body-parser');
const chargebee = require('chargebee');
const timeSheetRepo = require('./repositories/timeSheetRepo.js');
const clientRepo = require('./repositories/clientRepo.js');

(async function() {
console.log(await clientRepo.getClientNameById(1));
})();

app.set('view engine', 'ejs');
app.set('port',  process.env.PORT || "8080");
app.set('ip',  process.env.IP || "0.0.0.0");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.get("/", landingPageController.renderLanding);

app.listen(app.get('port'), app.get('ip'),()=>{console.log(`Express Server is Running at ${app.get('ip')} on port ${app.get('port')}`);});
