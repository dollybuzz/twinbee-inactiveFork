//id_token is retrieved from Google.js

//global variables
let selectedRow = null;
let selectedTab = null;
let selectedDropdown = null;
let TEST_ENVIRONMENT = false;

let navMapper = {
    main: function () {
        window.location.replace(`/login?token=${id_token}`);
    },

    manageCredits: function () {
        navItemChange("manageCredits");
        showFunction(timeBucketFunctionality, '/api/getAllMyTimeBuckets');
    },

    manageSubscriptions: function () {
        navItemChange("manageSubscriptions");
        showFunction(subscriptionFunctionality, "/api/getMySubscriptions");
    },

    manageMakers: function () {
        navItemChange("manageMakers");
        showFunction(makerFunctionality, "/api/getMyMakers");
    },

    reviewTimeSheets: function () {
        navItemChange("reviewTimeSheets");
        timeSheetFunctionality();
    }
};//end navMapper

function navItemChange(id) {
    let selectedNavMap = $(`#${id}`);
    let navItemText = selectedNavMap.html();
    selectedNavMap.html(`${navItemText}  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`);
    let parentToChange = selectedNavMap.parent().parent().parent().children()[0];

    $(".navItem").css('color', 'white')
        .css('font-style', 'normal');
    selectedNavMap.css("color", '#dbb459')
        .css("font-style", 'italic');
}

//Versatile Helper Functions
function createBody(button) {
    //top row
    $("#topRow").append('\n<div id="optionsClient"></div>');
    $("#optionsClient").hide();
    $("#optionsClient").css("width", "50%");
    if (button != null) {
        $("#buttonsTop").append("<span id='extraButtonSpan' style='float:right'></span><button id='DeleteButton' type='button' class='btn btn-default'>" + button + "</button>");
    }
    $("#buttonsTop").append("<button id='ExpandButton' type='button' class='btn btn-default'>></button>");
    $("#ExpandButton").hide();

    //dynamically append submit button in each form
}

function showBlock() {
    //show block after table stops moving
    $("#optionsClient").show();
    $("#ExpandButton").show();
    $("#SubmitButton").show();
    $("#optionsClient").css("width", "50%");
    setTimeout(function () {
        $("#optionsClient").css("opacity", "1");
        $("#SubmitButton").css("opacity", "1");
        $("#ExpandButton").css("opacity", "1")
    }, 500);
}

function minimizeTable() {
    $("#floor").css("transition", "width 0.5s ease-in-out");
    $("#floor").css("width", "50%");
    $("#floor").css("margin-left", "0");
    $("#floor").css("margin-right", "auto");
}

function expandTable() {
    $("#optionsClient").hide();
    $("#extraButtonSpan").html("");
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

}

function showFunction(functionality, endpoint) {
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
}

//Main Methods
function showMain(){
    //Contains any main tab functionality
    mainFunctionality();

};

function mainFunctionality () {
    //Shows Client any alerts
    setTimeout(function () {
        showAlerts();
    }, 1000);

    setTimeout(function() {
        $("#clientText1").html(`<h5>Hello, ${document.getElementById("googleUser").innerHTML.split(" ")[0]}!` +
            "<br>" +
            "We are so excited to introduce you to our new application.</h5><br>" +
            "<h6>This page is currently underway.<br><br>" +
            "Please navigate to 'Manage Available Hours' then to 'Update Payment Method' to get started!<br><br>" +
            "Please know you will see banner alerts if you have any existing invoices.<br>" +
            "Reach out to Freedom Makers if feel you have accrued an invoice in error.</h6>");
        $("#clientText1").css("opacity", "1");
    }, 1500);
};

