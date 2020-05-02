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
app.post("/api/login", adminPageController.temporaryNavigateFunction);
app.get("/api/getAllClients", clientRestController.getAllClients);
app.post("/api/getAllMakers", makerRestController.getAllMakers);
app.post("/api/getAllTimeSheets", timeSheetRestController.getAllTimeSheets);
app.get("/api/getClient", clientRestController.getClientById);
app.get("/api/createClient", clientRestController.createClient);
app.get("/api/getMaker", makerRestController.getMakerById);
app.get("/api/getTimeSheetByClientId", timeSheetRestController.getTimeSheetByClientId);
app.get("/api/getTimeSheetByMakerId", timeSheetRestController.getTimeSheetByMakerId);

(async function() {
    chargebee.configure({site : "freedom-makers-test",
        api_key : "test_uRyjE5xojHVh9DYAI0pjJbv2TS3LPYfV"});

    chargebee.customer.list({
    }).request(function(error,result) {
        if(error){
            //handle error
            console.log(error);
        }else{
            for(var i = 0; i < result.list.length;i++){
                var entry=result.list[i]
                console.log(entry);
                var customer = entry.customer;
                var card = entry.card;
            }
        }
    });


})();

app.listen(app.get('port'), app.get('ip'),()=>{console.log(`Express Server is Running at ${app.get('ip')} on port ${app.get('port')}`);});
