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

const Helper = require('../helper/helper.js')


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

module.exports = LaunchRequestHandler
