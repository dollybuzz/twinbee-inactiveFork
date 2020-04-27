const sinon = require('sinon');
const {expect} = require('chai');
const timeClockService = require("../services/TimeClockService.js");
const makerRepo = require('../repositories/clientRepo.js');





describe('Time Clock Service Test', function () {
    it('Should grab only online users', function () {
        sinon.stub(makerRepo, 'getOnlineMakers');
    })
})