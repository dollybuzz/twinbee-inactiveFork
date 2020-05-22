//TODO; have errors send us notifications rather than "throw"

const {query} = require("./repoMaster.js");
class EventRepository {
    constructor() {
    };

    async createEvent(eventId) {
        let sql = 'INSERT INTO chargebee_events(id) VALUES (?)';
        let sqlParams = [eventId];
        query(sql, sqlParams, function (err, result) {
            if (err) {
                console.log(`Duplicate Event not created: Event ${eventId}`);
                return false;
            }
            else{
                console.log(`Event ${eventId} created`);
                return true;
            }
        });
    }
}


module.exports = new EventRepository();