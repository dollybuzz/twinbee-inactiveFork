let navMapper = {
    main: function () {

    },
    manageClients: function () {
      showClients();
      setTimeout( function () {
          $(".clientRow").click(function () {
              let clientId = $(this).children()[0].innerHTML;
              alert ("You selected client " + clientId)
          })
      }, 300)
    },
    manageMakers: function () {
        alert("makers")

    },
    reviewTimesheets: function () {
        alert("timesheets")

    }
}

function showClients(){
    $("#adminMainContent").html(
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
    $("#adminMainContent").html(
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

$(document).ready(function () {
$(".navItem").click(function (e) {
    navMapper[e.target.id]();
})
})