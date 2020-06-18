//global variable
let selectedRow = null;
let selectedTab = null;
let id_token = null;
let TEST_ENVIRONMENT = false;
let TEST_CUSTOMER = "AzqgmORz6AFeK1Q5w";
let NAV_MAP_TEXT = "";
let SELECTED_NAV_MAP = null;

let navMapper = {
    main: function () {
        location.reload();
    },

    reviewTimeSheets: function () {
        timeSheetFunctionality();
    },

    manageSubscriptions: function () {
        showFunction(subscriptionFunctionality, "/api/getMySubscriptions");
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
    }, 800);
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
        url: endpoint,
        method: "post",
        data: {
            auth: id_token,
            token: id_token
        },
        dataType: "json",
        success: function (innerRes, innerStatus) {
            functionality(innerRes);
            $(".spinner-border").remove();
        },
        error: function (innerRes, innerStatus) {
            $("#userMainContent").html(`Something went wrong with ${endpoint}`);
        }
    });
};


//Main Methods
function showMain () {
    //Contains any main tab functionality
    showFunction(timeBucketFunctionality, '/api/getAllMyTimeBuckets');
}

//Google
onSignIn = function (googleUser) {
    id_token = TEST_ENVIRONMENT ? null : googleUser.getAuthResponse().id_token;

    let profile = TEST_ENVIRONMENT ? null : googleUser.getBasicProfile();
    let name = TEST_ENVIRONMENT ? null : profile.getName();
    $("#googleUser").html(TEST_ENVIRONMENT ? "test" : name);

    showMain();
};

