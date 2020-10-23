const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log('SessionEndedRequestHandler started')
        return handlerInput.responseBuilder.getResponse();
    }
};

module.exports = SessionEndedRequestHandler
