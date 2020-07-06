//global variable
let selectedRow = null;
let selectedTab = null;
let selectedDropdown = null;
let TEST_ENVIRONMENT = false;

let navMapper = {
    main: function () {
        location.reload();
    },

    manageClients: function () {
        navItemChange("manageClients");
        showFunction(clientFunctionality, "/api/getAllClients");
    },

    manageMakers: function () {
        navItemChange("manageMakers");
        showFunction(makerFunctionality, "/api/getAllMakers");
    },

    managePlans: function () {
        navItemChange("managePlans");
        showFunction(planFunctionality, "/api/getAllPlans");
    },

    manageSubscriptions: function () {
        navItemChange("manageSubscriptions");
        showFunction(subscriptionFunctionality, "/api/getAllSubscriptions");
    },

    manageRelationships: function () {
        navItemChange("manageRelationships");
        showFunction(relationshipFunctionality, "/api/getAllRelationships");
    },

    manageCredit: function () {
        navItemChange("manageCredit");
        showFunction(creditFunctionality, "/api/getAllTimeBuckets");
    },

    reviewTimeSheets: function () {
        navItemChange("reviewTimeSheets");
        showFunction(timeSheetFunctionality, "/api/getAllTimeSheets");
    },

    runReports: function () {
        navItemChange("runReports");
        showFunction(runReportFunctionality, "/api/getAllTimeSheets");
    }


};//end navMapper

function navItemChange(id) {
    let selectedNavMap = $(`#${id}`);
    let navItemText = selectedNavMap.html();
    selectedNavMap.html(`${navItemText}  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`);
    let parentToChange = selectedNavMap.parent().parent().parent().children()[0];

    $(".navItem").css('color', 'white')
        .css('font-style', 'normal');
    selectedNavMap.css("color", '#dbb459')
        .css("font-style", 'italic');
}

//Versatile Functions
function isEmail(val) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val);
}

function isZip(val) {
    let strippedString = Number.parseInt(Number.parseInt(val).toString());
    return strippedString.toString().length == 5 && !(strippedString.toString().includes('-'))
}

function createBody(button) {
    //top row
    $("#topRow").append('\n<div id="optionsClient"></div>');
    $("#optionsClient").hide();
    $("#optionsClient").css("width", "50%");
    $("#buttonsTop").append("<button id='AddButton' type='button' class='btn btn-default'>+</button>");
    $("#buttonsTop").append("<button id='ExpandButton' type='button' class='btn btn-default'>></button>");
    $("#ExpandButton").hide();
    if (button != null) {
        $("#buttonsTop").append("<button id='DeleteButton' type='button' class='btn btn-default'>" + button + "</button>");
    }
    $("#AddButton").css("opacity", "1");

    //dynamically append submit button in each form
};

function showBlock() {
    //show block after table stops moving
    setTimeout(function () {
        $("#optionsClient").show();
        $("#AddButton").show();
        $("#ExpandButton").show();
        $("#SubmitButton").show();
        $("#optionsClient").css("width", "50%");
        $("#optionsClient").css("width", "50%");
        $("#optionsClient").css("opacity", "1");
        $("#SubmitButton").css("opacity", "1");
        $("#ExpandButton").css("opacity", "1");
        $("#AddButton").css("opacity", "1");
    }, 500)
}

function minimizeTable() {
    $("#floor").css("transition", "width 0.5s ease-in-out");
    $("#floor").css("width", "50%");
    $("#floor").css("margin-left", "0");
    $("#floor").css("margin-right", "auto");
}

function expandTable() {
    $("#optionsClient").hide();
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

    $("#AddButton").show();
    $("#AddButton").css("opacity", "1");

    setTimeout(function () {
        $("#ExpandButton").hide();
    }, 500);
}

function showFunction(functionality, endpoint) {
    $.ajax({
        url: endpoint,
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (res, status) {
            functionality(res);
            $(".spinner-border").remove();
        },
        error: function (res, status) {
            $("#userMainContent").html("Something went wrong! Please refresh the page. Contact support if the problem persists.");
        }
    });
};

//Mod
function prePopModForm(endpoint, modForm) {
    minimizeTable();
    showBlock();
    let clientId = selectedRow.children()[0].innerHTML;
    $.ajax({
        url: endpoint,
        method: "post",
        data: {
            auth: id_token,
            id: clientId,
            subscriptionId: clientId,
            planId: clientId
        },
        dataType: "json",
        success: modForm,
        error: function (res, status) {
            $("#optionsClient").html("Mod Form is not populating!");
        }
    });//end ajax
}

function modSubmit(endpoint, object, successFunction) {
    $.ajax({
        url: endpoint,
        method: "post",
        data: object,
        dataType: "json",
        success: successFunction,
        error: function (res, status) {
            $("#optionsClient").html("Update Client isn't working!");
            //log, send error report
        }
    });//end ajax
}

//Add
function popAddForm(addForm) {
    minimizeTable();
    showBlock();
    addForm();
}

function addSubmit(endpoint, object, successFunction) {
    $.ajax({
        url: endpoint,
        method: "post",
        data: object,
        dataType: "json",
        success: successFunction,
        error: function (res, status) {
            $("#optionsClient").html("Add isn't working!");
        }
    });
};

//Delete
function showDeletePrompt(option, prompt, endpoint, object, successFunction, verifyDeleteUser) {
    showBlock();
    $("#optionsClient").html("<div id='deletePrompt'></div>");
    setTimeout(function () {
        $("#deletePrompt").html("<h5>Are you sure you want to " + option + "?</h5>");
        $("#deletePrompt").append("<div id='selectionYorN'></div>");
        $("#selectionYorN").append("<button id='NoDelete' type='button' class='btn btn-default'>No</button>");
        $("#selectionYorN").append("<button id='YesDelete' type='button' class='btn btn-default'>Yes</button>");
        $("#DeleteButton").css("opacity", "0");
        $("#deletePrompt").css("opacity", "1");
        $("#YesDelete").css("opacity", "1");
        $("#NoDelete").css("opacity", "1");
        $("#AddButton").css("opacity", "0");
        $("#DeleteButton").css("opacity", "0");

        setTimeout(function () {
            $("#AddButton").hide();
            $("#DeleteButton").hide();
        }, 500);

        $("#NoDelete").click(function () {
            $("#AddButton").show();
            $("#AddButton").css("opacity", "1");
            expandTable();
        });

        $("#YesDelete").click(function () {
            $("#AddButton").show();
            $("#AddButton").css("opacity", "1");

            $("#deletePrompt").html(
                prompt
            );

            $("#deletePrompt").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
            $("#SubmitButton").css("opacity", "1");

            $("#deletePrompt").append("<div id='verifyEntry'></div>");

            $("#SubmitButton").off("click");
            $("#SubmitButton").on("click", function (e) {
                if (verifyDeleteUser()) {
                    $("#SubmitButton").hide();
                    $("#verifyEntry").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
                    $.ajax({
                        url: endpoint,
                        method: "post",
                        data: object,
                        dataType: "json",
                        success: successFunction,
                        error: function (res, status) {
                            $("#optionsClient").html("Delete user not working!");
                        }
                    });//end ajax
                } else {
                    $("#verifyEntry").html("<span style='color:red'>Invalid entry! Please try again.</span>");
                }
            });
        });
    }, 500);
}

//Main Methods
function showMain() {
    //Contains any main tab functionality
    showOnlineMakers();
}

function showOnlineMakers() {
    //Create table
    $("#userMainContent").html(
        "<div id=\"buttonsTop\"></div>\n" +
        "<div class='row' id='topRow'>\n" +
        "<div id=\"floor\">\n" +
        "    <table id=\"onlineTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div></div>");
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
                '            <th scope="col">Freedom Maker ID</th>\n' +
                '            <th scope="col">Freedom Maker</th>\n' +
                '            <th scope="col">Email</th>\n' +
                '        </thead><tbody>');
            //Populate table
            res.forEach(item => {
                $("#onlineTable").append('\n' +
                    '<tr class="onlineRow">' +
                    '   <td>' + item.id + '</td>' +
                    '   <td>' + item.firstName + ' ' + item.lastName + '</td>' +
                    '<td>' + item.email + '</td>'
                );
            });
            $("#onlineTable").append('\n</tbody>');

            //Row effect
            $(".onlineRow").mouseenter(function () {
                $(this).css('transition', 'background-color 0.5s ease');
                $(this).css('background-color', '#e8ecef');
            }).mouseleave(function () {
                $(this).css('background-color', 'white');
            });
        },
        error: function (res, status) {
            $("#userMainContent").html("Could not get online Freedom Makers!");
        }
    });
};

//Google
onSignIn = function (googleUser) {
    GOOGLE_USER = googleUser;
    id_token = TEST_ENVIRONMENT ? null : googleUser.getAuthResponse().id_token;

    let profile = TEST_ENVIRONMENT ? null : googleUser.getBasicProfile();
    let name = TEST_ENVIRONMENT ? null : profile.getName();
    $("#googleUser").html(TEST_ENVIRONMENT ? "test" : name);

    showMain();
};

