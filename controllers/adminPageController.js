module.exports = {
    renderLanding: (req, res) => {
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
            {
                link: "/admin", text: "Main", id: "main", dropdowns: []
            },
            {
                link: "", text: "Manage Clients", id: "manageClients", dropdowns: []
            },
            {
                link: "", text: "Manage Freedom Makers", id: "manageMakers", dropdowns: []
            },
            {
                link: "", text: "Manage Relationships", id: "manageRelationships", dropdowns: []
            },
            {
                link: "", text: "Manage Billing", id: "manageBilling", dropdowns: [
                    {link: "", text: "Manage Plans", id: "managePlans"},
                    {link: "", text: "Manage Subscriptions", id: "manageSubscriptions"},
                    {link: "", text: "Manage Available Hours", id: "manageHours"}
                ]
            },

            {
                link: "", text: "Reporting Tools", id: "reportingTools", dropdowns: [
                    {link: "", text: "Review TimeSheets", id: "reviewTimeSheets"},
                    {link: "", text: "Time Reports", id: "runReports"},
                    {link: "", text: "Rollup", id: "rollupReport"}
                ]
            }
        ];
        let footerLinks = [
        ];

        res.render("admin", {
            siteTitle: thisID,
            pageTitle: headerTitle,
            headerImg: headerImageActual,
            navItemsTop: headerLinks,
            navItemsBottom: footerLinks
        });
    }
};

