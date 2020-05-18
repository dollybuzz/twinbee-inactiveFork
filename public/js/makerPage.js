//global variable
let selectedRow = null;
let selectedTab = null;
let id_token = null;
let signOut = null;

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
            id: makerId
        },
        dataType: "json",
        success: function (res, status) {
            functionality(res);
        },
        error: function (res, status) {
            $("#userMainContent").html("Something went wrong!");
        }
    });//end outer ajax
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

gapi.load('auth2', function() {
    gapi.auth2.init();
});


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
        url: "/api/getMakerIdByToken",
        method: "post",
        data: {
            token: id_token,
            auth: id_token
        },
        success: function (res, status) {
            makerId = res.id;
        },
        error: function (res, status) {
            console.log(res)
        }
    });

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