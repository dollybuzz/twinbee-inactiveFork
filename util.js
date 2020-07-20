const {notifyAdmin} = require('./services/notificationService.js');

let validatorMap = {
    "present": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate) {
            if (!body[keyString]) {
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "positiveIntegerOnly": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate) {
            console.log(body[keyString])
            if (!body[keyString] || !Number.parseInt(body[keyString])
                || body[keyString].toString().includes("-") || body[keyString].toString().includes(" ") || body[keyString].toString().includes(".")) {
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "noSpaces": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate) {
            if (!body[keyString] || body[keyString].includes(" ")) {
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "positiveDecimalAllowed": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate) {
            if (!body[keyString] || !Number.parseFloat(body[keyString])
                || body[keyString].includes("-")) {
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
    "decimalAllowed": async function (keysToValidate, body) {
        let valid = {isValid: true, message: ""};
        for (var keyString of keysToValidate) {
            if (!body[keyString] || !Number.parseFloat(body[keyString])) {
                valid.isValid = false;
                valid.message += `${keyString} was not valid.  `;
            }
        }
        return valid;
    },
};


module.exports = {

    /**
     *  validates parameters
     * {
     *      present: array of string keys that should be present
     *      positiveIntegerOnly: array of string keys that should parse to positive integers only,
     *      noSpaces: array of string keys that should not have spaces
     * }
     *
     * @returns object in the form:
     * {
     *      isValid: a boolean indicating whether or not the parameters were valid
     *      message: a string description of the result
     * }
     */
     validateParams: async (paramArrayMap, body)=> {
        let validator = {isValid: true, message: ""};
        let paramsTypesToScan = ["present", "positiveIntegerOnly", "noSpaces", "positiveDecimalAllowed", "decimalAllowed"];
        for (var paramName of paramsTypesToScan) {
            let keyArray = paramArrayMap[paramName];
            if (keyArray) {
                let result = await validatorMap[paramName](keyArray, body);
                if (!result.isValid) {
                    validator.isValid = false;
                    validator.message += result.message;
                }
            }
        }
        if (!validator.message) {
            validator.message = "Valid";
        }
        if (!validator.isValid) {
            let tracer = new Error();
            console.log(`Failed to validate! \nParameters:\n${JSON.stringify(paramArrayMap)}\nBody:\n${JSON.stringify(body)}\nTrace:${JSON.stringify(tracer.stack)}`);
            notifyAdmin(`Failed to validate! \nParameters:\n${JSON.stringify(paramArrayMap)}\nBody:\n${JSON.stringify(body)}\nTrace coming shortly.`);
            notifyAdmin(tracer.stack);
        }
        return validator;
    }
};