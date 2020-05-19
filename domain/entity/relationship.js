'use strict';
module.exports = class Relationship{
    constructor(id, makerId, clientId, planId, occupation){
        this.id = id;
        this.makerId = makerId;
        this.clientId = clientId;
        this.planId = planId;
        this.occupation = occupation;
    }
};