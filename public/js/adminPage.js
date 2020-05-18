//global variable
let selectedRow = null;

gapi.load('auth2', function() {
    gapi.auth2.init();
});
let auth2 = gapi.auth2.getAuthInstance();
const id_token = auth2.currentUser.je.tc.access_token;
console.log(`Welcome, google user. Your ID token is: ${id_token}`);

let navMapper = {
    main: function () {
        location.reload();
    },

    manageClients: function () {
      showFunction(clientFunctionality, "/api/getAllClients");
    },

    manageMakers: function () {
        showFunction(makerFunctionality, "/api/getAllMakers");
    },
    manageSubscriptions: function () {
        showFunction(subscriptionFunctionality, "/api/getAllSubscriptions");
    },
    managePlans: function () {
        showFunction(planFunctionality, "/api/getAllPlans");
    },

    reviewTimeSheets: function () {
        showFunction(timeSheetFunctionality, "/api/getAllTimeSheets");
    }
};//end navMapper

//Versatile Functions
function createBody () {
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
    });//end outer ajax
};// end showFunction

//Mod
function prePopModForm (endpoint, modForm){
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

function modSubmit (endpoint, object, successFunction) {
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
function popAddForm (addForm){
    minimizeTable();
    showBlock();
    addForm();
}

function addSubmit (endpoint, object, successFunction) {
    $.ajax({
        url: endpoint,
        method: "post",
        data: object,
        dataType: "json",
        success: successFunction,
        error: function (res, status) {
            $("#optionsClient").html("Add isn't working!");
            //log, send error report
        }
    });//end ajax
};

//Delete
function showDeletePrompt (prompt, endpoint, object, successFunction, verifyDeleteUser) {
    showBlock();
    $("#optionsClient").html("<div id='deletePrompt'></div>");
    setTimeout(function() {
        $("#deletePrompt").html("<h5>Are you sure you want to delete this user?</h5>");
        $("#deletePrompt").append("<div id='selectionYorN'></div>");
        $("#selectionYorN").append("<button id='NoDelete' type='button' class='btn btn-default'>No</button>");
        $("#selectionYorN").append("<button id='YesDelete' type='button' class='btn btn-default'>Yes</button>");
        $("#SubmitButton").css("opacity", "0");
        $("#AddButton").css("opacity", "0");
        $("#DeleteButton").css("opacity", "0");
        $("#deletePrompt").css("opacity", "1");
        $("#YesDelete").css("opacity", "1");
        $("#NoDelete").css("opacity", "1");

        setTimeout(function () {
            $("#SubmitButton").hide();
            $("#AddButton").hide();
        }, 500);

        $("#NoDelete").click(function() {
            $("#SubmitButton").show();
            $("#AddButton").show();
            expandTable();
        });

        $("#YesDelete").click(function() {
            $("#SubmitButton").show();
            $("#AddButton").show();
            $("#SubmitButton").css("opacity", "1");
            $("#AddButton").css("opacity", "1");
            $("#deletePrompt").html(
                prompt
            );

            $("#deletePrompt").append("<div id='verifyEntry'></div>");

            $("#SubmitButton").off("click");
            $("#SubmitButton").on("click", function (e) {
                if(verifyDeleteUser())
                {
                    $.ajax({
                        url: endpoint,
                        method: "post",
                        data: object,
                        dataType: "json",
                        success:successFunction,
                        error: function (res, status) {
                            $("#optionsClient").html("Delete user not working!");
                        }
                    });//end ajax
                }
                else
                {
                    $("#verifyEntry").html("<h6>Invalid entry. Please type in the name again.</h6>");
                }
            });
        });
    },500);
}

//Main Methods
function showMain () {
    //Contains any main tab functionality
    showOnlineMakers();
}

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
        if (item.customer.billing_address && !item.customer.deleted) {
            $("#clientTable").append('\n' +
                '<tr class="clientRow">' +
                '   <td scope="row">' + item.customer.id + '</td>' +
                '   <td>' + `${item.customer.first_name} ${item.customer.last_name}` + '</td>' +
                '   <td>' + item.customer.phone + '</td>' +
                '   <td>' + item.customer.email + '</td></tr>'
            );
        };
    });
    $("#clientTable").append('\n</tbody>');

    //Body Block content
    createBody();

    //Event Listeners
    //Modify Client
    $(".clientRow").click(function () {
        selectedRow = $(this);
        let clientPrompt = `<h5>Please type in the full name to delete the selected user.</h5>` +
            `<h6>You selected ${selectedRow.children()[1].innerHTML}<br>ID: ${selectedRow.children()[0].innerHTML}</h6>` +
            "<br><form id='delete'>" +
            "<label for='deleteUser'>Full Name:</label>" +
            `<input type='text' id='deleteUser' name='deleteUser'>\n<br>\n` +
            "</form>\n" ;

        prePopModForm("/api/getClient", clientModForm);
        $("#DeleteButton").show();
        $("#DeleteButton").css("opacity", "1");
        $("#DeleteButton").click(function () {
            let clientId = selectedRow.children()[0].innerHTML;
            showDeletePrompt(clientPrompt,"/api/deleteClient", {
                auth: id_token,
                id: clientId
            }, deleteClientSuccess, verifyDeleteClient);
        });
    });//end modify client

    //Add Client
    $("#AddButton").click(function () {
        popAddForm(clientAddForm);
        $("#DeleteButton").css("opacity", "0");
        setTimeout(function(){
            $("#DeleteButton").hide();
        }, 500);
    });//end add client

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

