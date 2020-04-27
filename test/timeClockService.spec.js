const sinon = require('sinon');
const {expect} = require('chai');
const timeClockService = require("../services/TimeClockService.js");
const makerRepo = require('../repositories/makerRepo.js');





describe('Time Clock Service Test', function () {
    it('Should grab only online users', function () {
        let stub = sinon.stub(makerRepo, 'getOnlineMakers').callsFake(()=>
        {return [{id:1, first_name:'first', last_name: 'last', email: 'email'}]
        });
        expect(makerRepo.getOnlineMakers()).to.equal([{id: 1, first_name: 'first', last_name: 'last'}]);
        stub.restore();
    })
})