'use strict';
module.exports = class Maker{

    constructor(id, firstName, lastName, email, chargebeeObj, clients){
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.clients = clients;
        this.chargebeeObj = chargebeeObj;
    }
}