require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');

let selectedTab = null;
let TEST_ENVIRONMENT = false;
let NAV_MAP_TEXT = "";
let SELECTED_NAV_MAP = null;
let navMapper = {
    main: function () {
        location.reload();
    },

    timeclock: function () {
        timeClockFunctionality();
    },

    previousHours: function () {
        showFunction(timeSheetFunctionality, "/api/getMyTimeSheetsMaker");
    },

    manageClients: function () {
        showFunction(clientFunctionality, "/api/getMyClients");
    },
};//end navMapper

//Versatile Functions
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
            $("#userMainContent").html("Something went wrong! Please refresh the page. Contact support if the problem persists.");
        }
    });
}// end showFunction

function createBody() {
    //top row
    $("#topRow").append('\n<div id="optionsClient"></div>');
    $("#optionsClient").hide();
    $("#optionsClient").css("width", "50%");
    //bottom row
    $("#userMainContent").append('\n<div class="row" id="bottomRow"></div>');
    $("#userMainContent").append('<div id="buttonsBottom"></div>');
    $("#buttonsBottom").hide();
};

//Time Clock Methods
function timeClockFunctionality() {
    //Create page
    $("#userMainContent").html(
        "<div class=\"block\">\n" +
        "            <div id=\"empty\"></div>\n" +
        "            <div id=\"clientRole\"><br><h6>Please select your Client<br>and Role:</h6><br></div>\n" +
        "            <div><br><select class=\"form-control\" id=\"makerSelectedClient\"></select></div>\n" +
        "            <div id=\"clientCredit\"><br><h6>Client's available credit:</h6><span id=\"availcredit\"></span></div>\n" +
        "            <div id=\"makerText1\"></div>\n" +
        "            <div id=\"empty\"></div>\n" +
        "            <div id=\"empty\"></div>\n" +
        "            <div id=\"empty\"></div>\n" +
        "            <div id=\"empty\"></div>\n" +
        "            <div id=\"taskBlock\"><br><h6>Please enter in a task:</h6></div>\n" +
        "            <div><br><input class=\"form-control\" type=\"text\" id=\"taskEntry\" name=\"taskEntry\"></div>\n" +
        "        </div>\n" +
        "        <div id='clockPrompt'></div>\n" +
        "        <br>\n" +
        "    <div class=\"row\" id=\"makerBottomRow\">\n" +
        "        <div id=\"empty\"></div>\n" +
        "        <div id=\"clockButton\"><button type=\"button\" class=\"btn btn-select btn-circle btn-xl\" id=\"makerClock\">Clock In</button></div>\n" +
        "        <div id=\"empty\"></div>\n" +
        "        <div id=\"empty\"></div>\n" +
        "        <div id=\"makerText2\"></div>\n" +
        "    </div>"
    );

    //Populating drop down selection
    $.ajax({
        url: "/api/getAllMyRelationshipsMaker",
        method: "post",
        data: {
            auth: id_token,
            token: id_token
        },
        dataType: "json",
        success: function (relres, status) {
            $("#makerSelectedClient").html("");
            for (var i = 0; i < relres.length; ++i) {
                if(relres[i].company == 'No Company'){
                    $("#makerSelectedClient").append(
                        `<option id=${relres[i].id} value=${relres[i].id}>${relres[i].clientName + " - " + relres[i].occupation}</option>`);
                }
                else {
                    $("#makerSelectedClient").append(
                        `<option id=${relres[i].id} value=${relres[i].id}>${relres[i].clientName + " - " + relres[i].company + " - " + relres[i].occupation}</option>`);
                }

                if (i == relres.length - 1) {
                    //Getting available credits by client selected
                    availableCredits();
                }
            }
            $(".spinner-border").remove();
        },
        error: function (relres, status) {
            $("#UserMainContent").html("Unable to grab relationships! Please refresh the page. Contact support if the problem persists.");
        }
    });

    //Getting timesheets to manage user navigation away
    $.ajax({
        url: "/api/getMyTimeSheetsMaker",
        method: "post",
        data: {
            auth: id_token,
            token: id_token
        },
        dataType: "json",
        //Managing user navigation away
        success: function (innerRes, innerStatus) {
            var clockedOut = true;
            for (var i = 0; i < innerRes.length; ++i) {
                let sheet = innerRes[i];
                if (sheet.timeOut[0] === "0" && sheet.timeIn[0] !== "0") {
                    clockedOut = false;
                    $("#taskBlock").css("opacity", "0");
                    $("#taskEntry").css("opacity", "0");
                    $("#clientRole").css("opacity", "0");
                    $("#clockPrompt").css("opacity", "1");
                    $("#makerSelectedClient").css("opacity", "0");
                    $("#clientCredit").css("opacity", "0");
                    $("#availcredit").css("opacity", "0");
                    $("#clockPrompt").html("<h5>Time is still running . . .</h5>");

                    setTimeout(function () {
                        $("#taskBlock").hide();
                        $(
                            "#taskEntry").hide();
                        $("#clientRole").hide();
                        $("#availcredit").hide();
                        $("#makerSelectedClient").hide();
                    }, 1500)
                } else if (sheet.timeOut[0] !== "0" && sheet.timeIn[0] !== "0") {
                    $("#taskBlock").css("opacity", "1");
                    $("#taskEntry").css("opacity", "1");
                    $("#clientRole").css("opacity", "1");
                    $("#availcredit").css("opacity", "1");
                    $("#clientCredit").css("opacity", "1");
                    $("#makerSelectedClient").css("opacity", "1");
                }
            }
            if (clockedOut) {
                setClockInFunctionality();
            } else {
                setClockOutFunctionality();
            }
        },
        error: function (innerRes, innerStatus) {
            $("#userMainContent").html("Something went wrong! Please refresh the page. Contact support if the problem persists.");
        }
    });
}

