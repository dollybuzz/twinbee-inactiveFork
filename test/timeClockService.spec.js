const sinon = require('sinon');
const {expect} = require('chai');
const makerRepo = require('../repositories/makerRepo.js');
const timeClockService = require('../services/TimeClockService.js');


const timeSheet1 = {id:1, first_name:'first', last_name: 'last', email: 'email',
    id: 1, maker_id: 1, client_id: 1, hourly_rate: 1.00, start_time: '2020-04-24 23:23:23',
    end_time: '2020-04-24 24:24:24', occupation:'worker', id: 1, location:'usa',
    remaining_hours: 20.00, email: 'clientEmail'};
const timeSheet2 = {id:2, first_name:'first', last_name: 'last', email: 'email',
        id: 1, maker_id: 1, client_id: 1, hourly_rate: 1.00, start_time: '2020-04-24 23:23:23',
    end_time: '0000-00-00 00:00:00', occupation:'worker', id: 1, location:'usa',
    remaining_hours: 20.00, email: 'clientEmail'};


describe('Time Clock Service Test', function () {
    it('Should grab only online users',  async function () {
        let stub = sinon.stub(makerRepo, 'getOnlineMakers').callsFake(()=>{return [timeSheet2];});
        let results =  await timeClockService.getOnlineMakers();
        expect(results).to.deep.equal([{id: 1, first_name: 'first', last_name: 'last'}]);
        stub.restore();
    })

})