function clientModForm (res, status) {
    //Pre-populate forms
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        "<form id='modify'>\n" +
        "<label for='modClient'>Client Information</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modClientid'>ID:</label>" +
        `<input type='text' id='modclientid' name='modclientid' value='${res.id}' disabled>\n<br>\n` +
        "<label for='modclientfname'>First Name:</label>" +
        `<input type='text' id='modclientfname' name='modclientfname' value='${res.first_name}'>\n<br>\n` +
        "<label for='modclientlname'>Last Name:</label>" +
        `<input type='text' id='modclientlname' name='modclientlname' value='${res.last_name}'>\n<br>\n` +
        "<label for='modphone'>Phone:</label>" +
        `<input type='text' id='modphone' name='modphone' value='${res.phone}'>\n<br>\n` +
        "<label for='modemail'>Email:</label>" +
        `<input type='text' id='modemail' name='modemail' value='${res.email}'>\n<br>\n` +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modbilling'>Billing Address</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modaddress'>Street:</label>" +
        `<input type='text' id='modaddress' name='modaddress' value='${res.billing_address.line1}'>\n<br>\n` +
        "<label for='modcity'>City:</label>" +
        `<input type='text' id='modcity' name='modcity' value='${res.billing_address.city}'>\n<br>\n` +
        "<label for='modstate'>State:</label>" +
        `<input type='text' id='modstate' name='modstate' value='${res.billing_address.state}'>\n<br>\n` +
        "<label for='modemail'>Zip:</label>" +
        `<input type='text' id='modzip' name='modzip' value='${res.billing_address.zip}'>\n<br>\n` +
        "</form>\n");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        modSubmit("/api/updateClientContact", {
            auth: id_token,
            id: $("#modclientid").val(),
            firstName: $("#modclientfname").val(),
            lastName: $("#modclientlname").val() ,
            phone: $("#modphone").val(),
            email: $("#modemail").val()
        }, modClientSuccessContact);

        modSubmit("/api/updateClientBilling", {
            auth: id_token,
            id: $("#modclientid").val(),
            firstName: $("#modclientfname").val(),
            lastName: $("#modclientlname").val() ,
            phone: $("#modphone").val(),
            email: $("#modemail").val(),
            street: $("#modaddress").val(),
            city: $("#modcity").val(),
            state: $("#modstate").val(),
            zip: $("#modzip").val()
        }, modClientSuccessBilling);
    });
}

