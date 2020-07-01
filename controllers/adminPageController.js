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
                    {
                        link: "", text: "Manage Plans", id: "managePlans", dropdowns: []
                    },
                    {
                        link: "", text: "Manage Subscriptions", id: "manageSubscriptions", dropdowns: []
                    },
                    {
                        link: "", text: "Manage Available Credit", id: "manageCredit", dropdowns: []
                    }
                ]
            },

            {
                link: "", text: "Reporting Tools", id: "reportingTools", dropdowns: [
                    {link: "", text: "Review TimeSheets", id: "reviewTimeSheets"},
                    {link: "", text: "Time Reports", id: "runReports"}
                ]
            }
        ];
        let footerLinks = [
            {link: "", text: "Report a problem", id: "reportProblem"}
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

