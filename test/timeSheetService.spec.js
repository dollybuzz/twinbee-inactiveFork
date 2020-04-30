const sinon = require('sinon');
const assert = require('assert');
const {expect} = require('chai');
const makerRepo = require('../repositories/makerRepo.js');
const clientRepo = require('../repositories/clientRepo.js');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const timeClockService = require('../services/TimeClockService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');


const timeSheetExtra1 = {id:1, first_name:'first', last_name: 'last', email: 'email',
    id: 1, maker_id: 1, client_id: 1, hourly_rate: 1.00, start_time: '2020-04-24 22:22:22',
    end_time: '2020-04-24 23:23:23', occupation:'worker', id: 1, location:'usa',
    remaining_hours: 20.00, email: 'clientEmail'};
const timeSheetExtra2 = {id:2, first_name:'first', last_name: 'last', email: 'email',
        id: 1, maker_id: 1, client_id: 1, hourly_rate: 1.00, start_time: '2020-04-24 22:22:22',
    end_time: '0000-00-00 00:00:00', occupation:'worker', id: 1, location:'usa',
    remaining_hours: 20.00, email: 'clientEmail'};
const timeSheetExtra3 = {id:3, first_name:'first', last_name: 'last', email: 'email',
    id: 1, maker_id: 1, client_id: 1, hourly_rate: 1.00, start_time: '2020-04-24 22:22:22',
    end_time: '2020-04-24 23:23:23', occupation:'worker', id: 1, location:'usa',
    remaining_hours: 20.00, email: 'clientEmail'};
const timeSheetExtra4 = {id:4, first_name:'first', last_name: 'last', email: 'email',
    id: 1, maker_id: 1, client_id: 1, hourly_rate: 1.00, start_time: '2019-04-24 22:22:22',
    end_time: '2019-04-24 23:23:23', occupation:'worker', id: 1, location:'usa',
    remaining_hours: 20.00, email: 'clientEmail'};
const timeSheetExtra5 = {id:5, first_name:'first', last_name: 'last', email: 'email',
    id: 1, maker_id: 1, client_id: 1, hourly_rate: 1.00, start_time: '2019-04-24 22:22:22',
    end_time: '2019-04-24 23:23:23', occupation:'worker', id: 1, location:'usa',
    remaining_hours: 20.00, email: 'clientEmail'};

const timeSheetBasic1 = {id: 1, maker_id: 1, client_id: 1, hourly_rate: 20.00, start_time: '2019-04-24 22:22:22',
                        end_time: '0000-00-00 00:00:00', occupation: 'worker'}
const timeSheetBasic2 = {id: 2, maker_id: 1, client_id: 1, hourly_rate: 20.00, start_time: '2019-04-23 22:22:22',
                        end_time: '2019-04-23 23:23:23', occupation: 'worker'}
const timeSheetBasic3 = {id: 3, maker_id: 2, client_id: 1, hourly_rate: 20.00, start_time: '2019-04-22 22:22:22',
                        end_time: '2019-04-22 23:23:23', occupation: 'worker'}


describe('Time Sheet Service Test', function () {

})