'use strict';
module.exports = class TimeSheet{

    constructor(id, firstName, lastName, email, hourlyRate, client, timeIn, timeOut){
        //upon finishing population of object, send to database.
        //any validity checks will have to occur prior to this.
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.hourlyRate = hourlyRate;
        this.client = client;
        this.timeIn = timeIn;
        this.timeOut = timeOut;
    }
}