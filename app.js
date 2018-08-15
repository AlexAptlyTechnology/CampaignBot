// This loads the environment variables from the .env file
require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
var Campaign = require('./campaign');
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
var inMemoryStorage = new builder.MemoryBotStorage();

// Setup bot 
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
var bot = new builder.UniversalBot(connector, function (session) {
    session.send("DEFAULT MESSAGE: Hi I'm Jane, the Iris support bot. What can I help you with today?", session.message.text);
}).set('storage', inMemoryStorage); // Register in memory storage

// This Url can be obtained by uploading or creating model from the LUIS portal: https://www.luis.ai/
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

// Greeting intent
bot.dialog('Greeting', function (session) {
    session.endDialog('Greeting LUIS INTENT: Hi, my name is Jane... I\'m the IRIS support bot.What can I help you with today ?')
}).triggerAction({
    matches: 'Greeting'
    });

// None intent
bot.dialog('None', function (session) {
    session.endDialog('None LUIS INTENT: I am your marketing campaign support bot, I cannot answer that question yet. But you can try asking how to set up Campaign or Interaction')
}).triggerAction({
    matches: 'None'
});

// Troubleshoot intent
bot.dialog('TroubleShoot', function (session) {
    session.endDialog('TroubleShoot LUIS INTENT: Alright, sounds like you want to troubleshoot a campaign.  Try asking me \' How was my campaign 2345\' ?')
}).triggerAction({
    matches: 'TroubleShoot'
    });

// Howto intent
bot.dialog('Howto', [
    function (session, args, next) {
        session.send('Howto LUIS INTENT: It seems that you are looking for: \'%s\'', session.message.text);

        // try getting LUIS entity
        var wikiSearchEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'WikiSearch');

        if (wikiSearchEntity) {
            // need to search through Wiki for entity...
            // search detected, continue to next step
            session.dialogData.searchType = 'wikiSearch';
            next({ response: wikiSearchEntity.entity });
        }
    },
    function (session, results) {
        var wikiPage = results.response;
        session.send('Looking in Wiki how to for: \'%s\'...', wikiPage);

        // Async search for wiki page
        Campaign
            .searchWiki(wikiPage)
            .then(function (wiki) {
                session.send('Here is a wiki to help you get started: http://www.iriswiki.com');
            });
    }
]).triggerAction({
    matches: 'Howto',
    onInterrupted: function (session) {
        session.send('Please ask me a question like \'How to set up my campaign\' and I can search in Wiki for answers');
    }
});


// Looking for Campaign ID
bot.dialog('CampaignLookup', function (session, args) {
    // retrieve ID from matched entities
    var campaignIDEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'CampaignID');
    if (campaignIDEntity) {
        session.send('Looking up campaign based on ID \'%s\'...', campaignIDEntity.entity);
        // need to test to see if campaign exists...
        Campaign
            .searchCampaign(campaignIDEntity.entity)
            .then(function (campaign) {
                var message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(campaign.map(campaignAsAttachment));
                session.endDialog(message);
            });
    }
    else {
        // no entities detected, ask user for what to search for
        builder.Prompts.text(session, 'Sorry,  I couldn\'t find that campaign ID...\'%s\'');
    };
}).triggerAction({
    matches: 'CampaignLookup'
    });


function campaignAsAttachment(campaign) {
    return new builder.ThumbnailCard()
        .title('Marketing Campaign for: %s', campaign.brand)
        .subtitle('Goal: %s', campaign.goal)
        .text('Audience: %s,\n Market: %s,\n Start Date: %s', campaign.audience, campaign.geography, campaign.startDate)
};

bot.dialog('Help', function (session) {
    session.endDialog('Try asking me thinks like what is Campaign ID xxxxx or how to set up Campaign or interaction')
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
