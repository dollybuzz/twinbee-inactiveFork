//global variable
let selectedRow = null;
let selectedTab = null;
let id_token = null;
let TEST_ENVIRONMENT = false;

let navMapper = {
    main: function () {
        location.reload();
    },

    reviewTimeSheets: function () {
        showFunction(timeSheetFunctionality, "/api/getTimeSheetsByClientId");
    },

    manageSubscriptions: function () {
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
    $("#ExpandButton").hide();

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
        $("#ExpandButton").show();
        $("#SubmitButton").show();
        $("#optionsClient").css("width", "50%");
        $("#optionsClient").css("width", "50%");
        $("#optionsClient").css("opacity", "1");
        $("#SubmitButton").css("opacity", "1");
        $("#ExpandButton").css("opacity", "1")
    }, 800)
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

    setTimeout(function () {
        $("#ExpandButton").hide();
    }, 500);

};

function showFunction (functionality, endpoint) {
    $.ajax({
        method: "post",
        url: TEST_ENVIRONMENT ? '/api/getAllClients' : '/api/getClientByToken',
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
                    id: TEST_ENVIRONMENT ? "AzqgmORz6AFeK1Q5w" : res.id
                },
                dataType: "json",
                success: function (innerRes, innerStatus) {
                    functionality(innerRes);
                },
                error: function (innerRes, innerStatus) {
                    $("#userMainContent").html(`Something went wrong with ${endpoint}`);
                }
            });// ajax
        },
        error: function (res, status) {
            $("#userMainContent").html("Failed to verify you!");
        }
    });
};


//Main Methods
function showMain () {
    //Contains any main tab functionality
    showFunction(timeBucketFunctionality, '/api/getTimeBucketByClientId');
}

//Google
onSignIn = function (googleUser) {
    id_token = TEST_ENVIRONMENT ? null : googleUser.getAuthResponse().id_token;
    showMain(); //must call here to first generate token
};

