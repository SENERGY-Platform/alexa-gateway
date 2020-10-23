const Helper = require('../helper/helper.js')
const ProcessHelper = require('../helper/process-helper.js')
const errorTitle = 'Fehler';


const RoomThermostatIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'RoomThermostat');
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
        const room = Helper.replaceUmlauts(handlerInput.requestEnvelope.request.intent.slots.Room.value);
        let target = handlerInput.requestEnvelope.request.intent.slots.Target.value;
        let toggle = undefined;
        if (handlerInput.requestEnvelope.request.intent.slots.Toggle.resolutions !== undefined
            && handlerInput.requestEnvelope.request.intent.slots.Toggle.resolutions.resolutionsPerAuthority[0].values !== undefined) {
            toggle = handlerInput.requestEnvelope.request.intent.slots.Toggle.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        }

        return new Promise(resolve => {
            ProcessHelper.findProcessByName('heizung_' + room, handlerInput.requestEnvelope.context.System.user.accessToken, (processes, error) => {
                if (error !== null) {
                    resolve(Helper.createStandardResponse(handlerInput, errorTitle, error))
                }
                switch (processes.length) {
                    case 0:
                        resolve(Helper.createStandardResponse(handlerInput, errorTitle, 'Für den Raum ' + room + ' finde ich kein passendes Deployment'))
                        break;
                    case 1:
                        const parameter = new Map();
                        if (toggle !== undefined) {
                            if (toggle === 'ON') {
                                target = 21;
                            } else {
                                target = 4;
                            }
                        }
                        parameter.set('targetTemperature', target);
                        ProcessHelper.startProcess(processes[0].id, parameter, handlerInput.requestEnvelope.context.System.user.accessToken, (error) => {
                            if (error !== null) {
                                resolve(Helper.createStandardResponse(handlerInput, errorTitle, error))
                            } else {
                                resolve(Helper.createStandardResponse(handlerInput, 'Heizung eingestellt', 'Okay, Heizung ' + room + ' auf ' + target + ' Grad'));
                            }
                        })
                        break;
                    default:
                        resolve(Helper.createStandardResponse(handlerInput, errorTitle, 'Für den Raum ' + room + ' finde ich mehrere Deployments'));
                        return
                }
            });
        });
    }
};

module.exports = RoomThermostatIntentHandler
