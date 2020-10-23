const imageUrl = 'https://ui.senergy.infai.org/src/img/SENERGY_LOGO-bunt_horizontal_medium_boldBulb130.svg'

class Helper {
    static createStandardResponse(handlerInput, header, text) {
        return handlerInput.responseBuilder
            .speak(text)
            .reprompt(text)
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
