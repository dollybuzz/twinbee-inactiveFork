const clientRepo = require('../repositories/clientRepo.js');
const eventRepo = require('../repositories/eventRepo.js');
const util = require('util');
const request = util.promisify(require('request'));
const emailService = require('./notificationService.js');
const chargebee = require("chargebee");
chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY
});


let updateClient = (customerId, keyValuePairs) => {
    console.log(`Updating client ${customerId} via chargebee with values:`);
    console.log(keyValuePairs);
    chargebee.customer.update(customerId, keyValuePairs).request(function (error, result) {
        if (error) {
            console.log(error);
            emailService.notifyAdmin(error.toString());
        } else {
            console.log(`Client ${customerId} updated successfully`)
        }
    });
};

let notifyClientOutOfCredits = email => {
    emailService.sendEmail(
        {
            to: email,
            subject: "Freedom Makers - Out of credits!",
            html: `<html lang='en'>
                                <head><style></style><title>Freedom Makers Hours</title></head>
                                <body><h1>Freedom Makers</h1>
                                <h4>You're out of credits!</h4>
                                <h5>Please <a href="https://www.freedom-makers-hours.com">log in</a> to pay any overdue fees and refill your credits as needed!</h5>
                                </body></html>`
        })
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
    async paymentSourceAdded(webhookData) {
        let customerPaymentCombo = webhookData.content;
        let customerName = `${customerPaymentCombo.customer.first_name} ${customerPaymentCombo.customer.last_name}`;
        let paymentType = customerPaymentCombo.payment_source.type;
        await emailService.emailFMAdmin("Payment source added!",
            `${customerName} added a new ${paymentType} for payments!`)
            .catch(error => {
                console.log(error);
                emailService.notifyAdmin(error.toString());
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
            emailService.notifyAdmin(err.toString());
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
            emailService.notifyAdmin(err.toString());
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
            emailService.notifyAdmin(err.toString());
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
     * @param company   - new client company name
     * @returns {Promise<void>}
     */
    async updateClientContact(clientId, newFirstName, newLastName, newEmail, newPhone, company) {
        console.log(`Updating client ${clientId} contact info...`);
        let customer = await this.getClientById(clientId).catch(err => {
            emailService.notifyAdmin(err.toString());
            console.log(err)
        });
        if (customer) {
            customer.first_name = newFirstName;
            customer.last_name = newLastName;
            customer.email = newEmail;
            customer.phone = newPhone;
            customer.company = company;
            updateClient(clientId, customer);
            clientRepo.updateClient(clientId, newFirstName, newLastName, newEmail, newPhone, company);
        }
        else{
            let err = `Error updating client: \n${clientId}\n${newFirstName}\n${newLastName}\n${newEmail}\n${newPhone}\n${company}`;
            console.log(err);
            emailService.notifyAdmin(err);
        }
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
            emailService.notifyAdmin(err.toString());
            console.log(err)
        });
    }

    /**
     * Creates a newly acquired client and logs them to the database. An object
     * reference to the client is returned.
     * @param firstName     - customer first name
     * @param lastName      - customer last name
     * @param customerEmail - customer email
     * @param phoneNumber  - customer phone
     * @param company       - client's company name
     * @returns {Promise<chargebee customer object>}
     */
    async createNewClient(firstName, lastName, customerEmail, phoneNumber, company) {
        console.log(`Creating new client with last name ${lastName}...`);
        return await clientRepo.createClient(firstName, lastName, customerEmail, phoneNumber, company).catch(err => {
            emailService.notifyAdmin(err.toString());
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
            emailService.notifyAdmin(err.toString());
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
            uri: `${process.env.TWINBEE_URL}/api/getTimeSheetsByClientId`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'id': id
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        let body = response.body;
        let sheets = JSON.parse(body);

        let makerResponse = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllMakers`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        let makerMap = {};
        let makers = JSON.parse(makerResponse.body);
        for (var maker of makers) {
            makerMap[maker.id] = maker;
        }

        for (var sheet of sheets) {
            if (sheet.clientId === id) {
                let maker = makerMap[sheet.makerId];
                sheet.makerName = maker.firstName + " " + maker.lastName;
                clientSheets.push(sheet);
            }
        }
        return clientSheets;
    }

    /**
     * Removes a client from the database.
     * @param chargebeeId    - Id of client to be removed
     */
    async deleteClientById(chargebeeId) {
        console.log(`Deleting client ${chargebeeId}...`);
        await this.deleteAllSubscriptions(chargebeeId)
            .catch(error => {
                console.log(error);
                emailService.notifyAdmin(error.toString());
            });
        console.log(`Deleting client ${chargebeeId}...`);
        await this.deleteAllRelationships(chargebeeId)
            .catch(error => {
                console.log(error);
                emailService.notifyAdmin(error.toString());
            });
        clientRepo.deleteClient(chargebeeId);
        await this.updateClientMetadata(chargebeeId, {"deleted": "true"});
    }

    /**
     * Cancels all subscriptions associated with a client;
     *
     * @param clientId  - client for which to cancel subscriptions
     * @returns {Promise<>}
     */
    async deleteAllSubscriptions(clientId) {
        console.log(`Deleting all subscriptions for ${clientId}`);
        let subscriptionList = await this.getSubscriptionsForClient(clientId);
        for (var i = 0; i < subscriptionList.length; ++i) {
            let entry = subscriptionList[i];
            if (entry.customer.id === clientId) {
                await request({
                    method: 'POST',
                    uri: `${process.env.TWINBEE_URL}/api/cancelSubscription`,
                    form: {
                        'auth': process.env.TWINBEE_MASTER_AUTH,
                        'subscriptionId': entry.subscription.id
                    }
                }).catch(err => {
                    console.log(err);
                    emailService.notifyAdmin(err.toString());
                });
            }
        }
    }

    /**
     * Retrieves all subscriptions for a client
     * @param clientId  -   client for which to retrieve subscriptions for
     * @returns {Promise<[subscription]>}
     */
    async getSubscriptionsForClient(clientId) {
        console.log(`Getting all subscriptions for ${clientId}`);
        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllSubscriptions`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        let subscriptions = JSON.parse(result.body);
        let list = [];
        for (var entry of subscriptions) {
            if (entry.subscription.customer_id === clientId) {
                list.push(entry);
            }
        }

        return list;
    }

    /**
     * Retrieves a suscription if the given clientId matches the subscription's subscriber,
     * otherwise false.
     *
     * @param clientId  - requesting client for verification
     * @param subscriptionId    - requested subscription
     * @returns {Promise<boolean|any>}
     */
    async getMySubscription(clientId, subscriptionId) {
        console.log(`Getting subscription ${subscriptionId} for client ${clientId}`);
        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/retrieveSubscription`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                "subscriptionId": subscriptionId
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        let subscription = JSON.parse(result.body);

        if (subscription && subscription.customer_id !== clientId) {
            console.log("Requester did not match subscriber");
            return false;
        }
        return subscription;
    }

    /**
     * Retrieves changes to the given subscription for the given customer.
     * Also ensures that the clientId is present in the subscription with id subscriptionId
     *
     * @param clientId  - client that wants to check subscription details
     * @param subscriptionId - subscription to be checked
     * @returns {Promise<boolean>}
     */
    async getMySubscriptionChanges(clientId, subscriptionId) {
        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/retrieveSubscriptionChanges`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'subscriptionId': subscriptionId
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        let subscription = JSON.parse(result.body);
        return subscription.customer_id === clientId ? subscription : false;
    }

    /**
     * Reverts changes to the subscription indicated if the client passed is
     * present on the subscription with id subscriptionId
     *
     * @param clientId  - ClientId that must be present on the subscription with id subscriptionId
     * @param subscriptionId    - subscription to revert
     * @returns {Promise<boolean|any>}
     */
    async undoMySubscriptionChanges(clientId, subscriptionId) {
        if (this.getMySubscriptionChanges(clientId, subscriptionId)) {
            let result = await request({
                method: 'POST',
                uri: `${process.env.TWINBEE_URL}/api/undoSubscriptionChanges`,
                form: {
                    'auth': process.env.TWINBEE_MASTER_AUTH,
                    'subscriptionId': subscriptionId
                }
            }).catch(err => {
                console.log(err);
                emailService.notifyAdmin(err.toString());
            });
            return result.body && result.body.length > 0;
        } else {
            return false;
        }
    }

    /**
     * Retrieves all relationships for a client
     * @param clientId  -   client whose relationships are to be retrieved
     * @returns {Promise<[Relationship]>}
     */
    async getRelationshipsForClient(clientId) {
        console.log(`Checking for relationships related to ${clientId}...`);
        let relationshipList = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllRelationships`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        relationshipList = JSON.parse(relationshipList.body);
        let finalList = [];
        for (var relationship of relationshipList) {
            if (relationship.clientId === clientId) {
                finalList.push(relationship);
            }
        }
        return finalList;
    }

    /**
     * Deletes all relationships associated with a client
     *
     * @param clientId  - client whose relationships are to be deleted
     * @returns {Promise<void>}
     */
    async deleteAllRelationships(clientId) {
        console.log(`Attempting to delete relationships for ${clientId}`);
        let relationshipList = await this.getRelationshipsForClient(clientId);
        for await (var relationship of relationshipList) {
            if (relationship.clientId === clientId) {
                console.log("Relationship found.");
                request({
                    method: 'POST',
                    uri: `${process.env.TWINBEE_URL}/api/deleteRelationship`,
                    form: {
                        'auth': process.env.TWINBEE_MASTER_AUTH,
                        'id': relationship.id
                    }
                });
            }
        }
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
        let response = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllMakers`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        let makers = JSON.parse(response.body);

        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllRelationships`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        let relationships = JSON.parse(result.body);
        let makerMap = {};
        let clientMakers = [];

        for (var i = 0; i < makers.length; ++i) {
            makerMap[makers[i].id] = makers[i];
        }

        for (var i = 0; i < relationships.length; ++i) {
            let makerOfRelationship = relationships[i].makerId;
            if (makerMap[makerOfRelationship] && relationships[i].clientId == id) {
                let maker = makerMap[makerOfRelationship];
                let occupation = relationships[i].occupation;
                clientMakers.push({maker: maker, occupation: occupation});
            }
        }
        console.log('List retrieved: ');
        console.log(clientMakers);
        return clientMakers;
    };

    async getAllTimeBuckets() {
        let clients = await this.getAllClients().catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        let timeBuckets = [];
        for (var i = 0; i < clients.length; ++i) {
            let client = clients[i].customer;
            if (client.meta_data) {
                let obj = {};
                obj.first_name = client.first_name;
                obj.last_name = client.last_name;
                obj.company = client.company;
                obj.id = client.id;
                obj.buckets = client.meta_data;
                timeBuckets.push(obj);
            }
        }
        return timeBuckets;
    }


    async getTimeBucketsByClientId(id) {
        let client = await this.getClientById(id).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        let obj = {};
        obj.first_name = client.first_name;
        obj.last_name = client.last_name;
        obj.id = client.id;

        if (client.meta_data) {
            obj.buckets = client.meta_data;
        } else {
            obj.buckets = {};
        }
        return obj;
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
                    emailService.notifyAdmin(error.toString());
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
        if (await eventRepo.createEvent(parsedBody.id).catch(error => {
            console.log(error);
            emailService.notifyAdmin(error.toString());
            return error
        })) {
            console.log("New event, updating minutes");
            return await this.updateClientRemainingMinutes(customerId, planId, minutes);
        } else {
            console.log(`Duplicate subscription blocked: ${parsedBody}`);
            return false;
        }
    }

    async chargeMeNow(planId, numHours, customerId) {
        console.log(`Attempting to charge ${customerId} for ${numHours} ${planId} hours...`);
        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/creditNow`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'planId': planId,
                'numHours': numHours,
                'customerId': customerId
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
            return false;
        });

        let client = await this.getClientById(customerId);
        emailService.emailFMAdmin("Hours added!",
            `${client.first_name} ${client.last_name} has manually added ${numHours} for time bucket ${planId}`);
        return true;
    }

    async subscriptionRenewed(parsedBody) {
        if (parsedBody.event_type === "subscription_renewed") {
            console.log("Subscription renewal request received");
            return await new ClientService().webHookBucketUpdate(parsedBody).catch(err=>{
                console.log(err);
                emailService.notifyAdmin(err.toString());
            });
        }
    }

    async subscriptionCreated(parsedBody) {
        if (parsedBody.event_type === "subscription_created") {
            console.log("Subscription creation request received");
            return await new ClientService().webHookBucketUpdate(parsedBody).catch(err=>{
                console.log(err);
                emailService.notifyAdmin(err.toString());
            });
        }
    }

    async doIHaveInvoices(clientId){
        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/doesCustomerHaveInvoices`,
            form: {
                'clientId': clientId,
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        let body = JSON.parse(result.body);
        return body.invoicesPresent;
    }

    async getAllMyRelationships(clientId) {
        let relationships = await this.getRelationshipsForClient(clientId).catch(err=>{
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllMakers`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => {
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });

        let makerMap = {};
        let makers = JSON.parse(result.body);
        for (var maker of makers) {
            makerMap[maker.id] = maker;
        }

        for (var relationship of relationships) {
            let maker = makerMap[relationship.makerId];
            relationship.makerName = maker.firstName + " " + maker.lastName;
            relationship.makerEmail = maker.email;
        }
        return relationships;
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
                    console.log(error);
                    emailService.notifyAdmin(error.toString());
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
        let client = await clientRepo.getClientByEmail(email).catch(err=>{
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        console.log(`Client was ${client.id}`);
        return client;
    }

    async getTimeBucket(clientId, planId) {
        console.log(`Getting available credit for ${clientId}'s time bucket`);
        let bucketObj = await this.getTimeBucketsByClientId(clientId).catch(err=>{
            console.log(err);
            emailService.notifyAdmin(err.toString());
        });
        return {minutes: bucketObj.buckets[planId]};
    }

}

module.exports = new ClientService();