//Client Methods
function clientFunctionality(res) {
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
        '            <th scope="col">Client ID</th>\n' +
        '            <th scope="col">Client</th>\n' +
        '            <th scope="col">Phone</th>\n' +
        '            <th scope="col">Email</th>\n' +
        '        </thead><tbody>');
    //Populate table
    res.forEach(item => {
        if (item.customer && !item.customer.deleted) {
            $("#clientTable").append('\n' +
                '<tr class="clientRow">' +
                '   <td scope="row">' + item.customer.id + '</td>' +
                '   <td>' + `${item.customer.first_name} ${item.customer.last_name}` + '</td>' +
                '   <td>' + item.customer.phone + '</td>' +
                '   <td>' + item.customer.email + '</td></tr>'
            );
        }
        ;
    });
    $("#clientTable").append('\n</tbody>');

    //Body Block content
    createBody("Delete");

    //Event Listeners
    //Modify
    $(".clientRow").click(function () {
        selectedRow = $(this);
        let clientPrompt = `<h5>Please type in the Full Name to delete the selected user.</h5>` +
            `<h6>You selected ${selectedRow.children()[1].innerHTML}<br>ID: ${selectedRow.children()[0].innerHTML}</h6>` +
            "<br><div id='delete'>" +
            "<div id='empty'></div>" +
            "<div><label for='deleteUser'>Enter Full Name:</label></div>" +
            `<div><input class='form-control' type='text' id='deleteUser' name='deleteUser'></div>\n` +
            "<div id='empty'></div>" +
            "</div>\n" +
            "<hr><p>Note: Changes may take a moment to reflect.</p>";

        prePopModForm("/api/getClient", clientModForm);
        $("#DeleteButton").show();
        $("#DeleteButton").css("opacity", "1");
        $("#DeleteButton").click(function () {
            let clientId = selectedRow.children()[0].innerHTML;
            showDeletePrompt("delete", clientPrompt, "/api/deleteClient", {
                auth: id_token,
                id: clientId
            }, deleteClientSuccess, verifyDeleteClient);
        });
    });

    //Add
    $("#AddButton").click(function () {
        popAddForm(clientAddForm);
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
    $(".clientRow").mouseenter(function () {
        $(this).css('transition', 'background-color 0.5s ease');
        $(this).css('background-color', '#e8ecef');
    }).mouseleave(function () {
        $(this).css('background-color', 'white');
    });
}

function clientModForm(res, status) {
    //Pre-populate forms
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        "<form id='modify'>\n" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modClientid'>Client ID:</label>" +
        `<input class='form-control' type='text' id='modclientid' name='modclientid' value='${res.id}' disabled>\n<br>\n` +
        "<label for='modclientfname'>First Name:</label>" +
        `<input class='form-control' type='text' id='modclientfname' name='modclientfname' value='${res.first_name}'>\n<br><br>\n` +
        "<label for='modclientlname'>Last Name:</label>" +
        `<input class='form-control' type='text' id='modclientlname' name='modclientlname' value='${res.last_name}'>\n<br>\n` +
        "<label for='modphone'>Phone:</label>" +
        `<input class='form-control' type='text' id='modphone' name='modphone' value='${res.phone}'>\n<br><br>\n` +
        "<label for='modemail'>Email:</label>" +
        `<input class='form-control' type='text' id='modemail' name='modemail' value='${res.email}'>\n<br>\n` +
        "</form><div><span id='errormessage' style='color:red'></span></div>\n");

    $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#SubmitButton").css("opacity", "1");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        let message = "";
        let valid = true;
        if (!isEmail($("#modemail").val())) {
            valid = false;
            message += "Email is not valid!<br>";
        }
        if ($("#modclientfname").val().length === 0) {
            valid = false;
            message += "A First Name is required!<br>";
        }
        if ($("#modclientlname").val().length === 0) {
            valid = false;
            message += "A Last Name is required!<br>";
        }
        if ($("#modphone").val().length === 0) {
            valid = false;
            message += "A Phone Number is required!<br>";
        }
        if ($("#modphone").val().match(/[a-z]|[A-Z]/g)) {
            valid = false;
            message += "A Phone Number can't have letters!<br>";
        }
        if (!$("#modphone").val().match(/[0-9]/g)) {
            valid = false;
            message += "A Phone Number needs numbers!<br>";
        }
        if ($("#modphone").val().length < 10) {
            valid = false;
            message += "Phone Number not long enough!<br>";
        }

        if (valid) {
            $("#errormessage").html("");
            $("#SubmitButton").hide();
            $("#optionsClient").append("<div id='modsuccess'></div>");
            $("#modsuccess").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
            modSubmit("/api/updateClientContact", {
                auth: id_token,
                id: $("#modclientid").val(),
                firstName: $("#modclientfname").val(),
                lastName: $("#modclientlname").val(),
                phone: $("#modphone").val(),
                email: $("#modemail").val()
            }, modClientSuccessContact);
        } else {
            $("#errormessage").html(message);
        }
    });
}

function clientAddForm() {
    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
        "<form id='add'>\n" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='addclientfname'>First Name:</label>" +
        `<input class='form-control' type='text' id='addclientfname' name='addclientfname'>\n<br>\n` +
        "<label for='addclientlname'>Last Name:</label>" +
        `<input class='form-control' type='text' id='addclientlname' name='addclientlname'>\n<br><br>\n` +
        "<label for='addphone'>Phone:</label>" +
        `<input class='form-control' type='text' id='addphone' name='addphone'>\n<br>\n` +
        "<label for='addemail'>Email:</label>" +
        `<input class='form-control' type='text' id='addemail' name='addemail'>\n<br><br>\n` +
        "</form><div><span id='errormessage' style='color:red'></span></div>\n");

    $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#SubmitButton").css("opacity", "1");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {

        let message = "";
        let valid = true;
        if (!isEmail($("#addemail").val())) {
            valid = false;
            message += "Email is not valid!<br>";
        }
        if ($("#addclientfname").val().length === 0) {
            valid = false;
            message += "A First Name is required!<br>";
        }
        if ($("#addclientlname").val().length === 0) {
            valid = false;
            message += "A Last Name is required!<br>";
        }
        if ($("#addphone").val().length === 0) {
            valid = false;
            message += "A Phone Number is required!<br>";
        }
        if ($("#addphone").val().match(/[a-z]|[A-Z]/g)) {
            valid = false;
            message += "A Phone Number can't have letters!<br>";
        }
        if (!$("#addphone").val().match(/[0-9]/g)) {
            valid = false;
            message += "A Phone Number needs numbers!<br>";
        }
        if ($("#addphone").val().length < 10) {
            valid = false;
            message += "Phone number not long enough!<br>";
        }

        if (valid) {
            $("#errormessage").html("");
            $("#SubmitButton").hide();
            $("#optionsClient").append("<div id='addsuccess'></div>");
            $("#addsuccess").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
            addSubmit("/api/createClient", {
                auth: id_token,
                firstName: $("#addclientfname").val(),
                lastName: $("#addclientlname").val(),
                phone: $("#addphone").val(),
                email: $("#addemail").val(),
                street: $("#addaddress").val(),
            }, addClientSuccess);
        } else {
            $("#errormessage").html(message);
        }
    });
}

function modClientSuccessContact(res, status) {
    $("#modsuccess").html(`<br><h5>Successfully updated Client ${$("#modclientid").val()}!</h5>`);

    setTimeout(function () {
        showFunction(clientFunctionality, "/api/getAllClients");
    }, 1000);
}

function addClientSuccess(res, status) {
    $("#addsuccess").html(`<br><h5>Successfully added Client ${res.id}!</h5>`);

    setTimeout(function () {
        showFunction(clientFunctionality, "/api/getAllClients");
    }, 1000);
}

function deleteClientSuccess(res, status) {
    $("#verifyEntry").html(`<br><h5>Successfully deleted Client ${selectedRow.children()[0].innerHTML}!</h5>`);
    setTimeout(function () {
        showFunction(clientFunctionality, "/api/getAllClients");
    }, 1500);
}

function verifyDeleteClient() {
    let deleteUser = $("#deleteUser").val();
    return (deleteUser == selectedRow.children()[1].innerHTML);
}

//Maker Methods
function makerFunctionality(res) {
    //Create table
    $("#userMainContent").html(
        "<div id=\"buttonsTop\"></div>\n" +
        "<div class='row' id='topRow'>\n" +
        "<div id=\"floor\">\n" +
        "    <table id=\"makerTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div></div>");
    $("#makerTable").append('\n' +
        '        <thead class="thead">\n' +
        '            <th scope="col">Freedom Maker ID</th>\n' +
        '            <th scope="col">Freedom Maker</th>\n' +
        '            <th scope="col">Email</th>\n' +
        '        </thead><tbody>');
    //Populate table
    res.forEach(item => {
        if (!item.deleted) {
            $("#makerTable").append('\n' +
                '<tr class="makerRow">' +
                '   <td scope="row">' + item.id + '</td>' +
                '   <td>' + item.firstName + " " + item.lastName + '</td>' +
                '   <td>' + item.email + '</td></tr>'
            );
        }
        ;
    });
    $("#makerTable").append('\n</tbody>');

    //Body Block content
    createBody("Delete");

    //Event Listeners
    // Modify
    $(".makerRow").click(function () {
        selectedRow = $(this);
        let makerPrompt = `<h5>Please type in the Full Name to delete the selected user.</h5>` +
            `<h6>You selected ${selectedRow.children()[1].innerHTML}<br>ID: ${selectedRow.children()[0].innerHTML}</h6>` +
            "<br><div id='delete'>" +
            "<div id='empty'></div>" +
            "<div><label for='deleteUser'>Enter Full Name:</label></div>" +
            `<div><input class='form-control' type='text' id='deleteUser' name='deleteUser'></div>\n` +
            "<div id='empty'></div>" +
            "</div>\n";

        prePopModForm("/api/getMaker", makerModForm);
        $("#DeleteButton").show();
        $("#DeleteButton").css("opacity", "1");
        $("#DeleteButton").click(function () {
            let makerId = selectedRow.children()[0].innerHTML;
            showDeletePrompt("delete", makerPrompt, "/api/deleteMaker", {
                auth: id_token,
                id: makerId
            }, deleteMakerSuccess, verifyDeleteMaker);
        });
    });

    //Add
    $("#AddButton").click(function () {
        popAddForm(makerAddForm);
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
    $(".makerRow").mouseenter(function () {
        $(this).css('transition', 'background-color 0.5s ease');
        $(this).css('background-color', '#e8ecef');
    }).mouseleave(function () {
        $(this).css('background-color', 'white');
    });
}

function makerModForm(res, status) {
    //Pre-populate forms
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        "<form id='modify'>\n" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modmakerid'>Freedom Maker ID:</label>" +
        `<input class='form-control' type='text' id='modmakerid' name='modmakerid' value='${res.id}' disabled>\n<br>\n` +
        "<label for='modmakerfname'>First Name:</label>" +
        `<input class='form-control' type='text' id='modmakerfname' name='modmakerfname' value='${res.firstName}'>\n<br>\n` +
        "<label for='modmakerlname'>Last Name:</label>" +
        `<input class='form-control' type='text' id='modmakerlname' name='modmakerlname' value='${res.lastName}'>\n<br>\n` +
        "<label for='modemail'>Email:</label>" +
        `<input class='form-control' type='text' id='modemail' name='modemail' value='${res.email}'>\n<br>\n` +
        "</form><div><span id='errormessage' style='color:red'></span></div>\n");

    $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#SubmitButton").css("opacity", "1");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        let message = "";
        let valid = true;
        if (!isEmail($("#modemail").val())) {
            valid = false;
            message += "Email is not valid!<br>";
        }
        if ($("#modmakerfname").val().length === 0) {
            valid = false;
            message += "A First Name is required!<br>";
        }
        if ($("#modmakerlname").val().length === 0) {
            valid = false;
            message += "A Last Name is required!<br>";
        }

        if (valid) {
            $("#errormessage").html("");
            $("#SubmitButton").hide();
            $("#optionsClient").append("<div id='modsuccess'></div>");
            $("#modsuccess").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
            modSubmit("/api/updateMaker", {
                auth: id_token,
                id: $("#modmakerid").val(),
                firstName: $("#modmakerfname").val(),
                lastName: $("#modmakerlname").val(),
                email: $("#modemail").val()
            }, modMakerSuccess);
        } else {
            $("#errormessage").html(message);
        }
    });
}