function setClockInFunctionality() {
    $("#makerClock").off("click");
    $("#makerClock").css("background-color", "#dbb459");
    $("#makerClock").text("Clock In");
    $("#makerClock").on('mouseenter', function () {
        $("#makerClock").css("background-color", "#32444e");
    });
    $("#makerClock").on('mouseleave', function () {
        $("#makerClock").css("background-color", "#dbb459");
    });

    $("#makerSelectedClient").on('change', function () {
        availableCredits();
    });

    $("#makerClock").on('click', function () {
        $("#makerClock").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>')
        $.ajax({
            url: "api/clockIn",
            method: "post",
            data: {
                auth: id_token,
                relationshipId: $("#makerSelectedClient").val(),
                task: $("#taskEntry").val()
            },
            dataType: "json",
            success: function (clockres, status) {
                if (clockres) {
                    setClockOutFunctionality();
                    $("#makerText2").html("<br><h5>Successfully clocked in!</h5>");
                    $("#makerText2").css("opacity", "1");


                    $("#clockPrompt").html("<div id='runningTime'></div>");
                    runningTime(moment().valueOf());
                    $("#clockPrompt").css("opacity", "1");

                    setTimeout(function () {
                        $("#makerText2").css("opacity", "0");
                    }, 1000);

                    setTimeout(function () {
                        $("#makerText2").html("");
                    }, 2000);

                } else {
                    $("#makerText2").html("<br><h5>Could not clock in!</h5>");
                }
            },
            error: function (clockres, status) {
                $("#makerClock").html('Clock In');
                $("#userMainContent").html("Clock not working! Please refresh the page. Contact support if the problem persists.");
            }
        });

    });
}

function setClockOutFunctionality() {
    $("#clientRole").css("opacity", "0");
    $("#makerSelectedClient").css("opacity", "0");
    $("#clockPrompt").css("opacity", "1");
    $("#clientCredit").css("opacity", "0");
    $("#availcredit").css("opacity", "0");
    $("#taskBlock").css("opacity", "0");
    $("#taskEntry").css("opacity", "0");

    setTimeout(function () {
        $("#makerSelectedClient").hide();
        $("#clientRole").hide();
        $("#clientCredit").hide();
        $("#availcredit").hide();
        $("#taskBlock").hide();
        $("#taskEntry").hide();
    }, 1500);

    $("#makerClock").off("click");
    $("#makerClock").css("background-color", "#32444e");
    $("#makerClock").text("Clock Out");
    $("#makerClock").on('mouseenter', function () {
        $("#makerClock").css("background-color", "#dbb459");
    });
    $("#makerClock").on('mouseleave', function () {
        $("#makerClock").css("background-color", "#32444e");
    });
    $("#makerClock").on('click', function () {
        $("#makerClock").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>')
        $.ajax({
            url: TEST_ENVIRONMENT ? '/api/getAllMakers' : '/api/getMakerIdByToken',
            method: "post",
            data: {
                auth: id_token,
                token: id_token,
            },
            dataType: "json",
            success: function (tokenres, status) {
                $.ajax({
                    url: "api/clockOut",
                    method: "post",
                    data: {
                        auth: id_token
                    },
                    dataType: "json",
                    success: function (clockres, status) {
                        if (clockres) {
                            setClockInFunctionality();
                            $("#clockPrompt").css("opacity", "0");
                            $("#makerText2").html("<br><h5>Successfully clocked out!</h5>");
                            $("#makerText2").css("opacity", "1");
                            $("#clientRole").css("opacity", "1");
                            $("#makerSelectedClient").css("opacity", "1");
                            $("#clientCredit").css("opacity", "1");
                            $("#availcredit").css("opacity", "1");
                            $("#taskBlock").css("opacity", "1");
                            $("#taskEntry").css("opacity", "1");
                            $("#taskEntry").val("");
                            $("#taskBlock").show();
                            $("#taskEntry").show();
                            $("#clientCredit").show();
                            $("#clientRole").show();
                            $("#availcredit").show();
                            $("#makerSelectedClient").show();

                            setTimeout(function () {
                                $("#makerText2").css("opacity", "0");
                            }, 1000);

                            setTimeout(function () {
                                $("#makerText2").html("");
                                $("#clockPrompt").html("");
                            }, 2000);
                        } else {
                            $("#clockPrompt").html("<br><h5>An error occurred! Please refresh and check your time sheet.</h5>");
                        }
                    },
                    error: function (clockres, status) {
                        $("#makerClock").html('Clock Out');
                        $("#userMainContent").html("Clock not working! Please refresh the page. Contact support if the problem persists.");
                    }
                });
            },
            error: function (tokenres, status) {
                $("#makerClock").html('Clock Out')
                $("#userMainContent").html("Clock not working! Please refresh the page. Contact support if the problem persists.");
            }
        });
    });
};

