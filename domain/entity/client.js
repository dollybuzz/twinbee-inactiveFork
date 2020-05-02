'use strict';

module.exports = class Client{

    constructor(id, name, location, remainingHours, email, chargebeeObj, makers){
        this.id = id;
        this.name = name;
        this.location = location;
        this.chargebeeObj = chargebeeObj;
        this.remainingHours = remainingHours;
        this.email = email;
        this.makers = makers;


    }
}