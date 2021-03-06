const clientRepo = require('../repositories/clientRepo.js');
const eventRepo = require('../repositories/eventRepo.js');
const util = require('util');
const request = util.promisify(require('request'));
const chargebee = require("chargebee");
const {logCaughtError} = require('../util.js');
chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY
});


let updateClient = (customerId, keyValuePairs) => {
    console.log(`Updating client ${customerId} via chargebee with values:`);
    console.log(keyValuePairs);
    return new Promise((resolve, reject) => {
        chargebee.customer.update(customerId, keyValuePairs).request(async function (error, result) {
            if (error) {
                logCaughtError(error);
                reject(error);
            } else {
                console.log(`Client ${customerId} updated successfully`);
                resolve(await module.exports.getClientById(customerId).catch(err => {
                    logCaughtError(err);
                    reject(err);
                }));
            }
        });
    })
};

let notifyClientOutOfCredits = email => {
    request({
        method: 'POST',
        uri: `${process.env.TWINBEE_URL}/api/notifyClientOutOfCredits`,
        form: {
            'auth': process.env.TWINBEE_MASTER_AUTH,
            'email': email
        }
    }).catch(err => logCaughtError(err));
};

let notifyClientLowCredits = email => {
    request({
        method: 'POST',
        uri: `${process.env.TWINBEE_URL}/api/notifyClientLowCredits`,
        form: {
            'auth': process.env.TWINBEE_MASTER_AUTH,
            'email': email
        }
    }).catch(err => logCaughtError(err));
};


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
     * To be called on "payment source added" webhook event.
     *
     * @returns {Promise<>}
     * @param webhookData   - chargebee webhook data
     */
    async paymentSourceAdded(webhookData) {
        let customerPaymentCombo = webhookData.content;
        let customerName = `${customerPaymentCombo.customer.first_name} ${customerPaymentCombo.customer.last_name}`;
        let paymentType = customerPaymentCombo.payment_source.type;

        request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/notifyFMAdminPaymentSourceAdded`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'customerName': customerName,
                'paymentType': paymentType
            }
        }).catch(err => logCaughtError(err));

        return "Requested admin notification";
    }

    /**
     * adds the keyValuePairs to the customer's metadata
     *
     * @param clientId  - client to update
     * @param keyValuePairs - key/value pairs to add
     */
    async updateClientThreshold(clientId, bucket, thresholdMinutes) {
        console.log(`Updating client ${clientId} threshold for bucket ${bucket} to ${thresholdMinutes} minutes`);
        let customer = await this.getClientById(clientId).catch(e=>logCaughtError(e));
        if (!customer.meta_data) {
            customer.meta_data = {};
        }
        if (!customer.meta_data.buckets) {
            customer.meta_data.buckets = {};
        }
        if (!customer.meta_data.threshold) {
            customer.meta_data.threshold = {};
        }
        customer.meta_data.threshold[bucket] = thresholdMinutes;
        return await updateClient(clientId, customer).catch(e=>logCaughtError(e));
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
        let customer = await this.getClientById(clientId).catch(e=>logCaughtError(e));
        if (!customer.meta_data) {
            customer.meta_data = {};
        }
        if (!customer.meta_data.buckets) {
            customer.meta_data.buckets = {};
        }
        if (!customer.meta_data.threshold) {
            customer.meta_data.threshold = {};
        }
        for (var key in keyValuePairs) {
            customer.meta_data[key] = keyValuePairs[key];
        }
        updateClient(clientId, customer)
    }

    /**
     * adds the keyValuePairs to the customer's buckets
     *
     * @param clientId  - client to update
     * @param keyValuePairs - key/value pairs to add
     */
    async updateClientBuckets(clientId, keyValuePairs) {
        console.log(`Updating client ${clientId} buckets with data: `);
        console.log(keyValuePairs);
        let customer = await this.getClientById(clientId).catch(e=>logCaughtError(e));
        if (!customer.meta_data) {
            customer.meta_data = {};
        }
        if (!customer.meta_data.buckets) {
            customer.meta_data.buckets = {};
        }
        if (!customer.meta_data.threshold) {
            customer.meta_data.threshold = {};
        }
        for (var key in keyValuePairs) {
            customer.meta_data.buckets[key] = keyValuePairs[key];
        }
        updateClient(clientId, customer)
    }

    async deleteTimeBucket(clientId, planBucket) {
        console.log(`Updating client ${clientId}, deleting time bucket ${planBucket}...`);
        let client = await this.getClientById(clientId).catch(e=>logCaughtError(e));
        if (!client.meta_data) {
            console.log("Client had no metadata; creating now...");
            client.meta_data = {};
            client.meta_data.buckets = {};
            client.meta_data.threshold = {};
        }
        if (!client.meta_data.buckets[planBucket]) {
            console.log("That bucket never existed!")
        }
        delete client.meta_data.buckets[planBucket];
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
        let client = await this.getClientById(clientId).catch(e=>logCaughtError(e));
        if (!client.meta_data) {
            console.log("Client had no metadata; creating now...");
            client.meta_data = {buckets:{},threshold:{}};
        }
        if (!client.meta_data.buckets){
            client.meta_data.buckets = {};
        }
        if (!client.meta_data.threshold){
            client.meta_data.threshold = {};
        }
        if (!client.meta_data.buckets[planBucket]) {
            console.log(`Client plan bucket ${planBucket} did not exist, creating now...`);
            client.meta_data.buckets[planBucket] = 0;
        }
        let newMinutes = minuteChange + client.meta_data.buckets[planBucket];
        let planMinutes = {};
        planMinutes[planBucket] = newMinutes;

        if (newMinutes < 0) {
            notifyClientOutOfCredits(client.email);
        }
        else if (newMinutes < (client.meta_data.threshold[planBucket] || 300)){
            notifyClientLowCredits(client.email);
        }

        this.updateClientBuckets(clientId, planMinutes);
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
    async updateMyContact(clientId, newFirstName, newLastName, newPhone, company) {
        console.log(`Updating client ${clientId} contact info...`);
        let customer = await this.getClientById(clientId).catch(e=>logCaughtError(e));
        if (customer) {
            customer.first_name = newFirstName;
            customer.last_name = newLastName;
            customer.phone = newPhone;
            customer.company = company;

            updateClient(clientId, customer);
            request({
                method: 'POST',
                uri: `${process.env.TWINBEE_URL}/api/notifyClientChange`,
                form: {
                    'auth': process.env.TWINBEE_MASTER_AUTH,
                    'clientEmail': clientId
                }
            }).catch(err => logCaughtError(err));
        } else {
            let err = `Error updating client: \n${clientId}\n${newFirstName}\n${newLastName}\n${newPhone}\n${company}`;
            logCaughtError(err);
        }
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
        let customer = await this.getClientById(clientId).catch(e=>logCaughtError(e));
        if (customer) {
            customer.first_name = newFirstName;
            customer.last_name = newLastName;
            customer.email = newEmail;
            customer.phone = newPhone;
            customer.company = company;

            updateClient(clientId, customer);
            clientRepo.updateClient(clientId, newFirstName, newLastName, newEmail, newPhone, company);
            request({
                method: 'POST',
                uri: `${process.env.TWINBEE_URL}/api/notifyClientChange`,
                form: {
                    'auth': process.env.TWINBEE_MASTER_AUTH,
                    'clientEmail': clientId
                }
            }).catch(err => logCaughtError(err));
        } else {
            let err = `Error updating client: \n${clientId}\n${newFirstName}\n${newLastName}\n${newEmail}\n${newPhone}\n${company}`;
            logCaughtError(err);
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
        return await clientRepo.getAllClients().catch(e=>logCaughtError(e));
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
        let client = await clientRepo.createClient(firstName, lastName, customerEmail, phoneNumber, company).catch(e=>logCaughtError(e));

        request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/welcomeClient`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'clientEmail': customerEmail
            }
        }).catch(err => logCaughtError(err));

        return client;
    }

    /**
     * Retrieves a client by their database id.
     * @param id    - client's chargebee id
     * @returns {Promise<chargebee customer object>}
     */
    async getClientById(id) {
        console.log(`Getting data for client ${id}...`);
        let clientData = await clientRepo.getClientById(id).catch(err => logCaughtError(err));
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
        let sheetsResult = request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getTimeSheetsByClientId`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'id': id
            }
        }).catch(err => logCaughtError(err));
        let makerResponse = request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllMakers`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => logCaughtError(err));
        let makerMap = {};

        sheetsResult = await sheetsResult;
        let sheets = JSON.parse(sheetsResult.body);
        makerResponse = await makerResponse;
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
        await this.deleteAllSubscriptions(chargebeeId).catch(err => logCaughtError(err));
        console.log(`Deleting client ${chargebeeId}...`);
        await this.deleteAllRelationships(chargebeeId).catch(err => logCaughtError(err));
        clientRepo.deleteClient(chargebeeId);
        await this.updateClientMetadata(chargebeeId, {"deleted": "true"}).catch(err => logCaughtError(err));
    }

    /**
     * Cancels all subscriptions associated with a client;
     *
     * @param clientId  - client for which to cancel subscriptions
     * @returns {Promise<>}
     */
    async deleteAllSubscriptions(clientId) {
        console.log(`Deleting all subscriptions for ${clientId}`);
        let subscriptionList = await this.getSubscriptionsForClient(clientId).catch(err => logCaughtError(err));
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
                }).catch(err => logCaughtError(err));
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
        }).catch(err => logCaughtError(err));

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
        }).catch(err => logCaughtError(err));

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
        }).catch(err => logCaughtError(err));

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
            }).catch(err => logCaughtError(err));

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
        }).catch(err => logCaughtError(err));

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
        let relationshipList = await this.getRelationshipsForClient(clientId).catch(err => logCaughtError(err));
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
        let makersResponse = request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllMakers`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => logCaughtError(err));
        let relationshipsResponse = request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllRelationships`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => logCaughtError(err));
        let makerMap = {};
        let clientMakers = [];

        makersResponse = await makersResponse;
        let makers = JSON.parse(makersResponse.body);
        relationshipsResponse = await relationshipsResponse;
        let relationships = JSON.parse(relationshipsResponse.body);

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
        console.log("Client's makers retrieved.");
        return clientMakers;
    };

    async getAllTimeBuckets() {
        let clients = await this.getAllClients().catch(err => logCaughtError(err));
        let timeBuckets = [];
        for (var i = 0; i < clients.length; ++i) {
            let client = clients[i].customer;
            if (client.meta_data && client.meta_data.buckets) {
                let obj = {};
                obj.first_name = client.first_name;
                obj.last_name = client.last_name;
                obj.company = client.company;
                obj.id = client.id;
                obj.buckets = client.meta_data.buckets;
                timeBuckets.push(obj);
            }
        }
        return timeBuckets;
    }


    async getTimeBucketsByClientId(id) {
        let client = await this.getClientById(id).catch(err => logCaughtError(err));
        let obj = {};
        obj.first_name = client.first_name;
        obj.last_name = client.last_name;
        obj.id = client.id;

        if (client.meta_data && client.meta_data.buckets) {
            obj.buckets = client.meta_data.buckets;
            obj.threshold = client.meta_data.threshold;
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
                    logCaughtError(error);
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
            logCaughtError(error);
            return error
        })) {
            console.log("New event, updating minutes");
            return this.updateClientRemainingMinutes(customerId, planId, minutes);
        } else {
            console.log(`Duplicate subscription blocked: ${parsedBody}`);
            return false;
        }
    }

    async chargeMeNow(planId, numHours, customerId) {
        console.log(`Attempting to charge ${customerId} for ${numHours} ${planId} hours...`);
        let success = true;
        let client = this.getClientById(customerId);
        let result = request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/creditNow`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'planId': planId,
                'numHours': numHours,
                'customerId': customerId
            }
        }).catch(err => {
            logCaughtError(err);
            success = false;
        });

        result = await result;
        client = await client;

        request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/notifyAdminClientUpdate`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'planId': planId,
                'numHours': numHours,
                'clientName': `${client.first_name} ${client.last_name}`
            }
        }).catch(err => logCaughtError(err));

        return success;
    }

    async subscriptionRenewed(parsedBody) {
        if (parsedBody.event_type === "subscription_renewed") {
            console.log("Subscription renewal request received");
            return await new ClientService().webHookBucketUpdate(parsedBody).catch(err => logCaughtError(err));
        }
    }

    async subscriptionCreated(parsedBody) {
        if (parsedBody.event_type === "subscription_created") {
            console.log("Subscription creation request received");
            return await new ClientService().webHookBucketUpdate(parsedBody).catch(err => logCaughtError(err));
        }
    }

    async doIHaveInvoices(clientId) {
        let result = await request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/doesCustomerHaveInvoices`,
            form: {
                'clientId': clientId,
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => logCaughtError(err));

        let body = JSON.parse(result.body);
        return {invoicesPresent: body.invoicesPresent, numInvoices: body.numInvoices};
    }

    async getAllMyRelationships(clientId) {
        let relationships = this.getRelationshipsForClient(clientId).catch(err => logCaughtError(err));
        let result =  request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/getAllMakers`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH
            }
        }).catch(err => logCaughtError(err));
        let makerMap = {};

        result = await result;
        let makers = JSON.parse(result.body);

        for (var maker of makers) {
            makerMap[maker.id] = maker;
        }

        relationships = await relationships;
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
                    logCaughtError(error);
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
        let client = await clientRepo.getClientByEmail(email).catch(err => logCaughtError(err));
        console.log(`Client was ${client.id}`);
        return client;
    }

    async getTimeBucket(clientId, planId) {
        console.log(`Getting available credit for ${clientId}'s time bucket`);
        let bucketObj = this.getTimeBucketsByClientId(clientId).catch(err => logCaughtError(err));
        let response = request({
            method: 'POST',
            uri: `${process.env.TWINBEE_URL}/api/retrieveBucketRate`,
            form: {
                'auth': process.env.TWINBEE_MASTER_AUTH,
                'clientId': clientId,
                'planId':planId
            }
        }).catch(err => logCaughtError(err));

        response = await response;
        bucketObj = await bucketObj;
        if (!bucketObj.buckets) {
            bucketObj.buckets = {};
        }
        if (!bucketObj.threshold) {
            bucketObj.threshold = {};
        }
        let {price} = JSON.parse(response.body);
        return {minutes: (bucketObj.buckets[planId] || 0), threshold: (bucketObj.threshold[planId] || 0), price: price};
    }
}

module.exports = new ClientService();