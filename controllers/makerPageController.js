
module.exports ={
    renderLanding: (req, res)=>{
        let headerImageActual = {
            src: "/img/freedom-makers-logo.png",
            alt: "Freedom Makers Logo"
        };
        let headerLinks = [
            {link: "", text: "Past Hours"},
            {link: "", text: "My Clients"},
        ]
        let footerLinks = [
            {link: "", text: "Past Hours"},
            {link: "", text: "My Clients"},
            {link: "", text: "Report a problem"},
        ]

        res.render("maker", {headerImg:headerImageActual, navItemsTop: headerLinks, navItemsBottom: footerLinks});
    },
}