function makerAddForm() {
    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
        "<form id='add'>\n" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='addmakerfname'>First Name:</label>" +
        `<input class='form-control' type='text' id='addmakerfname' name='addmakerfname'>\n<br>\n` +
        "<label for='addmakerlname'>Last Name:</label>" +
        `<input class='form-control' type='text' id='addmakerlname' name='addmakerlname'>\n<br>\n` +
        "<label for='addemail'>Email:</label>" +
        `<input class='form-control' type='text' id='addemail' name='addemail'>\n<br>\n` +
        "</form><div><span id='errormessage' style='color:red'></span></div>\n");

    $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#SubmitButton").css("opacity", "1");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        let message = "";
        let valid = true;
        if (!isEmail($("#addemail").val())) {
            valid = false;
            message += "Email is not valid!<br>";
        }
        if ($("#addmakerfname").val().length === 0) {
            valid = false;
            message += "A First Name is required!<br>";
        }
        if ($("#addmakerlname").val().length === 0) {
            valid = false;
            message += "A Last Name is required!<br>";
        }

        if (valid) {
            $("#errormessage").html("");
            $("#SubmitButton").hide();
            $("#optionsClient").append("<div id='addsuccess'></div>");
            $("#addsuccess").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
            addSubmit("/api/createMaker", {
                auth: id_token,
                firstName: $("#addmakerfname").val(),
                lastName: $("#addmakerlname").val(),
                email: $("#addemail").val()
            }, addMakerSuccess);
        } else {
            $("#errormessage").html(message);
        }
    });
}

function modMakerSuccess(res, status) {
    $("#modsuccess").html(`<br><h5>Successfully updated Freedom Maker ${$("#modmakerid").val()}!</h5>`);

    setTimeout(function () {
        showFunction(makerFunctionality, "/api/getAllMakers");
    }, 1000);
}

function addMakerSuccess(res, status) {
    $("#addsuccess").html(`<br><h5>Successfully added Freedom Maker ${res.id}!</h5>`);

    setTimeout(function () {
        showFunction(makerFunctionality, "/api/getAllMakers");
    }, 1000);
}

function deleteMakerSuccess(res, status) {
    $("#verifyEntry").html(`<br><h5>Successfully deleted Freedom Maker ${selectedRow.children()[0].innerHTML}!</h5>`);
    setTimeout(function () {
        showFunction(makerFunctionality, "/api/getAllMakers");
    }, 1000);
}

function verifyDeleteMaker() {
    let deleteUser = $("#deleteUser").val();
    return (deleteUser == (selectedRow.children()[1].innerHTML));
}

//Plan Methods
function planFunctionality(res) {
    //Create table
    $("#userMainContent").html(
        "<div id=\"buttonsTop\"></div>\n" +
        "<div class='row' id='topRow'>\n" +
        "<div id=\"floor\">\n" +
        "    <table id=\"planTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div></div>");
    $("#planTable").append('\n' +
        '        <thead class="thead">\n' +
        '            <th scope="col">Plan</th>\n' +
        '            <th scope="col">Price Per Hour</th>\n' +
        '            <th scope="col">Description</th>\n' +
        '        </thead><tbody>');

    //Populate table
    res.forEach(item => {
        let plan = item.plan;
        item = item.plan;
        if (plan.status != "archived") {
            $("#planTable").append('\n' +
                '<tr class="planRow">' +
                '   <td scope="row">' + plan.id + '</td>' +
                '   <td>$' + Number.parseInt(plan.price) / 100 + '</td>' +
                '   <td>' + plan.description + '</td></tr>'
            );
        }
    });
    $("#planTable").append('\n</tbody>');

    //Body Block content
    createBody("Delete");

    //Event Listeners
    //Modify
    $(".planRow").click(function () {
        selectedRow = $(this);
        let planPrompt = `<h5>Please type in the Plan to cancel the selected plan.</h5>` +
            `<h6>You selected Plan: ${selectedRow.children()[0].innerHTML}</h6>` +
            "<br><div id='delete'>" +
            "<div id='empty'></div>" +
            "<div><label for='deleteUser'>Enter Plan:</label></div>" +
            `<div><input class='form-control' type='text' id='deleteUser' name='deleteUser'></div>\n` +
            "<div id='empty'></div>" +
            "</div>\n";

        prePopModForm("/api/retrievePlan", planModForm);
        $("#DeleteButton").show();
        $("#DeleteButton").css("opacity", "1");
        $("#DeleteButton").click(function () {
            let planId = selectedRow.children()[0].innerHTML;
            showDeletePrompt("delete", planPrompt, "/api/deletePlan", {
                auth: id_token,
                planId: planId
            }, deletePlanSuccess, verifyDeletePlan);
        });

    });

    //Add
    $("#AddButton").click(function () {
        popAddForm(planAddForm);
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
    $(".planRow").mouseenter(function () {
        $(this).css('transition', 'background-color 0.5s ease');
        $(this).css('background-color', '#e8ecef');
    }).mouseleave(function () {
        $(this).css('background-color', 'white');
    });
}

function planModForm(res, status) {
    //Pre-populate forms
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        "<form id='modify'>\n" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modplanid'>Plan:</label>" +
        `<input class='form-control' type='text' id='modplanid' name='modplanid' value='${res.plan.id}' disabled>\n<br>\n` +
        "<label for='modplaninvoicename'>Invoice Statement Title:</label>" +
        `<input class='form-control' type='text' id='modplaninvoicename' name='modplaninvoicename' value='${res.plan.invoice_name}'>\n<br><br>\n` +
        "<label for='modplanprice'>Price Per Hour ($):</label>" +
        `<input class='form-control' type='number' id='modplanprice' name='modplanprice' value='${res.plan.price / 100}'>\n<br>\n` +
        "</form><div><span id='errormessage' style='color:red'></span></div>\n");

    $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#SubmitButton").css("opacity", "1");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        let message = "";
        let valid = true;
        if ($("#modplaninvoicename").val().length === 0) {
            valid = false;
            message += "Invoice description is mandatory!<br>";
        }
        if ($("#modplanprice").val().length === 0) {
            valid = false;
            message += "A Price is mandatory!<br>";
        }


        if (valid) {
            $("#errormessage").html("");
            $("#SubmitButton").hide();
            $("#optionsClient").append("<div id='modsuccess'></div>");
            $("#modsuccess").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
            modSubmit("/api/updatePlan", {
                auth: id_token,
                planId: $("#modplanid").val(),
                planInvoiceName: $("#modplaninvoicename").val(),
                planPrice: Number.parseFloat($("#modplanprice").val()).toFixed(2) * 100
            }, modPlanSuccess);
        } else {
            $("#errormessage").html(message);
        }
    });
}

function planAddForm() {
    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
        "<form id='add'>\n" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='addplanname'>Plan:</label>" +
        `<input class='form-control' type='text' id='addplanname' name='addplanname'>\n<br>\n` +
        "<label for='addplaninvoicename'>Invoice Statement Title:</label>" +
        `<input class='form-control' type='text' id='addplaninvoicename' name='addplaninvoicename'>\n<br><br>\n` +
        "<label for='addplanprice'>Price Per Hour ($):</label>" +
        `<input class='form-control' type='number' id='addplanprice' name='addplanprice'>\n<br>\n` +
        "<label for='addplandescription'>Description:</label>" +
        `<input class='form-control' type='text' id='addplandescription' name='addplandescription'>\n<br><br>\n` +
        "</form><div><span id='errormessage' style='color:red'></span></div>\n");

    $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#SubmitButton").css("opacity", "1");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        let message = "";
        let valid = true;
        if ($("#addplanname").val().match(/\s+/g)) {
            message += "No spaces allowed in plan names (use dashes)!<br>";
            valid = false;
        }
        if ($("#addplanname").val().length === 0) {
            message += "A plan name is mandatory!<br>";
            valid = false;
        }
        if ($("#addplaninvoicename").val().length === 0) {
            message += "Invoice Statement Title cannot be blank!<br>";
            valid = false;
        }
        if ($("#addplanprice").val().length === 0) {
            message += "Price per hour must have a value!<br>"
            valid = false;
        }
        if ($("#addplandescription").val().length === 0) {
            message += "A description is required!<br>"
            valid = false;
        }
        if (valid) {
            $("#errormessage").html("");
            $("#SubmitButton").hide();
            $("#optionsClient").append("<div id='addsuccess'></div>");
            $("#addsuccess").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
            addSubmit("/api/createPlan", {
                auth: id_token,
                planId: $("#addplanname").val(),
                invoiceName: $("#addplaninvoicename").val(),
                pricePerHour: Number.parseFloat($("#addplanprice").val()).toFixed(2) * 100,
                planDescription: $("#addplandescription").val()
            }, addPlanSuccess);
        } else {
            $("#errormessage").html(message);
        }
    });
}

function modPlanSuccess(res, status) {
    $("#modsuccess").html(`<br><h5>Successfully updated Plan ${$("#modplanid").val()}!</h5>`);

    setTimeout(function () {
        showFunction(planFunctionality, "/api/getAllPlans");
    }, 1000);
}

function addPlanSuccess(res, status) {
    $("#addsuccess").html(`<br><h5>Successfully added Plan ${res.id}!</h5>`);

    setTimeout(function () {
        showFunction(planFunctionality, "/api/getAllPlans");
    }, 1000);
}

function deletePlanSuccess(res, status) {
    $("#verifyEntry").html(`<br><h5>Successfully deleted Plan ${selectedRow.children()[0].innerHTML}!</h5>`);
    setTimeout(function () {
        showFunction(planFunctionality, "/api/getAllPlans");
    }, 1000);
}

function verifyDeletePlan() {
    let deleteUser = $("#deleteUser").val();
    return (deleteUser == selectedRow.children()[0].innerHTML);
}

