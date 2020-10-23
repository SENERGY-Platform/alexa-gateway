/*
 *  Copyright 2020 InfAI (CC SES)
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

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
