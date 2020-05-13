# Twinbee

A combination time-tracking and billing tool for use by [Freedom Makers](https://pages.github.com/) (head over to their site to see how Laura and her team are serving our veterans and veteran spouses!). Although this was built with a browser in mind, it has been structured such that future migrations should be as simple as using the exposed API and microservices. Inclined Freedom Makers: Dive in!

## Browser Navigation

Basic navigation within the browser is made simple with Google's log-in API. Administrators, Clients, and Freedom Makers are automatically redirected to their respective portals upon log-in. 


## Supported Functionality (in progress!)

- Freedom Makers
  - Clock in/out
  - View previous timesheets
  - Manage contact information
  
- Clients
  - View time logged
  - View remaining purchased credits
  - Purchase new credits
  - Modify/Cancel subscription(s)
  - Manage contact information
  
- Admin
  - Create, Retrieve, Update, and Delete all aspects of  Clients and Freedom Makers
  - Modify plans as needed
  - Correct time-sheet information
  - Apply credits
  - Pull time-sheets
  
  

## REST API

###### Chargebee General Actions

**Get/Grab/load/retrieve all plans**

Endpoint: '/api/getAllPlans'
     * Retrieves all plans from the current chargebee environment as chargebee entries.
      Note that in order to access meaningful data, an intermediate object is
      accessed.  E.g, to access "pricing_model", given that "returnedValue" is the
      result of this funciton, use:
       returnedValue[0].plan.pricing_model
       returns data as follows:
       [
           {
               "plan":{}
           },
           {
               "plan":{}
           }
       ]
     
       Looks for data in the body in the form:
       {
          "auth": authentication token
       }*

Sample response:
```
[
    {
        "plan": {
            "id": "cbdemo_free",
            "name": "Free",
            "invoice_name": "Plan-Free",
            "description": "This is a freemium plan and hence doesn't have a trial period.",
            "price": 0,
            "period": 1,
            "period_unit": "month",
            "pricing_model": "flat_fee",
            "free_quantity": 0,
            "status": "archived",
            "archived_at": 1569439677,
            "enabled_in_hosted_pages": true,
            "enabled_in_portal": true,
            "addon_applicability": "all",
            "is_shippable": false,
            "updated_at": 1569439677,
            "giftable": false,
            "resource_version": 1569439677593,
            "object": "plan",
            "charge_model": "flat_fee",
            "taxable": false,
            "currency_code": "USD"
        }
    },
    {
        "plan": {
            "id": "twinbee-new-plan",
            "name": "twinbee updated plan",
            "invoice_name": "twinbee updated invoice name",
            "description": "test description",
            "price": 32,
            "period": 1,
            "period_unit": "month",
            "pricing_model": "per_unit",
            "free_quantity": 0,
            "status": "active",
            "enabled_in_hosted_pages": true,
            "enabled_in_portal": true,
            "addon_applicability": "all",
            "is_shippable": false,
            "updated_at": 1588622579,
            "giftable": false,
            "resource_version": 1588622579066,
            "object": "plan",
            "charge_model": "per_unit",
            "taxable": true,
            "currency_code": "USD"
        }
    },
    {
        "plan": {
            "id": "freedom-makers-32",
            "name": "Freedom Makers 32",
            "description": "$32/hour plan",
            "price": 3200,
            "period": 1,
            "period_unit": "month",
            "pricing_model": "per_unit",
            "free_quantity": 0,
            "status": "active",
            "enabled_in_hosted_pages": false,
            "enabled_in_portal": true,
            "addon_applicability": "all",
            "is_shippable": false,
            "updated_at": 1588443505,
            "giftable": false,
            "resource_version": 1588443505147,
            "object": "plan",
            "charge_model": "per_unit",
            "taxable": true,
            "currency_code": "USD"
        }
    }
]
```

**Create a plan**

Endpoint: '/api/createPlan'
     * Creates a new plan in the current chargebee environment. looks for values in the body as follows:
      {
          "planName": name of plan,
          "invoiceName": name as it should appear on an invoice,
          "pricePerHour": integer price per hour in cents,
          "planDescription": general description of plan,
          "auth": authentication credentials; either master or token
      }*

Note that no data is returned to the user.

**Get/Grab/load/retrieve an existing plan**

Endpoint: '/api/retrievePlan'
     * Retrieves a chargebee plan object by chargebee plan id. Looks for values
      in the body as follows:
      {
          "planId": chargebee plan id,
          "auth": authentication credentials; either master or token
      }
     *
sample request body:
```
{
  "planId": "freedom-makers-32",      
  "auth": "myValidAuth"               
}
```

sample response:
```
{
    "plan": {
        "id": "freedom-makers-32",
        "name": "Freedom Makers 32",
        "description": "$32/hour plan",
        "price": 3200,
        "period": 1,
        "period_unit": "month",
        "pricing_model": "per_unit",
        "free_quantity": 0,
        "status": "active",
        "enabled_in_hosted_pages": false,
        "enabled_in_portal": true,
        "addon_applicability": "all",
        "is_shippable": false,
        "updated_at": 1588443505,
        "giftable": false,
        "resource_version": 1588443505147,
        "object": "plan",
        "charge_model": "per_unit",
        "taxable": true,
        "currency_code": "USD"
    }
}
```


**Update/Modify an existing plan**

Endpoint: '/api/updatePlan'
     * Updates a plan with new values. Note that the plan id is
      NOT updated on changing the plan's name. Looks for values in the body as follows;
      {
           "planId": existing chargebee plan id,
           "newName": new desired name for plan,
           "planInvoiceName": new desired name as it should appear on an invoice,
           "planPrice": overridden plan price in cents as integer,
          "auth": authentication credentials; either master or token
     
      }*

Note that no data is returned to the user.



**Delete a plan**

Endpoint: '/api/deletePlan'
     * Deletes a plan by chargebee plan id. Looks for values in the body as follows:
      {
          "planId": chargebee plan id,
          "auth": authentication credentials; either master or token
      }*

Note that no data is returned to the user.


**Get/Grab/load/retrieve all Subscriptions (Customer/Plan relationships)**

Endpoint: '/api/getAllSubscriptions'
     * ENDPOINT: /api/getAllSubscriptions
      Retrieves all subscriptions.
      Returns values as follows:
      [
           {
               "customer": {
                   ...
               },
               "subscription": {
                   ...
               },
               "card": {
                   ...
               }
           },...
      ]
      Looks for data in the body as follows
      {
          "auth": authentication credentials; either master or token
      }*

Sample response:
```
[
    {
        "subscription": {
            "id": "16CHQwRyLNawdnho",
            "customer_id": "Azqgt1Rxr8bmkN6b",
            "plan_id": "freedom-makers-42",
            "plan_quantity": 6,
            "plan_unit_price": 4200,
            "plan_amount": 25200,
            "billing_period": 1,
            "billing_period_unit": "month",
            "plan_free_quantity": 0,
            "status": "non_renewing",
            "current_term_start": 1586934000,
            "current_term_end": 1589526000,
            "remaining_billing_cycles": 0,
            "created_at": 1588890257,
            "started_at": 1586934000,
            "activated_at": 1586934000,
            "cancelled_at": 1589526000,
            "updated_at": 1588890264,
            "has_scheduled_changes": false,
            "resource_version": 1588890264945,
            "deleted": false,
            "object": "subscription",
            "currency_code": "USD",
            "due_invoices_count": 0,
            "mrr": 25200,
            "exchange_rate": 1,
            "base_currency_code": "USD"
        },
        "customer": {
            "id": "Azqgt1Rxr8bmkN6b",
            "first_name": "clientFirst3",
            "last_name": "clientLast3",
            "email": "client3@twinbee.com",
            "phone": "12345678912",
            "company": "clientCompany3",
            "auto_collection": "on",
            "net_term_days": 0,
            "allow_direct_debit": false,
            "created_at": 1588443395,
            "taxability": "taxable",
            "updated_at": 1588890257,
            "pii_cleared": "active",
            "resource_version": 1588890257374,
            "deleted": false,
            "object": "customer",
            "card_status": "no_card",
            "balances": [
                {
                    "promotional_credits": 0,
                    "excess_payments": 0,
                    "refundable_credits": 0,
                    "unbilled_charges": 25200,
                    "object": "customer_balance",
                    "currency_code": "USD",
                    "balance_currency_code": "USD"
                }
            ],
            "promotional_credits": 0,
            "refundable_credits": 0,
            "excess_payments": 0,
            "unbilled_charges": 25200,
            "preferred_currency_code": "USD"
        }
    },
    {
        "subscription": {
            "id": "AzqgmpRy3ZS5Nuv2",
            "customer_id": "Azqgt1Rxr8bmkN6b",
            "plan_id": "twinbee-new-plan",
            "plan_quantity": 6,
            "plan_unit_price": 32,
            "plan_amount": 192,
            "billing_period": 1,
            "billing_period_unit": "month",
            "plan_free_quantity": 0,
            "status": "active",
            "current_term_start": 1588627109,
            "current_term_end": 1591305509,
            "next_billing_at": 1591305509,
            "created_at": 1588627109,
            "started_at": 1588627109,
            "activated_at": 1588627109,
            "updated_at": 1588646751,
            "has_scheduled_changes": true,
            "auto_collection": "off",
            "resource_version": 1588646751268,
            "deleted": false,
            "object": "subscription",
            "currency_code": "USD",
            "due_invoices_count": 1,
            "due_since": 1588627109,
            "total_dues": 192,
            "mrr": 192,
            "exchange_rate": 1,
            "base_currency_code": "USD"
        },
        "customer": {
            "id": "Azqgt1Rxr8bmkN6b",
            "first_name": "clientFirst3",
            "last_name": "clientLast3",
            "email": "client3@twinbee.com",
            "phone": "12345678912",
            "company": "clientCompany3",
            "auto_collection": "on",
            "net_term_days": 0,
            "allow_direct_debit": false,
            "created_at": 1588443395,
            "taxability": "taxable",
            "updated_at": 1588890257,
            "pii_cleared": "active",
            "resource_version": 1588890257374,
            "deleted": false,
            "object": "customer",
            "card_status": "no_card",
            "balances": [
                {
                    "promotional_credits": 0,
                    "excess_payments": 0,
                    "refundable_credits": 0,
                    "unbilled_charges": 25200,
                    "object": "customer_balance",
                    "currency_code": "USD",
                    "balance_currency_code": "USD"
                }
            ],
            "promotional_credits": 0,
            "refundable_credits": 0,
            "excess_payments": 0,
            "unbilled_charges": 25200,
            "preferred_currency_code": "USD"
        }
    },
    {
        "subscription": {
            "id": "169yOXRy3SPY9s7n",
            "customer_id": "169yOXRy3SPY9s7n",
            "plan_id": "twinbee-new-plan",
            "plan_quantity": 1,
            "plan_unit_price": 32,
            "plan_amount": 32,
            "billing_period": 1,
            "billing_period_unit": "month",
            "plan_free_quantity": 0,
            "status": "non_renewing",
            "current_term_start": 1588625431,
            "current_term_end": 1591303831,
            "remaining_billing_cycles": 0,
            "created_at": 1588625431,
            "started_at": 1588625431,
            "activated_at": 1588625431,
            "cancelled_at": 1591303831,
            "updated_at": 1588630309,
            "has_scheduled_changes": false,
            "auto_collection": "off",
            "resource_version": 1588630309055,
            "deleted": false,
            "object": "subscription",
            "currency_code": "USD",
            "due_invoices_count": 1,
            "due_since": 1588625431,
            "total_dues": 32,
            "mrr": 32,
            "exchange_rate": 1,
            "base_currency_code": "USD"
        },
        "customer": {
            "id": "169yOXRy3SPY9s7n",
            "first_name": "firstname4",
            "last_name": "lastname4",
            "email": "client4@twinbee.com",
            "auto_collection": "on",
            "net_term_days": 0,
            "allow_direct_debit": false,
            "created_at": 1588625431,
            "taxability": "taxable",
            "updated_at": 1588625431,
            "pii_cleared": "active",
            "resource_version": 1588625431110,
            "deleted": false,
            "object": "customer",
            "billing_address": {
                "first_name": "firstname4",
                "last_name": "lastname4",
                "line1": "1 test st",
                "city": "testCity",
                "state": "testState",
                "country": "US",
                "zip": "11111",
                "validation_status": "not_validated",
                "object": "billing_address"
            },
            "card_status": "no_card",
            "promotional_credits": 0,
            "refundable_credits": 0,
            "excess_payments": 0,
            "unbilled_charges": 0,
            "preferred_currency_code": "USD"
        }
    }
]
```


**Create a Subscription**

Endpoint: '/api/createSubscription'
     * Creates a new subscription for an existing customer.
      Note that auto_collection is ALWAYS off. Looks for values in the body as follows:
      {
          "planId": id of the plan to subscribe to,
          "customerId": id of the subscribing customer,
          "planQuantity": initial number of hours to subscribe to,
          "auth": authentication credentials; either master or token
      }*

The newly created subscription is returned in the response.
Sample request body:
```
{
    "customerId": "169yFgRypfdqVmo",
    "planId": "freedom-makers-32",
    "planQuantity": "10",
    "auth": "myValidAuth"
    
}:
```

SampleResponse:
```
{
    "id": "169yKpRytp3VPQ7Q",
    "customer_id": "169yFgRypfdqVmo",
    "plan_id": "freedom-makers-32",
    "plan_quantity": 10,
    "plan_unit_price": 3200,
    "plan_amount": 32000,
    "billing_period": 1,
    "billing_period_unit": "month",
    "plan_free_quantity": 0,
    "status": "active",
    "current_term_start": 1589399197,
    "current_term_end": 1592077597,
    "next_billing_at": 1592077597,
    "created_at": 1589399197,
    "started_at": 1589399197,
    "activated_at": 1589399197,
    "updated_at": 1589399197,
    "has_scheduled_changes": false,
    "auto_collection": "off",
    "resource_version": 1589399197462,
    "deleted": false,
    "object": "subscription",
    "currency_code": "USD",
    "due_invoices_count": 1,
    "due_since": 1589399197,
    "total_dues": 32000,
    "mrr": 0
}
```


**Get/Grab/load/retrieve an existing Subscription**

Endpoint: '/api/retrieveSubscription'
     * Retrieves a subscription object by chargebee subscription id. Looks for values in the body
      as follows:
      {
          "subscriptionId": id of desired subscription,
          "auth": authentication credentials; either master or token
      }*

Sample request body:
```
{
  "subscriptionId": "169yKpRytp3VPQ7Q",
  "auth": "myValidAuth"
}:
```

Sample response:
```
{
    "id": "169yKpRytp3VPQ7Q",
    "customer_id": "169yFgRypfdqVmo",
    "plan_id": "freedom-makers-32",
    "plan_quantity": 10,
    "plan_unit_price": 3200,
    "plan_amount": 32000,
    "billing_period": 1,
    "billing_period_unit": "month",
    "plan_free_quantity": 0,
    "status": "active",
    "current_term_start": 1589399197,
    "current_term_end": 1592077597,
    "next_billing_at": 1592077597,
    "created_at": 1589399197,
    "started_at": 1589399197,
    "activated_at": 1589399197,
    "updated_at": 1589399208,
    "has_scheduled_changes": false,
    "auto_collection": "off",
    "resource_version": 1589399208777,
    "deleted": false,
    "object": "subscription",
    "currency_code": "USD",
    "due_invoices_count": 1,
    "due_since": 1589399197,
    "total_dues": 32000,
    "mrr": 32000,
    "exchange_rate": 1,
    "base_currency_code": "USD"
}
```

**Update/Change/Modify an existing Subscription**

Endpoint: '/api/updateSubscription'
     * Updates a subscription with new values. Note that
      the pricePerHour will override defaults. This can be used
      to create "custom" subscriptions. Use caution when doing so.
      Note that changes will not be made until the current term (usually month) 
      ends and a new cycle begins.
      The revised subscription is returned. Looks for values in the body as follows:
      {
          "subscriptionId": id of subscription to be modified,
          "planId": new plan to use for subscription,
          "planQuantity": new number of hours to use,
          "pricePerHour": overridden price per hour for subscription,
          "auth": authentication credentials; either master or token
      }*

Sample request body:
```
{
      "subscriptionId": id of subscription to be modified,
      "planId": new plan to use for subscription,
      "planQuantity": new number of hours to use,
      "pricePerHour": overridden price per hour for subscription,
      "auth": authentication credentials; either master or token
 }
```

Note that the new changes are not reflected in the response, as the
new cycle has not yet begun. The response should be used for confirmation
purposes only.
Sample response:
```
{
    "id": "169yKpRytp3VPQ7Q",
    "customer_id": "169yFgRypfdqVmo",
    "plan_id": "freedom-makers-32",
    "plan_quantity": 10,
    "plan_unit_price": 3200,
    "plan_amount": 32000,
    "billing_period": 1,
    "billing_period_unit": "month",
    "plan_free_quantity": 0,
    "status": "active",
    "current_term_start": 1589399197,
    "current_term_end": 1592077597,
    "next_billing_at": 1592077597,
    "created_at": 1589399197,
    "started_at": 1589399197,
    "activated_at": 1589399197,
    "updated_at": 1589399208,
    "has_scheduled_changes": false,
    "auto_collection": "off",
    "resource_version": 1589399208777,
    "deleted": false,
    "object": "subscription",
    "currency_code": "USD",
    "due_invoices_count": 1,
    "due_since": 1589399197,
    "total_dues": 32000,
    "mrr": 32000,
    "exchange_rate": 1,
    "base_currency_code": "USD"
}
```



**Get/Grab/load/retrieve an existing Subscription**

Endpoint: '/api/retrieveSubscription'
     * Retrieves a subscription object by chargebee subscription id. Looks for values in the body
      as follows:
      {
          "subscriptionId": id of desired subscription,
          "auth": authentication credentials; either master or token
      }*

Sample request body:
```
{
  "subscriptionId": "169yKpRytp3VPQ7Q",
  "auth": "myValidAuth"
}:
```

Sample response:
```
{
    "id": "169yKpRytp3VPQ7Q",
    "customer_id": "169yFgRypfdqVmo",
    "plan_id": "freedom-makers-32",
    "plan_quantity": 10,
    "plan_unit_price": 3200,
    "plan_amount": 32000,
    "billing_period": 1,
    "billing_period_unit": "month",
    "plan_free_quantity": 0,
    "status": "active",
    "current_term_start": 1589399197,
    "current_term_end": 1592077597,
    "next_billing_at": 1592077597,
    "created_at": 1589399197,
    "started_at": 1589399197,
    "activated_at": 1589399197,
    "updated_at": 1589399208,
    "has_scheduled_changes": false,
    "auto_collection": "off",
    "resource_version": 1589399208777,
    "deleted": false,
    "object": "subscription",
    "currency_code": "USD",
    "due_invoices_count": 1,
    "due_since": 1589399197,
    "total_dues": 32000,
    "mrr": 32000,
    "exchange_rate": 1,
    "base_currency_code": "USD"
}
```

**Cancel an existing Subscription**

Endpoint: '/api/cancelSubscription'
     * cancels a subscription by chargebee subscription id. Looks for values in the
      body as follows:
      {
          "subscriptionId": subscription to be cancelled,
          "auth": authentication credentials; either master or token
     * }

No response is returned.

**MORE TO COME!**

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
