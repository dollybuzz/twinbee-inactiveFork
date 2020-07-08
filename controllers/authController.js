const {OAuth2Client} = require('google-auth-library');
const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);
const util = require('util');
const request = util.promisify(require('request'));
const authService = require('../services/authService.js');
const clientService = require('../services/ClientService.js');
const adminPageController = require('./adminPageController.js');
const makerPageController = require('./makerPageController');
const clientPageController = require('./clientPageController.js');
const landingPageController = require('./landingPageController.js');
const {notifyAdmin} = require("../services/notificationService");
const TEST_ENVIRONMENT = process.env.TWINBEE_ENVIRONMENT_FLAG === 'test';

module.exports = {

    tokenToEmail: async (req, res) => {
        let token = req.body.token;
        let email = await authService.getEmailFromToken(token).catch(error => {
            console.log(error);
            notifyAdmin(error.toString());
        });
        res.send(email);
    },

    clientMatchesSubscription: TEST_ENVIRONMENT ? (req, res, next) => {
        console.log("Test env, skipping auth");
        next()
    } : async (req, res, next) => {
        console.log("Attempting to authorize client on subscription is requester...");
        let email = await authService.getEmailFromToken(req.body.auth).catch(error => {
            console.log(error);
            notifyAdmin(error.toString());
        });
        let client = await clientService.getClientByEmail(email).catch(error => {
            console.log(error);
            notifyAdmin(error.toString());
        });

        let isClient = await authService.accessorIsClient(req.body.auth)
            .catch(error => {
                console.log(error);
                notifyAdmin(error.toString());
            });
        if (req[process.env.TWINBEE_IS_OK] ||
            (isClient && req.body.id === client.id)) {
            req[process.env.TWINBEE_IS_OK] = true;
            console.log(`Match! requester was ${client.id} and suscriber was ${req.body.id}`);
            next();
        } else {
            console.log("Not authorized as client");
            if (next) {
                next()
            } else {
                res.send('nope');
            }
            //TODO: res.render(accessNotAllowed)
        }
    },

    authorizeClient: TEST_ENVIRONMENT ? (req, res, next) => {
        console.log("Test env, skipping auth");
        next()
    } : async (req, res, next) => {
        console.log("Attempting to authorize client...");
        let isMaster = await authService.accessorIsMaster(req.body.auth)
            .catch(error => {
                console.log(error);
                notifyAdmin(error.toString());
            });
        let isClient = await authService.accessorIsClient(req.body.auth)
            .catch(error => {
                console.log(error);
                notifyAdmin(error.toString());
            });
        if (req[process.env.TWINBEE_IS_OK] || isMaster || isClient) {
            req[process.env.TWINBEE_IS_OK] = true;
            next();
        } else {
            console.log("Not authorized as client");
            if (next) {
                next()
            } else {
                res.send('nope');
            }
            //TODO: res.render(accessNotAllowed)
        }
    },
    authorizeMaker: TEST_ENVIRONMENT ? (req, res, next) => {
        console.log("Test env, skipping auth");
        next()
    } : async (req, res, next) => {
        console.log("Attempting to authorize maker...");

        let isMaster = await authService.accessorIsMaster(req.body.auth)
            .catch(error => {
                console.log(error);
                notifyAdmin(error.toString());
            });
        let isMaker = await authService.accessorIsMaker(req.body.auth)
            .catch(error => {
                console.log(error);
                notifyAdmin(error.toString());
            });
        if (req[process.env.TWINBEE_IS_OK] || isMaster || isMaker) {
            req[process.env.TWINBEE_IS_OK] = true;
            next();
        } else {
            console.log("Not authorized as maker");
            if (next) {
                next()
            } else {
                res.send('nope');
            }
        }
    },

    authorizeAdmin: TEST_ENVIRONMENT ? (req, res, next) => {
        console.log("Test env, skipping auth");
        next()
    } : async (req, res, next) => {
        console.log("Attempting to authorize admin...");
        console.log(req.body);
        let isMaster = await authService.accessorIsMaster(req.body.auth)
            .catch(error => {
                console.log(error);
                notifyAdmin(error.toString());
            });
        let isAdmin = await authService.accessorIsAdmin(req.body.auth)
            .catch(error => {
                console.log(error);
                notifyAdmin(error.toString());
            });
        if (req[process.env.TWINBEE_IS_OK] || isMaster || isAdmin) {
            req[process.env.TWINBEE_IS_OK] = true;
            console.log("Passed auth check");
            console.log(authService.accessorIsAdmin(req.body.auth));
            next();
        } else {
            console.log("Not authorized as admin");
            if (next) {
                console.log("Checking next auth...");
                next()
            } else {
                console.log("All routes failed to authenticate");
                res.send('nope');
            }
        }
    },
    authorizeMaster: TEST_ENVIRONMENT ? (req, res, next) => {
        console.log("Test env, skipping auth");
        next()
    } : async (req, res, next) => {
        console.log("Attempting to authorize Master...");
        let isMaster = await authService.accessorIsMaster(req.body.auth)
            .catch(error => {
                console.log(error);
                notifyAdmin(error.toString());
            });
        if (req[process.env.TWINBEE_IS_OK] || isMaster) {
            req[process.env.TWINBEE_IS_OK] = true;
            console.log("Passed auth check");
            next();
        } else {
            console.log("Not authorized as Master");
            res.send('nope');
            //TODO: res.render(accessNotAllowed)
        }
    },
    authorizeSelfService: TEST_ENVIRONMENT ? (req, res, next) => {
        console.log("Test env, skipping auth");
        next()
    } : async (req, res, next) => {
        console.log("Attempting to authorize self service...");

        //  throw new Error("Not yet implemented");

        if (req[process.env.TWINBEE_IS_OK]  /* || updated == updater */) {
            req[process.env.TWINBEE_IS_OK] = true;
            next(req, res, next);
        } else {
            throw new Error("Not yet implemented");
            //TODO: res.render(accessNotAllowed)
        }
    },

    loginNavigation: async (req, res) => {
        let userToken = req.query.token;
        if (await authService.accessorIsAdmin(userToken)) {
            adminPageController.renderLanding(req, res);
        } else if (await authService.accessorIsMaker(userToken)) {
            makerPageController.renderLanding(req, res);
        } else if (await authService.accessorIsClient(userToken)) {
            clientPageController.renderLanding(req, res);
        } else {
            landingPageController.renderForbidden(req, res);
        }
    }
};

