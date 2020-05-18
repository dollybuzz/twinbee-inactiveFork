const sinon = require('sinon');
const assert = require('assert');
const {expect} = require('chai');
const relationshipRepo = require('../repositories/relationshipRepo.js');
const relationshipService = require('../services/relationshipService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const nock = require('nock');
const TimeSheet = require('../domain/entity/timeSheet');

const relationshipBasic1 = {id: "1", maker_id: "1", client_id: 'a', plan_id: 'freedom-makers-32', occupation: 'oc1'};
const relationshipBasic2 = {id: "2", maker_id: "1", client_id: 'b', plan_id: 'freedom-makers-37', occupation: 'oc2'};
const relationshipBasic3 = {id: "3", maker_id: "2", client_id: 'b', plan_id: 'freedom-makers-42', occupation: 'oc3'};

const relationshipRefined1 = {id: 1, makerId: 1, clientId: 'a', planId: 'freedom-makers-32', occupation: 'oc1'};
const relationshipRefined2 = {id: 2, makerId: 2, clientId: 'a', planId: 'freedom-makers-32', occupation: 'oc2'};
const relationshipRefined3 = {id: 3, makerId: 3, clientId: 'a', planId: 'freedom-makers-32', occupation: 'oc3'};

describe('Relationship Service Test', function () {
    beforeEach(function () {
        let getAllRelationshipsStub = sinon.stub(relationshipRepo, 'getAllRelationships')
            .resolves([timeSheetBasic1, timeSheetBasic2, timeSheetBasic3]);
        let updateRelationshipStub = sinon.stub(relationshipRepo, 'updateRelationship')
            .resolves(()=>{
                console.log("Hello, world!");
            });
        let getRelationshipsByMakerIdStub = sinon.stub(relationshipRepo, 'getRelationshipsByMakerId')
            .resolves([timeSheetBasic1, timeSheetBasic3]);
        let getRelationshipsByClientIdStub = sinon.stub(relationshipRepo, 'getRelationshipsByClientId')
            .resolves(1);
        let deleteRelationshipStub = sinon.stub(relationshipRepo, 'deleteRelationship')
            .resolves(()=>{
                console.log("Don't delete me bro!");
            });
        let createRelationshipStub = sinon.stub(relationshipRepo, 'createRelationship')
            .resolves(()=>{
                console.log("Don't delete me bro!");
            });
    });

    afterEach(function () {
        sinon.restore();
    });

    it('Should create a valid relationship object', async function () {
        let actual = relationshipService.createRelationship("1", "a", "freedom-makers-32", "oc1");
        expect(actual).to.deep.equal(relationshipRefined1);
    });

    it('Should grab a list of all relationship objects', async function () {
        let actual = await relationshipService.getAllRelationships();
        expect(actual).to.deep.equal([relationshipRefined1, relationshipRefined2, relationshipRefined3]);
        
    });
    
    it('Should grab relationships by maker id', async function () {
        let actual = await relationshipService.getRelationshipsByMakerId("1");
        expect(actual).to.deep.equal([relationshipRefined1, relationshipRefined2]);
    });

    it('Should grab relationships by client id', async function () {
        let actual = await relationshipService.getRelationshipsByClientId("b");
        expect(actual).to.deep.equal([relationshipRefined2, relationshipRefined3]);
    });

    it('Should delete a relationship', async function () {
        await relationshipService.deleteRelationship("123");
        sinon.assert.calledOnce(relationshipRepo.deleteRelationship);
    });

    it('Should update a relationship', async function () {
        let actual = await relationshipService.updateRelationship("7", "1", 'a', 'someplan', 'occupation');
        sinon.assert.calledOnce(relationshipRepo.updateRelationship);
    });

});