const {query} = require('./repoMaster');
const request = require('request');
var chargebee = require("chargebee");
chargebee.configure({site : "freedom-makers-test",
    api_key : process.env.CHARGEBEE_TEST_API})

class ClientRepository {
    constructor() {
    };

    createClient(firstName, lastName, customerEmail, addressStreet, customerCity, customerStateFull, customerZip, phoneNumber) {
        chargebee.customer.create({
            first_name : firstName,
            last_name : lastName,
            email : customerEmail,
            billing_address : {
                first_name : firstName,
                last_name : lastName,
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
            }else{
                //console.log(result);
                var customer = result.customer;
                var card = result.card;

                let sql = 'INSERT INTO client(chargebee_id, email) ' +
                    'VALUES (?, ?)';
                let sqlParams = [customer.id, customerEmail];
                query(sql, sqlParams, function (err, result) {
                    if (err) throw err;
                })
            }
        });
    }

    updateClient(clientId, firstName, lastName, customerEmail, addressStreet, customerCity, customerStateFull, customerZip, phoneNumber) {
        chargebee.customer.update(clientId,{
            first_name : firstName,
            last_name : lastName,
            phone : phoneNumber
        }).request(function(error,result) {
            if(error){
                //TODO handle error
                //console.log(`Failed to update ${firstName} ${lastName}`)
                //console.log(error);
            }else{
                var customer = result.customer;
                //console.log(`Updated ${customer.first_name} ${customer.last_name}`)
                //console.log(result);
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
                //console.log(`Failed to update ${firstName} ${lastName} billing info`)
                //console.log(error);
            }else{
                var customer = result.customer;
                //console.log(`Updated ${customer.first_name} ${customer.last_name} billing info`)
                //console.log(result);
            }
        });
    }

    deleteClient(chargebeeId) {
        let sql = 'DELETE FROM client WHERE chargebee_id = ?';
        let sqlParams = [chargebeeId];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        })

        chargebee.customer.update(clientId,{
            deleted : true
        }).request(function(error,result) {
            if(error){
                //TODO handle error
                //console.log(`Failed to update ${firstName} ${lastName}`)
                //console.log(error);
            }else{
                var customer = result.customer;
                //console.log(`Updated ${customer.first_name} ${customer.last_name}`)
                //console.log(result);
            }
        });
    }
/*
    decrementHoursClient(id, hoursToSubtract) {
        let sql = 'UPDATE client ' +
            'SET remaining_hours = remaining_hours - ? ' +
            'WHERE client.id = ?';
        let sqlParams = [hoursToSubtract, id];
        query(sql, sqlParams, function (err, result) {
            if (err) throw err;
        })
    }
*/
    getAllClients() {
        return new Promise((resolve, reject)=>{
            chargebee.customer.list({
            }).request(function(error,result) {
                if(error){
                    //handle error, email us?
                    //console.log(error);
                    reject(error);
                }else{
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
                    //console.log(error);
                    reject(error);
                } else {
                    var entry = result.list[0]
                    //console.log(entry);
                    var customer = entry.customer;
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
                    //console.log(`Could not find customer with id ${id}`);
                    //console.log(error);
                    reject(error);
                }else{
                    //console.log(`Customer found with id ${id}`)
                    //console.log(result);
                    var customer = result.customer;
                    resolve(customer);
                }
            });
        })
    }
}

module.exports = new ClientRepository();