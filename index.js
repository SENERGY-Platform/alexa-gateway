const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = require('./intent-handler/launch.js')
const ProcessIntentHandler = require('./intent-handler/process.js')
const RoomThermostatIntentHandler = require('./intent-handler/room-thermostat.js')
const HelpIntentHandler = require('./intent-handler/help.js')
const CancelAndStopIntentHandler = require('./intent-handler/cancel.js')
const SessionEndedRequestHandler = require('./intent-handler/end.js')
const ErrorHandler = require('./intent-handler/error.js')

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder.addRequestHandlers(
    LaunchRequestHandler,
    ProcessIntentHandler,
    RoomThermostatIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler)
    .addErrorHandlers(ErrorHandler)
    .lambda();
