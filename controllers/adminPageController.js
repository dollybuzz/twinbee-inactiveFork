

module.exports ={
    renderLanding: (req, res)=>{
        let headerImageActual = {
            src: "/img/freedom-makers-logo.png",
            alt: "Freedom Makers Logo"
        };
        let headerLinks = [
            {link: "", text: "Manage Clients"},
            {link: "", text: "Manage Makers"},
            {link: "", text: "Review Timesheets"}
        ]
        let footerLinks = [
            {link: "", text: "Manage Clients"},
            {link: "", text: "Manage Makers"},
            {link: "", text: "Report a problem"},
        ]

        res.render("admin", {headerImg:headerImageActual, navItemsTop: headerLinks, navItemsBottom: footerLinks});
    },

    temporaryNavigateFunction: (req, res)=>{
        if (req.body.userType == "admin"){
            module.exports.renderLanding(req, res);
        }
        else if (req.body.userType == "maker"){
            var controller = require('./makerPageController');
            controller.renderLanding(req, res);
        }
        else if (req.body.userType == "client"){
            var controller = require('./clientPageController');
            controller.renderLanding(req, res);
        }
    }
}