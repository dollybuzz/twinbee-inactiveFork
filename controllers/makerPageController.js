
module.exports ={
    renderLanding: (req, res)=>{
        let thisID = {
            text: "FMTitle"
        };
        let headerTitle = {
            text: "Freedom Maker Portal"
        };
        let headerImageActual = {
            src: "/img/freedom-makers-logo.png",
            alt: "Freedom Makers Logo"
        };
        let headerLinks = [
            {link: "/maker", text: "Main", id:"main"},
            {link: "", text: "View Previous Hours", id:"previousHours"},
            {link: "", text: "My Clients", id: "manageClients"},
        ];
        let footerLinks = [
            {link: "", text: "Report a problem"},
            {link: "", text: "FAQ"}
        ];
        let user = {
            text: "Welcome, Freedom Maker!"
        };

        res.render("maker", {welcome: user, siteTitle:thisID, pageTitle:headerTitle, headerImg:headerImageActual, navItemsTop: headerLinks, navItemsBottom: footerLinks});
    },
};