const {query} = require('./repoMaster');
const request = require('request');
var chargebee = require("chargebee");
chargebee.configure({site : "freedom-makers-test",
    api_key : process.env.CHARGEBEE_TEST_API})

class ClientRepository {
    constructor() {
    };

    createClient(firstName, lastName, customerEmail, addressStreet, customerCity, customerStateFull, customerZip, phoneNumber,
                 billingFirst, billingLast) {
        return new Promise((resolve, reject) => {
            chargebee.customer.create({
                first_name : firstName,
                last_name : lastName,
                email : customerEmail,
                billing_address : {
                    first_name : billingFirst,
                    last_name : billingLast,
                    line1 : addressStreet,
                    city : customerCity,
                    state : customerStateFull,
                    zip : customerZip,
                    country : "US",
                    phone: phoneNumber
                }
            }).request(function(error,result) {
                if(error){
                    //TODO handle error... email us?
                    //console.log(error);
                    reject(error);
                }else{
                    var customer = result.customer;
                    var card = result.card;

                    console.log(`Customer ${customer.id} successfully created, adding to DB`);
                    let sql = 'INSERT INTO client(chargebee_id, email) ' +
                        'VALUES (?, ?)';
                    let sqlParams = [customer.id, customerEmail];
                    query(sql, sqlParams, function (err, result) {
                        if (err) {
                            throw err;
                            reject(err);
                        }
                    });
                    console.log("Customer added to DB");
                    resolve(customer);
                }
            });
        })
    }

    updateClient(clientId, firstName, lastName, customerEmail, addressStreet, customerCity, customerStateFull, customerZip, phoneNumber) {
        chargebee.customer.update(clientId,{
            first_name : firstName,
            last_name : lastName,
            phone : phoneNumber
        }).request(function(error,result) {
            if(error){
                //TODO handle error
                console.log(`Failed to update ${clientId}`);
                console.log(error);
            }else{
                var customer = result.customer;
                console.log(`Updated ${customer.id}`);
            }
        });

        chargebee.customer.update_billing_info("16CHLFRxyBHonCsd",{
            billing_address : {
                first_name : firstName,
                last_name : lastName,
                line1 : addressStreet,
                city : customerCity,
                state : customerStateFull,
                zip : customerZip,
                country : "US"
            }
        }).request(function(error,result) {
            if(error){
                //TODO handle error
                console.log(`Failed to update ${clientId} billing info`)
                console.log(error);
            }else{
                var customer = result.customer;
                console.log(`Updated ${customer.id} billing info`)
            }
        });
    }

    deleteClient(chargebeeId) {
        let sql = 'DELETE FROM client WHERE chargebee_id = ?';
        let sqlParams = [chargebeeId];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        });


        chargebee.customer.delete(chargebeeId)
            .request(function(error,result) {
            if(error){
                console.log(`Failed to delete ${chargebeeId}`);
                console.log(error);
            }else{
                console.log(`Deleted ${chargebeeId}. Will update shortly.`);
            }
        });
    }

    getAllClients() {
        return new Promise((resolve, reject)=>{
            chargebee.customer.list({
                "limit": "100"
            }).request(function(error,result) {
                if(error){
                    //handle error, email us?
                    console.log(error);
                    reject(error);
                }else{
                    console.log("All clients retrieved successfully");
                    resolve(result.list);
                }
            })
        });
    }


    getClientByEmail(email) {
        return new Promise((resolve, reject)=> {
            chargebee.customer.list({
                "email[is]": email
            }).request(function (error, result) {
                if (error) {
                    //email us?
                    console.log(error);
                    reject(error);
                } else {
                    var entry = result.list[0];
                    var customer = entry.customer;
                    console.log("Customer retrieved by email successfully");
                    resolve(customer);
                }
            });
        })
    }

    getClientById(id) {
        return new Promise((resolve, reject)=>{
            chargebee.customer.retrieve(id).request(function(error,result) {
                if(error){
                    //email us?
                    console.log(`Could not find customer with id ${id}`);
                    console.log(error);
                    reject(error);
                }else{
                    console.log(`Customer found with id ${id}`);
                    var customer = result.customer;
                    resolve(customer);
                }
            });
        })
    }
}

module.exports = new ClientRepository();