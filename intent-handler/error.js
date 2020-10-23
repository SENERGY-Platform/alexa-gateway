const Helper = require('../helper/helper.js')
const errorTitle = 'Fehler';

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log('ErrorHandler started')
        console.log(`Error handled: ${error.message}`);
        return Helper.createStandardResponse(handlerInput, errorTitle, 'Das hat nicht geklappt. Probiers bitte nochmal');
    },
};

module.exports = ErrorHandler
