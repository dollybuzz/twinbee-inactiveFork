const sinon = require('sinon');
const assert = require('assert');
const {expect} = require('chai');
const relationshipRepo = require('../repositories/relationshipRepo.js');
const relationshipService = require('../services/relationshipService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const nock = require('nock');

const relationshipBasic1 = {id: "1", maker_id: "1", client_id: 'a', plan_id: 'freedom-makers-32', occupation: 'oc1', hourly_rate: 1000};
const relationshipBasic2 = {id: "2", maker_id: "1", client_id: 'b', plan_id: 'freedom-makers-37', occupation: 'oc2', hourly_rate: 2000};
const relationshipBasic3 = {id: "3", maker_id: "2", client_id: 'b', plan_id: 'freedom-makers-42', occupation: 'oc3', hourly_rate: 3000};

const relationshipRefined1 = {id: "1", makerId: "1", clientId: 'a', planId: 'freedom-makers-32', occupation: 'oc1', hourlyRate: 1000};
const relationshipRefined2 = {id: "2", makerId: "1", clientId: 'b', planId: 'freedom-makers-37', occupation: 'oc2', hourlyRate: 2000};
const relationshipRefined3 = {id: "3", makerId: "2", clientId: 'b', planId: 'freedom-makers-42', occupation: 'oc3', hourlyRate: 3000};

describe('Relationship Service Test', function () {
    beforeEach(function () {
        let getAllRelationshipsStub = sinon.stub(relationshipRepo, 'getAllRelationships')
            .resolves([relationshipBasic1, relationshipBasic2, relationshipBasic3]);
        let getRelationshipStub = sinon.stub(relationshipRepo, 'getRelationshipById')
            .resolves([relationshipBasic1]);
        let updateRelationshipStub = sinon.stub(relationshipRepo, 'updateRelationship')
            .resolves(()=>{
                console.log("Hello, world!");
            });
        let getRelationshipsByMakerIdStub = sinon.stub(relationshipRepo, 'getRelationshipsByMakerId')
            .resolves([relationshipBasic1, relationshipBasic2]);
        let getRelationshipsByClientIdStub = sinon.stub(relationshipRepo, 'getRelationshipsByClientId')
            .resolves([relationshipBasic2, relationshipBasic3]);
        let deleteRelationshipStub = sinon.stub(relationshipRepo, 'deleteRelationship')
            .resolves(()=>{
                console.log("Hello world!");
            });
        let createRelationshipStub = sinon.stub(relationshipRepo, 'createRelationship')
            .resolves("1");
    });

    afterEach(function () {
        sinon.restore();
    });

    it('Should create a valid relationship object', async function () {
        let actual = await relationshipService.createRelationship("1", "a", "freedom-makers-32", "oc1", 1000);
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
        let actual = await relationshipService.updateRelationship("1", "1", 'a', 'someplan', 'occupation');
        sinon.assert.calledOnce(relationshipRepo.updateRelationship);
    });

});