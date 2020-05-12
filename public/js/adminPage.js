let navMapper = {
    main: function () {
        location.reload();
    },

    manageClients: function () {
      showClients();
    },

    manageMakers: function () {
        showMakers();
    },

    reviewTimeSheets: function () {
        showSheets();
    }
};//end navMapper

function showClients() {
    //Create table
    $("#userMainContent").html(
        "<div id=\"buttonsTop\"></div>\n" +
        "<div class='row' id='topRow'>\n" +
        "<div id=\"floor\">\n" +
        "    <table id=\"clientTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div></div>");
    $.ajax({
        url: "/api/getAllClients",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (res, status) {
            $("#clientTable").append('\n' +
                '        <thead class="thead">\n' +
                '            <th scope="col">ID</th>\n' +
                '            <th scope="col">Name</th>\n' +
                '            <th scope="col">Phone</th>\n' +
                '            <th scope="col">Email</th>\n' +
                '            <th scope="col">Remaining Hours</th>\n' +
                '        </thead><tbody>');
            //Populate table
            res.forEach(item => {
                if (item.customer.billing_address) {
                    $("#clientTable").append('\n' +
                        '<tr class="clientRow">' +
                        '   <td scope="row">' + item.customer.id + '</td>' +
                        '   <td>' + `${item.customer.first_name} ${item.customer.last_name}` + '</td>' +
                        '   <td>' + item.customer.phone + '</td>' +
                        '   <td>' + item.customer.email + '</td>' +
                        '   <td>' + "not implemented" + '</td></tr>'
                    );
                };
            });
            $("#clientTable").append('\n</tbody>');

            //Body Block content
            createBody();

            //Event Listeners
            //on clicking a client row, populate the modify form
            $(".clientRow").click(function () {
                $("#floor").css("width", "50%");
                $("#floor").css("margin-left", "0");
                $("#floor").css("margin-right", "auto");
                let clientId = $(this).children()[0].innerHTML;
                $.ajax({
                    url: "/api/getClient",
                    method: "post",
                    data: {
                        auth: id_token,
                        id: clientId
                    },
                    dataType: "json",
                    success: function (res, status) {
                        //Pre-populate forms
                        $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
                            "<form id='modify'>\n" +
                            "<label for='modclientid'>ID:</label>" +
                            `<input type='text' id='modclientid' name='modclientid' value='${res.id}' disabled>\n<br>\n` +
                            "<label for='modclientfname'>Full Name:</label>" +
                            `<input type='text' id='modclientfname' name='modclientfname' value='${res.first_name}'>\n<br>\n` +
                            "<label for='modclientlname'>Full Name:</label>" +
                            `<input type='text' id='modclientlname' name='modclientlname' value='${res.last_name}'>\n<br>\n` +
                            "<label for='modphone'>Phone:</label>" +
                            `<input type='text' id='modphone' name='modphone' value='${res.phone}'>\n<br>\n` +
                            "<label for='modemail'>Email:</label>" +
                            `<input type='text' id='modemail' name='modemail' value='${res.email}'>\n<br>\n` +
                            "</form>\n");

                        //Submit button function
                        $("#SubmitButton").click(function () {
                            modSubmit();
                        });
                    },
                    error: function (res, status) {
                        $("#optionsClient").html("Form will not populate!");
                    }
                });//end internal ajax

                //on clicking add client, populate the add form


                //on click delete client, show prompt to verify

            });

             //Expand Table Button
             $("#ExpandButton").click(function () {
                 expandTable();
             })

            //Show Block content
            $(".clientRow").click(function () {
                $("#floor").css("transition", "width 2s ease-in-out");
                showBlock();
            })

            //Row effect
            $(".clientRow").mouseenter(function () {
                $(this).css('transition', 'background-color 0.5s ease');
                $(this).css('background-color', '#e8ecef');
            }).mouseleave(function () {
                $(this).css('background-color', 'white');
            });
        },
        error: function (res, status) {
            $("#floor").html("Something went wrong!");
        }
    });//end ajax
};


