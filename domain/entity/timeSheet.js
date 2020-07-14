'use strict';
module.exports = class TimeSheet{

    constructor(id, makerId, planId, clientId, timeIn, timeOut, task, adminNote, relationshipId){
        //upon finishing population of object, send to database.
        //any validity checks will have to occur prior to this.
        this.id = id;
        this.makerId = makerId;
        this.planId = planId;
        this.clientId = clientId;
        this.timeIn = timeIn;
        this.timeOut = timeOut;
        this.task = task;
        this.adminNote = adminNote;
        this.relationshipId = relationshipId;
    }
}