function availableCredits() {
    $.ajax({
        url: "/api/getMyRelationshipBucket",
        method: "post",
        data: {
            auth: id_token,
            token: id_token,
            relationshipId: $("#makerSelectedClient").val()
        },
        dataType: "json",
        success: function (bucketres, bucketstatus) {
            let hours = ((bucketres.minutes) / 60);
            let minutes = (bucketres.minutes) % 60;
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
            $("#availcredit").html(message);
        },
        error: function (bucketres, bucketstatus) {
            $("#userMainContent").html("Unable to grab client time buckets! Please refresh the page. Contact support if the problem persists.");
        }
    });
}

function runningTime(timeIn) {
    let currentTime;

    //Checking time zone to calculate time according to PST/PDT
    if (moment().isDST()){
        currentTime = moment().utcOffset("-08:00").format('YYYY-MM-DD HH:mm:ss');
        timeIn = moment(timeIn).utcOffset("-08:00").format('YYYY-MM-DD HH:mm:ss');
    }
    else {
        currentTime = moment().utcOffset("-07:00").format('YYYY-MM-DD HH:mm:ss');
        timeIn = moment(timeIn).utcOffset("-07:00").format('YYYY-MM-DD HH:mm:ss');
    }

    $("#runningTime").html(`<h5>${currentTime} ${timeIn}</h5>`);


}