//Subscription Methods
function subscriptionFunctionality(res) {
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
        '            <th scope="col">Subscription ID</th>\n' +
        '            <th scope="col">Client</th>\n' +
        '            <th scope="col">Client ID</th>\n' +
        '            <th scope="col">Plan</th>\n' +
        '            <th scope="col">Current Monthly Hours</th>\n' +
        '            <th scope="col">Pending changes</th>\n' +
        '            <th scope="col">Cancelled</th>\n' +
        '            <th scope="col">Next Billing</th>\n' +
        '        </thead><tbody>');

    //Populate table
    res.forEach(item => {
        let subscription = item.subscription;
        let customer = item.customer;
        item = item.subscription;
        let scheduled = subscription.has_scheduled_changes;
        let changes = "";
        (scheduled ? changes = "Yes" : changes = "No");

        if (item && !subscription.deleted) {
            $("#subscriptionTable").append('\n' +
                '<tr class="subscriptionRow">' +
                '   <td scope="row">' + subscription.id + '</td>' +
                '   <td>' + `${customer.first_name} ${customer.last_name}` + '</td>' +
                '   <td>' + subscription.customer_id + '</td>' +
                '   <td>' + subscription.plan_id + '</td>' +
                '   <td>' + subscription.plan_quantity + '</td>' +
                "   <td>" + changes + "</td>" +
                '   <td>' + (subscription.cancelled_at == undefined ? "No" : moment.unix(subscription.cancelled_at).format('YYYY/MM/DD')) + '</td>' +
                '   <td>' + (subscription.next_billing_at == undefined ? "Terminated" : moment.unix(subscription.next_billing_at).format('YYYY/MM/DD')) + '</td></tr>'
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
        let subscriptionPrompt = `<h5>Please type in the Subscription ID to cancel the selected subscription.</h5>` +
            `<h6>You selected ID: ${selectedRow.children()[0].innerHTML}</h6>` +
            "<br><iv id='delete'>" +
            "<div id='empty'></div>" +
            "<div><label for='deleteUser'>Enter Subscription ID:</label></div>" +
            `<div><input class='form-control' type='text' id='deleteUser' name='deleteUser'></div>\n` +
            "<div id='empty'></div>" +
            "</div>\n";

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

function subscriptionModForm(res, status) {
    //Pre-populate forms
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        "<form id='modify'>\n" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modsubscriptionid'>Subscription:</label>" +
        `<input class='form-control' type='text' id='modsubscriptionid' name='modsubscriptionid' value='${res.id}' disabled>\n<br>\n` +
        "<label for='modsubscriptionclient'>Client:</label>" +
        `<input class='form-control' type='text' id='modsubscriptionclient' name='modsubscriptionclient' value='${selectedRow.children()[1].innerHTML}' disabled>\n<br><br>\n` +
        "<label for='modsubscriptionplanname'>Plan:</label>" +
        `<select class='form-control' id='modsubscriptionplanname' name='modsubscriptionplanname'></select>\n<br>\n` +
        "<label for='modsubscriptionplanquantity'>Monthly Hours:</label>" +
        `<input class='form-control' type='number' id='modsubscriptionplanquantity' name='modsubscriptionplanquantity' value='${res.plan_quantity}'>\n<br><br>\n` +
        "<label for='modsubscriptionprice'>Price Per Hour ($):</label>" +
        `<input class='form-control' type='number' id='modsubscriptionprice' name='modsubscriptionprice' value='${res.plan_unit_price == undefined ? "" : res.plan_unit_price / 100}'>\n<br>\n` +
        "</form><div><span id='errormessage' style='color:red'></span></div>");

    $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#SubmitButton").css("opacity", "1");

    $("#optionsClient").append("<div id='pendingChanges'></div>");

    //Pre-populating drop down options
    $.ajax({
        url: "/api/getAllPlans",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (planres, planstatus) {
            for (var plan in planres) {
                plan = planres[plan].plan;
                if (selectedRow.children()[3].innerHTML == plan.id)
                    $('#modsubscriptionplanname').append(
                        `<option id="${plan.id}" value="${plan.id}" selected>${plan.id}</option>`
                    );
                else
                    $('#modsubscriptionplanname').append(
                        `<option id="${plan.id}" value="${plan.id}">${plan.id}</option>`
                    );
            }

            //Submit button function
            $("#SubmitButton").off("click");
            $("#SubmitButton").on('click', function (e) {
                let message = "";
                let valid = true;
                let monthlyHours = $("#modsubscriptionplanquantity").val();
                if ($("#modsubscriptionplanquantity").val().length === 0 || $("#modsubscriptionplanquantity").val().includes(".") || $("#modsubscriptionplanquantity").val() == 0) {
                    valid = false;
                    message += "Invalid entry! Please try again.<br>";
                }
                if ($("#modsubscriptionprice").val().length === 0) {
                    valid = false;
                    message += "Please indicate the price per hour for this subscription!<br>";
                }

                if (valid) {
                    $("#errormessage").html("");
                    $("#SubmitButton").hide();
                    $("#optionsClient").append("<div id='modsuccess'></div>");
                    $("#modsuccess").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
                    modSubmit("/api/updateSubscription", {
                        auth: id_token,
                        subscriptionId: $("#modsubscriptionid").val(),
                        planId: $("#modsubscriptionplanname").val(),
                        planQuantity: $("#modsubscriptionplanquantity").val(),
                        pricePerHour: $("#modsubscriptionprice").val()
                    }, modSubscriptionSuccess);
                } else {
                    $("#errormessage").html(message);
                }

            });
        },
        error: function (planres, makerstatus) {
            $("#userMainContent").html("Relationships isn't working!");
        }
    });

    //Has pending changes
    if (selectedRow.children()[5].innerHTML == "Yes") {
        $.ajax({
            url: "/api/retrieveSubscriptionChanges",
            method: "post",
            data: {
                auth: id_token,
                subscriptionId: selectedRow.children()[0].innerHTML
            },
            dataType: "json",
            success: function (retres, retstatus) {
                $("#pendingChanges").css("opacity", "1");
                $("#pendingChanges").html("<br><hr><p>This plan has the following scheduled change and will take effect on the next " +
                    "renewed billing cycle." +
                    `<h5>Monthly Hours from ${selectedRow.children()[4].innerHTML} to ${retres.plan_quantity} starting on ${selectedRow.children()[7].innerHTML}</h5>` +
                    "If you want to revoke this change,<br>please click <button id='CancelChangeButton' type='button' class='btn btn-default'>Revoke</button> to end the change request</span>.<br>" +
                    "<div id='cancelChange'></div>");

                $("#CancelChangeButton").on("click", function () {
                    $.ajax({
                        url: "/api/undoSubscriptionChanges",
                        method: "post",
                        data: {
                            auth: id_token,
                            subscriptionId: selectedRow.children()[0].innerHTML
                        },
                        dataType: "json",
                        success: function (undores, undostatus) {
                            $("#cancelChange").append("<br><h5>Successfully revoked the change request!</h5>");
                            setTimeout(function () {
                                showFunction(subscriptionFunctionality, "/api/getAllSubscriptions");
                            }, 1000);
                        },
                        error: function (undores, undostatus) {
                            $("#userMainContent").html("Unable to revoke change request!");
                        }
                    });
                });
            },
            error: function (retres, retstatus) {
                $("#userMainContent").html("Retrieve changes isn't working!");
            }
        });
    }
}

function subscriptionAddForm() {
    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
        "<form id='add'>\n" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='addsubscriptioncustomerid'>Client:</label>" +
        `<select class='form-control' id='addsubscriptioncustomerid' name='addsubscriptioncustomerid'></select>\n` +
        "<label for='empty'></label>" +
        "<label for='addsubscriptionplanid'>Plan:</label>" +
        `<select class='form-control' id='addsubscriptionplanid' name='addsubscriptionplanid'></select><br><br>\n` +
        "<label for='addsubscriptionplanquantity'>Planned Monthly Hours:</label>" +
        `<input class='form-control' type='number' step='1' id='addsubscriptionplanquantity' name='addsubscriptionplanquantity'>\n<br>\n` +
        "</form><br><div><span id='errormessage' style='color:red'></span></div>\n");

    $("#optionsClient").append("<hr><p>Note: Only Clients that have a valid payment method will populate in the field.</p>");

    $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#SubmitButton").css("opacity", "1");

    //Pre-populating drop down options
    $.ajax({
        url: "/api/getAllPlans",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (planres, planstatus) {

            $.ajax({
                url: "/api/getAllClients",
                method: "post",
                data: {
                    auth: id_token
                },
                dataType: "json",
                success: function (clientres, clientstatus) {
                    for (var plan in planres) {
                        plan = planres[plan].plan;
                        if (plan.status != 'archived') {
                            $('#addsubscriptionplanid').append(
                                `<option id="${plan.id}" value="${plan.id}">${plan.id}</option>`
                            );
                        }
                    }
                    for (var client in clientres) {
                        client = clientres[client].customer;
                        if (client.card_status == "valid") {
                            $('#addsubscriptioncustomerid').append(
                                `<option id="${client.id}" value="${client.id}">${client.first_name + ' ' + client.last_name + ' - ' + client.id}</option>`
                            );
                        }
                    }

                    //Submit button function
                    $("#SubmitButton").off("click");
                    $("#SubmitButton").on('click', function (e) {
                        let message = "";
                        let valid = true;
                        if ($("#addsubscriptionplanquantity").val().length === 0 || $("#addsubscriptionplanquantity").val().includes(".") || $("#addsubscriptionplanquantity").val() == 0 || $("#addsubscriptionplanquantity").val().includes("-")) {
                            valid = false;
                            message += "Invalid entry! Please try again.<br>";
                        }

                        if (valid) {
                            $("#errormessage").html("");
                            $("#SubmitButton").hide();
                            $("#optionsClient").append("<div id='addsuccess'></div>");
                            $("#addsuccess").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
                            addSubmit("/api/createSubscription", {
                                auth: id_token,
                                planId: $("#addsubscriptionplanid").val(),
                                customerId: $("#addsubscriptioncustomerid").val(),
                                planQuantity: $("#addsubscriptionplanquantity").val(),
                            }, addSubscriptionSuccess);
                        } else {
                            $("#errormessage").html(message);
                        }
                    });
                },
                error: function (clientres, clientstatus) {
                    $("#userMainContent").html("Clients isn't working!");
                }
            });
        },
        error: function (planres, makerstatus) {
            $("#userMainContent").html("Plans isn't working!");
        }
    });
}

function modSubscriptionSuccess(res, status) {
    $("#modsuccess").html(`<br><h5>Successfully updated Subscription ${$("#modsubscriptionid").val()}!</h5>`);

    setTimeout(function () {
        showFunction(subscriptionFunctionality, "/api/getAllSubscriptions");
    }, 1000);

}

function addSubscriptionSuccess(res, status) {
    $("#addsuccess").html(`<br><h5>Successfully added Subscription ${res.id}!</h5>`);

    setTimeout(function () {
        showFunction(subscriptionFunctionality, "/api/getAllSubscriptions");
    }, 1000);

}

function deleteSubscriptionSuccess(res, status) {
    $("#verifyEntry").html(`<br><h5>Successfully deleted Subscription ${selectedRow.children()[0].innerHTML}!</h5>`);
    setTimeout(function () {
        showFunction(subscriptionFunctionality, "/api/getAllSubscriptions");
    }, 1000);
}

function verifyDeleteSubscription() {
    let deleteUser = $("#deleteUser").val();
    return (deleteUser == selectedRow.children()[0].innerHTML);
}

//Relationship Methods
function relationshipFunctionality(res) {
    $.ajax({
        url: "/api/getAllClients",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (clientres, clientstatus) {
            $("#manageRelationships").append("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
            $.ajax({
                url: "/api/getAllMakers",
                method: "post",
                data: {
                    auth: id_token
                },
                dataType: "json",
                success: function (makerres, makerstatus) {
                    $.ajax({
                        url: "/api/getAllPlans",
                        method: "post",
                        data: {
                            auth: id_token
                        },
                        dataType: "json",
                        success: function (planres, planstatus) {
                            //Create table
                            let clientMap = {};
                            let makerMap = {};
                            for (var item of clientres) {
                                if (item.customer.first_name) {
                                    clientMap[item.customer.id] = item.customer;
                                }
                            }
                            for (var item of makerres) {
                                makerMap[item.id] = item;
                            }
                            $("#userMainContent").html(
                                "<div id=\"buttonsTop\"></div>\n" +
                                "<div class='row' id='topRow'>\n" +
                                "<div id=\"floor\">\n" +
                                "    <table id=\"relationshipTable\" class=\"table\">\n" +
                                "    </table>\n" +
                                "</div></div>");
                            $("#relationshipTable").append('\n' +
                                '        <thead class="thead">\n' +
                                '            <th scope="col">Relationship ID</th>\n' +
                                '            <th scope="col">Client </th>\n' +
                                '            <th scope="col">Client ID</th>\n' +
                                '            <th scope="col">Freedom Maker</th>\n' +
                                '            <th scope="col">Freedom Maker ID</th>\n' +
                                '            <th scope="col">Plan</th>\n' +
                                '            <th scope="col">Freedom Maker Role</th>\n' +
                                '        </thead><tbody>');
                            //Populate table
                            res.forEach(item => {
                                $("#relationshipTable").append('\n' +
                                    '<tr class="relationshipRow">' +
                                    '   <td>' + item.id + '</td>' +
                                    '   <td>' + clientMap[item.clientId].first_name + " " + clientMap[item.clientId].last_name + '</td>' +
                                    '   <td>' + clientMap[item.clientId].id + '</td>' +
                                    '   <td>' + makerMap[item.makerId].firstName + " " + makerMap[item.makerId].lastName + '</td>' +
                                    '   <td>' + makerMap[item.makerId].id + '</td>' +
                                    '   <td>' + item.planId + '</td>' +
                                    '   <td>' + item.occupation + '</td>'
                                );
                            });
                            $("#relationshipTable").append('\n</tbody>');

                            //Body Block content
                            createBody("Delete");

                            //Event Listeners
                            //Modify
                            $(".relationshipRow").click(function () {
                                selectedRow = $(this);
                                let relationshipPrompt = `<h5>Please type in the Relationship ID to delete the selected relationship.</h5>` +
                                    `<h6>You selected ID: ${selectedRow.children()[0].innerHTML}</h6>` +
                                    "<br><div id='delete'>" +
                                    "<div id='empty'></div>" +
                                    "<div><label for='deleteUser'>Enter Relationship ID:</label></div>" +
                                    `<div><input class='form-control' type='text' id='deleteUser' name='deleteUser'></div>\n` +
                                    "<div id='empty'></div>" +
                                    "</div>\n";
                                prePopModForm("/api/getRelationshipById", relationshipModForm);
                                $("#DeleteButton").show();
                                $("#DeleteButton").css("opacity", "1");
                                $("#DeleteButton").click(function () {
                                    let relationshipId = selectedRow.children()[0].innerHTML;
                                    showDeletePrompt("delete", relationshipPrompt, "/api/deleteRelationship", {
                                        auth: id_token,
                                        id: relationshipId
                                    }, deleteRelationshipSuccess, verifyDeleteRelationship);
                                });

                            });

                            //Add
                            $("#AddButton").click(function () {
                                popAddForm(relationshipAddForm);
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
                            $(".relationshipRow").mouseenter(function () {
                                $(this).css('transition', 'background-color 0.5s ease');
                                $(this).css('background-color', '#e8ecef');
                            }).mouseleave(function () {
                                $(this).css('background-color', 'white');
                            });

                            $(".spinner-border").remove();
                        },
                        error: function (planres, planstatus) {
                            $("#userMainContent").html("Plan Relationship isn't working!");
                        }
                    });
                },
                error: function (makerres, makerstatus) {
                    $("#userMainContent").html("Maker Relationship isn't working!");
                }
            });
        },
        error: function (clientres, clientstatus) {
            $("#userMainContent").html("Client Relationship isn't working! Please refresh the page. Contact support if the problem persists.");
        }
    });
}

function relationshipModForm(res, status) {
//Pre-populate forms
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        `<h6>You selected Relationship ID: ${selectedRow.children()[0].innerHTML}<br>Client: ${selectedRow.children()[1].innerHTML}</h6>` +
        "<br><form id='modify'>" +
        "<label for='modMakerRel'>Select a Freedom Maker:</label>" +
        "<select class='form-control' id='modMakerRel'></select>\n<br><br>" +
        "<label for='modMakerOcc'>Enter Freedom Maker Role:</label>" +
        `<input class='form-control' type='text' id='modMakerOcc' name='modMakerOcc' value='${selectedRow.children()[6].innerHTML}'><div><span id='errormessage' style='color:red'></span>\n` +
        "<div id='empty'></div></form>");

    $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#SubmitButton").css("opacity", "1");

    $.ajax({
        url: "/api/getAllMakers",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (makerres, makerstatus) {
            $.ajax({
                url: "/api/getRelationshipById",
                method: "post",
                data: {
                    auth: id_token,
                    id: selectedRow.children()[0].innerHTML
                },
                dataType: "json",
                success: function (relres, relstatus) {
                    let makerId = relres.makerId;
                    for (var item of makerres) {
                        if (makerId == item.id) {
                            $('#modMakerRel').append(
                                `<option id="${makerId}" value="${makerId}" selected>${item.firstName} ${item.lastName} - ${makerId}</option>`
                            );
                        } else if (!item.deleted) {
                            $('#modMakerRel').append(
                                `<option id="${item.id}" value="${item.id}">${item.firstName} ${item.lastName} - ${item.id}</option>`
                            );
                        }
                    }
                    ;

                    //Submit button function
                    $("#SubmitButton").off("click");
                    $("#SubmitButton").on('click', function (e) {
                        let message = "";
                        let valid = true;
                        if ($("#modMakerOcc").val().length === 0) {
                            valid = false;
                            message += "A Role is required!<br>";
                        }

                        if (valid) {
                            $("#errormessage").html("");
                            $("#SubmitButton").hide();
                            $("#optionsClient").append("<div id='modsuccess'></div>");
                            $("#modsuccess").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
                            modSubmit("/api/updateRelationship", {
                                auth: id_token,
                                id: selectedRow.children()[0].innerHTML,
                                makerId: $("#modMakerRel").val(),
                                planId: relres.planId,
                                occupation: $("#modMakerOcc").val()
                            }, modRelationshipSuccess);
                        } else {
                            $("#errormessage").html(message);
                        }
                    });
                },
                error: function (relres, relstatus) {
                    $("#userMainContent").html("Makers isn't working!");
                }
            });
        },
        error: function (makerres, makerstatus) {
            $("#userMainContent").html("Relationships isn't working! Please refresh the page. Contact support if the problem persists.");
        }
    });
}

function relationshipAddForm() {
    $.ajax({
        url: "/api/getAllClients",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (clientres, clientstatus) {
            $.ajax({
                url: "/api/getAllMakers",
                method: "post",
                data: {
                    auth: id_token
                },
                dataType: "json",
                success: function (makerres, makerstatus) {
                    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
                        "<form id='add'>\n" +
                        "<label for='empty'></label>" +
                        "<label for='empty'></label>" +
                        "<label for='empty'></label>" +
                        "<label for='addClientRel'> Select a Client:</label>" +
                        "<select class='form-control' id='addClientRel'>\n</select>\n<br><br>" +
                        "<label for='addMakerRel'> Select a Freedom Maker:</label>" +
                        "<select class='form-control' id='addMakerRel'>\n</select>\n<br>" +
                        "<label for='addPlanRel'> Select a Plan:</label>" +
                        "<select class='form-control' id='addPlanRel'>\n</select>\n<br><br>\n" +
                        "<label for='addOccRel'> Enter Freedom Maker Role:</label>" +
                        "<input class='form-control' type='text' id='addOccRel' name='addOccRel'>" +
                        "</form><div><span id='errormessage' style='color:red'></span></div>\n");

                    $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
                    $("#SubmitButton").css("opacity", "1");

                    for (var i = 0; i < clientres.length; ++i) {
                        $('#addClientRel').append(
                            `<option id="${clientres[i].customer.id}" value="${clientres[i].customer.id}">${clientres[i].customer.first_name} ${clientres[i].customer.last_name} - ${clientres[i].customer.id}</option>`
                        );
                        if (i == clientres.length - 1) {
                            $.ajax({
                                url: "/api/getAllPlans",
                                method: "post",
                                data: {
                                    auth: id_token
                                },
                                dataType: "json",
                                success: function (planres, planstatus) {
                                    $("#addPlanRel").html("");

                                    for (var item of makerres) {
                                        if (!item.deleted) {
                                            $('#addMakerRel').append(
                                                `<option id="${item.id}" value="${item.id}">${item.firstName} ${item.lastName}  -  ${item.id}</option>`
                                            );
                                        }
                                    }

                                    for (var item of planres) {
                                        if (item.plan.status != "archived")
                                            $('#addPlanRel').append(
                                                `<option id="${item.plan.id}" value="${item.plan.id}">${item.plan.id}</option>`
                                            );

                                    }

                                },
                                error: function (planres, planstatus) {
                                    $("#userMainContent").html("Subscriptions isn't working!");
                                }
                            });
                        }
                    }

                    $("#addClientRel").on('change', function () {
                        $.ajax({
                            url: "/api/getTimeBucketsByClientId",
                            method: "post",
                            data: {
                                auth: id_token,
                                id: $("#addClientRel").val()
                            },
                            dataType: "json",
                            success: function (bucketres, bucketstatus) {
                                $("#addMakerRel").html("");

                                for (var item of makerres) {
                                    if (!item.deleted) {
                                        $('#addMakerRel').append(
                                            `<option id="${item.id}" value="${item.id}">${item.firstName} ${item.lastName}  -  ${item.id}</option>`
                                        );
                                    }
                                }
                            },
                            error: function (bucketres, bucketstatus) {
                                $("#userMainContent").html("Subscriptions isn't working!");
                            }
                        });
                    })


                    //Submit button function
                    $("#SubmitButton").off("click");
                    $("#SubmitButton").on('click', function (e) {
                        let message = "";
                        let valid = true;
                        if ($("#addOccRel").val().length === 0) {
                            valid = false;
                            message += "A Role is required!<br>";
                        }

                        if (valid) {
                            $("#errormessage").html("");
                            $("#SubmitButton").hide();
                            $("#optionsClient").append("<div id='addsuccess'></div>");
                            $("#addsuccess").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
                            addSubmit("/api/createRelationship", {
                                auth: id_token,
                                clientId: $("#addClientRel").val(),
                                makerId: $("#addMakerRel").val(),
                                planId: $("#addPlanRel").val(),
                                occupation: $("#addOccRel").val(),
                            }, addRelationshipSuccess);
                        } else {
                            $("#errormessage").html(message);
                        }
                    });
                },
                error: function (makerres, makerstatus) {
                    $("#userMainContent").html("Maker Relationship isn't working!");
                }
            });
        },
        error: function (clientres, clientstatus) {
            $("#userMainContent").html("Client Relationship isn't working! Please refresh the page. Contact support if the problem persists.");
        }
    });
}

function modRelationshipSuccess(res, status) {
    $("#modRelSuccess").html(`<br><h5>Successfully updated Relationship for Client ${selectedRow.children()[1].innerHTML}!</h5>`);

    setTimeout(function () {
        showFunction(relationshipFunctionality, "/api/getAllRelationships");
    }, 1000);
}

function addRelationshipSuccess(res, status) {
    $("#addRelSuccess").html(`<br><h5>Successfully added Relationship ${res.id}!</h5>`);

    setTimeout(function () {
        showFunction(relationshipFunctionality, "/api/getAllRelationships");
    }, 1000);
}

function deleteRelationshipSuccess() {
    $("#verifyEntry").html(`<br><h5>Successfully deleted Relationship ${selectedRow.children()[0].innerHTML}!</h5>`);
    setTimeout(function () {
        showFunction(relationshipFunctionality, "/api/getAllRelationships");
    }, 1000);
}

function verifyDeleteRelationship() {
    let deleteUser = $("#deleteUser").val();
    return (deleteUser == (selectedRow.children()[0].innerHTML));
}

//Credit Methods
function creditFunctionality(res) {
    //Create table
    $("#userMainContent").html(
        "<div id=\"buttonsTop\"></div>\n" +
        "<div class='row' id='topRow'>\n" +
        "<div id=\"floor\">\n" +
        "    <table id=\"creditTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div></div>");
    $("#creditTable").append('\n' +
        '        <thead class="thead">\n' +
        '            <th scope="col">Client ID</th>\n' +
        '            <th scope="col">Client</th>\n' +
        '            <th scope="col">Plan</th>\n' +
        '            <th scope="col">Available Hours</th>\n' +
        '        </thead><tbody>');
    //Populate table
    res.forEach(customer => {
        for (var item in customer.buckets) {
            let hours = (Number.parseFloat(customer.buckets[item]) / 60);
            let minutes = (customer.buckets[item]) % 60;
            let message = "";
            if (hours >= 0) {
                message += ` ${Math.floor(hours)} hours `;
            }
            if (hours <= -1) {
                hours = Math.abs(hours);
                message += `-${Math.floor(hours)} hours `;
            }
            if (minutes >= 0 || minutes < 0) {
                message += ` ${minutes} minutes `;
            }
            $("#creditTable").append('\n' +
                '<tr class="creditRow">' +
                '   <td scope="row">' + customer.id + '</td>' +
                '   <td scope="row">' + customer.first_name + ' ' + customer.last_name + '</td>' +
                '   <td>' + item + '</td>' +
                `   <td>${message}</td>`
            );
        }
        ;
    });
    $("#creditTable").append('\n</tbody>');

    //Body Block content
    createBody("Delete");

    //Event Listeners
    //Modify
    $(".creditRow").click(function () {
        selectedRow = $(this);
        let creditPrompt = `<h5>Please type in the Plan to delete the selected credit.</h5>` +
            `<h6>You selected Plan: ${selectedRow.children()[2].innerHTML}<br>Client: ${selectedRow.children()[1].innerHTML}</h6>` +
            "<br><div id='delete'>" +
            "<div id='empty'></div>" +
            "<div><label for='deleteUser'>Enter Plan:</label></div>" +
            `<div><input class='form-control' type='text' id='deleteUser' name='deleteUser'></div>\n` +
            "<div id='empty'></div>" +
            "</div>\n";
        ;
        prePopModForm("/api/getAllTimeBuckets", creditModForm);
        $("#DeleteButton").show();
        $("#DeleteButton").css("opacity", "1");
        $("#DeleteButton").click(function () {
            let clientId = selectedRow.children()[0].innerHTML;
            let planId = selectedRow.children()[2].innerHTML;
            showDeletePrompt("delete", creditPrompt, "/api/deleteBucket", {
                auth: id_token,
                id: clientId,
                bucket: planId,
            }, deleteCreditSuccess, verifyDeleteCredit);
        });
    });

    //Add
    $("#AddButton").click(function () {
        popAddForm(creditAddForm);
    });

    //Expand Table Button
    $("#ExpandButton").click(function () {
        expandTable();
    });

    //Row effect
    $(".creditRow").mouseenter(function () {
        $(this).css('transition', 'background-color 0.5s ease');
        $(this).css('background-color', '#e8ecef');
    }).mouseleave(function () {
        $(this).css('background-color', 'white');
    });
}

function creditModForm(res, status) {
//Pre-populate forms
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        `<h6>You selected Client: ${selectedRow.children()[1].innerHTML}<br>Client ID: ${selectedRow.children()[0].innerHTML}<br>Plan: ${selectedRow.children()[2].innerHTML}</h6>` +
        "<br><br><form id='modify'>" +
        `<div>Enter a number (+/-) to adjust hours:</div>` +
        "<input class='form-control' type='number' id='creditmodhours' name='creditmodhours'>" +
        `<br><br><div>Enter a number (+/-) to adjust minutes:</div>` +
        "<input class='form-control' type='number' id='creditmodminutes' name='creditmodminutes'>" +
        "</form><div><span id='errormessage' style='color:red'></span></div>");

    $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#SubmitButton").css("opacity", "1");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        var hours = (Number.parseInt($("#creditmodhours").val()) * 60) || 0;
        var minutes = Number.parseInt($("#creditmodminutes").val()) || 0;
        var hoursPlusMin = hours + minutes;

        let valid = true;
        let message = "";
        if ($("#creditmodhours").val() == "" && $("#creditmodminutes").val() == "") {
            valid = false;
            message += "Please enter an amount to purchase!<br>"
        }
        if ($("#creditmodhours").val().includes(".")) {
            valid = false;
            message += "No decimals in hours please!<br>";
        }
        if ($("#creditmodminutes").val().includes(".")) {
            valid = false;
            message += "No decimals in minutes please!<br>"
        }

        if (!valid) {
            $("#errormessage").html(`<span style='color:red'>${message}</span>`);
        } else {

            if ($("#buyHours").val() == "") {
                $("#buyHours").val(0);
            }
            if ($("#buyMin").val() == "") {
                $("#buyMin").val(0);
            }

            if (valid) {
                $("#errormessage").html("");
                $("#SubmitButton").hide();
                $("#optionsClient").append("<div id='modsuccess'></div>");
                $("#modsuccess").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
                modSubmit("/api/updateClientTimeBucket", {
                    auth: id_token,
                    id: selectedRow.children()[0].innerHTML,
                    planId: selectedRow.children()[2].innerHTML,
                    minutes: hoursPlusMin,
                }, modCreditSuccess);
            } else {
                $("#errormessage").html(message);
            }
        }
    });
}

