let selectedTab = null;
let id_token = null;
let TEST_ENVIRONMENT = false;
let NAV_MAP_TEXT = "";
let SELECTED_NAV_MAP = null;

let navMapper = {
    main: function () {
        location.reload();
    },

    previousHours: function () {
        showFunction(timeSheetFunctionality, "/api/getTimeSheetsByMakerId");
    },

    manageClients: function () {
        showFunction(clientFunctionality, "/api/getClientsForMaker");
    },
};//end navMapper

//Versatile Functions
function showFunction (functionality, endpoint) {
    $.ajax({
        method: "post",
        url: TEST_ENVIRONMENT ? '/api/getAllMakers' : '/api/getMakerIdByToken',
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
                    id: TEST_ENVIRONMENT ? 4 : res.id
                },
                dataType: "json",
                success: function (innerRes, innerStatus) {
                    functionality(innerRes);
                    $(".spinner-border").remove();
                },
                error: function (innerRes, innerStatus) {
                    $("#userMainContent").html("Something went wrong!");
                }
            });// ajax
        },
        error: function (res, status) {
            $("#userMainContent").html("Failed to verify you!");
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

//Main Clock Methods
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

    $("#makerSelectedClient").on('change', function() {
        $.ajax({
            method: "post",
            url: TEST_ENVIRONMENT ? '/api/getAllMakers' : '/api/getMakerIdByToken',
            data: {
                auth: id_token,
                token: id_token
            },
            success: function (tokenres, tokenstatus) {
                console.log(tokenres)
                $.ajax({
                    method: "post",
                    url: "/api/getRelationshipsByMakerId",
                    data: {
                        auth: id_token,
                        id: TEST_ENVIRONMENT? 4: tokenres.id
                    },
                    success: function (relres, relstatus) {
                        for(var item of relres)
                        {
                            if(item.id == $("#makerSelectedClient").val())
                            {
                                $.ajax({
                                    url: "/api/getTimeBucket",
                                    method: "post",
                                    data: {
                                        auth: id_token,
                                        id: item.clientId,
                                        planId: item.planId
                                    },
                                    dataType: "json",
                                    success: function (bucketres, bucketstatus) {
                                    console.log("hello")
                                        let hours = Math.floor(((bucketres.minutes)/60));
                                        let minutes = (bucketres.minutes)%60;
                                        let message = "";
                                        if (hours > 0) {
                                            message += ` ${hours} hours `;
                                        }
                                        if (minutes > 0) {
                                            message += ` ${minutes} minutes `;
                                        }
                                        $("#availcredit").html(message);
                                    },
                                    error: function (bucketres, bucketstatus) {
                                        $("#userMainContent").html("Bucket isn't working!");
                                    }
                                });
                            }
                        }

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
                if(!$("#makerSElectedClient").val())
                {
                    $.ajax({
                        url: "api/getRelationshipById",
                        method: "post",
                        data: {
                            auth: id_token,
                            id: $("#makerSelectedClient").val(),
                        },
                        dataType: "json",
                        success: function (relres, status) {
                            $.ajax({
                                url: "api/clockIn",
                                method: "post",
                                data: {
                                    auth: id_token,
                                    makerId: relres.makerId,
                                    hourlyRate: relres.planId,
                                    clientId: relres.clientId,
                                    task: $("#taskEntry").val()
                                },
                                dataType: "json",
                                success: function (clockres, status) {
                                    if(clockres) {
                                        setClockOutFunctionality();
                                        $("#makerText2").html("<br><h5>Successfully clocked in!</h5>");
                                        $("#makerText2").css("opacity", "1");


                                        $("#clockPrompt").html("<h5>Time is running . . .</h5>");
                                        $("#clockPrompt").css("opacity", "1");

                                        $("#taskBlock").css("opacity", "0");
                                        $("#taskEntry").css("opacity", "0");
                                        $("#taskBlock").css("transition", "opacity 0.5s ease-out");
                                        $("#taskEntry").css("transition", "opacity 0.5s ease-out");

                                        setTimeout(function () {
                                            $("#makerText2").css("opacity", "0");
                                            $("#taskBlock").hide();
                                            $("#taskEntry").hide();
                                        }, 3000);

                                        setTimeout(function () {
                                            $("#makerText2").html("");
                                        }, 6000);

                                    }
                                    else {
                                        $("#makerText2").html("<br><h5>Could not clock in!</h5>");
                                    }
                                },
                                error: function (clockres, status) {
                                    $("#makerClock").html('Clock In');
                                    $("#userMainContent").html("Clock not working!");
                                }
                            });
                        },
                        error: function (relres, status) {
                            $("#makerClock").html('Clock In');
                            $("#clockButton").html("<h5>You are not currently assigned to any Client.<br>" +
                                "Please follow up with Freedom Makers for further instruction.</h5>");
                        }
                    });
                }
            },
            error: function (tokenres, status) {
                $("#userMainContent").html("Failed to verify you!");
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

    setTimeout(function () {
        $("#clientRole").hide();
        $("#clientCredit").hide();
        $("#availcredit").hide();
    }, 3000);

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
                        makerId: TEST_ENVIRONMENT ? 4 : tokenres.id
                    },
                    dataType: "json",
                    success: function (clockres, status) {
                        if(clockres) {
                            setClockInFunctionality();
                            $("#clockPrompt").css("opacity", "0");
                            $("#makerText2").html("<br><h5>Successfully clocked out!</h5>");
                            $("#makerText2").css("opacity", "1");
                            $("#taskBlock").css("transition", "opacity 0.5s ease-in");
                            $("#taskEntry").css("transition", "opacity 0.5s ease-in");
                            $("#taskBlock").show();
                            $("#taskBlock").css("opacity", "1");
                            $("#taskEntry").show();
                            $("#taskEntry").val("");
                            $("#taskEntry").css("opacity", "1");
                            $("#clientRole").show();
                            $("#clientRole").css("opacity", "1");
                            $("#makerSelectedClient").css("opacity", "1");
                            $("#clientCredit").css("opacity", "1");
                            $("#availcredit").css("opacity", "1");
                            $("#clientCredit").show();
                            $("#clientRole").show();
                            $("#availcredit").show();

                            setTimeout(function () {
                                $("#makerText2").css("opacity", "0");
                            }, 3000);

                            setTimeout(function () {
                                $("#makerText2").html("");
                                $("#clockPrompt").html("");
                            }, 6000);
                        }
                        else {
                            $("#makerText2").html("<br><h5>Could not clock out!</h5>");
                        }
                    },
                    error: function (clockres, status) {
                        $("#makerClock").html('Clock Out')
                        $("#userMainContent").html("Clock not working!");
                    }
                });
            },
            error: function (tokenres, status) {
                $("#makerClock").html('Clock Out')
                $("#userMainContent").html("Clock not working!");
            }
        });
    });
};

