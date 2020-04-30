const clientService = require('../services/ClientService.js');
const makerService = require('../services/makerService.js');

module.exports ={
    renderLanding: (req, res)=>{
        let headerImageActual = {
            src: "/img/freedom-makers-logo.png",
            alt: "Freedom Makers Logo"
        };
        let headerLinks = [
            {link: "", text: "Manage Clients", id:"manageClients"},
            {link: "", text: "Manage Makers", id: "manageMakers"},
            {link: "", text: "Review Timesheets", id:"reviewTimesheets"}
        ]
        let footerLinks = [
            {link: "", text: "Manage Clients", id:"manageClients"},
            {link: "", text: "Manage Makers", id: "manageMakers"},
            {link: "", text: "Report a problem", id: "reportProblem"},
        ]

        res.render("admin", {headerImg:headerImageActual, navItemsTop: headerLinks, navItemsBottom: footerLinks});
    },

    temporaryNavigateFunction: (req, res)=>{
        if (req.body.userType == "admin"){
            res.redirect('/admin')
        }
        else if (req.body.userType == "maker"){
            res.redirect('/maker')
        }
        else if (req.body.userType == "client"){
            res.redirect('/client')
        }
    },
    getAllClients: async (req, res)=>{
        res.send(await clientService.getAllClients());
    },
    getAllMakers: async (req, res)=>{
        res.send(await makerService.getAllMakers());
    }
}