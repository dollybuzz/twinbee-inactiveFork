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
    $("#buttonsTop").append("<button id='AddButton' type='button' class='btn btn-default'>+</button>");
    $("#buttonsTop").append("<button id='DeleteButton' type='button' class='btn btn-default'>Delete</button>");
    $("#AddButton").css("opacity", "1");

    //bottom row
    $("#userMainContent").append('\n<div class="row" id="bottomRow"></div>');
    $("#userMainContent").append('<div id="buttonsBottom"></div>');
    $("#buttonsTop").append("<button id='ExpandButton' type='button' class='btn btn-default'>></button>");
    $("#buttonsBottom").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#buttonsBottom").hide();
};

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
        '            <th scope="col">Plan ID</th>\n' +
        '            <th scope="col">Clock In</th>\n' +
        '            <th scope="col">Clock Out</th>\n' +
        '            <th scope="col">Occupation</th>\n' +
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
            '   <td>' + item.occupation + '</td></tr>'
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


$(document).ready(function () {
    //Adding logout Button
    $("#logout").append("<button id='logoutButton' type='button' class='btn btn-default'>Log Out</button>");

    setTimeout(function () {
        gapi.load('auth2', function() {
            gapi.auth2.init();
            setTimeout(function(){
                let auth2 = gapi.auth2.getAuthInstance();
                id_token = auth2.currentUser.je.tc.id_token;
                signOut = ()=>{
                    var auth2 = gapi.auth2.getAuthInstance();
                    auth2.signOut().then(function () {
                        console.log('User signed out.');
                        window.location.replace(`/`);
                    });
                };
                $("#logoutButton").click(function () {
                    signOut();
                });
            }, 1000)
        });
    }, 2000);


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

    //Populating drop down selection
    $.ajax({
        method: "post",
        url: '/api/getAllClients', //change to '/api/getMakerIdByToken' during live site
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
                    id: 4, //change to tokenres.id during live site
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
                                id: relationship,
                            },
                            dataType: "json",
                            success: function (clientres, status) {
                                relmap[relationship.id] = relationship;
                                console.log(clientres);
                                $("#makerSelectedClient").append(
                                    `<option value=${clientres.id}>${clientres.name}</option>`)
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

    //Clock button functionality
    $("#makerClock").on('click', function () {
        $.ajax({
            url: '/api/getAllMakers',  //change to '/api/getMakerIdByToken' during live site
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
                        id: $("#makerSelectedClient").val() , //change to tokenres.id during live site
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
                                occupation: relres.occupation,
                            },
                            dataType: "json",
                            success: function (clockres, status) {
                                    if(clockres) {
                                        clockInButton();
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


})//end document ready