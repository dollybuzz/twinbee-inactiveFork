
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
}