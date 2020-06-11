
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

        res.render("forbidden", {welcome:user, headerImg:headerImageActual, navItemsBottom: footerLinks});
    },
};