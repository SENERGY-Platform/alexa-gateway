const Helper = require('../helper/helper.js')

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent' || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent');
    },
    handle(handlerInput) {
        console.log('HelpIntentHandler started')
        return Helper.createStandardResponse(handlerInput, 'Hilfe', 'Ich kann Prozesse starten oder stoppen. Sag einfach: Starte Prozess Test!');
    }
};

module.exports = HelpIntentHandler