function clientAddForm () {
    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
        "<form id='add'>\n" +
        "<label for='addClient'>Client Information</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='addclientfname'>First Name:</label>" +
        `<input type='text' id='addclientfname' name='addclientfname'>\n<br>\n` +
        "<label for='addclientlname'>Last Name:</label>" +
        `<input type='text' id='addclientlname' name='addclientlname'>\n<br>\n` +
        "<label for='addphone'>Phone:</label>" +
        `<input type='text' id='addphone' name='addphone'>\n<br>\n` +
        "<label for='addemail'>Email:</label>" +
        `<input type='text' id='addemail' name='addemail'>\n<br>\n` +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='addbilling'>Billing Address</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='addbillingfname'>First Name:</label>" +
        `<input type='text' id='addbillingfname' name='addbillingfname'>\n<br>\n` +
        "<label for='addbillinglname'>Last Name:</label>" +
        `<input type='text' id='addbillinglname' name='addbillinglname'>\n<br>\n` +
        "<label for='addaddress'>Street:</label>" +
        `<input type='text' id='addaddress' name='addaddress'>\n<br>\n` +
        "<label for='addcity'>City:</label>" +
        `<input type='text' id='addcity' name='addcity'>\n<br>\n` +
        "<label for='addstate'>State:</label>" +
        `<input type='text' id='addstate' name='addstate'>\n<br>\n` +
        "<label for='addemail'>Zip:</label>" +
        `<input type='text' id='addzip' name='addzip'>\n<br>\n` +
        "</form>\n");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        addSubmit("/api/createClient", {
            auth: id_token,
            firstName: $("#addclientfname").val(),
            lastName: $("#addclientlname").val() ,
            phone: $("#addphone").val(),
            email: $("#addemail").val(),
            street: $("#addaddress").val(),
            city: $("#addcity").val(),
            state: $("#addstate").val(),
            zip: $("#addzip").val(),
            billingFirst: $("#addbillingfname").val(),
            billingLast:$("#addbillinglname").val()
        }, addClientSuccess);
    });
}

function modClientSuccessContact (res, status) {
    $("#optionsClient").append("<div id='modsuccess'></div>");
    $("#modsuccess").html("");
    $("#modsuccess").html(`<br><h5>Successfully updated client ${$("#modclientid").val()}!</h5>`);

    //Updating viewable rows in table
    selectedRow.children()[1].innerHTML = $("#modclientfname").val() + " " + $("#modclientlname").val();
    selectedRow.children()[2].innerHTML = $("#modphone").val();
    selectedRow.children()[3].innerHTML = $("#modemail").val();
}

function modClientSuccessBilling (res, status) {
    $("#optionsClient").append("<div id='modsuccess'></div>");
    $("#modsuccess").html("");
    $("#modsuccess").html(`<br><h5>Successfully updated client ${$("#modclientid").val()}!</h5>`);
}

function addClientSuccess (res, status) {
    $("#optionsClient").append("<div id='addsuccess'></div>");
    $("#addsuccess").html("");
    $("#addsuccess").html(`<br><h5>Successfully added client ${res.id}!</h5>`);

    //Adding new client to table
    $("#clientTable").append('\n' +
        `<tr id="${res.id}" class="clientRow">` +
        '   <td scope="row">' + `${res.id}` + '</td>' +
        '   <td>' + `${res.first_name} ${res.last_name}` + '</td>' +
        '   <td>' + `${res.phone}` + '</td>' +
        '   <td>' + `${res.email}` + '</td></tr>'
    );
}

function deleteClientSuccess (res, status) {
    $("#verifyEntry").html(`<h6>Successfully deleted Client ${selectedRow.children()[0].innerHTML}!</h6>`);
    setTimeout(function () {
        showFunction(clientFunctionality, "/api/getAllClients");
    }, 1000);
}

function verifyDeleteClient () {
    let deleteUser = $("#deleteUser").val();
    return (deleteUser == selectedRow.children()[1].innerHTML);
}

//Maker Methods
function makerFunctionality (res){
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
        };
    });
    $("#makerTable").append('\n</tbody>');

    //Body Block content
    createBody();

    //Event Listeners
    // Modify Maker
    $(".makerRow").click(function () {
        selectedRow = $(this);
        let makerPrompt = `<h5>Please type in the full name to delete the selected user.</h5>` +
            `<h6>You selected ${selectedRow.children()[1].innerHTML} ${selectedRow.children()[2].innerHTML}<br>ID: ${selectedRow.children()[0].innerHTML}</h6>` +
            "<br><form id='delete'>" +
            "<label for='deleteUser'>Full Name:</label>" +
            `<input type='text' id='deleteUser' name='deleteUser'>\n<br>\n` +
            "</form>\n";

        prePopModForm("/api/getMaker", makerModForm);
        $("#DeleteButton").show();
        $("#DeleteButton").css("opacity", "1");
        $("#DeleteButton").click(function () {
            let makerId = selectedRow.children()[0].innerHTML;
            showDeletePrompt(makerPrompt,"/api/deleteMaker", {
                auth: id_token,
                id: makerId
            }, deleteMakerSuccess, verifyDeleteMaker);
        });
    });//end modify maker

    //Add Maker
    $("#AddButton").click(function () {
        popAddForm(makerAddForm);
        $("#DeleteButton").css("opacity", "0");
        setTimeout(function(){
            $("#DeleteButton").hide();
        }, 500);
    });//end add maker

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

