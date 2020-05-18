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

    manageMakers: function () {
        showFunction(makerFunctionality, "/api/getMakersForClient");
    }
};//end navMapper


//Versatile Helper Functions
function createBody() {
    //top row
    $("#topRow").append('\n<div id="optionsClient"></div>');
    $("#optionsClient").hide();
    $("#optionsClient").css("width", "50%");
    $("#buttonsTop").append("<button id='AddButton' type='button' class='btn btn-default'>+</button>");
    $("#AddButton").css("opacity", "1");

    //bottom row
    $("#userMainContent").append('\n<div class="row" id="bottomRow"></div>');
    $("#userMainContent").append('<div id="buttonsBottom"></div>');
    $("#buttonsTop").append("<button id='ExpandButton' type='button' class='btn btn-default'>></button>");
    $("#buttonsBottom").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#buttonsBottom").hide();
};


function showBlock () {
    //show block after table stops moving
    setTimeout(function () {
        $("#optionsClient").show();
        $("#buttonsBottom").show();
        $("#AddButton").show();
        $("#SubmitButton").show();
        $("#optionsClient").css("width", "50%");
        $("#optionsClient").css("width", "50%");
        $("#optionsClient").css("opacity", "1");
        $("#SubmitButton").css("opacity", "1");
        $("#ExpandButton").css("opacity", "1");
        $("#AddButton").css("opacity", "1");
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
    $("#DeleteButton").hide();
    $("#optionsClient").css("width", "0%");
    $("#optionsClient").css("opacity", "0");
    $("#floor").css("width", "100%");
    $("#floor").css("margin-left", "0");
    $("#floor").css("margin-right", "auto");
    $("#floor").css("transition", "width 0.5s ease-in-out");
    $("#SubmitButton").css("opacity", "0");
    $("#ExpandButton").css("opacity", "0");
    $("#DeleteButton").css("opacity", "0");
    $("#AddButton").css("opacity", "1");
};

function showFunction (functionality, endpoint) {


    $.ajax({
        url: endpoint,
        method: "post",
        data: {
            auth: id_token,
            id: clientId
        },
        dataType: "json",
        success: function (res, status) {
            console.log(res);
            functionality(res);
        },
        error: function (res, status) {
            $("#userMainContent").html("Something went wrong!");
        }
    });//end outer ajax
};// end showFunction


//Main Methods
function showMain () {
    //Contains any main tab functionality
    showOnlineMakers();
}

//TODO show online makers only for client
function showOnlineMakers () {
    //Create table
    $("#online").html(
        "<div id=\"floor\">\n" +
        "    <table id=\"onlineTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div>");
    $.ajax({
        url: "/api/getOnlineMakers",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (res, status) {
            $("#onlineTable").append('\n' +
                '        <thead class="thead">\n' +
                '            <th scope="col">Maker ID</th>\n' +
                '            <th scope="col">First Name</th>\n' +
                '            <th scope="col">Last Name</th>\n' +
                '            <th scope="col">Email</th>\n' +
                '        </thead><tbody>');
            //Populate table
            res.forEach(item => {
                $("#onlineTable").append('\n' +
                    '<tr class="onlineRow">' +
                    '   <td>' + item.id + '</td>' +
                    '   <td>' + item.firstName + '</td>'+
                    '   <td>' + item.lastName + '</td>'+
                    '   <td>' + item.email + '</td></tr>'
                );
            });
            $("#onlineTable").append('\n</tbody>');

            //Body Block content
            $("#text1").append('<h6>This is a table of current online makers.</h6>');
            $("#text2").append('<h6>This is a running table of daily/weekly/monthly hours?</h6>');

            //Event Listeners
            $(".onlineRow").click(function () {
                let clientId = $(this).children()[0].innerHTML;
            })
            //Row effect
            $(".onlineRow").mouseenter(function () {
                $(this).css('transition', 'background-color 0.5s ease');
                $(this).css('background-color', '#e8ecef');
            }).mouseleave(function () {
                $(this).css('background-color', 'white');
            });
        },
        error: function (res, status) {
            $("#floor").html("Something went wrong!");
            //log, send error report
        }
    });//end ajax
};

function makerFunctionality (res) {
    //Create table

    let id = res.id;
    $("#userMainContent").html(
        "<div id=\"buttonsTop\"></div>\n" +
        "<div class='row' id='topRow'>\n" +
        "<div id=\"floor\">\n" +
        "    <table id=\"makerTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div></div>");
    $("#makerTable").append('\n' +
        '        <thead class="thead">\n' +
        '            <th scope="col">#</th>\n' +
        '            <th scope="col">First Name</th>\n' +
        '            <th scope="col">Last Name</th>\n' +
        '            <th scope="col">Email</th>\n' +
        '        </thead><tbody>');
    //Populate table
    res.forEach(item => {
        if (!item.deleted) {
            $("#makerTable").append('\n' +
                '<tr class="makerRow">' +
                '   <td scope="row">' + item.id + '</td>' +
                '   <td>' + item.firstName + '</td>' +
                '   <td>' + item.lastName + '</td>' +
                '   <td>' + item.email + '</td></tr>'
            );
        }
        ;
    });
    $("#makerTable").append('\n</tbody>');

    //Body Block content
    createBody();

    //Event Listeners


    //Expand Table Button
    $("#ExpandButton").click(function () {
        expandTable();
    });

    //Row effect
    $(".makerRow").mouseenter(function () {
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
        '            <th scope="col">Maker ID</th>\n' +
        '            <th scope="col">Client ID</th>\n' +
        '            <th scope="col">Hourly Rate</th>\n' +
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
            }, 2000)
        });
    }, 1000);

    $.ajax({
        url: "/api/getClientByToken",
        method: "post",
        data: {
            token: id_token,
            auth: id_token
        },
        success: function (res, status) {
            clientId = res.id;
        },
        error: function (res, status) {
            console.log(res)
        }
    });

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