function creditAddForm() {
    $.ajax({
        url: "/api/getAllClients",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (clientres, clientstatus) {
            $.ajax({
                url: "/api/getAllPlans",
                method: "post",
                data: {
                    auth: id_token
                },
                dataType: "json",
                success: function (planres, planstatus) {
                    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
                        "<form id='add'>" +
                        "<div id='empty'></div>" +
                        "<div id='empty'></div>" +
                        "<div id='empty'></div>" +
                        "<label for='addClientCredit'> Select a Client: </label>" +
                        "<select class='form-control' id='addClientCredit'>\n</select>\n<br>\n" +
                        "<label for='addPlanCredit'> Select a Plan: </label>" +
                        "<select class='form-control' id='addPlanCredit'>\n</select>\n<br><br>\n" +
                        "<label for='addMinCredit'> Enter Number of Hours: </label>" +
                        "<input class='form-control' type='number' id='addHourCredit' name='addHourCredit'>\n<br>" +
                        "<label for='addMinCredit'> Enter Number of Minutes: </label>" +
                        "<input class='form-control' type='number' id='addMinCredit' name='addMinCredit'>\n<br><br>" +
                        "</form><div><span id='errormessage' style='color:red'></span></div>");

                    $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
                    $("#SubmitButton").css("opacity", "1");

                    for (var client in clientres) {
                        client = clientres[client].customer;
                        $('#addClientCredit').append(
                            `<option id="${client.id}" value="${client.id}">${client.first_name} ${client.last_name} - ${client.id}</option>`
                        );
                    }
                    for (var item of planres) {
                        if (item.plan.status != "archived") {
                            $('#addPlanCredit').append(
                                `<option id="${item.plan.id}" value="${item.plan.id}">${item.plan.id}</option>`
                            );
                        }
                    }

                    //Submit button function
                    $("#SubmitButton").off("click");
                    $("#SubmitButton").on('click', function (e) {
                        var hours = (Number.parseInt($("#addHourCredit").val()) * 60) || 0;
                        var minutes = Number.parseInt($("#addMinCredit").val()) || 0;
                        var hoursPlusMin = hours + minutes;
                        console.log(hoursPlusMin);
                        let valid = true;

                        let message = "";
                        if ($("#addHourCredit").val() == "" && $("#addMinCredit").val() == "") {
                            valid = false;
                            message += "Please enter an amount to purchase!<br>"
                        }
                        if ($("#addHourCredit").val().includes(".")) {
                            valid = false;
                            message += "No decimals in hours please!<br>";
                        }
                        if ($("#addMinCredit").val().includes(".")) {
                            valid = false;
                            message += "No decimals in minutes please!<br>"
                        }

                        if (!valid) {
                            $("#errormessage").html(`<span style='color:red'>${message}</span>`);
                        } else {

                            if ($("#addHourCredit").val() == "") {
                                $("#addHourCredit").val(0);
                            }
                            if ($("#addMinCredit").val() == "") {
                                $("#addMinCredit").val(0);
                            }

                            if (valid) {
                                $("#errormessage").html("");
                                $("#SubmitButton").hide();
                                $("#optionsClient").append("<div id='addsuccess'></div>");
                                $("#addsuccess").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
                                addSubmit("/api/updateClientTimeBucket", {
                                    auth: id_token,
                                    id: $("#addClientCredit").val(),
                                    planId: $("#addPlanCredit").val(),
                                    minutes: hoursPlusMin,
                                }, addCreditSuccess);
                            } else {
                                $("#errormessage").html(message);
                            }
                        }
                    });
                },
                error: function (planres, planstatus) {
                    $("#userMainContent").html("Plan Credit isn't working!");
                }
            });
        },
        error: function (clientres, clientstatus) {
            $("#userMainContent").html("Client Credit isn't working! Please refresh the page. Contact support if the problem persists.");
        }
    });
}