function makerModForm (res, status) {
    //Pre-populate forms
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        "<form id='modify'>\n" +
        "<label for='modMaker'>Freedom Maker Information</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modmakerid'>ID:</label>" +
        `<input type='text' id='modmakerid' name='modmakerid' value='${res.id}' disabled>\n<br>\n` +
        "<label for='modmakerfname'>First Name:</label>" +
        `<input type='text' id='modmakerfname' name='modmakerfname' value='${res.firstName}'>\n<br>\n` +
        "<label for='modmakerlname'>Last Name:</label>" +
        `<input type='text' id='modmakerlname' name='modmakerlname' value='${res.lastName}'>\n<br>\n` +
        "<label for='modemail'>Email:</label>" +
        `<input type='text' id='modemail' name='modemail' value='${res.email}'>\n<br>\n` +
        "</form>\n");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        modSubmit("/api/updateMaker", {
            auth: id_token,
            id: $("#modmakerid").val(),
            firstName: $("#modmakerfname").val(),
            lastName: $("#modmakerlname").val() ,
            email: $("#modemail").val()
        }, modMakerSuccess);
    });
}

function makerAddForm () {
    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
        "<form id='add'>\n" +
        "<label for='addmaker'>Freedom Maker Information</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='addmakerfname'>First Name:</label>" +
        `<input type='text' id='addmakerfname' name='addmakerfname'>\n<br>\n` +
        "<label for='addmakerlname'>Last Name:</label>" +
        `<input type='text' id='addmakerlname' name='addmakerlname'>\n<br>\n` +
        "<label for='addemail'>Email:</label>" +
        `<input type='text' id='addemail' name='addemail'>\n<br>\n` +
        "</form>\n");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        addSubmit("/api/createMaker", {
            auth: id_token,
            id: $("#addmakerid").val(),
            firstName: $("#addmakerfname").val(),
            lastName: $("#addmakerlname").val(),
            email: $("#addemail").val()
        } , addMakerSuccess);
    });
}

function modMakerSuccess (res, status) {
    $("#optionsClient").append("<div id='modsuccess'></div>");
    $("#modsuccess").html("");
    $("#modsuccess").html(`<br><h5>Successfully updated Freedom Maker ${$("#modmakerid").val()}!</h5>`);

    //Updating viewable rows in table
    selectedRow.children()[1].innerHTML = $("#modmakerfname").val() + " " + $("#modmakerlname").val();
    selectedRow.children()[2].innerHTML = $("#modphone").val();
    selectedRow.children()[3].innerHTML = $("#modemail").val();
}

function addMakerSuccess (res, status) {
    $("#optionsClient").append("<div id='addsuccess'></div>");
    $("#addsuccess").html("");
    $("#addsuccess").html(`<br><h5>Successfully added Freedom Maker ${res.id}!</h5>`);

    //Adding new client to table
    $("#makerTable").append('\n' +
        `<tr id="${res.id}" class="makerRow">` +
        '   <td scope="row">' + `${res.id}` + '</td>' +
        '   <td>' + `${res.first_name} ${res.last_name}` + '</td>' +
        '   <td>' + `${res.phone}` + '</td>' +
        '   <td>' + `${res.email}` + '</td></tr>'
    );
}

function deleteMakerSuccess (res, status) {
    $("#verifyEntry").html(`<h6>Successfully deleted Freedom Maker ${selectedRow.children()[0].innerHTML}!</h6>`);
    setTimeout(function () {
        showFunction(makerFunctionality, "/api/getAllMakers");
    }, 1000);
}

