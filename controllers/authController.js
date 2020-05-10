const {OAuth2Client} = require('google-auth-library');
const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);
const util = require('util');
const request = util.promisify(require('request'));
const authService = require('../services/authService.js');
const adminPageController = require('./adminPageController.js');
const makerPageController = require('./makerPageController');
const clientPageController = require('./clientPageController.js');
const landingPageController = require('../controllers.js');


module.exports = {
    authorizeClient: async (req, res, next) =>{
        console.log("Attempting to authorize client...");
      if (req.isOk || await authService.accessorIsClient()){
          req.isOk = true;
          next();
      }
      else{
          res.send('nope');
          //TODO: res.render(accessNotAllowed)
      }
    },
    authorizeMaker: async(req, res, next) =>{
        console.log("Attempting to authorize maker...");
        if (req.isOk || await authService.accessorIsMaker(req.body.auth)) {
            req.isOk = true;
            next();
        }
        else{
            res.send('nope');
            //TODO: res.render(accessNotAllowed)
        }
    },

    authorizeAdmin: async(req, res, next) =>{
        console.log("Attempting to authorize admin...");
        if (req.isOk || authService.accessorIsAdmin(req.body.auth)) {
            req.isOk = true;
            next();
        }
        else{
            res.send('nope');
            //TODO: res.render(accessNotAllowed)
        }
    },
    authorizeMaster: async(req, res, next) =>{
        console.log("Attempting to authorize Master...");
        if (req.isOk || authService.accessorIsMaster(req.body.auth)) {
            req.isOk = true;
            next();
        }
        else{
            res.send('nope');
            //TODO: res.render(accessNotAllowed)
        }
    },
    authorizeSelfService: async(req, res, next)=>{
        console.log("Attempting to authorize self service...");

        throw new Error("Not yet implemented");

        if (req.isOk /* || updated == updater */) {
            req.isOk = true;
            next();
        }
        else{
            res.send('nope');
            //TODO: res.render(accessNotAllowed)
        }
    },

    loginNavigation: (req, res)=>{
        let userToken = req.query.token;
        if (authService.accessorIsAdmin(userToken)){
            adminPageController.renderLanding(req, res);
        }
        else if (authService.accessorIsMaker(userToken)){
            makerPageController.renderLanding(req, res);
        }
        else if (authService.accessorIsClient()){
            clientPageController.renderLanding(req, res);
        }
        else{
            landingPageController.renderLanding(req, res);
        }
    }
};