function openHostedPage(getPageEndpoint){

    $.ajax({
        url: getPageEndpoint,
        method: "post",
        data: {
            auth: id_token,
            token: id_token,
        },
        dataType: "json",
        success: function (innerRes, innerStatus) {
            window.open(innerRes.url);
        },
        error: function (innerRes, innerStatus) {
            $("#userMainContent").html("failed to get page!");
        }
    });// ajax


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
        '            <th scope="col" id="subOptions">Option</th>\n' +
        '        </thead><tbody>');
    //Populate table
    for(var plan in res.buckets) {
        let hours = Math.floor((Number.parseInt(res.buckets[plan])) / 60);
        let minutes = (Number.parseInt(res.buckets[plan])) % 60;
        let message = "";
        if (hours > 0) {
            message += ` ${hours} hours `;
        }
        if (minutes > 0) {
            message += ` ${minutes} minutes `;
        }
        $("#bucketTable").append('\n' +
            '<tr class="bucketRow">' +
            '   <td scope="row">' + plan + '</td>' +
            `   <td> ${message} </td>` +
            '   <td><button type="button" class="btn btn-select btn-circle btn-xl" id="BuyHoursSubButton">Buy Hours</button></td></tr>');
    }
    $("#bucketTable").append('\n</tbody>');

    //Body Block content
    createBody(null);
    $("#userMainContent").prepend("<div class='altTopButtons'></div>");
    $(".altTopButtons").append("<div id='empty'></div>");
    $(".altTopButtons").append("<button type=\"button\" class=\"btn btn-select btn-circle btn-xl\" id=\"updatePaymentButton\">Update Payment Method</button>" +
   "<button type=\"button\" class=\"btn btn-select btn-circle btn-xl\" id=\"revInvoicesButton\">Review Invoices</button>");
    $(".altTopButtons").append("<div id='empty'></div>");


    //Event Listeners
    //Update Payment
    $("#updatePaymentButton").on('click', function () {
        openHostedPage('/api/getMyUpdatePaymentPage');
    })

    //Review Invoices
    $("#revInvoicesButton").on('click', function () {
        openHostedPage('/api/getMyPayInvoicesPage');
    })

    //Buy Hours
    $(".bucketRow").click(function () {
        selectedRow = $(this);
        $("#optionsClient").html(`<span>Loading...   </span><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`)
        popBuyForm(buyForm(selectedRow.children()[0].innerHTML));
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

function buyForm (rowData) {
            $.ajax({
                url: "/api/getMyTimeBucket",
                method: "post",
                data: {
                    auth: id_token,
                   token: id_token,
                    bucket: rowData
                },
                dataType: "json",
                success: function (planres, planstatus) {
                    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
                        "<form id='add'>" +
                        "<label for='buyPlan'> Plan: </label>" +
                        `<input class='form-control' id='buyPlan' value='${selectedRow.children()[0].innerHTML}' disabled></input>\n<br>\n` +
                        "<label for='buyHours'> Enter Number of Hours: </label>" +
                        "<input class='form-control' type='number' id='buyHours' name='buyHours'>\n<br><br>\n" +
                        "<label for='buyHours'> Enter Number of Minutes: </label>" +
                        "<input class='form-control' type='number' id='buyMin' name='buyMin'></form>\n<br>\n");

                    for (var item in planres.buckets) {
                        $("#buyPlan").append(
                            `<option id="${item}" value="${item}">${item}</option>`
                        );
                    }

                    $("#optionsClient").append("<div id='verifyHourEntry'></div>");
                    $("#SubmitButton").off("click");
                    $("#SubmitButton").on("click", function (e) {
                        let valid = true;
                        let message = "";
                        if ($("#buyHours").val() == "" && $("#buyMin").val() == ""){
                            valid = false;
                            message += "Please enter an amount to purchase!<br>"
                        }
                        if ($("#buyHours").val().includes("-")){
                            valid = false;
                            message += "Hours must be positive!<br>"
                        }
                        if ($("#buyHours").val().includes(".")){
                            valid = false;
                            message += "No decimals in hours please!<br>";
                        }

                        if ($("#buyMin").val().includes("-")){
                            valid = false;
                            message += "Minutes must be positive!<br>";
                        }
                        if ($("#buyMin").val().includes(".")){
                            valid = false;
                            message += "No decimals in minutes please!<br>"
                        }

                        if (!valid) {
                            $("#verifyHourEntry").html(`<span style='color:red'>${message}</span>`);
                        } else {

                            if($("#buyHours").val() == "")
                            {
                                $("#buyHours").val(0);
                            }
                            if($("#buyMin").val() == "")
                            {
                                $("#buyMin").val(0);
                            }
                            let numHours = Number.parseInt($("#buyHours").val());
                            let numMin = Number.parseInt($("#buyMin").val());
                            let timeInMinutes = numHours * 60 + numMin;
                            let planSelect = $("#buyPlan").val();

                            $("#optionsClient").html(`<h5>Are you sure you want to buy ${$("#buyHours").val()} hour(s) and ${$("#buyMin").val()} minute(s) for your plan ${$("#buyPlan").val()}?</h5>`);
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
                            let message = "";
                            if (numHours > 0){
                                message += `${numHours} hour(s) `;
                            }
                            if (numMin > 0){
                                message += `${numMin} minute(s) `;
                            }

                            $("#YesBuy").click(function () {
                                $.ajax({
                                    url: "/api/chargeMeNow",
                                    method: "post",
                                    data: {
                                        auth: id_token,
                                        token: id_token,
                                        planId: planSelect,
                                        numHours: timeInMinutes/60
                                    },
                                    dataType: "json",
                                    success: function (res, status) {
                                        $("#optionsClient").append("<br><h5>Successfully purchased " + message + " for Plan " + planSelect + "!</h5>" +
                                            "<br><h6>Note: Due to processing, delays may occur. Please contact Freedom Makers<br>if your purchase does not reflect " +
                                            "in your account after 5 minutes.</h6>");
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
}

//Subscription Methods
function prePopModForm (endpoint, modForm) { //not a versatile method
    minimizeTable();
    showBlock();
    let subscriptionId = selectedRow.children()[0].innerHTML;
    $.ajax({
        url: endpoint,
        method: "post",
        data: {
            auth: id_token,
            token: id_token,
            subscriptionId: subscriptionId,
        },
        dataType: "json",
        success: modForm,
        error: function (res, status) {
            $("#optionsClient").html("Mod Form is not populating! Please refresh the page. Contact support if the problem persists.");
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
        '            <th scope="col">Current Monthly Hours</th>\n' +
        '            <th scope="col">Pending changes</th>\n' +
        '            <th scope="col">Cancelled</th>\n' +
        '            <th scope="col">Next Billing</th>\n' +
        '            <th scope="col" id="subOptions">Option</th>\n' +
        '        </thead><tbody>');

    //Populate table
    res.forEach(item => {
        let subscription = item.subscription;
        item = item.subscription;
        if (item && !subscription.deleted) {
            let scheduled = subscription.has_scheduled_changes;
            let changes = "";
            (scheduled ? changes = "Yes" : changes = "No");

            $("#subscriptionTable").append('\n' +
                '<tr class="subscriptionRow">' +
                '   <td>' + subscription.id + '</td>' +
                '   <td>' + subscription.plan_id + '</td>' +
                '   <td>' + subscription.plan_quantity + '</td>' +
                "   <td>" + changes + "</td>" +
                '   <td>' + (subscription.cancelled_at == undefined ? "No" : moment.unix(subscription.cancelled_at).format('YYYY/MM/DD')) + '</td>' +
                '   <td>' + (subscription.next_billing_at == undefined ? "Terminated" : moment.unix(subscription.next_billing_at).format('YYYY/MM/DD')) + '</td>' +
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
            prePopModForm("/api/retrieveMySubscription", subscriptionModForm);
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
        `<input class='form-control' id='modsubscriptionplanname' name='modsubscriptionplanname' value='${selectedRow.children()[1].innerHTML}' disabled>\n<br><br>\n` +
        "<label for='modsubscriptionplanquantity'>Monthly Hours:</label>" +
        `<input class='form-control' type='number' id='modsubscriptionplanquantity' name='modsubscriptionplanquantity' value='${res.plan_quantity}'>\n<br>\n` +
        "</form><br><div><span id='errormessage' style='color:red'></span></div>" +
        "<div id='pendingChanges'></div>");

    $("#SubmitButton").on("click", function (e) {
        let monthlyHours = $("#modsubscriptionplanquantity").val();
        if (monthlyHours.includes(".") || monthlyHours == selectedRow.children()[2].innerHTML) {
            e.preventDefault();
            $("#errormessage").html("Invalid entry! Please try again.");
        } else {
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

            $("#YesChange").click(function () {
                $.ajax({
                    url: "/api/updateMySubscription",
                    method: "post",
                    data: {
                        auth: id_token,
                        subscriptionId: res.id,
                        planQuantity: monthlyHours
                    },
                    dataType: "json",
                    success: function (updateres, status) {
                        $("#optionsClient").append("<br><h5>Successfully updated monthly hours for Subscription " + `${updateres.id}` + "!</h5>");
                        setTimeout(function () {
                            showFunction(subscriptionFunctionality, "/api/getMySubscriptions");
                        }, 1000);
                    },
                    error: function (updateres, status) {
                        $("#userMainContent").html("Failed to update subscription! Please refresh the page. Contact support if the problem persists.");
                    }
                });
            });
        }
    });

    //Has pending changes
    if(selectedRow.children()[3].innerHTML == "Yes")
    {
        $.ajax({
            url: "/api/getMySubscriptionChanges",
            method: "post",
            data: {
                auth: id_token,
                token: id_token,
                subscriptionId: selectedRow.children()[0].innerHTML
            },
            dataType: "json",
            success: function (retres, retstatus) {
                $("#pendingChanges").css("opacity", "1");
                $("#pendingChanges").html("<hr><p>This plan has the following scheduled change and will take effect on the next " +
                    "renewed billing cycle.<br>" +
                    `<br><h6>Monthly Hours from ${selectedRow.children()[2].innerHTML} to ${retres.plan_quantity} starting on ${selectedRow.children()[5].innerHTML}</h6>` +
                    "<br>If you want to keep your current monthly hours,<br>please click <button id='CancelChangeButton' type='button' class='btn btn-default'>Cancel</button> to end your change request</span>.<br>" +
                    "<div id='cancelChange'></div>" +
                    "<br>Please know canceling your change request <span style='font-style:italic'>does not cancel your subscription</span>.<br>" +
                    "Your plan will resume its current monthly hours unless you submit another change request.<br>" +
                    "<br>If you wish to terminate your subscription, please contact Freedom Makers.</p>");

                $("#CancelChangeButton").on("click", function() {
                    $.ajax({
                        url: "/api/undoMySubscriptionChanges",
                        method: "post",
                        data: {
                            auth: id_token,
                            token: id_token,
                            subscriptionId: selectedRow.children()[0].innerHTML
                        },
                        dataType: "json",
                        success: function (undores, undostatus) {
                            $("#cancelChange").html("");
                            $("#cancelChange").append("<br><h5>Successfully canceled change request!</h5>");
                            setTimeout(function () {
                                showFunction(subscriptionFunctionality, "/api/getMySubscriptions");
                            }, 1000);
                        },
                        error: function (undores, undostatus) {
                            $("#userMainContent").html("Unable to cancel change request! Please refresh the page. Contact support if the problem persists.");
                        }
                    });
                });
            },
            error: function (retres, retstatus) {
                $("#userMainContent").html("Unable to retrieve changes! Please refresh the page. Contact support if the problem persists.");
            }
        });
    }
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
                    id: TEST_ENVIRONMENT ? TEST_CUSTOMER : tokenres.id
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
                                $("#userMainContent").html("Unable to find Freedom Makers! Please refresh the page. Contact support if the problem persists.");
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
                    $("#userMainContent").html("Unable to find relationships! Please refresh the page. Contact support if the problem persists.");
                }
            });
        },
        error: function (tokenres, tokenstatus) {
            $("#userMainContent").html("Your token isn't working! Please refresh the page. Contact support if the problem persists.");
        }
    });
}

//TimeSheet Methods
function timeSheetFunctionality () {
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
        '            <th scope="col">Clock In (GMT/UTC)</th>\n' +
        '            <th scope="col">Clock Out (GMT/UTC)</th>\n' +
        '            <th scope="col">Task</th>\n' +
        '        </thead><tbody>');
    //Populate table
    $("#buttonsTop").append('<span>Loading...   </span><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');

    $.ajax({
        method: "post",
        url: '/api/getMyTimeSheetsClient',
        data: {
            auth:  id_token,
            token: id_token
        },
        success: function (tokenres, tokenstatus) {
            tokenres.forEach(item => {
                $("#sheetsTable").append('\n' +
                    '<tr class="sheetsRow">' +
                    '   <td>' + item.id + '</td>' +
                    '   <td>' + item.makerId + '</td>'+
                    '   <td>' + item.makerName + '</td>'+
                    '   <td>' + item.hourlyRate + '</td>'+
                    '   <td>' + item.timeIn + '</td>'+
                    '   <td>' + item.timeOut + '</td>' +
                    '   <td>' + item.task + '</td>'
                );
            })

            //remove loading message/gif
            $("#buttonsTop").children()[0].remove();
            $("#buttonsTop").children()[0].remove();
            $(".spinner-border").remove();
        },
        error: function (tokenres, tokenstatus) {
            console.log(tokenres);
            console.log(tokenstatus);
            $("#userMainContent").html("TimeSheet: Failed to verify you! Please refresh the page. Contact support if the problem persists.");
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
            if (TEST_ENVIRONMENT) {
                onSignIn();
            }
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
        navMapper[e.target.id]();
        selectedTab = $(this)[0].id;
        SELECTED_NAV_MAP = $(this);
        NAV_MAP_TEXT = SELECTED_NAV_MAP.html();
        SELECTED_NAV_MAP.html(`${NAV_MAP_TEXT}  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`);
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