function modCreditSuccess(res, status) {
    $("#modCreditSuccess").html(`<br><h5>Successfully updated hours for Client ${selectedRow.children()[1].innerHTML}!</h5>`);

    setTimeout(function () {
        showFunction(creditFunctionality, "/api/getAllTimeBuckets");
    }, 1000);
}

function addCreditSuccess(res, status) {
    $("#addCreditSuccess").html(`<br><h5>Successfully added plan for ${res.first_name} ${res.last_name}!</h5>`);

    setTimeout(function () {
        showFunction(creditFunctionality, "/api/getAllTimeBuckets");
    }, 1000);
}

function deleteCreditSuccess(res, status) {
    $("#verifyEntry").html(`<br><h5>Successfully deleted credit for Client ${selectedRow.children()[1].innerHTML}!</h5>`);

    setTimeout(function () {
        showFunction(creditFunctionality, "/api/getAllTimeBuckets");
    }, 1000);
}

function verifyDeleteCredit() {
    let deleteUser = $("#deleteUser").val();
    return (deleteUser == selectedRow.children()[2].innerHTML);

}

//TimeSheet Methods
function timeSheetFunctionality(res) {
    $.ajax({
        url: '/api/getAllMakers',
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (makerres, makerstatus) {
            $.ajax({
                url: '/api/getAllClients',
                method: "post",
                data: {
                    auth: id_token
                },
                dataType: "json",
                success: function (innerRes, innerStatus) {
                    let clientMap = {};
                    for (var i = 0; i < innerRes.length; ++i) {
                        let client = innerRes[i].customer;
                        if (client && client.first_name) {
                            clientMap[client.id] = client;
                        }
                    }

                    let makerMap = {};
                    for (var i = 0; i < makerres.length; ++i) {
                        let maker = makerres[i];
                        makerMap[maker.id] = maker;
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
                        '            <th scope="col">Time Sheet ID</th>\n' +
                        '            <th scope="col">Freedom Maker</th>\n' +
                        '            <th scope="col">Client</th>\n' +
                        '            <th scope="col">Plan</th>\n' +
                        '            <th scope="col">Clock In (GMT/UTC)</th>\n' +
                        '            <th scope="col">Clock Out (GMT/UTC)</th>\n' +
                        '            <th scope="col">Task</th>\n' +
                        '            <th scope="col">Detail</th>\n' +
                        '        </thead><tbody>');

                    //Populate table
                    res.forEach(item => {
                        let clientIdentifier = item.clientId;
                        clientIdentifier = clientMap[clientIdentifier] ?
                            clientMap[clientIdentifier].first_name + " " + clientMap[clientIdentifier].last_name :
                            `Deleted, ID: ${clientIdentifier}`;
                        let message = null;
                        if (item.adminNote == null) {
                            message = "";
                        } else {
                            message = item.adminNote;
                        }

                        let makerValue;
                        if (makerMap[item.makerId].deleted) {
                            makerValue = "Deleted, ID: " + makerMap[item.makerId].id;
                        } else {
                            makerValue = makerMap[item.makerId].firstName + " " + makerMap[item.makerId].lastName
                        }

                        $("#sheetsTable").append('\n' +
                            '<tr class="sheetRow">' +
                            '   <td scope="row">' + item.id + '</td>' +
                            '   <td>' + makerValue + '</td>' +
                            '   <td>' + clientIdentifier + '</td>' +
                            '   <td>' + item.hourlyRate + '</td>' +
                            '   <td>' + item.timeIn + '</td>' +
                            '   <td>' + item.timeOut + '</td>' +
                            '   <td>' + item.task + '</td>' +
                            '   <td>' + message + '</td></tr>');
                    });
                    $("#sheetsTable").append('\n</tbody>');

                    //Body Block content
                    createBody("Clear");

                    //Event Listeners
                    //Modify
                    $(".sheetRow").click(function () {
                        selectedRow = $(this);
                        let timeSheetPrompt = `<h5>Please type in the Time Sheet ID to clear the selected time sheet.</h5>` +
                            `<h6>You selected ID: ${selectedRow.children()[0].innerHTML}</h6>` +
                            "<br><div id='delete'>" +
                            "<div id='empty'></div>" +
                            "<label for='deleteUser'>Enter Time Sheet ID:</label>" +
                            `<input class='form-control' type='text' id='deleteUser' name='deleteUser'>\n<br>\n` +
                            "<div id='empty'></div>" +
                            "</div>\n" +
                            "<hr><p>Note: First please calculate the running time to credit back to the associated client.<br>Changes may take a moment to reflect.</p>";
                        prePopModForm("/api/getTimeSheet", sheetModForm);
                        $("#DeleteButton").show();
                        $("#DeleteButton").css("opacity", "1");
                        $("#DeleteButton").click(function () {
                            if ($("#modsheetdetail").val() == "" || $("#modsheetdetail").val() == "undefined") {
                                $("#errormessage").html("");
                                $("#errormessage").html("Requires a detail to clear!");
                            } else {
                                let sheetId = selectedRow.children()[0].innerHTML;
                                showDeletePrompt("clear", timeSheetPrompt, "/api/clearTimeSheet", {
                                    auth: id_token,
                                    id: sheetId,
                                    detail: $("#modsheetdetail").val()
                                }, clearSheetSuccess, verifyClearSheet);
                            }
                        });
                    });

                    //Add
                    $("#AddButton").click(function () {
                        popAddForm(sheetAddForm);
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
                    $(".sheetRow").mouseenter(function () {
                        $(this).css('transition', 'background-color 0.5s ease');
                        $(this).css('background-color', '#e8ecef');
                    }).mouseleave(function () {
                        $(this).css('background-color', 'white');
                    });
                },
                error: function (innerres, innerstatus) {
                    $("#userMainContent").html("Something went wrong!");
                }
            });

        },
        error: function (makerres, makerstatus) {
            $("#userMainContent").html("Something went wrong! Please refresh the page. Contact support if the problem persists.");
        }
    });
}

function sheetModForm(res, status) {
    //Pre-populate forms
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        "<form id='modify'>\n" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modsheetid'>Time Sheet ID:</label>" +
        `<input class='form-control' type='text' id='modsheetid' name='modsheetid' value='${res.id}' disabled>\n<br>\n` +
        "<label for='modsheetplanname'>Plan:</label>" +
        `<input class='form-control' type='text' id='modsheetplanname' name='modsheetplanname' value='${res.hourlyRate}' disabled>\n<br><br>\n` +
        "<label for='modsheettimein'>Time In:</label>" +
        `<input class='form-control' type='date' id='modsheettimeindate' name='modsheettimeindate' value='${res.timeIn}'>` +
        `<input class='form-control' type='time' id='modsheettimeintime' name='modsheettimeintime' value='${res.timeIn}'>\n` +
        "<label for='modsheettimeout'>Time Out:</label>" +
        `<input class='form-control' type='date' id='modsheettimeoutdate' name='modsheettimeoutdate' value='${res.timeOut}'>` +
        `<input class='form-control' type='time' id='modsheettimeouttime' name='modsheettimeouttime' value='${res.timeOut}'>\n` +
        "<label for='modsheettask'>Task:</label>" +
        `<input class='form-control' type='text' id='modsheettask' name='modsheettask' value='${res.task}'>\n<br>\n` +
        "<label for='modsheetdetail'>Detail:</label>" +
        `<input class='form-control' type='text' id='modsheetdetail' name='modsheetdetail' value='${res.adminNote}'>\n<br><br>\n` +
        "</form><div><span id='errormessage' style='color:red'></span></div>");

    $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#SubmitButton").css("opacity", "1");

    if ($("#modsheetdetail").val() == "null") {
        $("#modsheetdetail").val("");
    }

    $.ajax({
        url: "/api/getAllPlans",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (planres, planstatus) {
            //Submit button function
            $("#SubmitButton").off("click");
            $("#SubmitButton").on('click', function (e) {
                let message = "";
                let valid = true;
                if ($("#modsheettask").val().length == 0) {
                    valid = false;
                    message += "Please add a task!<br>";
                }
                if ($("#modsheetdetail").val() == "") {
                    valid = false;
                    message += "Please add a reason for editing!<br>";
                }
                if ($("#modsheettimeintime").val() == "" || $("#modsheettimeindate").val() == "" ||
                    $("#modsheettimeouttime").val() == "" || $("#modsheettimeoutdate").val() == "") {
                    valid = false;
                    message += "Please correct the dates and times!<br>";
                }

                if (valid) {
                    $("#errormessage").html("");
                    $("#SubmitButton").hide();
                    $("#optionsClient").append("<div id='modsuccess'></div>");
                    $("#modsuccess").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
                    modSubmit("/api/updateTimeSheet", {
                        auth: id_token,
                        id: $("#modsheetid").val(),
                        hourlyRate: $("#modsheetplanname").val(),
                        timeIn: `${$("#modsheettimeindate").val()} ${$("#modsheettimeintime").val()}:00`,
                        timeOut: `${$("#modsheettimeoutdate").val()} ${$("#modsheettimeouttime").val()}:00`,
                        task: $("#modsheettask").val(),
                        detail: $("#modsheetdetail").val()
                    }, modSheetSuccess);
                } else {
                    $("#errormessage").html(message);
                }
            });
        },
        error: function (planres, planstatus) {
            $("#userMainContent").html("Plans isn't working! Please refresh the page. Contact support if the problem persists.");
        }
    });
}

function sheetAddForm() {
    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
        "<form id='add'>\n" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='addsheetgroup'>Group:</label>" +
        `<select class='form-control' id='addsheetgroup' name='addsheetgroup'></select>\n<br><br>\n` +
        "<label for='addsheettimein'>Time In:</label>" +
        `<input class='form-control' type='date' id='addsheettimeindate' name='addsheettimeindate' >` +
        `<input class='form-control' type='time' id='addsheettimeintime' name='addsheettimeintime' >\n` +
        "<label for='addsheettimeout'>Time Out:</label>" +
        `<input class='form-control' type='date' id='addsheettimeoutdate' name='addsheettimeoutdate' >` +
        `<input class='form-control' type='time' id='addsheettimeouttime' name='addsheettimeouttime' >` +
        "<label for='addsheettask'>Task:</label>" +
        `<input class='form-control' type='text' id='addsheettask' name='addsheettask'>\n<br>\n` +
        "<label for='addsheetdetail'>Detail:</label>" +
        `<input class='form-control' type='text' id='addsheetdetail' name='addsheetdetail'>\n<br><br>\n` +
        "</form><div><span id='errormessage' style='color:red'></span></div>\n");
    $("#optionsClient").append("<hr><p>Note: Changes may take a moment to reflect.</p>");

    $("#optionsClient").append("<button id='SubmitButton' type='button' class='btn btn-default'>Submit</button>");
    $("#SubmitButton").css("opacity", "1");

    $.ajax({
        url: "/api/getAllMakers",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (makerres, makerstatus) {
            $.ajax({
                url: "/api/getAllClients",
                method: "post",
                data: {
                    auth: id_token
                },
                dataType: "json",
                success: function (clientres, clientstatus) {
                    $.ajax({
                        url: "/api/getAllRelationships",
                        method: "post",
                        data: {
                            auth: id_token,
                        },
                        dataType: "json",
                        success: function (relres, relstatus) {
                            let clientMap = {};
                            let makerMap = {};

                            for (var client of clientres) {
                                clientMap[client.customer.id] = client;
                            }

                            for (var maker of makerres) {
                                makerMap[maker.id] = maker;
                            }

                            for (var item of relres) {
                                $('#addsheetgroup').append(
                                    `<option value="${item.id}">${makerMap[item.makerId].firstName + " " + makerMap[item.makerId].lastName + " - " + clientMap[item.clientId].customer.first_name + " " + clientMap[item.clientId].customer.last_name + " - " + item.planId}</option>`
                                );
                            }

                            //Submit button function
                            $("#SubmitButton").off("click");
                            $("#SubmitButton").on('click', function (e) {
                                let message = "";
                                let valid = true;
                                if ($("#addsheettimeintime").val() == "" || $("#addsheettimeindate").val() == "" ||
                                    $("#addsheettimeouttime").val() == "" || $("#addsheettimeoutdate").val() == "") {
                                    valid = false;
                                    message += "Please correct the dates and times!<br>";
                                }
                                if ($("#addsheettask").val().length === 0) {
                                    valid = false;
                                    message += "Task must be added!<br>";
                                }
                                if ($("#addsheetdetail").val().length === 0) {
                                    valid = false;
                                    message += "Please enter a reason for adding!<br>";
                                }

                                if (valid) {
                                    $("#errormessage").html("");
                                    $("#SubmitButton").hide();
                                    $("#optionsClient").append("<div id='addsuccess'></div>");
                                    $("#addsuccess").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");
                                    $.ajax({
                                        url: "/api/getRelationshipById",
                                        method: "post",
                                        data: {
                                            auth: id_token,
                                            id: $("#addsheetgroup").val()
                                        },
                                        dataType: "json",
                                        success: function (subrelres, subrelstatus) {
                                            $("#errormessage").html("");
                                            addSubmit("/api/createTimeSheet", {
                                                auth: id_token,
                                                makerId: subrelres.makerId,
                                                hourlyRate: subrelres.planId,
                                                clientId: subrelres.clientId,
                                                timeIn: `${$("#addsheettimeindate").val()} ${$("#addsheettimeintime").val()}:00`,
                                                timeOut: `${$("#addsheettimeoutdate").val()} ${$("#addsheettimeouttime").val()}:00`,
                                                task: $("#addsheettask").val(),
                                                detail: $("#addsheetdetail").val()
                                            }, addSheetSuccess);
                                        },
                                        error: function (subrelres, subrelstatus) {
                                            $("#userMainContent").html("Submit relationship isn't working!");
                                        }
                                    });
                                } else {
                                    $("#errormessage").html(message);
                                }
                            });
                        },
                        error: function (relres, relstatus) {
                            $("#userMainContent").html("All relationships isn't working!");
                        }
                    });
                },
                error: function (clientres, clientstatus) {
                    $("#userMainContent").html("Plans isn't working!");
                }
            });
        },
        error: function (makerres, makerstatus) {
            $("#userMainContent").html("Plans isn't working! Please refresh the page. Contact support if the problem persists.");
        }
    });
}

