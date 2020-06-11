
module.exports ={
    renderLanding: (req, res)=>{

        let headerImageActual = {
            src: "/img/freedom-makers-logo.png",
            alt: "Freedom Makers Logo"
        };
        let footerLinks = [
            {link: "", text: "Our Mission"},
            {link: "", text: "Become a Maker"},
            {link: "", text: "FAQ"},
            {link: "", text: "Problems? Contact us."},
        ];

        let user = {
            text: "Welcome!"
        };

        res.render("landing", {welcome:user, headerImg:headerImageActual, navItemsBottom: footerLinks});
    },
    renderForbidden: (req, res)=>{
        let thisID = {
            text: "clientTitle"
        };
        let headerTitle = {
            text: ""
        };
        let headerImageActual = {
            src: "/img/freedom-makers-logo.png",
            alt: "Freedom Makers Logo"
        };
        let headerLinks = [
            {link: "", text: "", id: ""}
        ];
        let footerLinks = [
            {link: "", text: ""}
        ];

        res.render("forbidden", {siteTitle:thisID, pageTitle:headerTitle, headerImg:headerImageActual, navItemsTop: headerLinks, navItemsBottom: footerLinks});
    },
};