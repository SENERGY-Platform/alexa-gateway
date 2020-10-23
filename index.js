const Alexa = require('ask-sdk-core');

const Helper = require('./helper.js')
const ProcessHelper = require('./process-helper.js')
const errorTitle = 'Fehler';

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        console.log('LaunchRequestHandler started')
        if (!Helper.isLoggedIn(handlerInput)) {
            const text = 'Bitte melde dich zuerst mit deinem SENERGY Account an.'
            return handlerInput.responseBuilder
                .speak(text)
                .reprompt(text)
                .withLinkAccountCard()
                .getResponse()
        }
        return Helper.createStandardResponse(handlerInput, 'Willkommen', 'Wilkommen bei SENERGY');
    }
};


const ProcessIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'Process' || handlerInput.requestEnvelope.request.intent.name === 'SpecialProcess');
    },
    handle(handlerInput) {
        console.log('ProcessIntentHandler started')
        if (!Helper.isLoggedIn(handlerInput)) {
            const text = 'Bitte melde dich zuerst mit deinem SENERGY Account an.'
            return handlerInput.responseBuilder
                .speak(text)
                .reprompt(text)
                .withLinkAccountCard()
                .getResponse()
        }

        const isSpecial = handlerInput.requestEnvelope.request.intent.name === 'SpecialProcess';

        let name = ''
        if (handlerInput.requestEnvelope.request.intent.slots.ProcessName.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
            name = handlerInput.requestEnvelope.request.intent.slots.ProcessName.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        } else {
            name = handlerInput.requestEnvelope.request.intent.slots.ProcessName.value;
        }

        name = encodeURI(name);
        let action = '';
        if (isSpecial) {
            const specialAction = handlerInput.requestEnvelope.request.intent.slots.SpecialAction.resolutions.resolutionsPerAuthority[0].values[0].value.name;
            name = name + '_' + specialAction;
            action = 'starte';
        } else {
            action = handlerInput.requestEnvelope.request.intent.slots.Action.value
        }

        console.log('Request: ' + action + ' ' + name);
        switch (action) {
            case 'starte':
                return new Promise(resolve => {
                        ProcessHelper.findProcessByName(name, handlerInput.requestEnvelope.context.System.user.accessToken, (processes, error) => {
                            if (error !== null) {
                                resolve(Helper.createStandardResponse(handlerInput, errorTitle, error))
                            }
                            switch (processes.length) {
                                case 0:
                                    resolve(Helper.createStandardResponse(handlerInput, errorTitle,  'Unter diesem Namen finde ich leider kein Deployment'))
                                    break;
                                case 1:
                                    ProcessHelper.startProcess(processes[0].definition_id, handlerInput.requestEnvelope.context.System.user.accessToken, (error) => {
                                        if (error !== null) {
                                            resolve(Helper.createStandardResponse(handlerInput, errorTitle, error))
                                        } else {
                                            resolve(Helper.createStandardResponse(handlerInput,  'Prozess gestartet',  'Ich habe den Prozess gestartet'))
                                        }
                                    })
                                    break;
                                default:
                                    resolve(Helper.createStandardResponse(handlerInput, errorTitle, 'Unter diesem Namen finde ich mehrere Deployments'));
                                    return
                            }
                        })
                    }
                )
            case 'stoppe':
                return new Promise(resolve => {
                    ProcessHelper.findRunningProcessByName(name,  handlerInput.requestEnvelope.context.System.user.accessToken, (body, error) => {
                        if (error !== null) {
                            resolve(Helper.createStandardResponse(handlerInput, errorTitle, error))
                        }
                        switch (body.total) {
                            case 0:
                                resolve(Helper.createStandardResponse(handlerInput, errorTitle, 'Unter diesem Namen finde ich leider keinen laufenden Prozess'));
                                break;
                            case 1:
                                ProcessHelper.stopRunningProcess(body.data[0].id, handlerInput.requestEnvelope.context.System.user.accessToken, error => {
                                    if (error !== null) {
                                        resolve(Helper.createStandardResponse(handlerInput, errorTitle, error))
                                    } else {
                                        resolve(Helper.createStandardResponse(handlerInput,  'Prozess gestoppt', 'Ich habe den Prozess gestoppt'));
                                    }
                                });
                                break;
                            default:
                                resolve(Helper.createStandardResponse(handlerInput, errorTitle, 'Unter diesem Namen finde ich mehrere laufende Prozesse'));
                                break;
                        }
                    })
                });
            default:
                return Helper.createStandardResponse(handlerInput, errorTitle,  'Sorry, diese Aktion kenne ich nicht');
        }
    }
};

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

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log('SessionEndedRequestHandler started')
        return handlerInput.responseBuilder.getResponse();
    }
};

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


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder.addRequestHandlers(
    LaunchRequestHandler,
    ProcessIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler)
    .addErrorHandlers(ErrorHandler)
    .lambda();
