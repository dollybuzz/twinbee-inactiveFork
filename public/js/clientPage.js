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

    reviewSubscriptions: function () {
        showFunction(subscriptionFunctionality, "/api/getSubscriptionsByClient");
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
            auth: id_token
        },
        dataType: "json",
        success: function (res, status) {
            functionality(res);
        },
        error: function (res, status) {
            $("#userMainContent").html("Something went wrong!");
        }
    });
};// end showFunction


//Main Methods
function showMain () {
    //Contains any main tab functionality
}



//Maker Methods
function makerFunctionality (res) {
    //Create table
}

//Subscription Methods
function subscriptionFunctionality (res) {
    //Create table
    $("#userMainContent").html(
        "<div id=\"buttonsTop\"></div>\n" +
        "<div class='row' id='topRow'>\n" +
        "<div id=\"floor\">\n" +
        "    <table id=\"subscriptionTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div></div>");
    $("#subscriptionTable").append('\n' +
        '        <thead class="thead">\n' +
        '            <th scope="col">ID</th>\n' +
        '            <th scope="col">Customer</th>\n' +
        '            <th scope="col">Plan</th>\n' +
        '            <th scope="col">Planned Monthly Hours</th>\n' +
        '            <th scope="col">Scheduled changes</th>\n' +
        '            <th scope="col">Cancelled</th>\n' +
        '            <th scope="col">Next Billing</th>\n' +
        '        </thead><tbody>');

    //get clients to cross reference

    //Populate table
    res.forEach(item => {
        let subscription = item.subscription;
        let customer = item.customer;
        item = item.subscription;
        if (item && !subscription.deleted) {
            $("#subscriptionTable").append('\n' +
                '<tr class="subscriptionRow">' +
                '   <td scope="row">' + subscription.id + '</td>' +
                '   <td>' + `${customer.first_name} ${customer.last_name}`+ '</td>' +
                '   <td>' + subscription.plan_id + '</td>' +
                '   <td>' + (customer.meta_data == undefined? "no data": (customer.meta_data[item.plan_id] ? customer.meta_data[item.plan_id] : 0)) + '</td>' +
                '   <td>' + `${subscription.has_scheduled_changes}` + '</td>' +
                '   <td>' + (subscription.cancelled_at == undefined ? "No" : moment.unix(subscription.cancelled_at).format('YYYY/MM/DD')) + '</td>' +
                '   <td>' + (subscription.next_billing_at == undefined ? "Cancelled" : moment.unix(subscription.next_billing_at).format('YYYY/MM/DD'))  + '</td></tr>'
            );
        }
    });
    $("#subscriptionTable").append('\n</tbody>');

    //Body Block content
    createBody("Cancel");

    //Event Listeners
    //Modify
    $(".subscriptionRow").click(function () {
        selectedRow = $(this);
        let subscriptionPrompt = `<h5>Please type in the subscription ID to cancel the selected subscription.</h5>` +
            `<h6>You selected ID: ${selectedRow.children()[0].innerHTML}</h6>` +
            "<br><form id='delete'>" +
            "<label for='deleteUser'>Enter ID:</label>" +
            `<input type='text' id='deleteUser' name='deleteUser'>\n<br>\n` +
            "</form>\n";

        prePopModForm("/api/retrieveSubscription", subscriptionModForm);
        $("#DeleteButton").show();
        $("#DeleteButton").css("opacity", "1");
        $("#DeleteButton").click(function () {
            let subscriptionId = selectedRow.children()[0].innerHTML;
            showDeletePrompt("cancel", subscriptionPrompt, "/api/cancelSubscription", {
                auth: id_token,
                subscriptionId: subscriptionId
            }, deleteSubscriptionSuccess, verifyDeleteSubscription);
        });

    });

    //Add
    $("#AddButton").click(function () {
        popAddForm(subscriptionAddForm);
        $("#DeleteButton").css("opacity", "0");
        setTimeout(function () {
            $("#DeleteButton").hide();
        }, 500);
    });

    //Expand Table Button
    $("#ExpandButton").click(function () {
        expandTable();
    });

    //Row effect
    $(".subscriptionRow").mouseenter(function () {
        $(this).css('transition', 'background-color 0.5s ease');
        $(this).css('background-color', '#e8ecef');
    }).mouseleave(function () {
        $(this).css('background-color', 'white');
    });
}

//TimeSheet Methods
function timeSheetFunctionality (res) {

}

//Google
onSignIn = function (googleUser) {
    id_token = googleUser.getAuthResponse().id_token;
};

$(document).ready(function () {

    //Adding logout Button
    $("#logout").append("<button id='logoutButton' type='button' class='btn btn-default'>Log Out</button>");
    $("#logoutButton").click(signOut);

    showMain();

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