function verifyDeleteMaker () {
    let deleteUser = $("#deleteUser").val();
    return (deleteUser == (selectedRow.children()[1].innerHTML + " " + selectedRow.children()[2].innerHTML));
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
        '            <th scope="col">Number of Hours</th>\n' +
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
    createBody();

    //Event Listeners
    //Modify Subscription
    $(".subscriptionRow").click(function () {
        selectedRow = $(this);
        let subscriptionPrompt = `<h5>Please type in the subscription id to cancel the selected subscription.</h5>` +
            `<h6>You selected ID: ${selectedRow.children()[0].innerHTML}</h6>` +
            "<br><form id='delete'>" +
            "<label for='deleteUser'>Retype ID:</label>" +
            `<input type='text' id='deleteUser' name='deleteUser'>\n<br>\n` +
            "</form>\n";

        prePopModForm("/api/retrieveSubscription", subscriptionModForm);
        $("#DeleteButton").show();
        $("#DeleteButton").css("opacity", "1");
        $("#DeleteButton").click(function () {
            let subscriptionId = selectedRow.children()[0].innerHTML;
            showDeletePrompt(subscriptionPrompt, "/api/cancelSubscription", {
                auth: id_token,
                subscriptionId: subscriptionId
            }, deleteSubscriptionSuccess, verifyDeleteSubscription);
        });

    });


    //Add Subscription
    $("#AddButton").click(function () {
        popAddForm(subscriptionAddForm);
        $("#DeleteButton").css("opacity", "0");
        setTimeout(function () {
            $("#DeleteButton").hide();
        }, 500);
    });//end add subscription

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

function subscriptionModForm (res, status) {
    //Pre-populate forms
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        "<form id='modify'>\n" +
        "<label for='modSubscription'>Subscription Information</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modsubscriptionid'>ID:</label>" +
        `<input type='text' id='modsubscriptionid' name='modsubscriptionid' value='${res.plan_id}' disabled>\n<br>\n` +
        "<label for='modsubscriptionplanname'>Plan:</label>" +
        `<input type='text' id='modsubscriptionplanname' name='modsubscriptionplanname' value='${res.plan_id}'>\n<br>\n` +
        "<label for='modsubscriptionplanquantity'>Monthly Hours:</label>" +
        `<input type='text' id='modsubscriptionplanquantity' name='modsubscriptionplanquantity' value='${res.plan_quantity}'>\n<br>\n` +
        "<label for='modsubscriptionprice'>Price Per Hour ($):</label>" +
        `<input type='text' id='modsubscriptionplanquantity' name='modsubscriptionplanquantity' value='${res.plan_unit_price == undefined ? "": res.plan_unit_price/100}'>\n<br>\n` +
        "</form>\n");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        modSubmit("/api/updateSubscription", {
            auth: id_token,
            subscriptionId: $("#modsubscriptionid").val(),
            planId: $("#modsubscriptionplanname").val(),
            planQuantity: $("#modsubscriptionplanquantity").val()
        }, modSubscriptionSuccess);
    });
}

function subscriptionAddForm () {
    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
        "<form id='add'>\n" +
        "<label for='addSubscription'>Subscription Information</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='addsubscriptionplanid'>Plan ID:</label>" +
        `<input type='text' id='addsubscriptionplanid' name='addsubscriptionplanid'>\n<br>\n` +
        "<label for='addsubscriptioncustomerid'>Customer ID:</label>" +
        `<input type='text' id='addsubscriptioncustomerid' name='addsubscriptioncustomerid'>\n<br>\n` +
        "<label for='addsubscriptionplanquantity'>Monthly Hours:</label>" +
        `<input type='text' id='addsubscriptionplanquantity' name='addsubscriptionplanquantity'>\n<br>\n` +
        "</form>\n");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        addSubmit("/api/createSubscription", {
            auth: id_token,
            planId: $("#addsubscriptionplanid").val(),
            customerId: $("#addsubscriptioncustomerid").val() ,
            planQuantity: $("#addsubscriptionplanquantity").val(),
        }, addSubscriptionSuccess);
    });
}

function modSubscriptionSuccess (res, status) {
    $("#optionsSubscription").append("<div id='modsuccess'></div>");
    $("#modsuccess").html("");
    $("#modsuccess").html(`<br><h5>Successfully updated subscription ${$("#modsubscriptionid").val()}!</h5>`);

    //Updating viewable rows in table
    selectedRow.children()[1].innerHTML = $("#modsubscriptionfname").val() + " " + $("#modsubscriptionlname").val();
    selectedRow.children()[2].innerHTML = $("#modphone").val();
    selectedRow.children()[3].innerHTML = $("#modemail").val();
}

