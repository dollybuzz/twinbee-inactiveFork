//global variable
let selectedTab = null;
let id_token = null;
let currentRelationship = null;

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
        url: endpoint,
        method: "post",
        data: {
            auth: id_token,
            id: 4 // some maker in our db
        },
        dataType: "json",
        success: function (res, status) {
            functionality(res);
        },
        error: function (res, status) {
            $("#userMainContent").html("Something went wrong!");
        }
    });//end outer ajax

    /*  Uncomment when time for live
    $.ajax({
        method: "post",
        url: '/api/getMakerIdByToken',
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
                    id: res.id
                },
                dataType: "json",
                success: function (innerRes, innerStatus) {
                    console.log(innerStatus);
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
*/

};// end showFunction

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
        '            <th scope="col">ID</th>\n' +
        '            <th scope="col">Name</th>\n' +
        '            <th scope="col">Phone</th>\n' +
        '            <th scope="col">Email</th>\n' +
        '        </thead><tbody>');
    //Populate table
    res.forEach(item => {
        if (!item.deleted) {
            $("#clientTable").append('\n' +
                '<tr class="clientRow">' +
                '   <td scope="row">' + item.id + '</td>' +
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

//Previous Hours Methods
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
        '            <th scope="col">Freedom Maker ID</th>\n' +
        '            <th scope="col">Client ID</th>\n' +
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
            '   <td>' + item.timeIn + '</td>'+
            '   <td>' + item.timeOut + '</td>'+
            '   <td>' + item.task + '</td></tr>'
        );
    });
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
}

//Main Clock Methods
function setClockInFunctionality() {
    $("#taskBlock").show();
    $("#taskBlock").css("opacity", "1");

    $("#makerClock").off("click");
    $("#makerClock").css("background-color", "#dbb459");
    $("#makerClock").text("Clock In");
    $("#makerClock").on('mouseenter', function () {
        $("#makerClock").css("background-color", "#32444e");
    });
    $("#makerClock").on('mouseleave', function () {
        $("#makerClock").css("background-color", "#dbb459");
    });
    $("#makerClock").on('click', function () {
       $.ajax({
           url: '/api/getMakerIdByToken',
           method: "post",
           data: {
               auth: id_token,
               token: id_token,
           },
           dataType: "json",
           success: function (tokenres, status) {
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
                                   $("#makerText2").html("<h5>Successfully clocked in!</h5>");
                                   $("#makerText2").css("opacity", "1");

                                   setTimeout(function () {
                                       $("#makerText2").css("opacity", "0");
                                   }, 3000)

                               }
                               else {
                                   $("#makerText2").html("<h5>Could not clock in!</h5>");
                               }
                           },
                           error: function (clockres, status) {
                               $("#userMainContent").html("Clock not working!");
                           }
                       });
                   },
                   error: function (relres, status) {
                       $("#userMainContent").html("Could not get relationships!");
                   }
               });
           },
           error: function (tokenres, status) {
               $("#userMainContent").html("Failed to verify you!");
           }
       });
   });

}

function setClockOutFunctionality() {
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
        $.ajax({
            url: '/api/getMakerIdByToken',
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
                        makerId: tokenres.id,
                    },
                    dataType: "json",
                    success: function (clockres, status) {
                        if(clockres) {
                            setClockInFunctionality();
                            $("#makerText2").html("<h5>Successfully clocked out!</h5>");
                            $("#makerText2").css("opacity", "1");
                            $("#taskBlock").css("opacity", "0");

                            setTimeout(function () {
                                $("#makerText2").css("opacity", "0");
                                $("#taskBlock").hide();
                            }, 3000)
                        }
                        else {
                            $("#makerText2").html("<h5>Could not clock out!</h5>");
                        }
                    },
                    error: function (clockres, status) {
                        $("#userMainContent").html("Clock not working!");
                    }
                });
            },
            error: function (tokenres, status) {
                $("#userMainContent").html("Clock not working!");
            }
        });
    });
};

//Google
onSignIn = function (googleUser) {
    id_token = googleUser.getAuthResponse().id_token;
    setClockInFunctionality();

    //Populating drop down selection
    $.ajax({
        method: "post",
        url: '/api/getMakerIdByToken',
        data: {
            auth: id_token,
            token: id_token
        },
        success: function (tokenres, status) {
            $.ajax({
                url: "/api/getRelationshipsByMakerId",
                method: "post",
                data: {
                    auth: id_token,
                    id: tokenres.id,
                },
                dataType: "json",
                success: function (relres, status) {
                    let relmap = {};

                    for (var relationship of relres) {
                        $.ajax({
                            url: "/api/getClientName",
                            method: "post",
                            data: {
                                auth: id_token,
                                relationshipObj: relationship,
                            },
                            dataType: "json",
                            success: function (clientres, status) {
                                relmap[relationship.id] = relationship;
                                console.log(clientres);
                                $("#makerSelectedClient").append(
                                    `<option value=${clientres.relId}>${clientres.name}</option>`)
                            },
                            error: function (clientres, status) {
                                $("#UserMainContent").html("Could not get clients!");
                            }
                        });
                    }
                },
                error: function (relres, status) {
                    $("#UserMainContent").html("Could not get relationships!");
                }
            });
        },
        error: function (tokenres, status) {
            $("#userMainContent").html("Failed to verify you!");
        }
    });
};

$(document).ready(function () {

    //Adding logout Button
    $("#logout").append("<button id='logoutButton' type='button' class='btn btn-default'>Log Out</button>");
    $("#logoutButton").click(signOut);

    //Event Listeners for other nav menu items
    $(".navItem").click(function (e) {
        navMapper[e.target.id]();
        selectedTab = $(this)[0].id;
    })

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



})//end document ready