
module.exports ={
    renderLanding: (req, res)=>{
        let thisID = {
            text: "clientTitle"
        };
        let headerTitle = {
            text: "Client Portal"
        };
        let headerImageActual = {
            src: "/img/freedom-makers-logo.png",
            alt: "Freedom Makers Logo"
        };
        let headerLinks = [
            {link: "/client", text: "Main", id:"main"},
            {link: "", text: "Manage My Subscriptions", id: "manageSubscriptions"},
            {link: "", text: "My Freedom Makers", id: "manageMakers"},
            {link: "", text: "Review Time Sheets", id:"reviewTimeSheets"}
        ]
        let footerLinks = [
            {link: "", text: "Report a problem"},
            {link: "", text: "FAQ"}
        ]
        let user = {
            text: "Welcome, Client!"
        };

        res.render("client", {welcome: user, siteTitle:thisID, pageTitle:headerTitle, headerImg:headerImageActual, navItemsTop: headerLinks, navItemsBottom: footerLinks});
    },
}