function modSheetSuccess(res, status) {
    $("#modsuccess").html(`<br><h5>Successfully updated Time Sheet ${$("#modsheetid").val()}!</h5>`);

    setTimeout(function () {
        showFunction(timeSheetFunctionality, "/api/getAllTimeSheets");
    }, 1000);
}

function addSheetSuccess(res, status) {
    $("#addsuccess").html(`<br><h5>Successfully added Time Sheet ${res.id}!</h5>` +
        "<br><p>Now, please navigate to <button type=\"button\" class=\"btn btn-select btn-circle btn-xl\" id=\"ManageAvailCreditButton\">Manage Available Credit</button><br>to adjust credit for the plan and associated Client.<br>");

    $("#ManageAvailCreditButton").on('click', function () {
        navItemChange("manageCredit");
        selectedTab = $("#manageCredit")[0].id;
        showFunction(creditFunctionality, "/api/getAllTimeBuckets");
    });
}

function clearSheetSuccess(res, status) {
    $("#verifyEntry").html(`<br><h5>Successfully cleared time sheet ${selectedRow.children()[0].innerHTML}!</h5>` +
        "<br><p>Now, please navigate to <button type=\"button\" class=\"btn btn-select btn-circle btn-xl\" id=\"ManageAvailCreditButton\">Manage Available Credit</button><br>to adjust credit for the plan and associated Client.<br>");

    $("#ManageAvailCreditButton").on('click', function () {
        navItemChange("manageCredit");
        selectedTab = $("#manageCredit")[0].id;
        showFunction(creditFunctionality, "/api/getAllTimeBuckets");
    });
}

