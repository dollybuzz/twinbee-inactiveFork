'use strict';
module.exports = class Maker{

    constructor(id, firstName, lastName, email, deleted, unique){
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.deleted = deleted || false;
        this.unique = unique;
    }
};