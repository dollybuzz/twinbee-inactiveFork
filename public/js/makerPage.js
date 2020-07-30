//id_token is retrieved from Google.js

let selectedTab = null;
let selectedDropdown = null;
let TEST_ENVIRONMENT = false;
let TIME_SHOULD_RUN = false;
let taskValue = "";

let navMapper = {
    main: function () {
        window.location.replace(`/login?token=${id_token}`);
    },

    timeclock: function () {
        navItemChange("timeclock");
        timeClockFunctionality();
    },

    previousHours: function () {
        navItemChange("previousHours");
        showFunction(timeSheetFunctionality, "/api/getMyTimeSheetsMaker");
    },

    manageClients: function () {
        navItemChange("manageClients");
        showFunction(clientFunctionality, "/api/getMyClients");
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

//Main Methods
function showMain() {
    //Contains any main tab functionality
    navItemChange("main");
    $("#makerText1").html(`<h5>Hello, ${document.getElementById("googleUser").innerHTML.split(" ")[0]}!` +
        "<br>" +
        "We are so excited to introduce you to our new application.</h5><br>" +
        "<h6>This page is currently underway.<br><br>" +
        "Please navigate to 'Time Clock' to get started!<br><br>" +
        "Please know your client relationship may not be set up yet.<br>" +
        "Reach out to Freedom Makers if your client is not showing and wait for further instruction.</h6>");
    $("#makerText1").css("opacity", "1");
    $(".spinner-border").remove();
};

//Google
onSignIn = function (googleUser) {
    GOOGLE_USER = googleUser;
    id_token = TEST_ENVIRONMENT ? null : googleUser.getAuthResponse().id_token;

    let profile = TEST_ENVIRONMENT ? null : googleUser.getBasicProfile();
    let name = TEST_ENVIRONMENT ? null : profile.getName();
    $("#googleUser").html(TEST_ENVIRONMENT ? "test" : name);

    showMain();
};


//Time Clock Methods
function timeClockFunctionality() {
    //Create page
    $("#userMainContent").html(
        "<div id='otgRow'>" +
        "            <div id=\"empty\"></div>\n" +
        "            <div><button type='button 'class='btn btn-select btn-circle btn-xl' id='otgButton'>On-the-Go</button><h5 id='workingMessage'></h5></div>\n" +
        "            <div id=\"empty\"></div>\n" +
        "</div>\n" +
        "<div class=\"clockBlock\">\n" +
        "            <div id=\"empty\"></div>\n" +
        "            <div id=\"clientRole\"><h6>Please select your Client and Role:</h6></div>\n" +
        "            <div id='selectClientRole'><select class=\"form-control\" id=\"makerSelectedClient\"></select></div>\n" +
        "            <div id=\"clientCredit\"><h6>Client's available credit:</h6><span id=\"availcredit\"></span></div>\n" +
        "            <div id=\"empty\"></div>\n" +
        "            <div id=\"taskBlock\"><h6>Please enter in a task:</h6></div>\n" +
        `            <div><input class=\"form-control\" type=\"text\" id=\"taskEntry\" name=\"taskEntry\"></div>\n` +
        "            <div id=\"empty\"></div>\n" +
        "            <div id=\"empty\"></div>\n" +
        "            <div id=\"otgBlock\"></div>\n" +
        "            <div id='otgTime'></div>\n" +
        "        </div>\n" +
        "    <div class=\"clockRow\" id=\"makerBottomRow\">\n" +
        "        <div id=\"empty\"></div>\n" +
        "        <div id='clockPrompt'><div id='runningTime'></div></div>\n" +
        "        <div id=\"empty\"></div>\n" +
        "        <div id=\"empty\"></div>\n" +
        "        <div id=\"clockButton\"><button type=\"button\" class=\"btn btn-select btn-circle btn-xl\" id=\"makerClock\">Clock In</button></div>\n" +
        "        <div id=\"empty\"></div>\n" +
        "        <div id=\"empty\"></div>\n" +
        "        <div id=\"makerText2\"></div>\n" +
        "    </div>"
    );

    //hide working message
    $("#workingMessage").hide();

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
                if (relres[i].company == 'No Company') {
                    $("#makerSelectedClient").append(
                        `<option id=${relres[i].id} value=${relres[i].id}>${relres[i].clientName + " - " + relres[i].occupation}</option>`);
                } else {
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

    //Event listener for On-the-Go
    $("#otgButton").on('click', function() {
        //Dynamically change the button functions
        if($("#otgButton").html() == "Back to Live Clock")
        {
            timeClockFunctionality();
        }
        else
        {
            $("#otgBlock").css("opacity", "1");
            $("#otgTime").css("opacity", "1");
            $("#otgButton").html("Back to Live Clock");

            $("#otgBlock").html("<h6>Please select a time option:</h6>");

            //Populate drop down
            $("#otgTime").html("<select class='form-control' id='otgValues'>" +
                "<option id='5m' value='5'>5 minutes</option>\n" +
                "<option id='15m' value='15'>15 minutes</option>\n" +
                "<option id='30m' value='30'>30 minutes</option>\n" +
                "<option id='45m' value='45'>45 minutes</option>\n" +
                "<option id='60m' value='60'>1 hour</option></select>\n");

            $("#makerClock").html("Submit");
            $("#makerClock").off("click");
            $("#makerClock").on('click', function() {
                $("#clockPrompt").html("<span id='errormessage' style='color:red'></span>");
                let message = "";
                let valid = true;
                let entryVal = $("#taskEntry").val();

                if($("#taskEntry").val().length === 0) {
                    valid = false;
                    message += "A task is required!";
                    $("#clockPrompt").css("transition", "none");
                    $("#clockPrompt").css("opacity", "1");
                }

                if(valid) {
                    $("#taskEntry").val("");
                    $("#errormessage").html("");
                    $.ajax({
                        url: "/api/makerOnTheGo",
                        method: "post",
                        data: {
                            auth: id_token,
                            token: id_token,
                            relationshipId: $("#makerSelectedClient").val(),
                            minutes: $("#otgValues").val(),
                            task: entryVal
                        },
                        dataType: "json",
                        success: function(res, status) {
                            $("#makerText2").css("opacity", "1");
                            $("#makerText2").html("<h5>Successfully submitted entry!</h5>");
                            availableCredits();

                            setTimeout(function () {
                                $("#makerText2").css("opacity", "0");
                            }, 1000);
                        },
                        error: function (res, status) {
                            $("#errormessage").html("Could not add entry!");
                        }
                    });
                }
                else {
                    $("#errormessage").html(message);
                }
            });
        }
    });

    //Manages actions when user navigates away
    manageNavAway();
}

function manageNavAway() {
    //Determines functionality when user navigates away by timesheets
    $.ajax({
        url: "/api/getMyCurrentTimeSheet",
        method: "post",
        data: {
            auth: id_token,
            token: id_token
        },
        dataType: "json",
        //Managing user navigation away
        success: function (innerRes, innerStatus) {
            var clockedOut = true;
            if (innerRes) {
                clockedOut = false;
                $("#clientRole").css("opacity", "0");
                $("#clockPrompt").css("opacity", "1");
                $("#makerSelectedClient").css("opacity", "0");
                $("#clientCredit").css("opacity", "0");
                $("#availcredit").css("opacity", "0");
                $("#otgButton").css("opacity", "0");
                $("#taskBlock").html("<h6>Update task:</h6>");
                $("#taskEntry").val(taskValue);

                setTimeout(function () {
                    $("#clientRole").css("visibility", "hidden");
                    $("#availcredit").css("visibility", "hidden");
                    $("#makerSelectedClient").css("visibility", "hidden");
                    $("#otgButton").css("visibility", "hidden");
                    $("#clientCredit").css("visibility", "hidden");
                    $("#workingMessage").show();
                    $("#workingMessage").html(`You are currently working for ${innerRes.clientName}.`);
                    $("#workingMessage").css("visibility", "visible");
                    $("#workingMessage").css("opacity", "1");
                }, 1000)
            } else {
                $("#taskBlock").css("opacity", "1");
                $("#taskEntry").css("opacity", "1");
                $("#clientRole").css("opacity", "1");
                $("#availcredit").css("opacity", "1");
                $("#clientCredit").css("opacity", "1");
                $("#makerSelectedClient").css("opacity", "1");
            }

            if (clockedOut) {
                setClockInFunctionality();
            } else {
                setClockOutFunctionality();
            }
        },
        error: function (innerRes, innerStatus) {
            $("#userMainContent").html("Could not get current time sheet!");
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
        if($("#makerSelectedClient").val() === null) {
            $("#clockPrompt").css("opacity", "1");
            $("#clockPrompt").html("You do not have a client set up. Please contact Freedom Makers.");
            $(".spinner-border").remove();
            $("#makerClock").html("Clock in");

        } else {
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
                        $("#taskBlock").html("<h6>Update task:</h6>");
                        setClockOutFunctionality();
                        $("#makerText2").html("<h5>Successfully clocked in!</h5>");
                        taskValue = $("#taskEntry").val();
                        $("#makerText2").css("opacity", "1");
                        $("#clockPrompt").css("opacity", "1");
                        $("#otgButton").css("opacity", "0");

                        setTimeout(function () {
                            $("#makerText2").css("opacity", "0");
                            $("#otgButton").css("visibility", "hidden");
                            $("#workingMessage").show();
                            $("#workingMessage").html(`You are currently working for ${clockres.clientName}.`);
                            $("#workingMessage").css("opacity", "1");
                            $("#workingMessage").css("visibility", "visible");
                        }, 1000);

                    } else {
                        $("#makerText2").html("<h5>Could not clock in!</h5>");
                    }
                },
                error: function (clockres, status) {
                    $("#makerClock").html('Clock In');
                    $("#userMainContent").html("Clock not working! Please refresh the page. Contact support if the problem persists.");
                }
            });
        }
    });
}

