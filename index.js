const Alexa = require('ask-sdk-core');
const superagent = require('superagent');


const isLoggedIn = (handlerInput) => {
    let hasToken = handlerInput.requestEnvelope.context.System.user.accessToken !== undefined;
    console.log(hasToken ? 'Token provided' : 'No Token provided');
    return hasToken;
}

const SenergyApiUrl = 'https://api.senergy.infai.org'
const imageUrl = 'https://ui.senergy.infai.org/src/img/SENERGY_LOGO-bunt_horizontal_medium_boldBulb130.svg'

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        console.log('LaunchRequestHandler started')
        if (!isLoggedIn(handlerInput)) {
            const text = 'Bitte melde dich zuerst mit deinem SENERGY Account an.'
            return handlerInput.responseBuilder
                .speak(text)
                .reprompt(text)
                .withLinkAccountCard()
                .getResponse()
        }
        const speechText = 'Wilkommen bei SENERGY';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withStandardCard('Wilkommen', speechText, imageUrl)
            .getResponse();

    }
};


const ProcessIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'Process' || handlerInput.requestEnvelope.request.intent.name === 'SpecialProcess');
    },
    handle(handlerInput) {
        console.log('ProcessIntentHandler started')
        if (!isLoggedIn(handlerInput)) {
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
                        superagent.get(SenergyApiUrl + '/api-aggregator/processes?maxResults=3&firstResult=0&nameLike=%25' + name + '%25')
                            .set('Authorization', 'Bearer ' + handlerInput.requestEnvelope.context.System.user.accessToken)
                            .then(res => {
                                console.log('Retrieving deployments, code: ' + res.status);
                                if (res.status > 299) {
                                    let text0 = 'Laden der Prozesse mit Code ' + res.status + ' fehlgeschlagen.'
                                    resolve(handlerInput.responseBuilder
                                        .speak(text0)
                                        .reprompt(text0)
                                        .withStandardCard('Fehler', text0, imageUrl)
                                        .getResponse()
                                    );
                                }
                                if (res.body == null) {
                                    res.body = [];
                                }
                                console.log('found ' + res.body.length + ' processes')
                                switch (res.body.length) {
                                    case 0:
                                        let text0 = 'Unter diesem Namen finde ich leider kein Deployment';
                                        resolve(handlerInput.responseBuilder
                                            .speak(text0)
                                            .reprompt(text0)
                                            .withStandardCard('Fehler', text0, imageUrl)
                                            .getResponse()
                                        );
                                        break;
                                    case 1:
                                        // Start Process
                                        superagent.get(SenergyApiUrl + '/process/engine/process-definition/' + res.body[0].definition_id + '/start')
                                            .set('Authorization', 'Bearer ' + handlerInput.requestEnvelope.context.System.user.accessToken)
                                            .then(res => {
                                                console.log('Starting Process, code: ' + res.status);
                                                let text = '';
                                                let title = '';
                                                if (res.status < 299) {
                                                    text = 'Ich habe den Prozess gestartet';
                                                    title = 'Prozess gestartet'
                                                    resolve(handlerInput.responseBuilder
                                                        .speak(text)
                                                        .withStandardCard(title, text, imageUrl)
                                                        .getResponse()
                                                    );
                                                } else {
                                                    text = 'Prozess konnte nicht gestartet werden. Code: ' + res.status;
                                                    title = 'Fehler';
                                                    resolve(handlerInput.responseBuilder
                                                        .speak(text)
                                                        .withStandardCard(title, text, imageUrl)
                                                        .getResponse()
                                                    );
                                                }

                                            }).catch((e) => {
                                            console.error(e);
                                            let text = 'Unerwarteter Fehler aufgetreten: Konnte Prozess nicht starten';
                                            resolve(handlerInput.responseBuilder
                                                .speak(text)
                                                .reprompt(text)
                                                .withStandardCard('Fehler', text, imageUrl)
                                                .getResponse()
                                            );
                                        });
                                        break;
                                    default:
                                        let text = 'Unter diesem Namen finde ich mehrere Deployments';
                                        resolve(handlerInput.responseBuilder
                                            .speak(text)
                                            .reprompt(text)
                                            .withStandardCard('Fehler', text, imageUrl)
                                            .getResponse()
                                        );
                                        return
                                }
                            }).catch((e) => {
                            console.error(e);
                            let text = 'Unerwarteter Fehler aufgetreten: Konnte Prozessliste nicht lesen';
                            resolve(handlerInput.responseBuilder
                                .speak(text)
                                .reprompt(text)
                                .withStandardCard('Fehler', text, imageUrl)
                                .getResponse()
                            );
                        })
                    }
                )
            case 'stoppe':
                return new Promise(resolve => {
                    superagent.get(SenergyApiUrl + '/process/engine/history/unfinished/process-instance/processDefinitionNameLike/' + name + '/3/0/startTime/desc')
                        .set('Authorization', 'Bearer ' + handlerInput.requestEnvelope.context.System.user.accessToken)
                        .then(res => {
                            console.log('Retrieving deployed processes, code: ' + res.status);
                            switch (res.body.total) {
                                case 0:
                                    let text0 = 'Unter diesem Namen finde ich leider keinen laufenden Prozess';
                                    resolve(handlerInput.responseBuilder
                                        .speak(text0)
                                        .reprompt(text0)
                                        .withStandardCard('Fehler', text0, imageUrl)
                                        .getResponse()
                                    );
                                    break;
                                case 1:
                                    superagent.delete(SenergyApiUrl + '/process/engine/process-instance/' + res.body.data[0].id)
                                        .set('Authorization', 'Bearer ' + handlerInput.requestEnvelope.context.System.user.accessToken)
                                        .then(res => {
                                            console.log('Stopping deployed process, code: ' + res.status);
                                            let text = '';
                                            let title = '';
                                            if (res.status < 299) {
                                                text = 'Ich habe den Prozess gestoppt';
                                                title = 'Prozess gestoppt'
                                                resolve(handlerInput.responseBuilder
                                                    .speak(text)
                                                    .withStandardCard(title, text, imageUrl)
                                                    .getResponse()
                                                );
                                            } else {
                                                text = 'Prozess konnte nicht gestoppt werden. Code: ' + res.status;
                                                title = 'Fehler';
                                                resolve(handlerInput.responseBuilder
                                                    .speak(text)
                                                    .reprompt(text)
                                                    .withStandardCard(title, text, imageUrl)
                                                    .getResponse()
                                                );
                                            }

                                        }).catch((e) => {
                                        console.error(e);
                                        let text = 'Unerwarteter Fehler aufgetreten: Konnte Prozess nicht stoppen';
                                        resolve(handlerInput.responseBuilder
                                            .speak(text)
                                            .reprompt(text)
                                            .withStandardCard('Fehler', text, imageUrl)
                                            .getResponse()
                                        );
                                    });
                                    break;
                                default:
                                    let text = 'Unter diesem Namen finde ich mehrere laufende Prozesse';
                                    resolve(handlerInput.responseBuilder
                                        .speak(text)
                                        .reprompt(text)
                                        .withStandardCard('Fehler', text, imageUrl)
                                        .getResponse()
                                    );
                                    break;
                            }
                        }).catch((e) => {
                        console.error(e);
                        let text = 'Unerwarteter Fehler aufgetreten: Konnte Liste der deployten Prozesse nicht lesen';
                        resolve(handlerInput.responseBuilder
                            .speak(text)
                            .reprompt(text)
                            .withStandardCard('Fehler', text, imageUrl)
                            .getResponse()
                        );
                    });
                });
            default:
                let text = 'Sorry, diese Aktion kenne ich nicht';
                return handlerInput.responseBuilder
                    .speak(text)
                    .reprompt(text)
                    .withStandardCard('Fehler', text, imageUrl)
                    .getResponse();
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

        const speechText = 'Ich kann Prozesse starten oder stoppen. Sag einfach: Starte Prozess Test! ';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withStandardCard('Hilfe', speechText, imageUrl)
            .getResponse();
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
        const speechText = 'Alles klar, bis später!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withStandardCard('Verlassen', speechText, imageUrl)
            .withShouldEndSession(true)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log('SessionEndedRequestHandler started')
        //any cleanup logic goes here
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
        const answer = 'Das hat nicht geklappt. Probiers bitte nochmal'

        return handlerInput.responseBuilder
            .speak(answer)
            .reprompt(answer)
            .withStandardCard('Fehler', answer, imageUrl)
            .getResponse();
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
