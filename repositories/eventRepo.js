//TODO; have errors send us notifications rather than "throw"

const {query} = require("./repoMaster.js");
class EventRepository {
    constructor() {
    };

    createEvent(eventId) {
        return new Promise((resolve, reject) => {
            let sql = 'INSERT INTO chargebee_events(id) VALUES (?)';
            let sqlParams = [eventId];
            query(sql, sqlParams, function (err, result) {
                if (err) {
                    notificationService.notifyAdmin(err.toString());
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