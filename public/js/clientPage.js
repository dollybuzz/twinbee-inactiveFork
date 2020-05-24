//global variable
let selectedRow = null;
let selectedTab = null;
let id_token = null;

let navMapper = {
    main: function () {
        location.reload();
    },

    reviewTimeSheets: function () {
        showFunction(timeSheetFunctionality, "/api/getTimeSheetsByClientId");
    },

    reviewSubscriptions: function () {
        showFunction(subscriptionFunctionality, "/api/getSubscriptionsByClient");
    },

    manageMakers: function () {
        showFunction(makerFunctionality, "/api/getMakersForClient");
    }
};//end navMapper

//Versatile Helper Functions
function createBody (button) {
    //top row
    $("#topRow").append('\n<div id="optionsClient"></div>');
    $("#optionsClient").hide();
    $("#optionsClient").css("width", "50%");
    if(button != null)
    {
        $("#buttonsTop").append("<button id='DeleteButton' type='button' class='btn btn-default'>" + button + "</button>");
    }
    $("#buttonsTop").append("<button id='ExpandButton' type='button' class='btn btn-default'>></button>");

    //bottom row
    $("#userMainContent").append('\n<div class="row" id="bottomRow"></div>');
    $("#userMainContent").append('<div id="buttonsBottom"></div>');
    $("#buttonsBottom").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#buttonsBottom").hide();
};


function showBlock () {
    //show block after table stops moving
    setTimeout(function () {
        $("#optionsClient").show();
        $("#buttonsBottom").show();
        $("#SubmitButton").show();
        $("#optionsClient").css("width", "50%");
        $("#optionsClient").css("width", "50%");
        $("#optionsClient").css("opacity", "1");
        $("#SubmitButton").css("opacity", "1");
        $("#ExpandButton").css("opacity", "1");
        $("#buyForm").css("opacity", "1");
    }, 500)
};

function minimizeTable () {
    $("#floor").css("transition", "width 0.5s ease-in-out");
    $("#floor").css("width", "50%");
    $("#floor").css("margin-left", "0");
    $("#floor").css("margin-right", "auto");
}

function expandTable () {
    $("#optionsClient").hide();
    $("#buttonsBottom").hide();
    $("#optionsClient").css("width", "0%");
    $("#optionsClient").css("opacity", "0");
    $("#floor").css("width", "100%");
    $("#floor").css("margin-left", "0");
    $("#floor").css("margin-right", "auto");
    $("#floor").css("transition", "width 0.5s ease-in-out");
    $("#SubmitButton").css("opacity", "0");
    $("#ExpandButton").css("opacity", "0");
};

function showFunction (functionality, endpoint) {
    $.ajax({
        method: "post",
        url: '/api/getAllMakers', // change when ready for live:'/api/getClientByToken',
        data: {
            auth: id_token,
            token: id_token
        },
        success: function (res, status) {
            $.ajax({
                url: endpoint,
                method: "post",
                data: {
                    auth: id_token,
                    id: "16CHT7Ryu5EhnPWY" //Chris Redfield, change when ready for live: res.id
                },
                dataType: "json",
                success: function (innerRes, innerStatus) {
                    functionality(innerRes);
                },
                error: function (innerRes, innerStatus) {
                    $("#userMainContent").html("Something went wrong!");
                }
            });// ajax
        },
        error: function (res, status) {
            $("#userMainContent").html("Failed to verify you!");
            console.log(res);
        }
    });
};

