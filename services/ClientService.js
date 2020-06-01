const clientRepo = require('../repositories/clientRepo.js');
const eventRepo = require('../repositories/eventRepo.js');
const util = require('util');
const request = util.promisify(require('request'));
const emailService = require('./emailService.js');
var chargebee = require("chargebee");
chargebee.configure({site : "freedom-makers-test",
    api_key : process.env.CHARGEBEE_TEST_API})



let updateClient = (customerId, keyValuePairs)=>{
    console.log(`Updating client ${customerId} via chargebee with values:`);
    console.log(keyValuePairs);
    chargebee.customer.update(customerId, keyValuePairs).request(function(error,result) {
        if(error){
            //handle error
            console.log(error);
            emailService.emailAdmin(error);
        }else{
            console.log(`Client ${customerId} updated successfully`)
        }
    });
};

let notifyClientOutOfCredits = email=>{
    emailService.sendEmail(
        {
            to:email,
            subject:"Freedom Makers - Out of credits!",
            html:`<html lang='en'>
                                <head><style></style><title>Freedom Makers Hours</title></head>
                                <body><h1>Freedom Makers</h1>
                                <h4>You're out of credits!</h4>
                                <h5>Please <a href="https://www.freedom-makers-hours.com">log in</a> to pay any overdue fees and refill your credits as needed!</h5>
                                </body></html>`})
};


//TODO: Add validation
/**
 * Service that works with chargebee's customer objects
 *
 */
class ClientService {

    /**
     * Note: no setup for the service is necessary. The ClientService object
     * is to be used as a singleton.
     */
    constructor() {
        this.webhookMap = {
            "subscription_renewed": this.subscriptionRenewed,
            "subscription_created": this.subscriptionCreated,
            "payment_source_added": this.paymentSourceAdded
        }
    };

    /**
     * Sends an email alert to the Freedom Makers admin
     * with details of a customer and paymentSource.
     * To be called on "payment source added" event.
     *
     * @param customerPaymentCombo - object containing a chargebee customer and payment_source
     * @returns {Promise<>}
     */
    async paymentSourceAdded(webhookData){
        let customerPaymentCombo = webhookData.content;
        let customerName = `${customerPaymentCombo.customer.first_name} ${customerPaymentCombo.customer.first_name}`;
        let paymentType = customerPaymentCombo.payment_source.type;
        await emailService.emailFMAdmin("Payment source added!",
            `${customerName} added a new ${paymentType} for payments!`)
            .catch(error => {
                console.log(error);
                emailService.emailAdmin(error);
                return false;
            });
        return "Successfully notified admin";
    }

    /**
     * adds the keyValuePairs to the customer's metadata
     *
     * @param clientId  - client to update
     * @param keyValuePairs - key/value pairs to add
     */
    async updateClientMetadata(clientId, keyValuePairs) {
        console.log(`Updating client ${clientId} metadata with data: `);
        console.log(keyValuePairs);
        let customer = await this.getClientById(clientId).catch(err => {
            emailService.emailAdmin(err);
            console.log(err)
        });
        if (!customer.meta_data) {
            customer.meta_data = {};
        }
        for (var key in keyValuePairs) {
            customer.meta_data[key] = keyValuePairs[key];
        }
        updateClient(clientId, customer)
    }

    async deleteTimeBucket(clientId, planBucket) {
        console.log(`Updating client ${clientId}, deleting time bucket ${planBucket}...`);
        let client = await this.getClientById(clientId).catch(err => {
            emailService.emailAdmin(err);
            console.log(err)
        });
        if (!client.meta_data) {
            console.log("Client had no metadata; creating now...");
            client.meta_data = {};
        }
        if (!client.meta_data[planBucket]) {
            console.log("That bucket never existed!")
        }
        delete client.meta_data[planBucket];
        updateClient(clientId, client);
        return client;
    }

    /**
     * Adds or removes minutes to/from a client's given planBucket.
     *
     * @param clientId  - chargebee id of the client to update
     * @param planBucket- planbucket whose minutes need adjusting
     * @param minuteChange- positive or negative change in minutes
     */
    async updateClientRemainingMinutes(clientId, planBucket, minuteChange) {
        console.log(`Updating client ${clientId} time bucket ${planBucket} with ${minuteChange} minutes...`);
        let client = await this.getClientById(clientId).catch(err => {
            emailService.emailAdmin(err);
            console.log(err)
        });
        if (!client.meta_data) {
            console.log("Client had no metadata; creating now...");
            client.meta_data = {};
        }
        if (!client.meta_data[planBucket]) {
            console.log(`Client plan bucket ${planBucket} did not exist, creating now...`);
            client.meta_data[planBucket] = {};
            client.meta_data[planBucket] = 0;
        }
        let newMinutes = minuteChange + client.meta_data[planBucket];
        let planMinutes = {};
        planMinutes[planBucket] = newMinutes;
        if (newMinutes < 0) {
            notifyClientOutOfCredits(client.email);
        }
        this.updateClientMetadata(clientId, planMinutes);
        return client;
    }

