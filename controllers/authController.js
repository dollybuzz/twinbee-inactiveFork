const {OAuth2Client} = require('google-auth-library');
const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);
const util = require('util');
const request = util.promisify(require('request'));
const authService = require('../services/authService.js');




module.exports = {


    authorizeClient: async (req, res, next) =>{
      if (req.isOk || await authService.accessorIsClient()){
          req.isOk = true;
          next(req, res);
      }
      else{
          res.send('nope');
          //TODO: res.render(accessNotAllowed)
      }
    },
    authorizeMaker: async(req, res, next) =>{
        /*if (req.isOk || await authService.accessorIsMaker(req.body.auth)) {
            req.isOk = true;
            next(req, res);
        }
        else{
            res.send('nope');
            //TODO: res.render(accessNotAllowed)
        }*/
    },

    authorizeAdmin: async(req, res, next) =>{
        if (req.isOk || authService.accessorIsAdmin(req.body.auth)) {
            req.isOk = true;
            next(req, res);
        }
        else{
            res.send('nope');
            //TODO: res.render(accessNotAllowed)
        }
    },
    authorizeMaster: async(req, res, next) =>{
        if (req.isOk || authService.accessorIsMaster(req.body.auth)) {
            req.isOk = true;
            next(req, res);
        }
        else{
            res.send('nope');
            //TODO: res.render(accessNotAllowed)
        }
    },
    authorizeSelfService: async(req, res, next)=>{


        if (req.isOk /* || updated == updater */) {
            req.isOk = true;
            next(req, res);
        }
        else{
            res.send('nope');
            //TODO: res.render(accessNotAllowed)
        }
    },
    authorizeLogin: async (req, res, next) =>{

    }
};