function addSubscriptionSuccess (res, status) {
    $("#optionsSubscription").append("<div id='addsuccess'></div>");
    $("#addsuccess").html("");
    $("#addsuccess").html(`<br><h5>Successfully added subscription ${res.id}!</h5>`);
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
                if (client && client.billing_address) {
                    clientMap[client.id] = client;
                }
            }
            let customer = clientMap[res.customer_id];

            //Adding new subscription to table
            $("#subscriptionTable").append('\n' +
                '<tr class="subscriptionRow">' +
                '   <td scope="row">' + res.id + '</td>' +
                '   <td>' + `${customer.first_name} ${customer.last_name}` + '</td>' +
                '   <td>' + res.plan_id + '</td>' +
                '   <td>' + customer.meta_data[res.plan_id] + '</td></tr>' +
                '   <td>' + `${res.has_scheduled_changes}` + '</td>' +
                '   <td>' + res.cancelled + '</td>' +
                '   <td>' + res.next_billing_at + '</td></tr>'
            );
        },
        error: function (res, status) {
            $("#userMainContent").html("Something went wrong!");
        }
    });

}

function deleteSubscriptionSuccess (res, status) {
    $("#verifyEntry").html(`<h6>Successfully deleted Subscription ${selectedRow.children()[0].innerHTML}!</h6>`);
    setTimeout(function () {
        showFunction(subscriptionFunctionality, "/api/getAllSubscriptions");
    }, 1000);
}

function verifyDeleteSubscription () {
    let deleteUser = $("#deleteUser").val();
    return (deleteUser == selectedRow.children()[0].innerHTML);
}


//Plan Methods
function planFunctionality (res) {
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
        '            <th scope="col">ID</th>\n' +
        '            <th scope="col">Price Per Hour</th>\n' +
        '            <th scope="col">Description</th>\n' +
        '        </thead><tbody>');

    //get clients to cross reference


    //Populate table
    res.forEach(item => {
        let plan = item.plan;
        item = item.plan;
        $("#planTable").append('\n' +
            '<tr class="planRow">' +
            '   <td scope="row">' + plan.id + '</td>' +
            '   <td>$' + Number.parseInt(plan.price)/100 + '</td>' +
            '   <td>' + plan.description + '</td></tr>'
        );

    });
    $("#planTable").append('\n</tbody>');

    //Body Block content
    createBody();

    //Event Listeners
    //Modify Plan
    $(".planRow").click(function () {
        selectedRow = $(this);
        let planPrompt = `<h5>Please type in the plan id to cancel the selected plan.</h5>` +
            `<h6>You selected ID: ${selectedRow.children()[0].innerHTML}</h6>` +
            "<br><form id='delete'>" +
            "<label for='deleteUser'>Retype ID:</label>" +
            `<input type='text' id='deleteUser' name='deleteUser'>\n<br>\n` +
            "</form>\n";

        prePopModForm("/api/retrievePlan", planModForm);
        $("#DeleteButton").show();
        $("#DeleteButton").css("opacity", "1");
        $("#DeleteButton").click(function () {
            let planId = selectedRow.children()[0].innerHTML;
            showDeletePrompt(planPrompt, "/api/deletePlan", {
                auth: id_token,
                planId: planId
            }, deletePlanSuccess, verifyDeletePlan);
        });

    });


    //Add Plan
    $("#AddButton").click(function () {
        popAddForm(planAddForm);
        $("#DeleteButton").css("opacity", "0");
        setTimeout(function () {
            $("#DeleteButton").hide();
        }, 500);
    });//end add plan

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

function planModForm (res, status) {
    //Pre-populate forms
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        "<form id='modify'>\n" +
        "<label for='modPlan'>Plan Information</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modplanid'>ID:</label>" +
        `<input type='text' id='modplanid' name='modplanid' value='${res.plan.id}' disabled>\n<br>\n` +
        "<label for='modplaninvoicename'>Name on Invoice:</label>" +
        `<input type='text' id='modplaninvoicename' name='modplaninvoicename' value='${res.plan.invoice_name}'>\n<br>\n` +
        "<label for='modplanprice'>Price Per Hour ($):</label>" +
        `<input type='number' id='modplanprice' name='modplanprice' value='${res.plan.price/100}'>\n<br>\n` +
        "</form>\n");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        modSubmit("/api/updatePlan", {
            auth: id_token,
            planId: $("#modplanid").val(),
            planInvoiceName: $("#modplaninvoicename").val(),
            planPrice: Number.parseFloat($("#modplanprice").val()).toFixed(2) * 100
        }, modPlanSuccess);
    });
}