    /**
     * Updates client contact information
     *
     * @param clientId  - id of client to be updated
     * @param newFirstName  - new first name of client
     * @param newLastName   - new last name of client
     * @param newPhone   - new phone number of client
     * @param newEmail  - new email of client
     * @returns {Promise<void>}
     */
    async updateClientContact(clientId, newFirstName, newLastName, newEmail, newPhone) {
        console.log(`Updating client ${clientId} contact info...`);
        let customer = await this.getClientById(clientId).catch(err => {
            emailService.emailAdmin(err);
            console.log(err)
        });
        ;
        customer.first_name = newFirstName;
        customer.last_name = newLastName;
        customer.email = newEmail;
        customer.phone = newPhone;
        updateClient(clientId, customer)
    }

    /**
     * Updates client billing information
     *
     * @param clientId - id of client to be updated
     * @param newFirstName  - new first name for billing
     * @param newLastName   - new last name for billing
     * @param newAddress    - new address for billing
     * @param newCity       - new city for billing
     * @param newState      - new state for billing
     * @param newZip        - new zip for billing
     */
    updateClientBilling(clientId, newFirstName, newLastName, newAddress, newCity, newState, newZip) {
        console.log(`Updating ${clientId} billing info...`);
        chargebee.customer.update_billing_info(clientId, {
            billing_address: {
                first_name: newFirstName,
                last_name: newLastName,
                line1: newAddress,
                city: newCity,
                state: newState,
                zip: newZip,
                country: "US"
            }
        }).request(function (error, result) {
            if (error) {
                console.log(error);
            } else {
                console.log(`Client ${clientId} billing updated successfully`);
            }
        });
    }

    /**
     *
     * Retrieves all clients as Client objects in a list of entries. Note than intermediate
     * object must be accessed to obtain meaningful data.  E.g, to obtaina phone number
     * from the list, use resultList[0].customer.phone
     *
     * @returns {Promise<[entry]>}
     */
    async getAllClients() {
        return await clientRepo.getAllClients().catch(err => {
            emailService.emailAdmin(err);
            console.log(err)
        });
    }

    /**
     * Creates a newly acquired client and logs them to the database. An object
     * reference to the client is returned.
     * @param firstName     - customer first name
     * @param lastName      - customer last name
     * @param customerEmail - customer email
     * @param addressStreet - customer streed address
     * @param customerCity  - customer city
     * @param phoneNumber  - customer phone
     * @param customerStateFull - customer state typed fully
     * @param customerZip   - customer zip code
     * @param billingFirst  - customer billing address
     * @param billingLast   - customer billing address
     * @returns {Promise<chargebee customer object>}
     */
    async createNewClient(firstName, lastName, customerEmail, addressStreet,
                          customerCity, customerStateFull, customerZip, phoneNumber,
                          billingFirst, billingLast) {
        console.log(`Creating new client with last name ${lastName}...`);
        return await clientRepo.createClient(firstName, lastName, customerEmail, addressStreet,
            customerCity, customerStateFull, customerZip, phoneNumber, billingFirst, billingLast).catch(err => {
            emailService.emailAdmin(err);
            console.log(err)
        });
    }

    /**
     * Retrieves a client by their database id.
     * @param id    - client's chargebee id
     * @returns {Promise<chargebee customer object>}
     */
    async getClientById(id) {
        console.log(`Getting data for client ${id}...`);
        let clientData = await clientRepo.getClientById(id).catch(err => {
            emailService.emailAdmin(err);
            console.log(err)
        });
        return clientData;
    }


    /**
     * Retrieves time all time sheets for a given client.
     * @param id    - id of the desired client
     * @returns {Promise<[]>} containing time_sheet objects
     */
    async getSheetsByClient(id) {
        console.log(`Getting timesheets for client ${id}...`);
        let clientSheets = [];
        let response = await request({
            method: 'POST',
            uri: `https://www.freedom-makers-hours.com/api/getAllTimesheets`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });

        let body = response.body;
        let sheets = JSON.parse(body);
        for (var i = 0; i < sheets.length; ++i) {
            if (sheets[i].clientId === id) {
                clientSheets.push(sheets[i]);
            }
        }
        return clientSheets;
    }

    /**
     * Removes a client from the database. TODO: remove from chargebee
     * @param chargebeeId    - Id of client to be removed
     */
    async deleteClientById(chargebeeId) {
        console.log("Deleting client...");
        let subscriptionList = await request({
            method: 'POST',
            uri: `https://www.freedom-makers-hours.com/api/getAllSubscriptions`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });

        for (var i = 0; i < subscriptionList.length; ++i) {
            let entry = subscriptionList[i];
            if (entry.customer.id == chargebeeId) {
                await request({
                    method: 'POST',
                    uri: `https://www.freedom-makers-hours.com/api/cancelSubscription`,
                    form: {
                        'auth': process.env.TWINBEE_MASTER_AUTH,
                        'subscriptionId': entry.subscription.id
                    }
                }).catch(err => {
                    console.log(err);
                    emailService.emailAdmin(err);
                });
            }
        }
        clientRepo.deleteClient(chargebeeId);
        await this.updateClientMetadata(chargebeeId, {"deleted": "true"});
    }

