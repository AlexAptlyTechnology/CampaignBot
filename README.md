### Prerequisites

* Latest Node.js with NPM. Download it from [here](https://nodejs.org/en/download/).
* The Bot Framework Emulator. To install the Bot Framework Emulator, download it from [here](https://emulator.botframework.com/). Please refer to [this documentation article](https://github.com/microsoft/botframework-emulator/wiki/Getting-Started) to know more about the Bot Framework Emulator.

#### Node JS

After Node.js is installed, using Command line navigate to folder where source code is located.
Example: C:\Users\xxxxxx>cd C:\Users\xxxxxx\source\repos\BookingBot-LUIS
Run NPM update, this will install all dependencies for this project based on what is listed in package.json file
Example: C:\Users\xxxxxx>npm update

To run Node JS app, start app.js file
Example: C:\Users\xxxxxx>node app.js

#### LUIS Application Model URL

Link to LUIS URL in located in .env file
LUIS_MODEL_URL=https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/8c25dd44-cbda-40e7-a208-ee2028d95e85?subscription-key=5e821da5e31d4cbd96e5cfd218276025&verbose=true&timezoneOffset=0&q=

### Code Highlights

Good referece for Bot application is [Planning an Application](https://docs.microsoft.com/en-us/azure/cognitive-services/LUIS/plan-your-app)

#### Intent Recognizers

Intent recognizers return matches as named intents/entities.

````JavaScript
bot.dialog('ShowBooking', [
    // ... waterfall dialog ...
	// matches "check my booking" intent and similar intents
	// Performs search for booking based on BookingCode entity in LUIS model
]).triggerAction({
    matches: 'ShowBooking'
});

bot.dialog('SearchHotels', [
    // ... waterfall dialog ...
	// matches "Find hodel near" intent and similar intents
	// Performs search for hotels based on AirportCode or Geography.City entities provided by LUIS model
]).triggerAction({
    matches: 'SearchHotels'
});

bot.dialog('ShowHotelsReviews', function (session, args) {
    // ...
	// matches "show hotel review" intent and similar intents
	// Performs search for reviews based on Hotel entity from LUIS model
}).triggerAction({
    matches: 'ShowHotelsReviews'
});

````

#### Entity Recognition

// ShowBooking
````JavaScript
var bookingEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'BookingCode');
````

// SearchHotels
````JavaScript
var cityEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.geography.city');
var airportEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'AirportCode');
````
// ShowHotelsReviews
````JavaScript
var hotelEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Hotel');
````

### Node Modules

Store.js module contains functions that returns properties used in Bot dialogs.  All data for returned by dialogs are currently stored in store.js file as arrays.  For production use, store.js would make calls to external APIs for data.


### Spelling Correction
Spelling correction, set by `IS_SPELL_CORRECTION_ENABLED` key

Microsoft Bing Spell Check API provides a module that allows you to to correct the spelling of the text. Check out the [reference](https://dev.cognitive.microsoft.com/docs/services/56e73033cf5ff80c2008c679/operations/56e73036cf5ff81048ee6727) to know more about the modules available.

[spell-service.js](spell-service.js) is the core component illustrating how to call the Bing Spell Check RESTful API.

In this sample we added spell correction as a middleware. Check out the middleware in [app.js](app.js#L109-L126).

````JavaScript
if (process.env.IS_SPELL_CORRECTION_ENABLED === 'true') {
    bot.use({
        botbuilder: function (session, next) {
            spellService
                .getCorrectedText(session.message.text)
                .then(function (text) {
                    console.log('Text corrected to "' + text + '"');
                    session.message.text = text;
                    next();
                })
                .catch(function (error) {
                    console.error(error);
                    next();
                });
        }
    });
}
````