function setClockOutFunctionality() {
    runningTime();
    $("#clientRole").css("opacity", "0");
    $("#makerSelectedClient").css("opacity", "0");
    $("#clockPrompt").css("opacity", "1");
    $("#clientCredit").css("opacity", "0");
    $("#availcredit").css("opacity", "0");
    $("#otgBlock").css("opacity", "0");
    $("#otgTime").css("opacity", "0");

    setTimeout(function () {
        $("#makerSelectedClient").css("visibility", "hidden");
        $("#clientRole").css("visibility", "hidden");
        $("#clientCredit").css("visibility", "hidden");
        $("#availcredit").css("visibility", "hidden");
        $("#otgBlock").css("visibility", "hidden");
        $("#otgTime").css("visibility", "hidden");
    }, 1000);

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
                        auth: id_token,
                        newTask: $("#taskEntry").val()
                    },
                    dataType: "json",
                    success: function (clockres, status) {
                        if (clockres) {
                            TIME_SHOULD_RUN = false;
                            setClockInFunctionality();
                            $("#clockPrompt").css("opacity", "0");
                            $("#makerText2").html("<h5>Successfully clocked out!</h5>");
                            $("#makerText2").css("opacity", "1");
                            $("#clientCredit").css("visibility", "visible");
                            $("#clientRole").css("visibility", "visible");
                            $("#availcredit").css("visibility", "visible");
                            $("#makerSelectedClient").css("visibility", "visible");
                            $("#otgBlock").css("visibility", "visible");
                            $("#otgTime").css("visibility", "visible");
                            $("#otgButton").css("visibility", "visible");
                            $("#workingMessage").css("opacity", "0");

                            setTimeout(function () {
                                $("#workingMessage").hide();
                                $("#taskBlock").html("<h6>Please enter in a task:</h6>");
                                taskValue = "";
                                $("#taskEntry").val(taskValue);
                                $("#makerText2").css("opacity", "0");
                                $("#clientCredit").css("opacity", "1");
                                $("#clientRole").css("opacity", "1");
                                $("#availcredit").css("opacity", "1");
                                $("#makerSelectedClient").css("opacity", "1");
                                $("#otgBlock").css("opacity", "1");
                                $("#otgTime").css("opacity", "1");
                                $("#otgButton").css("opacity", "1");
                                $("#workingMessage").css("visibility", "hidden");
                            }, 1000);
                        } else {
                            $("#clockPrompt").html("<h5>An error occurred! Please refresh and check your time sheet.</h5>");
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

function padIntToTwoPlaces(int){
    let intString = int.toString();
    if (intString.length === 1){
        intString = "0" + intString;
    }
    return intString;
}

function runningTime() {
    TIME_SHOULD_RUN = true;
    $.ajax({
        url: "/api/getMyCurrentTimeSheet",
        method: "post",
        data: {
            auth: id_token,
            token: id_token
        },
        dataType: "json",
        success: function (timeres, timestatus) {

            let elapsedSeconds = timeres.secondsOnline;
            runClock(elapsedSeconds);
            setInterval(function () {
            }, 1000);

        },
        error: function (timeres, timestatus) {
            $("#userMainContent").html("Cannot get current time sheet!");
        }
    });
}

function runClock(startingTime){
    if (TIME_SHOULD_RUN){
        startingTime += 1;
        let duration = moment.duration(startingTime * 1000);
        let hours = padIntToTwoPlaces(duration.hours());
        let minutes = padIntToTwoPlaces(duration.minutes());
        let seconds = padIntToTwoPlaces(duration.seconds());
        $("#runningTime").html(`<h5>${hours}:${minutes}:${seconds}</h5>`);

        setTimeout(function () {
            runClock(startingTime)
        }, 1000)
    }
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
    $(".reportOptionsMaker").append("<div id='uniform'><label for='startDate'>Start Date:</label><input class='form-control' type='date' id='startDate' name='startDate'></div>");
    $(".reportOptionsMaker").append("<div id='uniform'><label for='endDate'>End Date:</label><input class='form-control' type='date' id='endDate' name='endDate'></div>");
    $(".reportOptionsMaker").append("<div id='uniform'><label for='client'>Client:</label><input class='form-control' type='text' id='clientRepSearch' name='clientRepSearch'><select class='form-control' id='clientReport'>\n</select></div>");
    $(".reportOptionsMaker").append("<button type='button' class='btn btn-select btn-circle btn-xl' id='runReportButton'>Run Report</button>");
    $(".reportOptionsMaker").append("<div id='empty'></div>");
    //Populate table but do not show
    $("#sheetsTable").append('\n' +
        '        <thead class="thead">\n' +
        '            <th scope="col" style="width: 200px">Timesheet ID</th>\n' +
        '            <th scope="col">Client</th>\n' +
        '            <th scope="col">Company</th>\n' +
        '            <th scope="col">Clock In (PST/PDT)</th>\n' +
        '            <th scope="col">Clock Out (PST/PDT)</th>\n' +
        '            <th scope="col">Task</th>\n' +
        '            <th scope="col">Shift Duration</th>\n' +
        '        </thead><tbody id="reportContent">' +
        '</tbody>');
    //Pre-populate Report drop down options
    $("#clientRepSearch").on("keypress input", function () {
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
        $("#topRow").append('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="margin: auto"></span>');
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
                $(".spinner-border").remove();
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

                $("#reportContent").append('<th id="repTotal" colspan="1">Total Time:</th>' +
                    '<td>' + totalmessage + '</td>');
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

});//end document ready