//Previous Hours Methods
function timeSheetFunctionality(res) {

    //Create table
    $("#userMainContent").html(
        "<div class='reportOptionsMaker'></div>" +
        "<div id=\"buttonsTop\"></div>\n" +
        "<div class='row' id='topRow'>\n" +
        "<div id=\"floor\">\n" +
        "    <table id=\"sheetsTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div></div>");
    //Report Buttons
    $(".reportOptionsMaker").append("<div id='empty'></div>");
    $(".reportOptionsMaker").append("<div><label for='startDate'>Start Date:</label><input class='form-control' type='date' id='startDate' name='startDate'></div>");
    $(".reportOptionsMaker").append("<div><label for='endDate'>End Date:</label><input class='form-control' type='date' id='endDate' name='endDate'></div>");
    $(".reportOptionsMaker").append("<div><label for='client'>Client:</label><input class='form-control' type='text' id='clientRepSearch' name='clientRepSearch'><select class='form-control' id='clientReport'>\n</select></div>");
    $(".reportOptionsMaker").append("<button type='button' class='btn btn-select btn-circle btn-xl' id='runReportButton'>Run Report</button>");
    $(".reportOptionsMaker").append("<div id='empty'></div>");
    //Populate table but do not show
    $("#sheetsTable").append('\n' +
        '        <thead class="thead">\n' +
        '            <th scope="col">Timesheet ID</th>\n' +
        '            <th scope="col">Client</th>\n' +
        '            <th scope="col">Company</th>\n' +
        '            <th scope="col">Clock In (PST/PDT)</th>\n' +
        '            <th scope="col">Clock Out (PST/PDT)</th>\n' +
        '            <th scope="col">Task</th>\n' +
        '            <th scope="col">Shift Duration</th>\n' +
        '        </thead><tbody id="reportContent">' +
        '</tbody>');
    //Pre-populate Report drop down options
    $("#clientRepSearch").on("change", function () {
        $.ajax({
            url: "/api/getMyClients",
            method: "post",
            data: {
                auth: id_token,
                token: id_token
            },
            dataType: "json",
            success: function (clientres, clientstatus) {
                $("#clientReport").html("");
                for (var i = 0; i < clientres.length; ++i) {
                    let clientName = clientres[i].first_name + " " + clientres[i].last_name;
                    if (clientName.toLowerCase().includes($("#clientRepSearch").val().toLowerCase()) && $("#clientRepSearch").val() != "") {
                        $('#clientReport').append(
                            `<option id="${clientres[i].id}" value="${clientres[i].id}">${clientres[i].first_name} ${clientres[i].last_name} - ${clientres[i].company}</option>`
                        )
                    }
                }
            },
            error: function (clientres, clientstatus) {
                $("#userMainContent").html("Could not get clients for drop down!");
            }
        });
    });

    //Event Listeners
    //Run Report
    $("#runReportButton").on('click', function () {
        $("#reportTable").css("opacity", "1");
        $("#reportContent").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
        $.ajax({
            url: "/api/getMakerTimeReport",
            method: "post",
            data: {
                auth: id_token,
                token: id_token,
                clientId: $("#clientReport").val(),
                start: $("#startDate").val(),
                end: $("#endDate").val()
            },
            dataType: "json",
            success: function (timeres, timestatus) {
                $("#reportContent").html("");
                for (var item of timeres.sheets) {
                    let hours = item.duration / 60;
                    let minutes = item.duration % 60;
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
                    $("#reportContent").append('\n' +
                        '<tr class="sheetsRow">' +
                        '   <td scope="row">' + item.id + '</td>' +
                        '   <td>' + item.clientName + '</td>' +
                        '   <td>' + (item.company || 'No Company') + '</td>' +
                        '   <td>' + item.timeIn + '</td>' +
                        '   <td>' + item.timeOut + '</td>' +
                        '   <td>' + item.task + '</td>' +
                        `   <td> ${message}</td></tr>`);
                }
                let totalhours = Number.parseInt(timeres.total) / 60;
                let totalminutes = Number.parseInt(timeres.total) % 60;
                let totalmessage = "";
                if (totalhours >= 0) {
                    totalmessage += ` ${Math.floor(totalhours)} hours `;
                }
                if (totalhours <= -1) {
                    totalhours = Math.abs(totalhours);
                    totalmessage += `-${Math.floor(totalhours)} hours `;
                }
                if (totalminutes >= 0 || totalminutes < 0) {
                    totalmessage += ` ${totalminutes} minutes `;
                }

                $("#reportContent").append('<tfoot><th id="repTotal">Total Time:</th>' +
                    '<td>' + totalmessage + '</td></tfoot>');
            },
            error: function (timeres, timestatus) {
                $("#userMainContent").html("Run Reports isn't working!");
            }
        });
    });

    //Event Listeners
    //Row effect
    $(".sheetRow").mouseenter(function () {
        $(this).css('transition', 'background-color 0.5s ease');
        $(this).css('background-color', '#e8ecef');
    }).mouseleave(function () {
        $(this).css('background-color', 'white');
    });
}

//Client Methods
function clientFunctionality(res) {
    //Create table
    $("#userMainContent").html(
        "<div id=\"buttonsTop\"></div>\n" +
        "<div class='row' id='topRow'>\n" +
        "<div id=\"floor\">\n" +
        "    <table id=\"clientTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div></div>");
    $("#clientTable").append('\n' +
        '        <thead class="thead">\n' +
        '            <th scope="col">Client</th>\n' +
        '            <th scope="col">Company</th>\n' +
        '            <th scope="col">Phone</th>\n' +
        '            <th scope="col">Email</th>\n' +
        '        </thead><tbody>');
    //Populate table
    res.forEach(item => {
        if (!item.deleted) {
            $("#clientTable").append('\n' +
                '<tr class="clientRow">' +
                '   <td>' + `${item.first_name} ${item.last_name}` + '</td>' +
                '   <td>' + item.company + '</td>' +
                '   <td>' + item.phone + '</td>' +
                '   <td>' + item.email + '</td></tr>'
            );
        }
        ;
    });
    $("#clientTable").append('\n</tbody>');

    //Body Block content
    createBody();

    //Event Listeners
    //Expand Table Button
    $("#ExpandButton").click(function () {
        expandTable();
    });

    //Row effect
    $(".clientRow").mouseenter(function () {
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
    })

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

    $("#makerSelectedClient").append("<option>Loading...</option>");

    //shifts the logo
    $("#landingLogo").css("width", "20%");
});//end document ready