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

const imageUrl = 'https://ui.senergy.infai.org/src/img/SENERGY_LOGO-bunt_horizontal_medium_boldBulb130.svg'

class Helper {
    static createStandardResponse(handlerInput, header, text) {
        return handlerInput.responseBuilder
            .speak(text)
            .reprompt(text)
            .withStandardCard(header, text, imageUrl)
            .getResponse()
    }

    static createStandardResponseNoRepromt(handlerInput, header, text) {
        return handlerInput.responseBuilder
            .speak(text)
            .withStandardCard(header, text, imageUrl)
            .getResponse()
    }

    static isLoggedIn(handlerInput) {
        let hasToken = handlerInput.requestEnvelope.context.System.user.accessToken !== undefined;
        console.log(hasToken ? 'Token provided' : 'No Token provided');
        return hasToken;
    }

    static replaceUmlauts(str) {
        return str.replace(/ä/gi, 'ae')
            .replace(/ü/gi, 'ue')
            .replace(/ö/gi, 'oe')
            .replace(/ß/gi, 'ss')
    }
}

module.exports = Helper