//Maker Methods
function makerFunctionality (res) {
    $.ajax({
        url: "/api/getRelationshipsByClientId", //returns maker id, use maker id to get maker name
        method: "post",
        data: {
            auth: id_token,
            id: '16CHT7Ryu5EhnPWY',//tokenres.id,
        },
        dataType: "json",
        success: function (res, status) {
            //Create table
            $("#userMainContent").html(
                "<div id=\"buttonsTop\"></div>\n" +
                "<div class='row' id='topRow'>\n" +
                "<div id=\"floor\">\n" +
                "    <table id=\"makerTable\" class=\"table\">\n" +
                "    </table>\n" +
                "</div></div>");
            $("#makerTable").append('\n' +
                '        <thead class="thead">\n' +
                '            <th scope="col">Freedom Maker Name</th>\n' +
                '            <th scope="col">Email</th>\n' +
                '            <th scope="col">Occupation</th>\n' +
                '        </thead><tbody>');

            //Populate table
            res.forEach(item => {
                $("#makerTable").append('\n' +
                    '<tr class="makerRow">' +
                    '   <td scope="row">' + subscription.id + '</td>' +
                    '   <td>' + `${customer.first_name} ${customer.last_name}`+ '</td>' +
                    '   <td>' + subscription.plan_id + '</td>' +
                    '   <td>' + (customer.meta_data == undefined? "no data": (customer.meta_data[item.plan_id] ? customer.meta_data[item.plan_id] : 0)) + '</td>' +
                    '   <td>' + `${subscription.has_scheduled_changes}` + '</td>' +
                    '   <td>' + (subscription.cancelled_at == undefined ? "No" : moment.unix(subscription.cancelled_at).format('YYYY/MM/DD')) + '</td>' +
                    '   <td>' + (subscription.next_billing_at == undefined ? "Cancelled" : moment.unix(subscription.next_billing_at).format('YYYY/MM/DD'))  + '</td></tr>'
                );
            });

            $("#subscriptionTable").append('\n</tbody>');

            //Body Block content
            createBody(null);

            //Expand Table Button
            $("#ExpandButton").click(function () {
                expandTable();
            });

            //Row effect
            $(".subscriptionRow").mouseenter(function () {
                $(this).css('transition', 'background-color 0.5s ease');
                $(this).css('background-color', '#e8ecef');
            }).mouseleave(function () {
                $(this).css('background-color', 'white');
            });
        },
        error: function (tokenres, tokenstatus) {
            $("#userMainContent").html("Token isn't working!");
        }
    });


}

//Subscription Methods
function subscriptionFunctionality (res) {
    //Create table
    $("#userMainContent").html(
        "<div id=\"buttonsTop\"></div>\n" +
        "<div class='row' id='topRow'>\n" +
        "<div id=\"floor\">\n" +
        "    <table id=\"subscriptionTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div></div>");
    $("#subscriptionTable").append('\n' +
        '        <thead class="thead">\n' +
        '            <th scope="col">ID</th>\n' +
        '            <th scope="col">Customer</th>\n' +
        '            <th scope="col">Plan</th>\n' +
        '            <th scope="col">Planned Monthly Hours</th>\n' +
        '            <th scope="col">Scheduled changes</th>\n' +
        '            <th scope="col">Cancelled</th>\n' +
        '            <th scope="col">Next Billing</th>\n' +
        '        </thead><tbody>');

    //Populate table
    res.forEach(item => {
        let subscription = item.subscription;
        let customer = item.customer;
        item = item.subscription;
        if (item && !subscription.deleted) {
            $("#subscriptionTable").append('\n' +
                '<tr class="subscriptionRow">' +
                '   <td scope="row">' + subscription.id + '</td>' +
                '   <td>' + `${customer.first_name} ${customer.last_name}`+ '</td>' +
                '   <td>' + subscription.plan_id + '</td>' +
                '   <td>' + (customer.meta_data == undefined? "no data": (customer.meta_data[item.plan_id] ? customer.meta_data[item.plan_id] : 0)) + '</td>' +
                '   <td>' + `${subscription.has_scheduled_changes}` + '</td>' +
                '   <td>' + (subscription.cancelled_at == undefined ? "No" : moment.unix(subscription.cancelled_at).format('YYYY/MM/DD')) + '</td>' +
                '   <td>' + (subscription.next_billing_at == undefined ? "Cancelled" : moment.unix(subscription.next_billing_at).format('YYYY/MM/DD'))  + '</td></tr>'
            );
        }
    });
    $("#subscriptionTable").append('\n</tbody>');

    //Body Block content
    createBody(null);

    //Expand Table Button
    $("#ExpandButton").click(function () {
        expandTable();
    });

    //Row effect
    $(".subscriptionRow").mouseenter(function () {
        $(this).css('transition', 'background-color 0.5s ease');
        $(this).css('background-color', '#e8ecef');
    }).mouseleave(function () {
        $(this).css('background-color', 'white');
    });
}