function planAddForm () {
    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
        "<form id='add'>\n" +
        "<label for='addPlan'>Plan Information</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='addplanname'>New Plan Id (no spaces!):</label>" +
        `<input type='text' id='addplanname' name='addplanname'>\n<br>\n` +
        "<label for='addplaninvoicename'>Name on Invoice:</label>" +
        `<input type='text' id='addplaninvoicename' name='addplaninvoicename'>\n<br>\n` +
        "<label for='addplanprice'>Price Per Hour ($):</label>" +
        `<input type='number' id='addplanprice' name='addplanprice'>\n<br>\n` +
        "<label for='addplandescription'>Plan Description:</label>" +
        `<input type='text' id='addplandescription' name='addplandescription'>\n<br>\n` +
        "</form>\n");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        addSubmit("/api/createPlan", {
            auth: id_token,
            planName: $("#addplanname").val(),
            invoiceName: $("#addplaninvoicename").val() ,
            pricePerHour: Number.parseFloat($("#addplanprice").val()).toFixed(2) * 100,
            planDescription: $("#addplandescription").val()
        }, addPlanSuccess);
    });
}

function modPlanSuccess (res, status) {
    $("#optionsClient").append("<div id='modsuccess'></div>");
    $("#modsuccess").html("");
    $("#modsuccess").html(`<br><h5>Successfully updated plan ${$("#modplanid").val()}!</h5>`);

    //Updating viewable rows in table
    selectedRow.children()[1].innerHTML = `$${$("#modplanprice").val()}`;
}

function addPlanSuccess (res, status) {
    $("#optionsClient").append("<div id='addsuccess'></div>");
    $("#addsuccess").html("");
    $("#addsuccess").html(`<br><h5>Successfully added plan ${res.id}!</h5>`);

    //Adding new plan to table
    $("#planTable").append('\n' +
        '<tr class="planRow">' +
        `   <td scope="row">${res.id}</td>` +
        `   <td>${res.price}</td>` +
        `   <td>${res.description}</td></tr>`
    );
}

function deletePlanSuccess (res, status) {
    $("#verifyEntry").html(`<h6>Successfully deleted Plan ${selectedRow.children()[0].innerHTML}!</h6>`);
    setTimeout(function () {
        showFunction(planFunctionality, "/api/getAllPlans");
    }, 1000);
}

function verifyDeletePlan () {
    let deleteUser = $("#deleteUser").val();
    return (deleteUser == selectedRow.children()[0].innerHTML);
}

//TimeSheet Methods
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



    //Modify Sheet
    $(".sheetRow").click(function () {
        selectedRow = $(this);

        prePopModForm("/api/getTimeSheet", sheetModForm);
        $("#DeleteButton").show();
        $("#DeleteButton").css("opacity", "1");
        $("#DeleteButton").click(function () {
            let sheetId = selectedRow.children()[0].innerHTML;
            showDeletePrompt("/api/deleteTimeSheet", {
                auth: id_token,
                id: sheetId
            }, deleteSheetSuccess, verifyDeleteSheet);


        });

    });//end modify sheet

    //Add Sheet
    $("#AddButton").click(function () {
        popAddForm(sheetAddForm);
        $("#DeleteButton").css("opacity", "0");
        setTimeout(function(){
            $("#DeleteButton").hide();
        }, 500);
    });//end add sheet

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

function sheetModForm(res, status) {
    //Pre-populate forms
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        "<form id='modify'>\n" +
        "<label for='modSheet'>Time Sheet Information</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modsheetid'>ID:</label>" +
        `<input type='text' id='modsheetid' name='modsheetid' value='${res.id}' disabled>\n<br>\n` +
        "<label for='modsheetplanname'>Plan ID:</label>" +
        `<input type='text' id='modsheetplanname' name='modsheetplanname' value='${res.hourlyRate}'>\n<br>\n` +
        "<label for='modsheettimein'>Time In:</label>" +
        `<input type='text' id='modsheettimein' name='modsheettimein' value='${res.timeIn}'>\n<br>\n` +
        "<label for='modsheettimeout'>Time Out:</label>" +
        `<input type='text' id='modsheettimeout' name='modsheettimeout' value='${res.timeOut}'>\n<br>\n` +
        "</form>\n");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        modSubmit("/api/updateTimeSheet", {
            auth: id_token,
            id: $("#modsheetid").val(),
            hourlyRate: $("#modsheetplanname").val(),
            timeIn: $("#modsheettimein").val() ,
            timeOut: $("#modsheettimeout").val(),
        }, modSheetSuccess);
    });
}

