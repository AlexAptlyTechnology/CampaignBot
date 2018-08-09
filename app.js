// This loads the environment variables from the .env file
require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
var Store = require('./campaign');
var spellService = require('./spell-service');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
// Create connector and listen for messages
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

// Bot Storage: Here we register the state storage for your bot. 
// Default store: volatile in-memory store - Only for prototyping!
// We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
// For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
var inMemoryStorage = new builder.MemoryBotStorage();

// Setup bot 
var bot = new builder.UniversalBot(connector, function (session) {
    session.send("Hi I'm Jane, the Iris support bot. What can I help you with today?", session.message.text);
}).set('storage', inMemoryStorage); // Register in memory storage

// You can provide your own model by specifing the 'LUIS_MODEL_URL' environment variable
// This Url can be obtained by uploading or creating your model from the LUIS portal: https://www.luis.ai/
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

// Looking for Campaign ID
bot.dialog('ShowCampaignID', function (session, args) {
    // retrieve ID from matched entities
    var campaignIDEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'CampaignID');
    if (campaignIDEntity) {
        session.send('Looking up campaign based on ID \'%s\'...', campaignIDEntity.entity);
        // need to test to see if campaign exists...
        campaign.searchCampaign(campaignID.entity)
            .then(function (campaign) {
                var message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(campaign.map(campaignAsAttachment));
                session.endDialog(message);
            });
    }
}).triggerAction({
    matches: 'ShowCampaignID'
    });

function campaignAsAttachment(campaign) {
    return new builder.ThumbnailCard()
        .title('Marketing Campaign for: %d', campaign.brand)
        .subtitle('Goal: %s', campaign.goal)
        .text('Audience: %s,\n Market: %s,\n Start Date: %s', campaign.audience, campaign.geography, campaign.startDate)
};

bot.dialog('Help', function (session) {
    session.endDialog('Try asking me things like \'Find \', \'search hotels near LAX airport\' or \'show me the reviews of The Bot Resort\'');
}).triggerAction({
    matches: 'Help'
});

// Spell Check
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