//Google
onSignIn = function (googleUser) {
    id_token = TEST_ENVIRONMENT ? null : googleUser.getAuthResponse().id_token;
    GOOGLE_USER = googleUser;
    let profile = TEST_ENVIRONMENT ? null : googleUser.getBasicProfile();
    let name = TEST_ENVIRONMENT ? null : profile.getName();
    $("#googleUser").html(TEST_ENVIRONMENT ? "test" : name);

    setClockInFunctionality();
    //Populating drop down selection
    $.ajax({
        method: "post",
        url: TEST_ENVIRONMENT ? '/api/getAllMakers' : '/api/getMakerIdByToken',
        data: {
            auth: id_token,
            token: id_token
        },
        success: function (tokenres, status) {
            $.ajax({
                url: "/api/getTimeSheetsByMakerId",
                method: "post",
                data: {
                    auth: id_token,
                    id: TEST_ENVIRONMENT ? 4 : tokenres.id
                },
                dataType: "json",

                //Managing user navigation away
                success: function (innerRes, innerStatus) {
                    var clockedOut = true;
                    for (var i = 0; i < innerRes.length; ++i){
                        let sheet = innerRes[i];
                        if (sheet.timeOut[0] === "0" && sheet.timeIn[0] === "0"){
                            clockedOut = false;
                            $("#taskBlock").css("opacity", "1");
                            $("#taskEntry").css("opacity", "1");
                        }
                        else if (sheet.timeOut[0] === "0" && sheet.timeIn[0] !== "0"){
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
                                $("#taskEntry").hide();
                                $("#clientRole").hide();
                                $("#availcredit").hide();
                            }, 3000)
                        }
                        else if (sheet.timeOut[0] !== "0" && sheet.timeIn[0] !== "0"){
                            clockedOut = true;
                            $("#taskBlock").css("opacity", "1");
                            $("#taskEntry").css("opacity", "1");
                            $("#clientRole").css("opacity", "1");
                            $("#availcredit").css("opacity", "1");
                            $("#clientCredit").css("opacity", "1");
                            $("#makerSelectedClient").css("opacity", "1");
                        }
                    }
                    if (clockedOut){
                        setClockInFunctionality();
                    }
                    else{
                        setClockOutFunctionality();
                    }
                    $.ajax({
                        url: "/api/getRelationshipsByMakerId",
                        method: "post",
                        data: {
                            auth: id_token,
                            id: TEST_ENVIRONMENT ? 4 : tokenres.id,
                        },
                        dataType: "json",
                        success: function (relres, status) {
                            for (var relationship of relres) {
                                let occ = relationship.occupation;
                                $.ajax({
                                    url: "/api/getClientName",
                                    method: "post",
                                    data: {
                                        auth: id_token,
                                        relationshipObj: relationship,
                                    },
                                    dataType: "json",
                                    success: function (clientres, status) {
                                        $("#makerSelectedClient").append(
                                            `<option id=${clientres.relId} value=${clientres.relId}>${clientres.name + " - " + occ}</option>`);
                                    },
                                    error: function (clientres, status) {
                                        $("#UserMainContent").html("Could not get clients!");
                                    }
                                });
                            }
                            setTimeout(function () {
                                $.ajax({
                                    method: "post",
                                    url: TEST_ENVIRONMENT ? '/api/getAllMakers' : '/api/getMakerIdByToken',
                                    data: {
                                        auth: id_token,
                                        token: id_token
                                    },
                                    success: function (tokenres, tokenstatus) {
                                        $.ajax({
                                            method: "post",
                                            url: "/api/getRelationshipsByMakerId",
                                            data: {
                                                auth: id_token,
                                                id: TEST_ENVIRONMENT? 4: tokenres.id
                                            },
                                            success: function (relres, relstatus) {
                                                for(var item of relres)
                                                {
                                                    if(item.id == $("#makerSelectedClient").val())
                                                    {
                                                        $.ajax({
                                                            url: "/api/getTimeBucket",
                                                            method: "post",
                                                            data: {
                                                                auth: id_token,
                                                                id: item.clientId,
                                                                planId: item.planId
                                                            },
                                                            dataType: "json",
                                                            success: function (bucketres, bucketstatus) {
                                                                console.log("hello")
                                                                let hours = Math.floor(((bucketres.minutes)/60));
                                                                let minutes = (bucketres.minutes)%60;
                                                                let message = "";
                                                                if (hours > 0) {
                                                                    message += ` ${hours} hours `;
                                                                }
                                                                if (minutes > 0) {
                                                                    message += ` ${minutes} minutes `;
                                                                }
                                                                $("#availcredit").html(message);
                                                            },
                                                            error: function (bucketres, bucketstatus) {
                                                                $("#userMainContent").html("Bucket isn't working!");
                                                            }
                                                        });
                                                    }
                                                }

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
                            }, 300)
                        },
                        error: function (relres, status) {
                            $("#UserMainContent").html("Could not get relationships!");
                        }
                    });
                },
                error: function (innerRes, innerStatus) {
                    $("#userMainContent").html("Something went wrong!");
                }
            });// ajax
        },
        error: function (tokenres, status) {
            $("#userMainContent").html("Failed to verify you!");
        }
    });
};

//Previous Hours Methods
function timeSheetFunctionality (res) {
    $.ajax({
        method: "post",
        url: TEST_ENVIRONMENT ? '/api/getAllMakers' : '/api/getMakerIdByToken',
        data: {
            auth: id_token,
            token: id_token
        },
        success: function (tokenres, status) {
            $.ajax({
                url: '/api/getClientsForMaker',
                method: "post",
                data: {
                    auth: id_token,
                    id: TEST_ENVIRONMENT ? 4 : tokenres.id
                },
                dataType: "json",
                success: function (innerRes, innerStatus) {
                    let clientMap = {};
                    for (var i = 0; i < innerRes.length; ++i){
                        clientMap[innerRes[i].id] = innerRes[i];
                    }

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
                        '            <th scope="col">Timesheet ID</th>\n' +
                        '            <th scope="col">Client</th>\n' +
                        '            <th scope="col">Clock In (GMT/UTC)</th>\n' +
                        '            <th scope="col">Clock Out (GMT/UTC)</th>\n' +
                        '            <th scope="col">Task</th>\n' +
                        '        </thead><tbody>');
                    //Populate table
                    for (var item in res){
                        let clientIdentifier = res[item].clientId;
                        clientIdentifier = clientMap[clientIdentifier] ?
                            clientMap[clientIdentifier].first_name + " " + clientMap[clientIdentifier].last_name :
                            `Deleted client ${clientIdentifier}`;

                        $("#sheetsTable").append('\n' +
                            '<tr class="sheetRow">' +
                            '   <td>' + res[item].id + '</td>'+
                            '   <td>' + clientIdentifier + '</td>' +
                            '   <td>' + res[item].timeIn + '</td>'+
                            '   <td>' + res[item].timeOut + '</td>'+
                            '   <td>' + res[item].task + '</td></tr>'
                        );
                    }
                    $("#sheetsTable").append('\n</tbody>');

                    //Body Block content
                    createBody();

                    //Event Listeners

                    //Row effect
                    $(".sheetRow").mouseenter(function () {
                        $(this).css('transition', 'background-color 0.5s ease');
                        $(this).css('background-color', '#e8ecef');
                    }).mouseleave(function () {
                        $(this).css('background-color', 'white');
                    });
                },
                error: function (innerRes, innerStatus) {
                    $("#userMainContent").html("Something went wrong!");
                }
            });// ajax
        },
        error: function (tokenres, status) {
            $("#userMainContent").html("Failed to verify you!");
        }
    });

}

//Client Methods
function clientFunctionality (res){
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
        '            <th scope="col">Phone</th>\n' +
        '            <th scope="col">Email</th>\n' +
        '        </thead><tbody>');
    //Populate table
    res.forEach(item => {
        if (!item.deleted) {
            $("#clientTable").append('\n' +
                '<tr class="clientRow">' +
                '   <td>' + `${item.first_name} ${item.last_name}` + '</td>' +
                '   <td>' + item.phone + '</td>' +
                '   <td>' + item.email + '</td></tr>'
            );
        };
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
    })

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
})//end document ready