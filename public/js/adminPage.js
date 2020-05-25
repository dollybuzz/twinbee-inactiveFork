//global variable
let selectedRow = null;
let id_token = null;
let selectedTab = null;

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
    },

    manageCredit: function () {
        showFunction(creditFunctionality, "/api/getAllTimeBuckets");
    },

    manageRelationships: function () {
        showFunction(relationshipFunctionality, "/api/getAllRelationships");
    }

};//end navMapper

//Versatile Functions
function isEmail(val){
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val);
}

function isZip(val) {
    let strippedString = Number.parseInt(Number.parseInt(val).toString());
    return strippedString.toString().length == 5 && !(strippedString.toString().includes('-'))
}

function createBody (button) {
    //top row
    $("#topRow").append('\n<div id="optionsClient"></div>');
    $("#optionsClient").hide();
    $("#optionsClient").css("width", "50%");
    $("#buttonsTop").append("<button id='AddButton' type='button' class='btn btn-default'>+</button>");
    $("#buttonsTop").append("<button id='ExpandButton' type='button' class='btn btn-default'>></button>");
    if(button != null)
    {
        $("#buttonsTop").append("<button id='DeleteButton' type='button' class='btn btn-default'>" + button + "</button>");
    }
    $("#AddButton").css("opacity", "1");

    //bottom row
    $("#userMainContent").append('\n<div class="row" id="bottomRow"></div>');
    $("#userMainContent").append('<div id="buttonsBottom"></div>');
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
}

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
}

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
};

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
function showDeletePrompt (option, prompt, endpoint, object, successFunction, verifyDeleteUser) {
    showBlock();
    $("#optionsClient").html("<div id='deletePrompt'></div>");
    setTimeout(function() {
        $("#deletePrompt").html("<h5>Are you sure you want to " + option + "?</h5>");
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
            $("#adminText1").append('<h6>This is a table of current online makers.</h6>');
            $("#adminText2").append('<h6>This is a running table of daily/weekly/monthly hours?</h6>');

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
    createBody("Delete");

    //Event Listeners
    //Modify Client
    $(".clientRow").click(function () {
        selectedRow = $(this);
        let clientPrompt = `<h5>Please type in the full name to delete the selected user.</h5>` +
            `<h6>You selected ${selectedRow.children()[1].innerHTML}<br>ID: ${selectedRow.children()[0].innerHTML}</h6>` +
            "<br><form id='delete'>" +
            "<label for='deleteUser'>Enter Full Name:</label>" +
            `<input type='text' id='deleteUser' name='deleteUser'>\n<br>\n` +
            "</form>\n" ;

        prePopModForm("/api/getClient", clientModForm);
        $("#DeleteButton").show();
        $("#DeleteButton").css("opacity", "1");
        $("#DeleteButton").click(function () {
            let clientId = selectedRow.children()[0].innerHTML;
            showDeletePrompt("delete", clientPrompt,"/api/deleteClient", {
                auth: id_token,
                id: clientId
            }, deleteClientSuccess, verifyDeleteClient);
        });
    });

    //Add Client
    $("#AddButton").click(function () {
        popAddForm(clientAddForm);
        $("#DeleteButton").css("opacity", "0");
        setTimeout(function(){
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
        "<label for='modbillfname'>First Name:</label>" +
        `<input type='text' id='modbillfname' name='modbillfname' value='${res.billing_address.first_name}'>\n<br>\n` +
        "<label for='modbilllname'>Last Name:</label>" +
        `<input type='text' id='modbilllname' name='modbilllname' value='${res.billing_address.last_name}'>\n<br>\n` +
        "<label for='modaddress'>Street:</label>" +
        `<input type='text' id='modaddress' name='modaddress' value='${res.billing_address.line1}'>\n<br>\n` +
        "<label for='modcity'>City:</label>" +
        `<input type='text' id='modcity' name='modcity' value='${res.billing_address.city}'>\n<br>\n` +
        "<label for='modstate'>State:</label>" +
        `<input type='text' id='modstate' name='modstate' value='${res.billing_address.state}'>\n<br>\n` +
        "<label for='modzip'>Zip:</label>" +
        `<input type='text' id='modzip' name='modzip' value='${res.billing_address.zip}'>\n<br>\n` +
        "</form>\n");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        if (isEmail($("#modemail").val()) && isZip($("#modzip").val())) {
            modSubmit("/api/updateClientContact", {
                auth: id_token,
                id: $("#modclientid").val(),
                firstName: $("#modclientfname").val(),
                lastName: $("#modclientlname").val(),
                phone: $("#modphone").val(),
                email: $("#modemail").val()
            }, modClientSuccessContact);

            modSubmit("/api/updateClientBilling", {
                auth: id_token,
                id: $("#modclientid").val(),
                firstName: $("#modbillfname").val(),
                lastName: $("#modbilllname").val(),
                phone: $("#modphone").val(),
                email: $("#modemail").val(),
                street: $("#modaddress").val(),
                city: $("#modcity").val(),
                state: $("#modstate").val(),
                zip: $("#modzip").val()
            }, modClientSuccessBilling);
        }
        else if (!isEmail($("#modemail").val())){
            alert("Invalid email!");
        }
        else if (!isZip($("#modzip").val())){
            alert("Invalid zip!");
        }
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
        if ( isEmail($("#addemail").val()) && isZip($("#addzip").val())) {
            addSubmit("/api/createClient", {
                auth: id_token,
                firstName: $("#addclientfname").val(),
                lastName: $("#addclientlname").val(),
                phone: $("#addphone").val(),
                email: $("#addemail").val(),
                street: $("#addaddress").val(),
                city: $("#addcity").val(),
                state: $("#addstate").val(),
                zip: $("#addzip").val(),
                billingFirst: $("#addbillingfname").val(),
                billingLast: $("#addbillinglname").val()
            }, addClientSuccess);
        } else if (!isZip($("#addzip").val())){
            alert("Invalid zip!");
        }
        else if (!isEmail($("#addemail").val())){
            alert("Invalid email!");
        }

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
    }, 3000);
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
    createBody("Delete");

    //Event Listeners
    // Modify
    $(".makerRow").click(function () {
        selectedRow = $(this);
        let makerPrompt = `<h5>Please type in the full name to delete the selected user.</h5>` +
            `<h6>You selected ${selectedRow.children()[1].innerHTML} ${selectedRow.children()[2].innerHTML}<br>ID: ${selectedRow.children()[0].innerHTML}</h6>` +
            "<br><form id='delete'>" +
            "<label for='deleteUser'>Enter Full Name:</label>" +
            `<input type='text' id='deleteUser' name='deleteUser'>\n<br>\n` +
            "</form>\n";

        prePopModForm("/api/getMaker", makerModForm);
        $("#DeleteButton").show();
        $("#DeleteButton").css("opacity", "1");
        $("#DeleteButton").click(function () {
            let makerId = selectedRow.children()[0].innerHTML;
            showDeletePrompt("delete", makerPrompt,"/api/deleteMaker", {
                auth: id_token,
                id: makerId
            }, deleteMakerSuccess, verifyDeleteMaker);
        });
    });

    //Add
    $("#AddButton").click(function () {
        popAddForm(makerAddForm);
        $("#DeleteButton").css("opacity", "0");
        setTimeout(function(){
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
        if (isEmail($("#modemail").val())) {
            modSubmit("/api/updateMaker", {
                auth: id_token,
                id: $("#modmakerid").val(),
                firstName: $("#modmakerfname").val(),
                lastName: $("#modmakerlname").val(),
                email: $("#modemail").val()
            }, modMakerSuccess);
        }
        else if(isEmail($("#modemail").val())){
            alert("Email not valid!");
        }
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
        if (isEmail($("#addemail").val())) {
            addSubmit("/api/createMaker", {
                auth: id_token,
                id: $("#addmakerid").val(),
                firstName: $("#addmakerfname").val(),
                lastName: $("#addmakerlname").val(),
                email: $("#addemail").val()
            }, addMakerSuccess);
        }
        else{
            alert("Invalid email!");
        }
    });
}

function modMakerSuccess (res, status) {
    $("#optionsClient").append("<div id='modsuccess'></div>");
    $("#modsuccess").html("");
    $("#modsuccess").html(`<br><h5>Successfully updated Freedom Maker ${$("#modmakerid").val()}!</h5>`);

    //Updating viewable rows in table
    selectedRow.children()[1].innerHTML = $("#modmakerfname").val();
    selectedRow.children()[2].innerHTML = $("#modmakerlname").val();
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
        '   <td>' + res.firstName + '</td>' +
        '   <td>' +  res.lastName +  '</td>' +
        '   <td>' + res.email + '</td></tr>'
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
                '   <td>' + subscription.plan_quantity + '</td>' +
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

function subscriptionModForm (res, status) {
    //Pre-populate forms
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        "<form id='modify'>\n" +
        "<label for='modSubscription'>Subscription Information</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='modsubscriptionid'>ID:</label>" +
        `<input type='text' id='modsubscriptionid' name='modsubscriptionid' value='${res.id}' disabled>\n<br>\n` +
        "<label for='modsubscriptionplanname'>Plan:</label>" +
        `<select id='modsubscriptionplanname' name='modsubscriptionplanname'></select>\n<br>\n` +
        "<label for='modsubscriptionplanquantity'>Monthly Hours:</label>" +
        `<input type='text' id='modsubscriptionplanquantity' name='modsubscriptionplanquantity' value='${res.plan_quantity}'>\n<br>\n` +
        "<label for='modsubscriptionprice'>Price Per Hour ($):</label>" +
        `<input type='text' id='modsubscriptionplanquantity' name='modsubscriptionplanquantity' value='${res.plan_unit_price == undefined ? "": res.plan_unit_price/100}'>\n<br>\n` +
        "</form>\n");
    $.ajax({
        url: "/api/getAllPlans",
        method: "post",
        data: {
            auth: id_token
        },
        dataType: "json",
        success: function (planres, planstatus) {
            for(var plan in planres){
                plan = planres[plan].plan;
                if (selectedRow.children()[2].innerHTML == plan.id)
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
                modSubmit("/api/updateSubscription", {
                    auth: id_token,
                    subscriptionId: $("#modsubscriptionid").val(),
                    planId: $("#modsubscriptionplanname").val(),
                    planQuantity: $("#modsubscriptionplanquantity").val()
                }, modSubscriptionSuccess);
            });
        },
        error: function (planres, makerstatus) {
            $("#userMainContent").html("Relationships isn't working!");
        }
    });


}

function subscriptionAddForm () {
    $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
        "<form id='add'>\n" +
        "<label for='addSubscription'>Subscription Information</label>" +
        "<label for='empty'></label>" +
        "<label for='empty'></label>" +
        "<label for='addsubscriptionplanid'>Plan ID:</label>" +
        `<select id='addsubscriptionplanid' name='addsubscriptionplanid'></select>\n<br>\n` +
        "<label for='addsubscriptioncustomerid'>Customer ID:</label>" +
        `<select id='addsubscriptioncustomerid' name='addsubscriptioncustomerid'></select><span id='addsubscrtioncustomerdescription'></span>\n` +
        "<label for='addsubscriptionplanquantity'>Monthly Hours:</label>" +
        `<input type='number' step='1' id='addsubscriptionplanquantity' name='addsubscriptionplanquantity'>\n<br>\n` +
        "</form>\n");

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
                    for(var plan in planres) {
                        plan = planres[plan].plan;
                        $('#addsubscriptionplanid').append(
                            `<option id="${plan.id}" value="${plan.id}">${plan.id}</option>`
                        );
                    }
                    for(var client in clientres) {
                        client = clientres[client].customer;
                        $('#addsubscriptioncustomerid').append(
                            `<option id="${client.id}" value="${client.id}">${client.first_name + ' ' + client.last_name}</option>`
                        );
                    }

                    $.ajax({
                        url: "/api/getClient",
                        method: "post",
                        data: {
                            auth: id_token,
                            id: $("#addsubscriptioncustomerid").val()
                        },
                        dataType: "json",
                        success:function (res, status) {
                            $("#addsubscrtioncustomerdescription").html(res.id);
                        },
                        error: function (clientres, clientstatus) {
                            $("#userMainContent").html("Clients isn't working!");
                        }

                    });

                    $("#addsubscriptioncustomerid").on('change', function () {
                        $.ajax({
                            url: "/api/getClient",
                            method: "post",
                            data: {
                                auth: id_token,
                                id: $("#addsubscriptioncustomerid").val()
                            },
                            dataType: "json",
                            success:function (res, status) {
                                $("#addsubscrtioncustomerdescription").html(res.id)
                            },
                            error: function (clientres, clientstatus) {
                                $("#userMainContent").html("Clients isn't working!");
                            }

                        })
                    });

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
    createBody("Cancel");

    //Event Listeners
    //Modify
    $(".planRow").click(function () {
        selectedRow = $(this);
        let planPrompt = `<h5>Please type in the plan id to cancel the selected plan.</h5>` +
            `<h6>You selected ID: ${selectedRow.children()[0].innerHTML}</h6>` +
            "<br><form id='delete'>" +
            "<label for='deleteUser'>Enter ID:</label>" +
            `<input type='text' id='deleteUser' name='deleteUser'>\n<br>\n` +
            "</form>\n";

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
        "<label for='addplanname'>New Plan ID (no spaces!):</label>" +
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
        '            <th scope="col">Freedom Maker ID</th>\n' +
        '            <th scope="col">Client ID</th>\n' +
        '            <th scope="col">Plan ID</th>\n' +
        '            <th scope="col">Clock In</th>\n' +
        '            <th scope="col">Clock Out</th>\n' +
        '            <th scope="col">Task</th>\n' +
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
            '   <td>' + item.task + '</td></tr>'
        );
    });
    $("#sheetsTable").append('\n</tbody>');

    //Body Block content
    createBody("Delete");

    //Event Listeners
    //Modify
    $(".sheetRow").click(function () {
        selectedRow = $(this);
        let timeSheetPrompt = `<h5>Please type in the time sheet ID to delete the selected time sheet.</h5>` +
            `<h6>You selected ID: ${selectedRow.children()[0].innerHTML}</h6>` +
            "<br><form id='delete'>" +
            "<label for='deleteUser'>Enter ID:</label>" +
            `<input type='text' id='deleteUser' name='deleteUser'>\n<br>\n` +
            "</form>\n";
        prePopModForm("/api/getTimeSheet", sheetModForm);
        $("#DeleteButton").show();
        $("#DeleteButton").css("opacity", "1");
        $("#DeleteButton").click(function () {
            let sheetId = selectedRow.children()[0].innerHTML;
            showDeletePrompt("delete", timeSheetPrompt,"/api/deleteTimeSheet", {
                auth: id_token,
                id: sheetId
            }, deleteSheetSuccess, verifyDeleteSheet);
        });
    });

    //Add
    $("#AddButton").click(function () {
        popAddForm(sheetAddForm);
        $("#DeleteButton").css("opacity", "0");
        setTimeout(function(){
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
        "<label for='modsheettask'>Freedom Maker Task:</label>" +
        `<input type='text' id='modsheettask' name='modsheettask'>\n<br>\n` +
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
            task: $("#modsheettask").val(),
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
        '   <td>' + `${res.task}` + '</td></tr>'
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

//Credit Methods
function creditFunctionality (res) {
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
        '            <th scope="col">Plan ID</th>\n' +
        '            <th scope="col">Minutes</th>\n' +
        '        </thead><tbody>');
    //Populate table
    res.forEach(customer => {
       for(var item in customer.buckets) {
           $("#creditTable").append('\n' +
               '<tr class="creditRow">' +
               '   <td scope="row">' + customer.id + '</td>' +
               '   <td scope="row">' + customer.first_name + ' ' + customer.last_name + '</td>' +
               '   <td>' + item + '</td>' +
               '   <td>' + customer.buckets[item] + '</td>'
           );
       };
    });
    $("#creditTable").append('\n</tbody>');

    //Body Block content
    createBody(null);

    //Event Listeners
    //Modify
    $(".creditRow").click(function () {
        selectedRow = $(this);
        prePopModForm("/api/getAllTimeBuckets", creditModForm);
        //No delete feature
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
        `<h6>You selected ID: ${selectedRow.children()[0].innerHTML}<br>Client: ${selectedRow.children()[1].innerHTML}</h6>` +
        `<br><h6>Please enter an integer (+/-)<br>to adjust minutes for Plan ID: ${selectedRow.children()[2].innerHTML}</h6>` +
        "<input type='number' id='creditmodminutes' name='creditmodminutes'>");

    //Submit button function
    $("#SubmitButton").off("click");
    $("#SubmitButton").on('click', function (e) {
        modSubmit("/api/updateClientTimeBucket", {
            auth: id_token,
            id: selectedRow.children()[0].innerHTML,
            planName: selectedRow.children()[2].innerHTML,
            minutes: $("#creditmodminutes").val()
        }, modCreditSuccess);
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
                        "<h6>Please select a Client and Plan to assign:</h6><br>" +
                        "<label for='addClientCredit'> Select a Client: </label>" +
                        "<select id='addClientCredit'>\n</select><br><br>\n" +
                        "<label for='addPlanCredit'> Select a Plan: </label>" +
                        "<select id='addPlanCredit'>\n</select><br><br>\n" +
                        "<label for='addMinCredit'> Enter Value of Minutes: </label>" +
                        "<input type='number' id='addMinCredit' name='addMinCredit'><br><br>\n");

                    for(var item of clientres) {
                        $('#addClientCredit').append(
                            `<option id="${item.customer.id}" value="${item.customer.id}">${item.customer.first_name} ${item.customer.last_name}</option>`
                        );
                    }
                    for(var item of planres) {
                        $('#addPlanCredit').append(
                            `<option id="${item.plan.id}" value="${item.plan.id}">${item.plan.id}</option>`
                        );
                    }

                    //Submit button function
                    $("#SubmitButton").off("click");
                    $("#SubmitButton").on('click', function (e) {
                        addSubmit("/api/updateClientTimeBucket", {
                            auth: id_token,
                            id: $("#addClientCredit").val(),
                            planId: $("#addPlanCredit").val(),
                            minutes: $("#addMinCredit").val()
                        }, addCreditSuccess);
                    });
                },
                error: function (planres, planstatus) {
                    $("#userMainContent").html("Plan Credit isn't working!");
                }
            });
        },
        error: function (clientres, clientstatus) {
            $("#userMainContent").html("Client Credit isn't working!");
        }
    });
}

function modCreditSuccess (res, status) {
    $("#optionsClient").append("<div id='modCreditSuccess'></div>");
    $("#modCreditSuccess").html("");
    $("#modCreditSuccess").html(`<br><h5>Successfully updated minutes for Client ${selectedRow.children()[1].innerHTML}!</h5>`);

    //Different from previous methods because of ajax dependency
    setTimeout(function () {
        showFunction(creditFunctionality, "/api/getAllTimeBuckets");
    }, 3000);
}

function addCreditSuccess (res, status) {
    $("#optionsClient").append("<div id='addCreditSuccess'></div>");
    $("#addCreditSuccess").html("");
    $("#addCreditSuccess").html(`<br><h5>Successfully added new available credit for ${res.id}!</h5>`);

    //Different from previous methods because of ajax dependency
    setTimeout(function () {
        showFunction(creditFunctionality, "/api/getAllTimeBuckets");
    }, 3000);
}

//Relationship Methods
function relationshipFunctionality (res) {
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
                            for(item of clientres) {
                                if(item.customer.first_name)
                                {
                                    clientMap[item.customer.id] = item.customer;
                                }
                            }
                            for(item of makerres) {
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
                                '            <th scope="col">ID</th>\n' +
                                '            <th scope="col">Client </th>\n' +
                                '            <th scope="col">Freedom Maker</th>\n' +
                                '            <th scope="col">Plan ID</th>\n' +
                                '            <th scope="col">Occupation</th>\n' +
                                '        </thead><tbody>');
                            //Populate table
                            res.forEach(item => {
                                $("#relationshipTable").append('\n' +
                                    '<tr class="relationshipRow">' +
                                    '   <td scope="row">' + item.id +'</td>' +
                                    '   <td>' + clientMap[item.clientId].first_name + " " + clientMap[item.clientId].last_name + '</td>'+
                                    '   <td>' + makerMap[item.makerId].firstName + " " + makerMap[item.makerId].lastName + '</td>'+
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
                                let relationshipPrompt = `<h5>Please type in the relationship ID to delete the selected relationship.</h5>` +
                                    `<h6>You selected ID: ${selectedRow.children()[0].innerHTML}</h6>` +
                                    "<br><form id='delete'>" +
                                    "<label for='deleteUser'>Enter ID:</label>" +
                                    `<input type='text' id='deleteUser' name='deleteUser'>\n<br>\n` +
                                    "</form>\n";
                                prePopModForm("/api/getRelationshipById", relationshipModForm);
                                $("#DeleteButton").show();
                                $("#DeleteButton").css("opacity", "1");
                                $("#DeleteButton").click(function () {
                                    let relationshipId = selectedRow.children()[0].innerHTML;
                                    showDeletePrompt("delete", relationshipPrompt,"/api/deleteRelationship", {
                                        auth: id_token,
                                        id: relationshipId
                                    }, deleteRelationshipSuccess, verifyDeleteRelationship);
                                });

                            });

                            //Add
                            $("#AddButton").click(function () {
                                popAddForm(relationshipAddForm);
                                $("#DeleteButton").css("opacity", "0");
                                setTimeout(function(){
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
            $("#userMainContent").html("Client Relationship isn't working!");
        }
    });
}

function relationshipModForm(res, status) {
//Pre-populate forms
    $("#optionsClient").html("<h5>Edit/Modify the following fields</h5><br>" +
        `<h6>You selected ID: ${selectedRow.children()[0].innerHTML}<br>Client: ${selectedRow.children()[1].innerHTML}</h6>` +
        "<br><h6>Please select a Freedom Maker to assign:</h6>" +
        "<select id='modMakerRel'>\n</select>\n");
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
                            for(var item of makerres) {
                                if(makerId == item.id) {
                                    $('#modMakerRel').append(
                                        `<option id="${makerId}" value="${makerId}" selected>${makerId} ${item.firstName} ${item.lastName}</option>`
                                    );
                                }
                                else {
                                    $('#modMakerRel').append(
                                        `<option id="${item.id}" value="${item.id}">${item.id} ${item.firstName} ${item.lastName}</option>`
                                    );
                                }
                            };

                            //Submit button function
                            $("#SubmitButton").off("click");
                            $("#SubmitButton").on('click', function (e) {
                                modSubmit("/api/updateRelationship", {
                                    auth: id_token,
                                    id: selectedRow.children()[0].innerHTML,
                                    makerId: $("#modMakerRel").val(),
                                    planId: relres.planId,
                                    occupation: relres.occupation
                                }, modRelationshipSuccess);
                            });
                        },
                        error: function (relres, relstatus) {
                            $("#userMainContent").html("Makers isn't working!");
                        }
                    });
                },
                error: function (makerres, makerstatus) {
                    $("#userMainContent").html("Relationships isn't working!");
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
                    $.ajax({
                        url: "/api/getAllPlans",
                        method: "post",
                        data: {
                            auth: id_token
                        },
                        dataType: "json",
                        success: function (planres, planstatus) {
                            $("#optionsClient").html("<h5>Add data into the following fields</h5><br>" +
                                "<h6>Please select a Client, Freedom Maker, and Plan to assign:</h6><br>" +
                                "<label for='addClientRel'> Select a Client: </label>" +
                                "<select id='addClientRel'>\n</select><br><br>\n" +
                                "<label for='addMakerRel'> Select a Freedom Maker: </label>" +
                                "<select id='addMakerRel'>\n</select><br><br>\n" +
                                "<label for='addPlanRel'> Select a Plan: </label>" +
                                "<select id='addPlanRel'>\n</select><br><br>\n" +
                                "<label for='addOccRel'> Enter an Occupation: </label>" +
                                "<input type='text' id='addOccRel' name='addOccRel'><br><br>\n");

                            for(var item of clientres) {
                                $('#addClientRel').append(
                                    `<option id="${item.customer.id}" value="${item.customer.id}">${item.customer.first_name} ${item.customer.last_name}</option>`
                                );
                            }
                            for(var item of makerres) {
                                $('#addMakerRel').append(
                                    `<option id="${item.id}" value="${item.id}">${item.id} ${item.firstName} ${item.lastName}</option>`
                                );
                            }
                            for(var item of planres) {
                                $('#addPlanRel').append(
                                    `<option id="${item.plan.id}" value="${item.plan.id}">${item.plan.id}</option>`
                                );
                            }

                            //Submit button function
                            $("#SubmitButton").off("click");
                            $("#SubmitButton").on('click', function (e) {
                                addSubmit("/api/createRelationship", {
                                    auth: id_token,
                                    clientId: $("#addClientRel").val(),
                                    makerId: $("#addMakerRel").val(),
                                    planId: $("#addPlanRel").val(),
                                    occupation: $("#addOccRel").val(),
                                }, addRelationshipSuccess);
                            });
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
            $("#userMainContent").html("Client Relationship isn't working!");
        }
    });
}

function modRelationshipSuccess (res, status) {
    $("#optionsClient").append("<div id='modRelSuccess'></div>");
    $("#modRelSuccess").html("");
    $("#modRelSuccess").html(`<br><h5>Successfully updated Relationship for Client ${selectedRow.children()[1].innerHTML}!</h5>`);

    //Different from previous methods because of ajax dependency
    setTimeout(function () {
        showFunction(relationshipFunctionality, "/api/getAllRelationships");
    }, 1000);
}

function addRelationshipSuccess (res, status) {
    $("#optionsClient").append("<div id='addRelSuccess'></div>");
    $("#addRelSuccess").html("");
    $("#addRelSuccess").html(`<br><h5>Successfully added Relationship ${res.id}!</h5>`);

    //Different from previous methods because of ajax dependency
    setTimeout(function () {
        showFunction(relationshipFunctionality, "/api/getAllRelationships");
    }, 1000);
}

function deleteRelationshipSuccess() {
    $("#verifyEntry").html(`<h6>Successfully deleted Relationship ${selectedRow.children()[0].innerHTML}!</h6>`);
    setTimeout(function () {
        showFunction(relationshipFunctionality, "/api/getAllRelationships");
    }, 1000);
}

function verifyDeleteRelationship() {
    let deleteUser = $("#deleteUser").val();
    return (deleteUser == (selectedRow.children()[0].innerHTML));
}

//Google
onSignIn = function (googleUser) {
    id_token = googleUser.getAuthResponse().id_token;

};

$(document).ready(function () {

    //Adding logout Button
    $("#logout").append("<button id='logoutButton' type='button' class='btn btn-default'>Log Out</button>");
    $("#logoutButton").click(signOut);

    //table on page tab: Main (this functionality is not included in navItem)
    //Requires on load document ready instead of event listener method
    //otherwise it will not load unless clicking on 'Main'
    showMain();

    //Event Listeners for other nav menu items
    $(".navItem").click(function (e) {
        navMapper[e.target.id]();
        selectedTab = $(this)[0].id;
        $(".navItem").css('color', 'white');
        $(".navItem").css('font-style', 'normal');
        $(this).css("color", '#dbb459');
        $(this).css("font-style", 'italic');
    })

    $(".navItem").hover(function () {
        $(this).css("color", '#dbb459');
        $(this).css("font-style", 'italic');
    });

    $(".navItem").on("mouseleave", function() {
        if (selectedTab!= $(this)[0].id)
        {
            $(this).css("color", 'white');
            $(this).css("font-style", 'normal');
        }
    });

    //shifts the logo
    $("#landingLogo").css("width", "20%");

})