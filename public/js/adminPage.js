let navMapper = {
    main: function () {
        location.reload();
    },

    manageClients: function () {
      showClients();
      setTimeout( function () {
          $(".clientRow").click(function () {
              let clientId = $(this).children()[0].innerHTML;
              alert ("You selected client " + clientId)
          })
          $(".clientRow").mouseenter(function () {
              $(this).css('transition', 'background-color 0.5s ease');
              $(this).css('background-color', '#e8ecef');
          }).mouseleave(function () {
              $(this).css('background-color', 'white');

          })
      }, 300)
    },

    manageMakers: function () {
        showMakers();
        setTimeout( function () {
            $(".makerRow").click(function () {
                let makerId = $(this).children()[0].innerHTML;
                alert ("You selected maker " + makerId)
            })
            $(".makerRow").mouseenter(function () {
                $(this).css('transition', 'background-color 0.5s ease');
                $(this).css('background-color', '#e8ecef');
            }).mouseleave(function () {
                $(this).css('background-color', 'white');

            })
        }, 300)
    },

    reviewTimeSheets: function () {
        showSheets();
        setTimeout( function () {
            $(".sheetRow").click(function () {
                let makerId = $(this).children()[0].innerHTML;
                alert ("You selected sheet " + makerId)
            })
            $(".sheetRow").mouseenter(function () {
                $(this).css('transition', 'background-color 0.5s ease');
                $(this).css('background-color', '#e8ecef');
            }).mouseleave(function () {
                $(this).css('background-color', 'white');

            })
        }, 300)
    }
}

function showClients() {
    $("#userMainContent").html(
        "<div id=\"floor\">\n" +
        "    <table id=\"clientTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div>")
    $.ajax({
        url: "/api/getAllClients",
        method: "get",
        data: {
            token: "TODOImplementRealToken"
        },
        dataType: "json",
        success: function (res, status) {
            $("#clientTable").append('\n' +
                '        <thead class="thead">\n' +
                '            <th scope="col">ID</th>\n' +
                '            <th scope="col">Name</th>\n' +
                '            <th scope="col">Location</th>\n' +
                '            <th scope="col">Remaining Hours</th>\n' +
                '            <th scope="col">Email</th>\n' +
                '        </thead><tbody>')
            res.forEach(item => {
                if (item.customer.billing_address) {
                    $("#clientTable").append('\n' +
                        '<tr class="clientRow">' +
                        '   <th scope="row">' + item.customer.id + '</th>' +
                        '   <td>' + `${item.customer.first_name} ${item.customer.last_name}` + '</td>' +
                        '   <td>' + `${item.customer.billing_address.city}, ${item.customer.billing_address.state}` + '</td>' +
                        '   <td>' + "not implemented" + '</td>' +
                        '   <td>' + item.customer.email + '</td></tr>'
                    );
                }
            })
            $("#clientTable").append('\n</tbody>')
            //Body Text
            //Event Listeners
            $(".clientRow").click(function () {
                let clientId = $(this).children()[0].innerHTML;
                alert("You selected client " + clientId)
            })
            $(".clientRow").mouseenter(function () {
                $(this).css('transition', 'background-color 0.5s ease');
                $(this).css('background-color', '#e8ecef');
            }).mouseleave(function () {
                $(this).css('background-color', 'white');
            })
        },
        error: function (res, status) {
            $("#floor").html("Something went wrong!");
            //log, send error report
        }
    })
}

function showMakers(){
    $("#userMainContent").html(
        "<div id=\"floor\">\n" +
        "    <table id=\"makerTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div>")
    $.ajax({
        url: "/api/getAllMakers",
        method: "get",
        data: {
            token: "TODOImplementRealToken"
        },
        dataType: "json",
        success: function (res, status) {
            $("#makerTable").append('\n' +
                '        <thead class="thead">\n' +
                '            <th scope="col">#</th>\n' +
                '            <th scope="col">First Name</th>\n' +
                '            <th scope="col">Last Name</th>\n' +
                '            <th scope="col">Email</th>\n' +
                '        </thead><tbody>')
            res.forEach(item => {
                $("#makerTable").append('\n' +
                    '<tr class="makerRow">' +
                    '   <th scope="row">' + item.id +'</th>' +
                    '   <td>' + item.firstName + '</td>'+
                    '   <td>' + item.lastName + '</td>'+
                    '   <td>' + item.email + '</td>'
                );
            })
            $("#makerTable").append('\n</tbody>')
        },
        error: function (res, status) {
            $("#floor").html("Something went wrong!");
            //log, send error report
        }
    })
}
function showSheets(){
    $("#userMainContent").html(
        "<div id=\"floor\">\n" +
        "    <table id=\"sheetsTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div>")
    $.ajax({
        url: "/api/getAllTimeSheets",
        method: "get",
        data: {
            token: "TODOImplementRealToken"
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
                '        </thead><tbody>')
            res.forEach(item => {
                $("#sheetsTable").append('\n' +
                    '<tr class="sheetRow">' +
                    '   <th scope="row">' + item.id +'</th>' +
                    '   <td>' + item.maker_id + '</td>'+
                    '   <td>' + item.client_id + '</td>'+
                    '   <td>' + item.hourly_rate + '</td>'+
                    '   <td>' + item.start_time + '</td>'+
                    '   <td>' + item.end_time + '</td>'+
                    '   <td>' + item.occupation + '</td>'
                );
            })
            $("#sheetsTable").append('\n</tbody>')
        },
        error: function (res, status) {
            $("#floor").html("Something went wrong!");
            //log, send error report
        }
    })
}

function showOnlineMakers() {
    $("#online").html(
        "<div id=\"floor\">\n" +
        "    <table id=\"onlineTable\" class=\"table\" cellspacing=\"0\">\n" +
        "    </table>\n" +
        "</div>")
    $.ajax({
        url: "/api/getOnlineMakers",
        method: "get",
        data: {
            token: "TODOImplementRealToken"
        },
        dataType: "json",
        success: function (res, status) {
            $("#onlineTable").append('\n' +
                '        <thead class="thead">\n' +
                '            <th scope="col">Maker ID</th>\n' +
                '            <th scope="col">First Name</th>\n' +
                '            <th scope="col">Last Name</th>\n' +
                '            <th scope="col">Email</th>\n' +
                '        </thead><tbody>')
            res.forEach(item => {
                $("#onlineTable").append('\n' +
                    '<tr class="onlineRow">' +
                    '   <td>' + item.id + '</td>' +
                    '   <td>' + item.firstName + '</td>'+
                    '   <td>' + item.lastName + '</td>'+
                    '   <td>' + item.email + '</td>'
                );
            })
            $("#onlineTable").append('\n</tbody>')
        },
        error: function (res, status) {
            $("#floor").html("Something went wrong!");
            //log, send error report
        }
    }),

        setTimeout( function () {
            $(".onlineRow").click(function () {
                let clientId = $(this).children()[0].innerHTML;
                alert ("You selected client " + clientId)
            })
            $(".onlineRow").mouseenter(function () {
                $(this).css('transition', 'background-color 0.5s ease');
                $(this).css('background-color', '#e8ecef');
            }).mouseleave(function () {
                $(this).css('background-color', 'white');

            })
        }, 300)
}

$(document).ready(function () {
    //Event Listeners
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

    //shifts the landing logo
    $("#actualImage").css("float", "left");
    $("#landingLogo").css("height", "15rem");

    //Main page tables
    setTimeout(showOnlineMakers());

})