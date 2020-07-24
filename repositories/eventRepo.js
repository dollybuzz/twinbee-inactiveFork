const repoMaster = require("./repoMaster.js");
const {logCaughtError} = require('../util.js');

class EventRepository {
    constructor() {
    };

    createEvent(eventId) {
        return new Promise((resolve, reject) => {
            let sql = 'INSERT INTO chargebee_events(id) VALUES (?)';
            let sqlParams = [eventId];
            repoMaster.query(sql, sqlParams, function (err, result) {
                if (err) {
                    logCaughtError(err.toString());
                    console.log(`Duplicate Event not created: Event ${eventId}`);
                    resolve(false);
                }
                else{
                    console.log(`Event ${eventId} created`);
                    resolve(true);
                }
            });
        })

    }
}


module.exports = new EventRepository();