//TimeSheet Methods
function timeSheetFunctionality (res) {
    //Create table
    $("#userMainContent").html(
        "<div id=\"buttonsTop\"></div>\n" +
        "<div class='row' id='topRow'>\n" +
        "<div id=\"floor\">\n" +
        "    <table id=\"sheetsTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div></div>");
    $("#sheetsTable").append('\n' +
        '        <thead class="thead">\n' +
        '            <th scope="col">#</th>\n' +
        '            <th scope="col">Maker ID</th>\n' +
        '            <th scope="col">Client ID</th>\n' +
        '            <th scope="col">Plan</th>\n' +
        '            <th scope="col">Clock In</th>\n' +
        '            <th scope="col">Clock Out</th>\n' +
        '            <th scope="col">Task</th>\n' +
        '        </thead><tbody>');
    //Populate table
    res.forEach(item => {
        $("#sheetsTable").append('\n' +
            '<tr class="sheetRow">' +
            '   <td scope="row">' + item.id +'</td>' +
            '   <td>' + item.makerId + '</td>'+
            '   <td>' + item.clientId + '</td>'+
            '   <td>' + item.hourlyRate + '</td>'+
            '   <td>' + item.timeIn + '</td>'+
            '   <td>' + item.timeOut + '</td>'+
            '   <td>' + item.occupation + '</td></tr>' //change to task
        );
    });
    $("#sheetsTable").append('\n</tbody>');

    //Body Block content
    createBody(null);

    //Expand Table Button
    $("#ExpandButton").click(function () {
        expandTable();
    });

    //Row effect
    $(".sheetRow").mouseenter(function () {
        $(this).css('transition', 'background-color 0.5s ease');
        $(this).css('background-color', '#e8ecef');
    }).mouseleave(function () {
        $(this).css('background-color', 'white');
    });
}

//Main Methods
function showMain () {
    //Contains any main tab functionality
    showFunction(timeBucketFunctionality, '/api/getTimeBucketByClientId');

    $("#updatePaymentButton").click(function () {
        openHostedPage('/api/getUpdatePaymentURL');
    })

    $("#revInvoicesButton").click(function () {
        openHostedPage('/api/getClientPayInvoicesPage');
    })
}

//Google
onSignIn = function (googleUser) {
    id_token = googleUser.getAuthResponse().id_token;
    showMain(); //must call here to first generate token
};

function openHostedPage(getPageEndpoint){
    $.ajax({
        method: "post",
        url: 'api/getAllMakers', //uncomment when live '/api/getClientByToken',
        data: {
            auth: id_token,
            token: id_token
        },
        success: function (res, status) {
            $.ajax({
                url: getPageEndpoint,
                method: "post",
                data: {
                    auth: id_token,
                    id: "16CHT7Ryu5EhnPWY" //Chris Redfield, change to res.id
                },
                dataType: "json",
                success: function (innerRes, innerStatus) {
                    console.log(innerStatus);
                    window.open(innerRes.url);
                },
                error: function (innerRes, innerStatus) {
                    $("#userMainContent").html("failed to get page!");
                }
            });// ajax
        },
        error: function (res, status) {
            $("#userMainContent").html("Failed to verify you!");
            console.log(res);
        }
    });

}

//Buy Hours Methods
function timeBucketFunctionality (res) {
    //Create table
    $("#userMainContent").html(
        "<div id=\"buttonsTop\"></div>\n" +
        "<div class='row' id='topRow'>\n" +
        "<div id=\"floor\">\n" +
        "    <table id=\"bucketTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div></div>");
    $("#bucketTable").append('\n' +
        '        <thead class="thead">\n' +
        '            <th scope="col">Plan ID</th>\n' +
        '            <th scope="col">Hours Available</th>\n' +
        '        </thead><tbody>');
    //Populate table
    for(var plan in res.buckets) {
        let minToHours = (Number.parseFloat(res.buckets[plan]))/60;
        minToHours = minToHours.toFixed(2);
            $("#bucketTable").append('\n' +
                '<tr class="bucketRow">' +
                '   <td scope="row">' + plan + '</td>' +
                '   <td>' + minToHours + '</td></tr>'
            );
    };
    $("#bucketTable").append('\n</tbody>');

    //Body Block content
    createBody(null);
    $("#userMainContent").prepend("<div id='altTopButtons'></div>");
    $("#altTopButtons").append("<button type=\"button\" class=\"btn btn-select btn-circle btn-xl\" id=\"BuyButton\">Buy Hours</button>");
    $("#altTopButtons").append("<button type=\"button\" class=\"btn btn-select btn-circle btn-xl\" id=\"updatePaymentButton\">Update Payment</button>");
    $("#altTopButtons").append("<button type=\"button\" class=\"btn btn-select btn-circle btn-xl\" id=\"revInvoicesButton\">Review Invoices</button>");

    //Event Listeners
    //Buy Hours
    $(".bucketRow").click(function () {
        selectedRow = $(this);
        popBuyForm(buyForm);
    });

    //Buy Hours
    $("#BuyButton").click(function () {
        selectedRow = $(this);
        popBuyForm(buyForm);
    });

    //Expand Table Button
    $("#ExpandButton").click(function () {
        expandTable();
    });

    //Row effect
    $(".bucketRow").mouseenter(function () {
        $(this).css('transition', 'background-color 0.5s ease');
        $(this).css('background-color', '#e8ecef');
    }).mouseleave(function () {
        $(this).css('background-color', 'white');
    });

}