function openHostedPage(getPageEndpoint){
    $.ajax({
        method: "post",
        url: TEST_ENVIRONMENT ? '/api/getAllClients' : '/api/getClientByToken',
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
                    id:  TEST_ENVIRONMENT ? "AzqgmORz6AFeK1Q5w" : res.id
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
function popBuyForm (form) { //not a versatile method
    minimizeTable();
    showBlock();
    form();
}

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
        '            <th scope="col">Plan</th>\n' +
        '            <th scope="col">Available Hours</th>\n' +
        '        </thead><tbody>');
    //Populate table
    for(var plan in res.buckets) {
        let minToHours = (Number.parseFloat(res.buckets[plan]))/60;
        minToHours = minToHours.toFixed(1);
        $("#bucketTable").append('\n' +
            '<tr class="bucketRow">' +
            '   <td scope="row">' + plan + '</td>' +
            '   <td>' + minToHours + '</td></tr>'
        );
    }
    $("#bucketTable").append('\n</tbody>');

    //Body Block content
    createBody(null);
    $("#userMainContent").prepend("<div class='altTopButtons'></div>");
    $(".altTopButtons").append("<button type=\"button\" class=\"btn btn-select btn-circle btn-xl\" id=\"BuyButton\">Buy Hours</button>");
    $(".altTopButtons").append("<button type=\"button\" class=\"btn btn-select btn-circle btn-xl\" id=\"updatePaymentButton\">Update Payment</button>");
    $(".altTopButtons").append("<button type=\"button\" class=\"btn btn-select btn-circle btn-xl\" id=\"revInvoicesButton\">Review Invoices</button>");

    //Event Listeners
    //Update Payment
    $("#updatePaymentButton").on('click', function () {
        openHostedPage('/api/getUpdatePaymentURL');
    })

    //Review Invoices
    $("#revInvoicesButton").on('click', function () {
        openHostedPage('/api/getClientPayInvoicesPage');
    })

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

function buyForm () {
    $.ajax({
        url: TEST_ENVIRONMENT ? '/api/getAllClients' : '/api/getClientByToken',
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
                    id: TEST_ENVIRONMENT ? "AzqgmORz6AFeK1Q5w" : tokenres.id
                },
                dataType: "json",
                success: function (planres, planstatus) {
                    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
                        "<h6>Please select your plan and how many hours you would like to purchase:</h6><br>" +
                        "<div class='setGrid'></div>");
                    $(".setGrid").append("<div id='empty'></div>" +
                        "<label for='buyPlan'> Select a Plan: </label>" +
                        "<select class='form-control' id='buyPlan'>\n</select><br><br>\n" +
                        "<div id='empty'></div>" +
                        "<div id='empty'></div>" +
                        "<div id='empty'></div>" +
                        "<div id='empty'></div>" +
                        "<div id='empty'></div>" +
                        "<label for='buyHours'> Enter Number of Hours: </label>" +
                        "<input class='form-control' type='number' id='buyHours' name='buyHours'><br><br>\n");

                    for (var item in planres.buckets) {
                        $("#buyPlan").append(
                            `<option id="${item}" value="${item}">${item}</option>`
                        );
                    }

                    $("#optionsClient").append("<div id='verifyHourEntry'></div>");
                    $("#SubmitButton").off("click");
                    $("#SubmitButton").on("click", function (e) {
                        if ($("#buyHours").val().includes(".") || ($("#buyHours").val().length < 1) || ($("#buyHours").val().includes("-")) || $("#buyHours").val() == "0") {
                            e.preventDefault();
                            $("#verifyHourEntry").html("<h6>Invalid entry! Please try again.</h6>");
                        } else {
                            let numHours = $("#buyHours").val();
                            let planSelect = $("#buyPlan").val();
                            $("#optionsClient").html(`<h5>Are you sure you want to buy ${$("#buyHours").val()} hour(s) for your plan ${$("#buyPlan").val()}?</h5>`);
                            $("#optionsClient").append("<div id='selectionYorN'></div>");
                            $("#selectionYorN").append("<button id='NoBuy' type='button' class='btn btn-default'>No</button>");
                            $("#selectionYorN").append("<button id='YesBuy' type='button' class='btn btn-default'>Yes</button>");
                            $("#SubmitButton").css("opacity", "0");
                            $("#SubmitButton").hide();
                            $("#optionsClient").css("opacity", "1");
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
                                        $("#optionsClient").append("<h5>Successfully purchased " + numHours + " hour(s) for Plan " + planSelect + "!</h5>");
                                        setTimeout(function () {
                                            showFunction(timeBucketFunctionality, '/api/getTimeBucketByClientId');
                                        }, 1000);
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

//Subscription Methods
function prePopModForm (endpoint, modForm) { //not a versatile method
    minimizeTable();
    showBlock();
    let subscriptionId = selectedRow.children()[0].innerHTML;
    console.log(subscriptionId);
    $.ajax({
        url: endpoint,
        method: "post",
        data: {
            auth: id_token,
            subscriptionId: subscriptionId,
        },
        dataType: "json",
        success: modForm,
        error: function (res, status) {
            $("#optionsClient").html("Mod Form is not populating!");
        }
    });//end ajax
}

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
        '            <th scope="col">Subscription ID</th>\n' +
        '            <th scope="col">Plan</th>\n' +
        '            <th scope="col">Planned Monthly Hours</th>\n' +
        '            <th scope="col">Scheduled changes</th>\n' +
        '            <th scope="col">Cancelled</th>\n' +
        '            <th scope="col">Next Billing</th>\n' +
        '            <th scope="col" id="subOptions">Option</th>\n' +
        '        </thead><tbody>');

    //Populate table
    res.forEach(item => {
        let subscription = item.subscription;
        item = item.subscription;
        if (item && !subscription.deleted) {
            $("#subscriptionTable").append('\n' +
                '<tr class="subscriptionRow">' +
                '   <td>' + subscription.id + '</td>' +
                '   <td>' + subscription.plan_id + '</td>' +
                '   <td>' + subscription.plan_quantity + '</td>' +
                '   <td>' + `${subscription.has_scheduled_changes}` + '</td>' +
                '   <td>' + (subscription.cancelled_at == undefined ? "No" : moment.unix(subscription.cancelled_at).format('YYYY/MM/DD')) + '</td>' +
                '   <td>' + (subscription.next_billing_at == undefined ? "Cancelled" : moment.unix(subscription.next_billing_at).format('YYYY/MM/DD'))  + '</td>' +
                '   <td><button type="button" class="btn btn-select btn-circle btn-xl" id="ChangeSubButton">Change</button></td></tr>');
        }
    });
    $("#subscriptionTable").append('\n</tbody>');

    //Body Block content
    createBody(null);

    //Event Listeners
    //Change Subscription
    $(".subscriptionRow").click(function () {
        selectedRow = $(this);
        prePopModForm("/api/retrieveSubscription", subscriptionModForm);
    });

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

function subscriptionModForm (res, status) {
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        "<form id='modify'>\n" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modsubscriptionid'>Subscription:</label>" +
        `<input class='form-control' type='text' id='modsubscriptionid' name='modsubscriptionid' value='${res.id}' disabled>\n<br>\n` +
        "<label for='modsubscriptionplanname'>Plan:</label>" +
        `<input class='form-control' id='modsubscriptionplanname' name='modsubscriptionplanname' value='${selectedRow.children()[1].innerHTML}' disabled>\n<br>\n` +
        "<label for='modsubscriptionplanquantity'>Monthly Hours:</label>" +
        `<input class='form-control' type='number' id='modsubscriptionplanquantity' name='modsubscriptionplanquantity' value='${res.plan_quantity}'>\n<br>\n` +
        "</form><div><span id='errormessage' style='color:red'></span></div>\n");

    let monthlyHours = $("#modsubscriptionplanquantity").val();

    $.ajax({
        url: "/api/updateSubscription",
        method: "post",
        data: {
            auth: id_token,
            subscriptionId: res.id,
            planQuantity: res.plan_quantity
        },
        dataType: "json",
        success: function (updateres, planstatus) {
            $("#SubmitButton").on("click", function (e) {
                if(monthlyHours.includes(".")) {
                    e.preventDefault();
                    $("#errormessage").html("Invalid entry! Please try again.");
                }
                else {
                    $("#optionsClient").html(`<h5>Are you sure you want to change from ${selectedRow.children()[2].innerHTML} to ${$("#modsubscriptionplanquantity").val()} monthly hour(s) for your plan ${selectedRow.children()[1].innerHTML}?</h5>`);
                    $("#optionsClient").append("<div id='selectionYorN'></div>");
                    $("#selectionYorN").append("<button id='NoChange' type='button' class='btn btn-default'>No</button>");
                    $("#selectionYorN").append("<button id='YesChange' type='button' class='btn btn-default'>Yes</button>");
                    $("#SubmitButton").css("opacity", "0");
                    $("#SubmitButton").hide();
                    $("#optionsClient").css("opacity", "1");
                    $("#YesChange").css("opacity", "1");
                    $("#NoChange").css("opacity", "1");

                    $("#NoChange").click(function () {
                        $("#SubmitButton").show();
                        expandTable();
                    });




                }
            });
        },
        error: function (updateres, tokenstatus) {
            $("#userMainContent").html("Change Subscription isn't working!");
        }
    });


}

//Maker Methods
function makerFunctionality (res) {
    $.ajax({
        url: TEST_ENVIRONMENT ? '/api/getAllClients' : '/api/getClientByToken',
        method: "post",
        data: {
            auth: id_token,
            token: id_token,
        },
        dataType: "json",
        success: function (tokenres, status) {
            $.ajax({
                url: "/api/getRelationshipsByClientId", //returns maker id, use maker id to get maker name
                method: "post",
                data: {
                    auth: id_token,
                    id: TEST_ENVIRONMENT ? "AzqgmORz6AFeK1Q5w" : tokenres.id
                },
                dataType: "json",
                success: function (relres, status) {
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
                        '            <th scope="col">Freedom Maker ID</th>\n' +
                        '            <th scope="col">Freedom Maker</th>\n' +
                        '            <th scope="col">Email</th>\n' +
                        '            <th scope="col">Role</th>\n' +
                        '        </thead><tbody>');
                    for (var item in relres) {
                        console.log(relres[0].occupation);
                        let occ = relres[item].occupation;
                        $.ajax({
                            url: "/api/getMaker",
                            method: "post",
                            data: {
                                auth: id_token,
                                id: relres[item].makerId,//tokenres.id,
                            },
                            dataType: "json",
                            success: function (makerres, makerstatus) {
                                //Populate table
                                $("#makerTable").append('\n' +
                                    '<tr class="makerRow">' +
                                    '   <td>' + `${makerres.id}` + '</td>' +
                                    '   <td>' + `${makerres.firstName} ${makerres.lastName}` + '</td>' +
                                    '   <td>' + `${makerres.email}` + '</td>' +
                                    '   <td>' + occ + '</td></tr>'
                                );
                            },
                            error: function (makerres, makerstatus) {
                                $("#userMainContent").html("Maker isn't working!");
                            }
                        });
                    }
                    ;
                    $("#makerTable").append('\n</tbody>');
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
                error: function (relres, relstatus) {
                    $("#userMainContent").html("Relationship isn't working!");
                }
            });
        },
        error: function (tokenres, tokenstatus) {
            $("#userMainContent").html("Token isn't working!");
        }
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
        '            <th scope="col">Time Sheet ID</th>\n' +
        '            <th scope="col">Freedom Maker ID</th>\n' +
        '            <th scope="col">Freedom Maker</th>\n' +
        '            <th scope="col">Plan</th>\n' +
        '            <th scope="col">Clock In</th>\n' +
        '            <th scope="col">Clock Out</th>\n' +
        '            <th scope="col">Task</th>\n' +
        '        </thead><tbody>');
    //Populate table
    $("#buttonsTop").append('<span>Loading...   </span><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');

    $.ajax({
        method: "post",
        url: TEST_ENVIRONMENT ? '/api/getAllClients' : '/api/getClientByToken',
        data: {
            auth: id_token,
            token: id_token
        },
        success: function (tokenres, status) {
            $.ajax({
                url: '/api/getMakersForClient',
                method: "post",
                data: {
                    auth: id_token,
                    id: TEST_ENVIRONMENT ? "AzqgmORz6AFeK1Q5w" : tokenres.id
                },
                dataType: "json",
                success: function (innerRes, innerStatus) {

                    let makerMap = {};
                    for (var i = 0; i < innerRes.length; ++i) {
                        let maker = innerRes[i];
                        makerMap[maker.id] = maker;
                    }
                    for (var item in res) {
                        $("#sheetsTable").append('\n' +
                            '<tr class="sheetRow">' +
                            '   <td scope="row">' + res[item].id + '</td>' +
                            '   <td>' + makerMap[res[item].makerId].id + '</td>' +
                            '   <td>' + makerMap[res[item].makerId].firstName + " " + makerMap[res[item].makerId].lastName + '</td>' +
                            '   <td>' + res[item].hourlyRate + '</td>' +
                            '   <td>' + res[item].timeIn + '</td>' +
                            '   <td>' + res[item].timeOut + '</td>' +
                            '   <td>' + res[item].task + '</td></tr>'
                        );
                    }

                    //remove loading message/gif
                    $("#buttonsTop").children()[0].remove();
                    $("#buttonsTop").children()[0].remove();
                },
                error: function (innerRes, innerStatus) {
                    $("#userMainContent").html("Something went wrong with getmakers!");
                }
            });// ajax
        },
        error: function (res, status) {
            $("#userMainContent").html("Failed to verify you!");
            console.log(res);
        }
    });

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


$(document).ready(function () {
    $.ajax({
        url: "/api/getEnvironment",
        method: "get",
        dataType: "json",
        success:function (res, status) {
            TEST_ENVIRONMENT = res;
            onSignIn();
        },
        error: function (clientres, clientstatus) {
            TEST_ENVIRONMENT = true;
            onSignIn();
        }
    });

    //Adding logout Button
    $("#logout").append("<button id='logoutButton' type='button' class='btn btn-default'>Log Out</button>");
    $("#logoutButton").click(signOut);

    //Event Listeners for other nav menu items
    $(".navItem").click(function (e) {
        $("#buttonsTop").append('Loading...  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>')
        navMapper[e.target.id]();
        selectedTab = $(this)[0].id;
        $(".navItem").css('color', 'white');
        $(".navItem").css('font-style', 'normal');
        $(this).css("color", '#dbb459');
        $(this).css("font-style", 'italic');
    });

    $(".navItem").hover(function () {
        $(this).css("color", '#dbb459');
        $(this).css("font-style", 'italic');
    });

    $(".navItem").on("mouseleave", function() {
        if (selectedTab!= $(this)[0].id)
        {
            $(this).css("color", 'white');
            $(this).css("font-style", 'normal');
        }
    });
    //shifts the logo
    $("#landingLogo").css("width", "20%");
});//end document ready