function showAlerts() {
    $.ajax({
        url: "/api/getAllMyTimeBuckets",
        method: "post",
        data: {
            auth: id_token,
            token: id_token,
        },
        dataType: "json",
        success: function (bucketres, bucketstatus) {
            for(var plan in bucketres.buckets)
            {
                if(Number.parseInt(bucketres.buckets[plan]) <= 300 && Number.parseInt(bucketres.buckets[plan]) > 0)
                {
                    $("#clientAlerts").html("<div class='alert alert-warning alert-dismissable fade show' role='alert'>You are running low on available hours!<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
                        "<span aria-hidden='true'>&times;</span></button></div>");
                }
                else if(Number.parseInt(bucketres.buckets[plan]) <= 0)
                {
                    $("#clientAlerts").html("<div class='alert alert-danger alert-dismissable fade show' role='alert'>You have no hours!<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
                        "<span aria-hidden='true'>&times;</span></button></div>");
                }
            }
        },
        error: function (invoiceres, invoicestatus) {
            $("#userMainContent").html("Alerts are not working!");
        }
    });

    $.ajax({
        url: "/api/doIHaveInvoices",
        method: "post",
        data: {
            auth: id_token,
            token: id_token,
        },
        dataType: "json",
        success: function (invoiceres, invoicestatus) {
            if(invoiceres.invoicesPresent)
            {
                $("#clientAlerts").append(`<div class='alert alert-danger alert-dismissable fade show' role='alert'>You have ${invoiceres.numInvoices} outstanding invoice(s)!<button type='button' class='close' data-dismiss='alert' aria-label='Close'>` +
                    "<span aria-hidden='true'>&times;</span></button></div>");
            }
        },
        error: function (invoiceres, invoicestatus) {
            $("#userMainContent").html("Alerts are not working!");
        }
    });
}

//Google
onSignIn = function (googleUser) {
    GOOGLE_USER = googleUser;
    id_token = TEST_ENVIRONMENT ? null : googleUser.getAuthResponse().id_token;

    let profile = TEST_ENVIRONMENT ? null : googleUser.getBasicProfile();
    let name = TEST_ENVIRONMENT ? null : profile.getName();
    $("#googleUser").html(TEST_ENVIRONMENT ? "test" : name);

    showMain();
};


