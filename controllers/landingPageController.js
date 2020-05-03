
module.exports ={
    renderLanding: (req, res)=>{
        let thisID = {
            text: "landingTitle"
        };
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
        ]

        res.render("landing", {siteTitle:thisID, pageTitle:headerTitle, headerImg:headerImageActual, navItemsBottom: footerLinks});
    },

    temporaryNavigateFunction: (req, res)=>{
        if (req.body.userType == "admin"){
            res.redirect('/admin')
        }
        else if (req.body.userType == "maker"){
            res.redirect('/maker')
        }
        else if (req.body.userType == "client"){
            res.redirect('/client')
        }
    }
}