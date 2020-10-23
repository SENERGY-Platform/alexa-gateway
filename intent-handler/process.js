const Helper = require('../helper/helper.js')
const ProcessHelper = require('../helper/process-helper.js')
const errorTitle = 'Fehler';


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
                                    ProcessHelper.startProcess(processes[0].id, new Map(), handlerInput.requestEnvelope.context.System.user.accessToken, (error) => {
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

module.exports = ProcessIntentHandler