//Available Hours Methods
function openHostedPage(getPageEndpoint) {

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
function popBuyForm(form) { //not a versatile method
    minimizeTable();
    showBlock();
    form();
}

function timeBucketFunctionality(res) {
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
    for (var plan in res.buckets) {
        let hours = (Number.parseInt(res.buckets[plan]) / 60);
        let minutes = (Number.parseInt(res.buckets[plan])) % 60;
        let message = "";
        if (hours >= 0) {
            message += ` ${Math.floor(hours)} hours `;
        }
        if (hours <= -1) {
            hours = Math.abs(hours);
            message += `-${Math.floor(hours)} hours `;
        }
        if (minutes >= 0 || minutes < 0) {
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

function buyForm() {
    let rowData = selectedRow.children()[0].innerHTML;
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
            $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
            $("#SubmitButton").css("opacity", "1");

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
                if ($("#buyHours").val() == "" && $("#buyMin").val() == "") {
                    valid = false;
                    message += "Please enter an amount to purchase!<br>"
                }
                if ($("#buyHours").val().includes("-")) {
                    valid = false;
                    message += "Hours must be positive!<br>"
                }
                if ($("#buyHours").val().includes(".")) {
                    valid = false;
                    message += "No decimals in hours please!<br>";
                }

                if ($("#buyMin").val().includes("-")) {
                    valid = false;
                    message += "Minutes must be positive!<br>";
                }
                if ($("#buyMin").val().includes(".")) {
                    valid = false;
                    message += "No decimals in minutes please!<br>"
                }

                if (!valid) {
                    $("#verifyHourEntry").html(`<span style='color:red'>${message}</span>`);
                } else {

                    if ($("#buyHours").val() == "") {
                        $("#buyHours").val(0);
                    }
                    if ($("#buyMin").val() == "") {
                        $("#buyMin").val(0);
                    }
                    let numHours = Number.parseInt($("#buyHours").val());
                    let numMin = Number.parseInt($("#buyMin").val());
                    let timeInMinutes = numHours * 60 + numMin;
                    let planSelect = $("#buyPlan").val();

                    $("#optionsClient").html(`<h5>Are you sure you want to buy ${$("#buyHours").val()} hour(s) and ${$("#buyMin").val()} minute(s) for your plan ${$("#buyPlan").val()}?</h5><br>` +
                    `<h6>You will be immediately charged $${((timeInMinutes * (parseFloat(planres.price)/100))/60).toFixed(2)} upon successful purchase.</h6>`);
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
                    if (numHours > 0) {
                        message += `${numHours} hour(s) `;
                    }
                    if (numMin > 0) {
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
                                numHours: timeInMinutes / 60
                            },
                            dataType: "json",
                            success: function (res, status) {
                                $("#optionsClient").html("<br><h5>Successfully purchased " + message + " for Plan " + planSelect + "!</h5>" +
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
function prePopModForm(endpoint, modForm) { //not a versatile method
    minimizeTable();
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
    showBlock();
}

function subscriptionFunctionality(res) {
    //Create table
    $("#userMainContent").html(
        "<div id=\"buttonsTop\"><span id='extraButtonSpan' style='float:right'></span></div>\n" +
        "<div class='row' id='topRow'>\n" +
        "<div id=\"floor\">\n" +
        "    <table id=\"subscriptionTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div></div>");
    $("#subscriptionTable").append('\n' +
        '        <thead class="thead">\n' +
        '            <th scope="col" style="width:260px">Subscription ID</th>\n' +
        '            <th scope="col">Plan</th>\n' +
        '            <th scope="col">Monthly Hours</th>\n' +
        '            <th scope="col">Pending Changes</th>\n' +
        '            <th scope="col">Cancelled</th>\n' +
        '            <th scope="col">Next Billing</th>\n' +
        '            <th scope="col">Next Charge</th>\n' +
        '            <th scope="col" id="subOptions">Option</th>\n' +
        '        </thead><tbody>');

    //Populate table
    let i = 1;
    for (let item of res) {
        let subscription = item.subscription;
        item = item.subscription;
        let scheduled = subscription.has_scheduled_changes;
        let changes = "";
        (scheduled ? changes = "Yes" : changes = "No");
        let now = moment();
        let cancelled = moment.unix(item.cancelled_at);
        let difference = now.diff(cancelled, 'days');

        if (item && !subscription.deleted) {
            //Get new plan quantity to update subscription Price on table
            if (subscription.has_scheduled_changes) {
                $.ajax({
                    url: "/api/getMySubscriptionChanges",
                    method: "post",
                    data: {
                        auth: id_token,
                        token: id_token,
                        subscriptionId: subscription.id
                    },
                    dataType: "json",
                    success: function (changeres, changestatus) {
                        $("#subscriptionTable").append('\n' +
                            `<tr id="${'ajaxSubscriptionRow'+ (++i)}">` +
                            '   <td>' + subscription.id + '</td>' +
                            '   <td>' + subscription.plan_id + '</td>' +
                            '   <td>' + subscription.plan_quantity + '</td>' +
                            '   <td>' + changes + '</td>' +
                            '   <td>' + (subscription.cancelled_at == undefined ? "No" : moment.unix(subscription.cancelled_at).format('YYYY/MM/DD')) + '</td>' +
                            '   <td>' + (subscription.next_billing_at == undefined ? (subscription.pause_date ? "Paused":"Terminated") : moment.unix(subscription.next_billing_at).format('YYYY/MM/DD')) + '</td>' +
                            `   <td>$${(changeres.plan_quantity * (changeres.plan_unit_price / 100)).toFixed(2)}</td>` +
                            '   <td><button type="button" class="btn btn-select btn-circle btn-xl" id="ChangeSubButton">Change</button></td></tr>');

                        $(`#${'ajaxSubscriptionRow'+ (i)}`).click(function () {
                            selectedRow = $(this);
                            prePopModForm("/api/retrieveMySubscription", subscriptionModForm);
                        });
                    },
                    error: function (changeres, changestatus) {
                        $("#userMainContent").html("Could not calculate next charge for changed subscription!");
                    }
                });
            } else if (subscription.status != "cancelled") {
                $("#subscriptionTable").append('\n' +
                    '<tr class="subscriptionRow">' +
                    '   <td>' + subscription.id + '</td>' +
                    '   <td>' + subscription.plan_id + '</td>' +
                    '   <td>' + subscription.plan_quantity + '</td>' +
                    '   <td>' + changes + '</td>' +
                    '   <td>' + (subscription.cancelled_at == undefined ? "No" : moment.unix(subscription.cancelled_at).format('YYYY/MM/DD')) + '</td>' +
                    '   <td>' + (subscription.next_billing_at == undefined ? (subscription.pause_date ? "Paused":"Terminated") : moment.unix(subscription.next_billing_at).format('YYYY/MM/DD')) + '</td>' +
                    `   <td>$${(subscription.plan_quantity * (subscription.plan_unit_price / 100)).toFixed(2)}</td>` +
                    '   <td><button type="button" class="btn btn-select btn-circle btn-xl" id="ChangeSubButton">Change</button></td></tr>');
            }
            else if (difference < 10){
                $("#subscriptionTable").append('\n' +
                    '<tr class="subscriptionRow">' +
                    '   <td>' + subscription.id + '</td>' +
                    '   <td>' + subscription.plan_id + '</td>' +
                    '   <td>' + subscription.plan_quantity + '</td>' +
                    '   <td>' + changes + '</td>' +
                    '   <td>' + (subscription.cancelled_at == undefined ? "No" : moment.unix(subscription.cancelled_at).format('YYYY/MM/DD')) + '</td>' +
                    '   <td>' + (subscription.next_billing_at == undefined ? "Terminated" : moment.unix(subscription.next_billing_at).format('YYYY/MM/DD')) + '</td>' +
                    '   <td>' + "Terminated" + '</td>' +
                    '   <td><button type="button" class="btn btn-select btn-circle btn-xl" id="ChangeSubButton">Change</button></td></tr>');
            }
        }
    };
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

function pauseSubscription(id){
    $.ajax({
        url: "/api/pauseMySubscription",
        method: "post",
        data: {
            auth: id_token,
            token: id_token,
            subscriptionId: id
        },
        dataType: "json",
        success: function (res, status) {
            $("#pauseResumeSubscription").off("click");
            $("#pauseResumeSubscription").on("click", function () {
                $("#pauseResumeSubscription").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
                undoPause(id);
            }).html("Resume");
            $(".spinner-border").remove();
        },
        error: function (res, status) {
            $("#pauseResumeSubscription").off("click");
            $("#pauseResumeSubscription").on("click", function () {
                $("#pauseResumeSubscription").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
                pauseSubscription(id);
            }).html("Pause");
            $(".spinner-border").remove();
        }
    });
}

function undoPause(id){
    $.ajax({
        url: "/api/undoMyPause",
        method: "post",
        data: {
            auth: id_token,
            token: id_token,
            subscriptionId: id
        },
        dataType: "json",
        success: function (res, status) {
            $("#pauseResumeSubscription").off("click");
            $("#pauseResumeSubscription").on("click", function () {
                $("#pauseResumeSubscription").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
                pauseSubscription(id);
            }).html("Pause");
            $(".spinner-border").remove();
        },
        error: function (res, status) {
            $("#pauseResumeSubscription").off("click");
            $("#pauseResumeSubscription").on("click", function () {
                $("#pauseResumeSubscription").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
                undoPause(id);
            }).html("Resume");
            $(".spinner-border").remove();
        }
    });
}

function resumeSubscription(id){
    $.ajax({
        url: "/api/resumeMyPausedSubscription",
        method: "post",
        data: {
            auth: id_token,
            token: id_token,
            subscriptionId: id
        },
        dataType: "json",
        success: function (res, status) {
            $("#pauseResumeSubscription").off("click");
            $("#pauseResumeSubscription").on("click", function () {
                $("#pauseResumeSubscription").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
                pauseSubscription(id);
            }).html("Pause");
            $(".spinner-border").remove();
        },
        error: function (res, status) {
            $("#pauseResumeSubscription").off("click");
            $("#pauseResumeSubscription").on("click", function () {
                $("#pauseResumeSubscription").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
                resumeSubscription(id);
            }).html("Resume");
            $(".spinner-border").remove();
        }
    });
}

function subscriptionModForm(res, status) {
    if (res.status === "active" && !res.has_scheduled_changes) {
        $("#extraButtonSpan").html(`<button id="pauseResumeSubscription" class="btn btn-default" style="float:right">${res.pause_date || res.status === "paused" ? "Resume" : "Pause"}</button>`);
        $("#pauseResumeSubscription").off("click");
        $("#pauseResumeSubscription").on("click", function () {
            $("#pauseResumeSubscription").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
            let functionToCall = (res.pause_date || res.status === "paused" ? (res.status === "paused" ? resumeSubscription : undoPause) : pauseSubscription);
            functionToCall(res.id);
        })
    }
    else{
        $("#extraButtonSpan").html("");
    }

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
        "</form><br><div><span id='errormessage' style='color:red'></span></div>");

    $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#SubmitButton").css("opacity", "1");

    $("#optionsClient").append("<div id='pendingChanges'></div>");

    if(selectedRow.children()[5].innerHTML == "Terminated")
    {
        $("#pendingChanges").html("");
        $("#pendingChanges").html("<br><hr><h5>You cannot modify a terminated subscription.</h5><p>Please contact Freedom Makers to create a new subscription.</p>");
        setTimeout(function () {
            $("#SubmitButton").hide();
            $("#pendingChanges").css("opacity", "1");
        }, 500);
    }


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
                        $("#optionsClient").html("<br><h5>Successfully updated monthly hours for Subscription " + `${updateres.id}` + "!</h5>");
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
    if (selectedRow.children()[3].innerHTML == "Yes") {
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
                $("#pendingChanges").html("<br><hr><p>This plan has the following scheduled change and will take effect on the next " +
                    "renewed billing cycle.<br>" +
                    `<h5>Monthly Hours from ${selectedRow.children()[2].innerHTML} to ${retres.plan_quantity} starting on ${selectedRow.children()[5].innerHTML}</h5>` +
                    "If you want to keep your current monthly hours,<br>please click <button id='CancelChangeButton' type='button' class='btn btn-default'>Cancel</button> to end your change request</span>.<br>" +
                    "Please know canceling your change request <span style='font-style:italic'>does not cancel your subscription</span>.<br>" +
                    "Your plan will resume its current monthly hours unless you submit another change request.<br>" +
                    "If you wish to terminate your subscription, please contact Freedom Makers.</p>" +
                    "<div id='cancelChange'></div>");

                $("#CancelChangeButton").on("click", function () {
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
                            $("#cancelChange").append("<h5>Successfully cancelled change request!</h5>");
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
function makerFunctionality(res) {

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
    //Populate table
    for (var item of res) {
        $("#makerTable").append('\n' +
            '<tr class="makerRow">' +
            '   <td>' + item.maker.id + '</td>' +
            '   <td>' + item.maker.firstName + " " + item.maker.lastName + '</td>' +
            '   <td>' + item.maker.email + '</td>' +
            '   <td>' + item.occupation + '</td></tr>'
        );
    }
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
}

//TimeSheet Methods
function timeSheetFunctionality() {
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
        '            <th scope="col">Freedom Maker</th>\n' +
        '            <th scope="col">Freedom Maker ID</th>\n' +
        '            <th scope="col">Plan</th>\n' +
        '            <th scope="col">Clock In (PST/PDT)</th>\n' +
        '            <th scope="col">Clock Out (PST/PDT)</th>\n' +
        '            <th scope="col">Task</th>\n' +
        '        </thead><tbody>');
    //Populate table
    $.ajax({
        method: "post",
        url: '/api/getMyTimeSheetsClient',
        data: {
            auth: id_token,
            token: id_token
        },
        success: function (tokenres, tokenstatus) {
            tokenres.forEach(item => {
                $("#sheetsTable").append('\n' +
                    '<tr class="sheetsRow">' +
                    '   <td>' + item.id + '</td>' +
                    '   <td>' + item.makerName + '</td>' +
                    '   <td>' + item.makerId + '</td>' +
                    '   <td>' + item.planId + '</td>' +
                    '   <td>' + item.timeIn + '</td>' +
                    '   <td>' + item.timeOut + '</td>' +
                    '   <td>' + item.task + '</td>'
                );
            })
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

//User Action Methods
//Manage my Account
//---Should have options to update their information and update payment method
//Temporarily, these functions are in updateThreshold to fill the page

//Settings
//---Will eventually have a second interface to propose other options
function showSettings() {

    updateThreshold();
}

//Settings sub-options
function updateThreshold() {
    selectedTab = null;
    navItemChange();
    $("#userMainContent").html("");
    $("#userMainContent").html("<div id=tempSettings></div>");
}

$(document).ready(function () {
    /*$.ajax({
        url: "/api/getEnvironment",
        method: "get",
        dataType: "json",
        success: function (res, status) {
            TEST_ENVIRONMENT = res;
            if (TEST_ENVIRONMENT) {
                onSignIn();
            }
        },
        error: function (clientres, clientstatus) {
            TEST_ENVIRONMENT = true;
            onSignIn();
        }
    });*/

    //Report a technical problem
    $("#technicalReport").on('click', function () {
        $("textarea").val("");
        $("#successSent").html("");
        $("#SubmitIssue").on('click', function() {
            if(!$("textarea").val())
            {
                $("#verifySuccess").html("<p id='successSent' style='color:red !important; width: 310px; margin-bottom: -2px'>Invalid request!</p>");
            }
            else {
                $("#verifySuccess").html("<span style='color:#32444e' class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>");
                $.ajax({
                    url: "/api/technicalHelp",
                    method: "post",
                    data: {
                        auth: id_token,
                        token: id_token,
                        message: $("textarea").val()
                    },
                    dataType: "json",
                    success: function (helpres, helpstatus) {
                        $("#verifySuccess").html("<p id='successSent' style='color:#32444e !important; width: 310px; margin-bottom: -2px'>Request sent!</p>");
                        $("#SubmitIssue").off('click');
                    },
                    error: function (helpres, helpstatus) {
                        $("#verifySuccess").html("<p id='successSent' style='color:red !important; width: 310px; margin-bottom: -2px'>Could not send help ticket!</p>");
                    }
                });
            }
        });
    });

    //Adding logout Button
    $("#logout").append("<button id='logoutButton' type='button' class='btn btn-default'>Log Out</button>");
    $("#logoutButton").click(signOut);

    //Event Listeners for other nav menu items
    $(".navItem").click(function (e) {
        navMapper[e.target.id]();
        selectedTab = $(this)[0].id;
        selectedDropdown = null;
        let parentToChange = $(this).parent().parent().parent().children()[0];
        if (parentToChange.classList[0] && parentToChange.classList[0].toString() === "navItem") {
            selectedDropdown = parentToChange.id;
            $(`#${parentToChange.id}`).append("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>")
        }
        if (selectedDropdown) {
            $(`#${selectedDropdown}`).css("color", '#dbb459')
                .css("font-style", 'italic');
        }
    });

    $(".navItem").hover(function () {
        $(this).css("color", '#dbb459');
        $(this).css("font-style", 'italic');
    });

    $(".navItem").on("mouseleave", function () {
        if (selectedTab != $(this)[0].id) {
            $(this).css("color", 'white');
            $(this).css("font-style", 'normal');
        }
    });

    //Hover simulation on drop down
    $("#userAction").mouseenter(function(){$("#userAction").click()});
    $("#userOptions").mouseleave(function(){
        $("#welcome").removeClass("show");
        $("#userAction").attr("aria-expanded", "false");
        $(".dropdown-menu").removeClass("show");
    });

    //User Actions in drop down
    $("#settings").on('click', function() {
        showSettings();
    });

});//end document ready