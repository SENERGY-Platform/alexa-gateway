const Helper = require('../helper/helper.js')

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        console.log('CancelAndStopIntentHandler started')
        return Helper.createStandardResponse(handlerInput, 'Verlassen', 'Alles klar, bis später!');
    }
};

module.exports = CancelAndStopIntentHandler
