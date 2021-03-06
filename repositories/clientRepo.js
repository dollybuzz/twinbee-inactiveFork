const repoMaster = require('./repoMaster.js');
const {logCaughtError} = require('../util.js');
var chargebee = require("chargebee");
chargebee.configure({site : process.env.CHARGEBEE_SITE,
    api_key : process.env.CHARGEBEE_API_KEY});

class ClientRepository {
    constructor() {
    };

    createClient(firstName, lastName, customerEmail, phoneNumber, company) {
        return new Promise((resolve, reject) => {
            chargebee.customer.create({
                first_name : firstName,
                last_name : lastName,
                company: company,
                email : customerEmail,
                phone: phoneNumber,
            }).request(function(error,result) {
                if(error){
                    logCaughtError(error);
                    reject(error);
                }else{
                    var customer = result.customer;

                    console.log(`Customer ${customer.id} successfully created, adding to DB`);
                    let sql = 'INSERT INTO client(chargebee_id, email) ' +
                        'VALUES (?, ?)';
                    let sqlParams = [customer.id, customerEmail];
                    repoMaster.query(sql, sqlParams, function (err, result) {
                        if (err) {
                            logCaughtError(err);
                            reject(err);
                        }
                    });
                    console.log("Customer added to DB");
                    resolve(customer);
                }
            });
        })
    }

    updateClient(clientId, firstName, lastName, customerEmail, phoneNumber, company) {
        return new Promise((resolve, reject) => {
            chargebee.customer.update(clientId,{
                first_name : firstName,
                last_name : lastName,
                phone : phoneNumber,
                company: company
            }).request(function(error,result) {
                if(error){
                    logCaughtError(error);
                    console.log(`Failed to update ${clientId}`);
                }else{
                    var customer = result.customer;

                    let sql = 'UPDATE client SET email = ? WHERE chargebee_id = ?';
                    let sqlParams = [customerEmail, customer.id];
                    repoMaster.query(sql, sqlParams, function (err, result) {
                        if (err) {
                            logCaughtError(err);
                            reject(err);
                        }
                        console.log(`Updated ${customer.id}`);
                        resolve(customer);
                    });
                }
            });
        })
    }

    deleteClient(chargebeeId) {
        let sql = 'DELETE FROM client WHERE chargebee_id = ?';
        let sqlParams = [chargebeeId];
        repoMaster.query(sql, sqlParams, function (err, result) {
            if (err) {
                logCaughtError(err);
            }
        });


        chargebee.customer.delete(chargebeeId)
            .request(function(error,result) {
            if(error){
                console.log(`Failed to delete ${chargebeeId}`);
                logCaughtError(error);
            }else{
                console.log(`Deleted ${chargebeeId}. Will update shortly.`);
            }
        });
    }

    async getAllClients() {
        let listObject = await chargebee.customer.list({
            "limit": "100"
        }).request().catch(error => {
            logCaughtError(error);
        });
        let list = listObject.list;
        while (listObject.next_offset) {
            listObject = await chargebee.customer.list({
                limit: 100,
                offset: listObject.next_offset
            }).request().catch(error => logCaughtError(error));
            for (var item of listObject.list) {
                list.push(item);
            }
        }
        return list;
    }

    getClientByEmail(email) {
        return new Promise((resolve, reject)=> {
            chargebee.customer.list({
                "email[is]": email
            }).request(function (error, result) {
                if (error) {
                    logCaughtError(error);
                    reject(error);
                } else {
                        var entry = result.list[0];
                        var customer = null;
                        if (result.list.length){
                            customer = entry.customer || null;
                            console.log("getClientByEmail found no client with that email.")
                        }else {
                            console.log("Customer retrieved by email successfully");
                        }
                        resolve(customer);
                }
            });
        })
    }

    getClientById(id) {
        return new Promise((resolve, reject)=>{
            chargebee.customer.retrieve(id).request(function(error,result) {
                if(error){
                    logCaughtError(error);
                    console.log(`Could not find customer with id ${id}`);
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