function verifyClearSheet() {
    let deleteId = $("#deleteUser").val();
    return (deleteId == selectedRow.children()[0].innerHTML);
}


//Run Report
function runReportFunctionality() {
    //Creating the table
    $("#userMainContent").html(
        "<div class='reportOptions'></div>" +
        "<div id=\"buttonsTop\"></div>\n" +
        "<div class='row' id='topRow'>\n" +
        "<div id=\"floor\">\n" +
        "    <table id=\"reportTable\" class=\"table\">\n" +
        "    </table>\n" +
        "</div></div>");
    //Report Buttons
    $(".reportOptions").append("<div><label for='startDate'>Start Date:</label><input class='form-control' type='date' id='startDate' name='startDate'></div>");
    $(".reportOptions").append("<div><label for='endDate'>End Date:</label><input class='form-control' type='date' id='endDate' name='endDate'></div>");
    $(".reportOptions").append("<div><label for='client'>Client:</label><input class='form-control' type='text' id='clientRepSearch' name='clientRepSearch'><select class='form-control' id='clientReport'>\n</select></div>");
    $(".reportOptions").append("<div><label for='maker'>Freedom Maker:</label><input class='form-control' type='text' id='makerRepSearch' name='makerRepSearch'><select class='form-control' id='makerReport'>\n</select></div>");
    $(".reportOptions").append("<button type='button' class='btn btn-select btn-circle btn-xl' id='runReportButton'>Run Report</button>");
    //Populate table but do not show
    $("#reportTable").html('\n' +
        '        <thead class="thead">\n' +
        '            <th scope="col">Time Sheet ID</th>\n' +
        '            <th scope="col">Freedom Maker</th>\n' +
        '            <th scope="col">Plan</th>\n' +
        '            <th scope="col">Client</th>\n' +
        '            <th scope="col">Shift Duration</th>\n' +
        '        </thead><tbody id="reportContent">' +
        '</tbody>');
    //Pre-populate Report drop down options
    $("#clientRepSearch").on("change", function () {
        $.ajax({
            url: "/api/getAllClients",
            method: "post",
            data: {
                auth: id_token
            },
            dataType: "json",
            success: function (clientres, clientstatus) {
                $("#clientReport").html("");
                for (var i = 0; i < clientres.length; ++i) {
                    let clientName = clientres[i].customer.first_name + " " + clientres[i].customer.last_name;
                    if (clientName.toLowerCase().includes($("#clientRepSearch").val().toLowerCase()) && $("#clientRepSearch").val() != "") {
                        $('#clientReport').append(
                            `<option id="${clientres[i].customer.id}" value="${clientres[i].customer.id}">${clientres[i].customer.first_name} ${clientres[i].customer.last_name} - ${clientres[i].customer.id}</option>`
                        )
                    }
                }
            },
            error: function (clientres, clientstatus) {
                $("#userMainContent").html("Could not get clients for drop down!");
            }
        });
    });
    $("#makerRepSearch").on("change", function () {
        $.ajax({
            url: "/api/getAllMakers",
            method: "post",
            data: {
                auth: id_token,
            },
            dataType: "json",
            success: function (makerres, makerstatus) {
                $("#makerReport").html("");
                for (var item of makerres) {
                    let makerName = item.firstName + " " + item.lastName;
                    if (makerName.toLowerCase().includes($("#makerRepSearch").val().toLowerCase()) && $("#makerRepSearch").val() != "") {
                        if (item.deleted) {
                            $('#makerReport').append(
                                `<option id="${item.id}" value="${item.id}">*Deleted* ` + makerName + ` -  ${item.id}</option>`
                            );
                        } else {
                            $('#makerReport').append(
                                `<option id="${item.id}" value="${item.id}">` + makerName + ` -  ${item.id}</option>`
                            );
                        }
                    }
                }
            },
            error: function (makerres, makerstatus) {
                $("#userMainContent").html("Could not get makers for drop down!");
            }
        });
    });
    //Event Listeners
    //Run Report
    $("#runReportButton").on('click', function () {
        $("#reportTable").css("opacity", "1");
        $("#reportContent").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
        $.ajax({
            url: "/api/getTimeForMakerClientPair",
            method: "post",
            data: {
                auth: id_token,
                makerId: $("#makerReport").val(),
                clientId: $("#clientReport").val(),
                start: $("#startDate").val(),
                end: $("#endDate").val()
            },
            dataType: "json",
            success: function (timeres, timestatus) {
                $("#reportContent").html("");
                for (var item of timeres.sheets) {
                    let hours = item.duration / 60;
                    let minutes = item.duration % 60;
                    let message = "";
                    if (hours >= 0) {
                        message += ` ${Math.floor(hours)} hours `;
                    }
                    if (hours <= -1) {
                        hours = Math.abs(hours);
                        message += `-${Math.floor(hours)} hours `;
                    }
                    if (minutes >= 0 || minutes < 0) {
                        message += ` ${minutes} minutes `;
                    }
                    $("#reportContent").append('\n' +
                        '<tr class="reportRow">' +
                        '   <td scope="row">' + item.id + '</td>' +
                        '   <td>' + item.makerName + '</td>' +
                        '   <td>' + item.plan + '</td>' +
                        '   <td>' + item.clientName + '</td>' +
                        `   <td> ${message}</td></tr>`);
                }
                ;
                let totalhours = Number.parseInt(timeres.total) / 60;
                let totalminutes = Number.parseInt(timeres.total) % 60;
                let totalmessage = "";
                if (totalhours >= 0) {
                    totalmessage += ` ${Math.floor(totalhours)} hours `;
                }
                if (totalhours <= -1) {
                    totalhours = Math.abs(totalhours);
                    totalmessage += `-${Math.floor(totalhours)} hours `;
                }
                if (totalminutes >= 0 || totalminutes < 0) {
                    totalmessage += ` ${totalminutes} minutes `;
                }

                $("#reportContent").append('<tfoot><th id="repTotal">Total Time:</th>' +
                    '<td>' + totalmessage + '</td></tfoot>');
            },
            error: function (timeres, timestatus) {
                $("#userMainContent").html("Run Reports isn't working!");
            }
        });
    });

    //Row effect
    $(".reportRow").mouseenter(function () {
        $(this).css('transition', 'background-color 0.5s ease');
        $(this).css('background-color', '#e8ecef');
    }).mouseleave(function () {
        $(this).css('background-color', 'white');
    });
}

$(document).ready(function () {

    //Adding logout Button
    $("#logout").append("<button id='logoutButton' type='button' class='btn btn-default'>Log Out</button>");
    $("#logoutButton").click(signOut);


    $(".navItem").hover(function () {
        $(this).css("color", '#dbb459');
        $(this).css("font-style", 'italic');
    });

    $(".navItem").on("mouseleave", function () {
        if (selectedTab != $(this)[0].id && selectedDropdown != $(this)[0].id) {
            $(this).css("color", 'white');
            $(this).css("font-style", 'normal');
        }
    });

    //shifts the logo
    $("#landingLogo").css("width", "20%");


    gapi.auth2.init().then(function () {
        GOOGLE_USER = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse();
        id_token = GOOGLE_USER.id_token;


        $.ajax({
            url: "/api/getEnvironment",
            method: "get",
            dataType: "json",
            success: function (res, status) {
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

        //Event Listeners for other nav menu items
        $(".navItem").click(function (e) {
            navMapper[e.target.id]();
            selectedTab = $(this)[0].id;
            selectedDropdown = null;
            let parentToChange = $(this).parent().parent().parent().children()[0];
            if (parentToChange.classList[0] && parentToChange.classList[0].toString() === "navItem") {
                selectedDropdown = parentToChange.id;
                $(`#${parentToChange.id}`).append("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>")
            }
            if (selectedDropdown) {
                $(`#${selectedDropdown}`).css("color", '#dbb459')
                    .css("font-style", 'italic');
            }
        });


        //refresh tokens before timeout
        setInterval(function () {
            GOOGLE_USER.reloadAuthResponse()
                .then(function () {
                    id_token = GOOGLE_USER.getAuthResponse().id_token;
                });
        }, 600000)
    });


})