function showMakers(){
    //Create table
    $(".row").html(
        "<div id=\"floor\">\n" +
        "    <table id=\"makerTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div>");
    $.ajax({
        url: "/api/getAllMakers",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (res, status) {
            $("#makerTable").append('\n' +
                '        <thead class="thead">\n' +
                '            <th scope="col">#</th>\n' +
                '            <th scope="col">First Name</th>\n' +
                '            <th scope="col">Last Name</th>\n' +
                '            <th scope="col">Email</th>\n' +
                '        </thead><tbody>');
            //Populate table
            res.forEach(item => {
                $("#makerTable").append('\n' +
                    '<tr class="makerRow">' +
                    '   <td scope="row">' + item.id +'</td>' +
                    '   <td>' + item.firstName + '</td>'+
                    '   <td>' + item.lastName + '</td>'+
                    '   <td>' + item.email + '</td></tr>'
                );
            });
            $("#makerTable").append('\n</tbody>');

            //Body Block content

            //Event Listeners
            $(".makerRow").click(function () {
                let makerId = $(this).children()[0].innerHTML;
                $("#floor").css("width", "50vw");
                $(".row").css("float", "left");
                //alert ("You selected maker " + makerId);
            });
            //Row effect
            $(".makerRow").mouseenter(function () {
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

function showSheets(){
    //Create table
    $(".row").html(
        "<div id=\"floor\">\n" +
        "    <table id=\"sheetsTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div>");
    $.ajax({
        url: "/api/getAllTimeSheets",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (res, status) {
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
                    '   <td>' + item.maker_id + '</td>'+
                    '   <td>' + item.client_id + '</td>'+
                    '   <td>' + item.hourly_rate + '</td>'+
                    '   <td>' + item.start_time + '</td>'+
                    '   <td>' + item.end_time + '</td>'+
                    '   <td>' + item.occupation + '</td></tr>'
                );
            });
            $("#sheetsTable").append('\n</tbody>');

            //Body Block content

            //Event Listeners
            $(".sheetRow").click(function () {
                let makerId = $(this).children()[0].innerHTML;
                $("#floor").css("width", "50vw");
                $(".row").css("float", "left");
                //alert ("You selected sheet " + makerId);
            });
            //Row effect
            $(".sheetRow").mouseenter(function () {
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
};//end showSheets

function showOnlineMakers() {
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
                //alert("You selected client " + clientId);
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

//Helper Functions
function createBody() {
    //top row
    $("#topRow").append('\n<div id="optionsClient"></div>');
    $("#optionsClient").hide();
    $("#optionsClient").css("width", "50%");
    $("#buttonsTop").append("<button id='AddButton' type='button' class='btn btn-default'>+</button>");
    $("#buttonsTop").append("<button id='DeleteButton' type='button' class='btn btn-default'>-</button>");

    //bottom row
    $("#userMainContent").append('\n<div class="row" id="bottomRow"></div>');
    $("#userMainContent").append('<div id="buttonsBottom"></div>');
    $("#buttonsBottom").append("<button id='ExpandButton' type='button' class='btn btn-default'>></button>");
    $("#buttonsBottom").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#buttonsBottom").hide();
};

function showBlock() {
    //show block after table stops moving
    setTimeout(function () {
        $("#optionsClient").show();
        $("#buttonsBottom").show();
        $("#buttonsBottom").css("transition", "height 2s ease-in-out");
        $("#optionsClient").css("opacity", "1");
        $("#optionsClient").css("width", "50%");
        $("#optionsClient").css("width", "50%");
        $("#SubmitButton").css("opacity", "1");
        $("#SubmitButton").css("transition", "opacity 2s ease-in-out");
        $("#ExpandButton").css("opacity", "1");
        $("#ExpandButton").css("transition", "opacity 2s ease-in-out");

    }, 2000)
};

function expandTable() {
    $("#optionsClient").hide();
    $("#buttonsBottom").hide();
    $("#buttonsBottom").css("transition", "height 2s ease-in-out");
    $("#optionsClient").css("width", "0%");
    $("#optionsClient").css("opacity", "0");
    $("#floor").css("width", "100%");
    $("#floor").css("margin-left", "0");
    $("#floor").css("margin-right", "auto");
    $("#floor").css("transition", "width 2s ease-in-out");
    $("#SubmitButton").css("opacity", "0");
    $("#SubmitButton").css("transition", "opacity 2s ease-in-out");
    $("#ExpandButton").css("opacity", "0");
    $("#ExpandButton").css("transition", "opacity 2s ease-in-out");

    setTimeout(function () {
        showClients();
    }, 2000)
};

function modSubmit() {
    $("#optionsClient").append("<div id='modsuccess'></div>");
    $.ajax({
        url: "/api/updateClientContact",
        method: "post",
        data: {
            auth: id_token,
            id: $("#modclientid").val(),
            firstName: $("#modclientfname").val(),
            lastName: $("#modclientlname").val() ,
            phone: $("#modphone").val(),
            email: $("#modemail").val()
        },
        dataType: "json",
        success: function (res, status) {
            $("#modsuccess").html("");
            $("#modsuccess").html(`<br><h5>Successfully updated client ${$("#modclientid").val()}!</h5>`);
        },
        error: function (res, status) {
            $("#optionsClient").html("Something isn't working!");
            //log, send error report
        }
    });//end ajax
};

$(document).ready(function () {

    //table on page tab: Main (this functionality is not included in navItem)
    //Requires on load document ready instead of event listener method
    //otherwise it will not load unless clicking on 'Main'
    showOnlineMakers();

    //Event Listeners for other nav menu items
    $(".navItem").click(function (e) {
        navMapper[e.target.id]();
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

    //shifts the welcome textS

    //Adding logout Button
    $("#logout").append("<button id='logoutButton' type='button' class='btn btn-default'>Log Out</button>");
    $("#logoutButton").click(function () {
        window.location.href = "/";
    })


})//end document ready