function sheetAddForm () {
    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
        "<form id='add'>\n" +
        "<label for='addSheet'>Time Sheet Information</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modsheetplanname'>Plan ID:</label>" +
        `<input type='text' id='modsheetplanname' name='modsheetplanname'>\n<br>\n` +
        "<label for='modsheettimein'>Time In:</label>" +
        `<input type='text' id='modsheettimein' name='modsheettimein'>\n<br>\n` +
        "<label for='modsheettimeout'>Time Out:</label>" +
        `<input type='text' id='modsheettimeout' name='modsheettimeout'>\n<br>\n` +
        "<label for='modsheetclientid'>Client ID:</label>" +
        `<input type='text' id='modsheetclientid' name='modsheetclientid'>\n<br>\n` +
        "<label for='modsheetmakerid'>Freedom Maker ID:</label>" +
        `<input type='text' id='modsheetmakerid' name='modsheetmakerid'>\n<br>\n` +
        "<label for='modsheetoccupation'>Freedom Maker Occupation:</label>" +
        `<input type='text' id='modsheetoccupation' name='modsheetoccupation'>\n<br>\n` +
        "</form>\n");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        addSubmit("/api/createTimeSheet", {
            auth: id_token,
            makerId: $("#modsheetmakerid").val(),
            hourlyRate: $("#modsheetplanname").val() ,
            clientId: $("#modsheetclientid").val(),
            timeIn: $("#modsheettimein").val(),
            timeOut: $("#modsheettimeout").val(),
            occupation: $("#addcity").val(),
        }, addSheetSuccess);
    });
}

function modSheetSuccess (res, status) {
    $("#optionsClient").append("<div id='modsuccess'></div>");
    $("#modsuccess").html("");
    $("#modsuccess").html(`<br><h5>Successfully updated sheet ${$("#modsheetid").val()}!</h5>`);

    //Updating viewable rows in table
    selectedRow.children()[3].innerHTML = $("#modsheetplanname").val();
    selectedRow.children()[4].innerHTML = $("#modsheettimein").val();
    selectedRow.children()[5].innerHTML = $("#modsheettimeout").val();
}

function addSheetSuccess (res, status) {
    $("#optionsClient").append("<div id='addsuccess'></div>");
    $("#addsuccess").html("");
    $("#addsuccess").html(`<br><h5>Successfully added sheet ${res.id}!</h5>`);

    //Adding new client to table
    $("#sheetTable").append('\n' +
        `<tr id="${res.id}" class="sheetRow">` +
        '   <td scope="row">' + `${res.id}` + '</td>' +
        '   <td>' + `${res.makerId}` + '</td>' +
        '   <td>' + `${res.clientId}` + '</td>' +
        '   <td>' + `${res.timeIn}` + '</td>' +
        '   <td>' + `${res.timeOut}` + '</td>' +
        '   <td>' + `${res.occupation}` + '</td></tr>'
    );

    $(`#${res.id}`).mouseenter(function () {
        $(this).css('transition', 'background-color 0.5s ease');
        $(this).css('background-color', '#e8ecef');
    }).mouseleave(function () {
        $(this).css('background-color', 'white');
    }).click(function () {
        prePopModForm("/api/getTimeSheet", sheetModForm);
    });
}

function deleteSheetSuccess (res, status) {
    $("#verifyEntry").html(`<h6>Successfully cleared sheet ${selectedRow.children()[0].innerHTML}!</h6>`);
    setTimeout(function () {
        showFunction(timeSheetFunctionality, "/api/getAllTimeSheets");
    }, 1000);
}

function verifyDeleteSheet () {
    let deleteId = $("#deleteUser").val();
    return (deleteId == selectedRow.children()[0].innerHTML);
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        window.location.replace(`/`);
    });
}

$(document).ready(function () {

    //table on page tab: Main (this functionality is not included in navItem)
    //Requires on load document ready instead of event listener method
    //otherwise it will not load unless clicking on 'Main'
    showMain();

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

    //Adding logout Button
    $("#logout").append("<button id='logoutButton' type='button' class='btn btn-default'>Log Out</button>");
    $("#logoutButton").click(function () {
        signOut();
        window.location.href = "/";
    })
})//end document ready