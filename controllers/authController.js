const {OAuth2Client} = require('google-auth-library');
const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);
const util = require('util');
const request = util.promisify(require('request'));
const authService = require('../services/authService.js');
const adminPageController = require('./adminPageController.js');
const makerPageController = require('./makerPageController');
const clientPageController = require('./clientPageController.js');
const landingPageController = require('./landingPageController.js');
const TEST_ENVIRONMENT = process.env.TWINBEE_ENVIRONMENT_FLAG === 'test';

module.exports = {

    tokenToEmail: async(req, res)=>{
        let token = req.body.token;
        let email = await authService.getEmailFromToken(token);
        res.send(email);
    },

    authorizeClient: TEST_ENVIRONMENT ? (req, res, next)=>{console.log("Test env, skipping auth");next()} : async (req, res, next) =>{
        console.log("Attempting to authorize client...");
      if (req[process.env.TWINBEE_IS_OK] || await authService.accessorIsClient(req.body.auth)){
          req[process.env.TWINBEE_IS_OK] = true;
          next();
      }
      else{
          console.log("Not authorized as client");
          if (next != undefined){
              next()
          }
          else {
              res.send('nope');
          }
          //TODO: res.render(accessNotAllowed)
      }
    },
    authorizeMaker: TEST_ENVIRONMENT ? (req, res, next)=>{console.log("Test env, skipping auth");next()} : async(req, res, next) =>{
        console.log("Attempting to authorize maker...");
        if (req[process.env.TWINBEE_IS_OK]  || await authService.accessorIsMaker(req.body.auth)) {
            req[process.env.TWINBEE_IS_OK]  = true;
            next();
        }
        else{
            console.log("Not authorized as maker");
            if (next != undefined){
                next()
            }
            else {
                res.send('nope');
            }
            //TODO: res.render(accessNotAllowed)
        }
    },

    authorizeAdmin: TEST_ENVIRONMENT ? (req, res, next)=>{console.log("Test env, skipping auth");next()} : async(req, res, next) =>{
        console.log("Attempting to authorize admin...");
        console.log(req.body);
        if (req[process.env.TWINBEE_IS_OK] || await authService.accessorIsAdmin(req.body.auth)) {
            req[process.env.TWINBEE_IS_OK] = true;
            console.log("Passed auth check");
            console.log(authService.accessorIsAdmin(req.body.auth));
            next();
        }
        else{
            console.log("Not authorized as admin");
            if (next != undefined){
                console.log("Checking next auth...");
                next()
            }
            else {
                console.log("All routes failed to authenticate")
                res.send('nope');
            }
            //TODO: res.render(accessNotAllowed)
        }
    },
    authorizeMaster: TEST_ENVIRONMENT ? (req, res, next)=>{console.log("Test env, skipping auth");next()} : async(req, res, next) =>{
        console.log("Attempting to authorize Master...");
        if (req[process.env.TWINBEE_IS_OK]  || await authService.accessorIsMaster(req.body.auth)) {
            req[process.env.TWINBEE_IS_OK]  = true;
            console.log("Passed auth check");
            next();
        }
        else{
            console.log("Not authorized as Master");
                res.send('nope');
            //TODO: res.render(accessNotAllowed)
        }
    },
    authorizeSelfService: TEST_ENVIRONMENT ? (req, res, next)=>{console.log("Test env, skipping auth");next()} : async(req, res, next)=>{
        console.log("Attempting to authorize self service...");

      //  throw new Error("Not yet implemented");

        if (req[process.env.TWINBEE_IS_OK]  /* || updated == updater */) {
            req[process.env.TWINBEE_IS_OK]  = true;
            next(req, res, next);
        }
        else{
            throw new Error("Not yet implemented");
            //TODO: res.render(accessNotAllowed)
        }
    },

    loginNavigation: async (req, res)=>{
        let userToken = req.query.token;
        if (await authService.accessorIsAdmin(userToken)){
            adminPageController.renderLanding(req, res);
        }
        else if (await authService.accessorIsMaker(userToken)){
            makerPageController.renderLanding(req, res);
        }
        else if (await authService.accessorIsClient(userToken)){
            clientPageController.renderLanding(req, res);
        }
        else{
            landingPageController.renderLanding(req, res);
        }
    }
};