function popBuyForm (form) {
    minimizeTable();
    showBlock();
    form();
}

function buyForm () {
    $("#optionsClient").html("<div id='buyForm'></div>");
    $.ajax({
        url: '/api/getAllClients', //"/api/getClientByToken",
        method: "post",
        data: {
            auth: id_token,
            token: id_token,
        },
        dataType: "json",
        success: function (tokenres, tokenstatus) {
            $.ajax({
                url: "/api/getTimeBucketByClientId",
                method: "post",
                data: {
                    auth: id_token,
                    id: '16CHT7Ryu5EhnPWY',//tokenres.id,
                },
                dataType: "json",
                success: function (planres, planstatus) {
                    $("#buyForm").html("<h5>Add data into the following fields</h5><br>" +
                        "<h6>Please select your plan and how many hours you would like to purchase:</h6><br>" +
                        "<label for='buyPlan'> Select a Plan: </label>" +
                        "<select id='buyPlan'>\n</select><br><br>\n" +
                        "<label for='buyHours'> Enter Number of Hours: </label>" +
                        "<input type='number' id='buyHours' name='buyHours'><br><br>\n");

                    for (var item in planres.buckets) {
                        $("#buyPlan").append(
                            `<option id="${item}" value="${item}">${item}</option>`
                        );
                    }

                    $("#buyForm").append("<div id='verifyHourEntry'></div>");
                    $("#SubmitButton").off("click");
                    $("#SubmitButton").on("click", function (e) {
                        if ($("#buyHours").val().includes(".") || ($("#buyHours").val().length < 1) || ($("#buyHours").val().includes("-")) || $("#buyHours").val() == "0") {
                            e.preventDefault();
                            $("#verifyHourEntry").html("<h6>Invalid entry! Please enter hours again.</h6>");
                        } else {
                            let numHours = $("#buyHours").val();
                            let planSelect = $("#buyPlan").val();
                            $("#buyForm").html(`<h5>Are you sure you want to buy ${$("#buyHours").val()} hour(s) for your plan ${$("#buyPlan").val()}?</h5>`);
                            $("#buyForm").append("<div id='selectionYorN'></div>");
                            $("#selectionYorN").append("<button id='NoBuy' type='button' class='btn btn-default'>No</button>");
                            $("#selectionYorN").append("<button id='YesBuy' type='button' class='btn btn-default'>Yes</button>");
                            $("#SubmitButton").css("opacity", "0");
                            $("#SubmitButton").hide();
                            $("#buyForm").css("opacity", "1");
                            $("#YesBuy").css("opacity", "1");
                            $("#NoBuy").css("opacity", "1");

                            $("#NoBuy").click(function () {
                                $("#SubmitButton").show();
                                expandTable();
                            });

                            $("#YesBuy").click(function () {
                                $.ajax({
                                    url: "/api/creditNow",
                                    method: "post",
                                    data: {
                                        auth: id_token,
                                        customerId: '16CHT7Ryu5EhnPWY',//tokenres.id,
                                        planId: planSelect,
                                        numHours: numHours,
                                    },
                                    dataType: "json",
                                    success: function (res, status) {
                                        $("#buyForm").append("<h5>Successfully purchased " + numHours + " hour(s) for Plan " + planSelect + "!</h5>");
                                        setTimeout(function () {
                                            showFunction(timeBucketFunctionality, '/api/getTimeBucketByClientId');
                                        }, 3000);
                                    },
                                    error: function (res, status) {
                                        $("#userMainContent").html("Buy Credit isn't working!");
                                    }
                                });
                            });
                        }
                    });

                },
                error: function (planres, planstatus) {
                    $("#userMainContent").html("Plan isn't working!");
                }
            });
        },
        error: function (tokenres, tokenstatus) {
            $("#userMainContent").html("Token isn't working!");
        }
    });
}


$(document).ready(function () {
    //Adding logout Button
    $("#logout").append("<button id='logoutButton' type='button' class='btn btn-default'>Log Out</button>");
    $("#logoutButton").click(signOut);

    //Event Listeners for other nav menu items
    $(".navItem").click(function (e) {
        navMapper[e.target.id]();
        selectedTab = $(this)[0].id;
    });

    $(".navItem").hover(function () {
        $(this).css("color", '#dbb459');
        $(this).css("font-style", 'italic');
    });

    $(".navItem").on("mouseleave", function() {
        $(this).css("color", 'white');
        $(this).css("font-style", 'normal');
    });

    //shifts the logo
    $("#landingLogo").css("width", "20%");

});//end document ready