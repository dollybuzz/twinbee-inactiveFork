
module.exports ={
    renderLanding: (req, res)=>{
        let headerImageActual = {
            src: "/img/freedom-makers-logo.png",
            alt: "Freedom Makers Logo"
        };
        let headerLinks = [
            {link: "", text: "View/Edit Hours"},
            {link: "", text: "My Makers"},
        ]
        let footerLinks = [
            {link: "", text: "View/Edit Hours"},
            {link: "", text: "My Makers"},
            {link: "", text: "Report a problem"},
            {link: "", text: "FAQ"}
        ]

        res.render("client", {headerImg:headerImageActual, navItemsTop: headerLinks, navItemsBottom: footerLinks});
    },
}