
const express = require("express");
const controller = require('./controllers/controller.js');
const app = express();
const bodyParser = require('body-parser');
const chargebee = require('chargebee');



app.set('view engine', 'ejs');
app.set('port',  process.env.PORT || "8080");
app.set('ip',  process.env.IP || "0.0.0.0");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get("/", (req, res) => {res.render("home")});

app.listen(app.get('port'), app.get('ip'),()=>{console.log(`Express Server is Running at ${app.get('ip')} on port ${app.get('port')}`);});
