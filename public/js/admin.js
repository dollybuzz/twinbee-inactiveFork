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
              $(this).css('background-color', 'gray');
          }).mouseleave(function () {
              $(this).css('background-color', '#f5f5f5');

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
                $(this).css('background-color', 'gray');
            }).mouseleave(function () {
                $(this).css('background-color', '#f5f5f5');

            })
        }, 300)
    },
    reviewTimesheets: function () {
        showSheets();
        setTimeout( function () {
            $(".sheetRow").click(function () {
                let makerId = $(this).children()[0].innerHTML;
                alert ("You selected sheet " + makerId)
            })
            $(".sheetRow").mouseenter(function () {
                $(this).css('transition', 'background-color 0.5s ease');
                $(this).css('background-color', 'gray');
            }).mouseleave(function () {
                $(this).css('background-color', '#f5f5f5');

            })
        }, 300)
    }
}

function showClients(){
    $("#userMainContent").html(
        "<div id=\"floor\">\n" +
        "    <table id=\"clientTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div>")
    $.ajax({
        url: "/api/getAllClients",
        method: "post",
        data: {
            token: "TODOImplementRealToken"
        },
        dataType: "json",
        success: function (res, status) {
            $("#clientTable").append('\n' +
                '        <thead class="thead-dark">\n' +
                '            <th scope="col">#</th>\n' +
                '            <th scope="col">Name</th>\n' +
                '            <th scope="col">Location</th>\n' +
                '            <th scope="col">Remaining Hours</th>\n' +
                '            <th scope="col">Email</th>\n' +
                '        </thead><tbody>')
            res.forEach(item => {
                $("#clientTable").append('\n' +
                    '<tr class="clientRow">' +
                    '   <th scope="row">' + item.id +'</th>' +
                    '   <td>' + item.name + '</td>'+
                    '   <td>' + item.location + '</td>'+
                    '   <td>' + item.remainingHours + '</td>'+
                    '   <td>' + item.email + '</td>'
                );
            })
            $("#clientTable").append('\n</tbody>')
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
        method: "post",
        data: {
            token: "TODOImplementRealToken"
        },
        dataType: "json",
        success: function (res, status) {
            $("#makerTable").append('\n' +
                '        <thead class="thead-dark">\n' +
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
        url: "/api/getAllTimesheets",
        method: "post",
        data: {
            token: "TODOImplementRealToken"
        },
        dataType: "json",
        success: function (res, status) {
            $("#sheetsTable").append('\n' +
                '        <thead class="thead-dark">\n' +
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

$(document).ready(function () {
$(".navItem").click(function (e) {
    navMapper[e.target.id]();
})
})