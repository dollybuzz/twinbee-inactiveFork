
module.exports ={
    renderLanding: (req, res)=>{
        let headerTitle = {
            text: ""
        };
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

        res.render("landing", {welcome:user, pageTitle:headerTitle, headerImg:headerImageActual, navItemsBottom: footerLinks});
    },
};