    /**
     * Retrieves all makers associated with a given client given the client's id.
     * "Associated with" is identified as having a timesheet (open or not) linked to
     * the client.
     * @param id    - Id of the client for which to find makers
     * @returns {Promise<[maker objects]>}
     */
    async getMakersForClient(id) {
        console.log(`Getting makers for client ${id}...`);
        let clientMakers = [];
        let response = await request({
            method: 'POST',
            uri: `https://www.freedom-makers-hours.com/api/getAllMakers`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });

        let body = response.body;
        let makers = JSON.parse(body);
        let makersMap = {};
        let foundIds = {};

        for (var i = 0; i < makers.length; ++i) {
            makersMap[makers[i].id] = makers[i];
        }

        let sheets = await this.getSheetsByClient(id).catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });
        for (var i = 0; i < sheets.length; ++i) {
            if (!foundIds[sheets[i].makerId] && makersMap[sheets[i].makerId]) {
                foundIds[sheets[i].makerId] = true;
                clientMakers.push(makersMap[sheets[i].makerId]);
            }
        }
        return clientMakers;
    };

    async getAllTimeBuckets() {
        let clients = await this.getAllClients().catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });
        let timeBuckets = [];
        for (var i = 0; i < clients.length; ++i) {
            let client = clients[i].customer;
            if (client.meta_data) {
                let obj = {};
                obj.first_name = client.first_name;
                obj.last_name = client.last_name;
                obj.id = client.id;
                obj.buckets = client.meta_data;
                timeBuckets.push(obj);
            }
        }
        return timeBuckets;
    }

    async getTimeBucketByClientId(id) {
        let client = await this.getClientById(id).catch(err => {
            console.log(err);
            emailService.emailAdmin(err);
        });
        if (client.meta_data) {
            let obj = {};
            obj.first_name = client.first_name;
            obj.last_name = client.last_name;
            obj.id = client.id;
            obj.buckets = client.meta_data;
            return obj;
        }
    }

    async getUpdatePaymentPage(clientId) {
        console.log(`Getting update payment page for client ${clientId}...`);
        return new Promise((resolve, reject) => {
            chargebee.hosted_page.manage_payment_sources({
                card: {
                    gateway_account_id: process.env.GATEWAY_ACCOUNT_ID
                },
                customer: {
                    id: clientId
                }
            }).request(function (error, result) {
                if (error) {
                    //handle error
                    console.log(error);
                    emailService.emailAdmin(error);
                    reject(error);
                } else {
                    console.log("Successfully retrieved update payment page");
                    var hosted_page = result.hosted_page;
                    resolve(hosted_page);
                }
            });
        });
    }

    async webHookBucketUpdate(parsedBody) {
        let subscription = parsedBody.content.subscription;
        console.log(`subscription is ${subscription}`);
        let customerId = subscription.customer_id;
        let minutes = subscription.plan_quantity * 60;
        let planId = subscription.plan_id;
        if (await eventRepo.createEvent(parsedBody.id)) {
            console.log("New event, updating minutes");
            return await this.updateClientRemainingMinutes(customerId, planId, minutes);
        } else {
            console.log(`Duplicate subscription blocked: ${parsedBody}`);
            return false;
        }
    }


    async subscriptionRenewed(parsedBody) {
        if (parsedBody.event_type === "subscription_renewed") {
            console.log("Subscription renewal request received");
            console.log(this.webHookBucketUpdate);
            return await new ClientService().webHookBucketUpdate(parsedBody);
        }
    }

    async subscriptionCreated(parsedBody) {
        if (parsedBody.event_type === "subscription_created") {
            console.log("Subscription creation request received")
            return await new ClientService().webHookBucketUpdate(parsedBody);
        }
    }

    async getOutstandingPaymentsPage(clientId) {
        console.log(`Getting outstanding payments page for client ${clientId}...`);
        return new Promise((resolve, reject) => {
            chargebee.hosted_page.collect_now({
                customer: {
                    id: clientId
                }
            }).request(function (error, result) {
                if (error) {
                    //handle error
                    console.log(error);
                    emailService.emailAdmin(error);
                    reject(error);
                } else {
                    var hosted_page = result.hosted_page;
                    resolve(hosted_page);
                }
            });
        });
    }

    /**
     * Retrieves the chargebee "Customer" object for a client given their email.
     *
     * @param email - Client's email address
     * @returns {Promise<>} that should resolve to a chargebee "Customer" object. Throws a notifying
     *                      error if none is found.
     */
    async getClientByEmail(email) {
        console.log(`Getting client by email...`);
        return await clientRepo.getClientByEmail(email)
        emailService.emailAdmin(err);
    }

    async getTimeBucket(clientId, planId) {
        console.log(`Getting available credit for ${clientId}'s time bucket`);
        let bucketObj = await this.getTimeBucketByClientId(clientId);
        return {minutes: bucketObj.buckets[planId]};
    }

}

module.exports = new ClientService();