module.exports ={
    renderLanding: (req, res)=>{
        let thisID = {
            text: "adminTitle"
        };
        let headerTitle = {
            text: "Administrator and Billing Portal"
        };
        let headerImageActual = {
            src: "/img/freedom-makers-logo.png",
            alt: "Freedom Makers Logo"
        };
        let headerLinks = [
            {link: "/admin", text: "Main", id:"main"},
            {link: "", text: "Manage Clients", id:"manageClients"},
            {link: "", text: "Manage Makers", id: "manageMakers"},
            {link: "", text: "Review TimeSheets", id:"reviewTimeSheets"}
        ]
        let footerLinks = [
            {link: "", text: "Report a problem", id: "reportProblem"}
        ]

        res.render("admin", {siteTitle:thisID, pageTitle:headerTitle, headerImg:headerImageActual, navItemsTop: headerLinks, navItemsBottom: footerLinks});
    }
}