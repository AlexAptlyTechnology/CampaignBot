namespace Microsoft.Bot.Sample.LuisBot
{
    // For more information about this template visit http://aka.ms/azurebots-csharp-luis
    [Serializable]
    public class BasicLuisDialog : LuisDialog<object>
    {
        public BasicLuisDialog() : base(new LuisService(new LuisModelAttribute(
            ConfigurationManager.AppSettings["LuisAppId"], 
            ConfigurationManager.AppSettings["LuisAPIKey"], 
            domain: ConfigurationManager.AppSettings["LuisAPIHostName"])))
        {
        }

        // why detect a greeting Intent, wouldn't you want bot to reply always with new connections with this greeting?
        [LuisIntent("Greeting")]
        public async Task GreetingIntent(IDialogContext context, LuisResult result)
        {
            await context.PostAsync("Hi, my name is Jane... I'm the IRIS support bot.  What can I help you with today?");
        }

        [LuisIntent("None")]
        public async Task NoneIntent(IDialogContext context, LuisResult result)
        {
            await context.PostAsync("I am your marketing campaign support bot, I cannot answer that question yet. But you can try asking how to set up Campaign or interaction");
        }

        // Go to https://luis.ai and create a new intent, then train/publish your luis app.
        // Finally replace "Greeting" with the name of your newly created intent in the following handler
        [LuisIntent("Howto")]
        public async Task Howto(IDialogContext context, LuisResult result)
        {
            //await this.ShowLuisResult(context, result);
            await context.PostAsync("It seems that you are looking for help on how to setup a campaign.  Here is a wiki to help you get started: http://www.iriswiki.com");
            PromptDialog.Confirm(
                context,
                AfterWikiAsync,
                "Did this answer your question?",
                "Hmm... Would you like more help with campaigns or interactions?",
                promptStyle: PromptStyle.Auto
            );
        }

        [LuisIntent("TroubleShoot")]
        public async Task TroubleShoot(IDialogContext context, LuisResult result)
        {
            await context.PostAsync("Alright, sounds like you want to troubleshoot a campaign.  What's your campaign ID?");
            context.Wait(CampaignIdDialog);

        }

        [LuisIntent("Lookup")]
        public async Task Lookup(IDialogContext context, LuisResult result)
        {
            await this.ShowLuisResult(context, result);
        }

        private async Task ShowLuisResult(IDialogContext context, LuisResult result) 
        {
            await context.PostAsync($"You have reached {result.Intents[0].Intent}. You said: {result.Query}");
        }
        public async Task AfterWikiAsync(IDialogContext context, IAwaitable<bool> argument)
        {
            var confirm = await argument;
            if (confirm)
            {
                await context.PostAsync("Great, what else can I help you with?");
            }
            else
            {
                await context.PostAsync("Sorry about that... you can try asking about a specific Campaign ID, or interaction ID");
                context.Done(true);
            }
        }    

        public async Task CampaignIdDialog(IDialogContext context, IAwaitable<IMessageActivity> argument)
        {
            var input = await argument;
            int campaignId;
            if (Int32.TryParse(input.Text, out campaignId))
            {
                await context.PostAsync($"Here is your campaign {campaignId} information: ...");
                context.Done(true);
            }
            else
            {
                await context.PostAsync("Sorry,  I couldn't find that campaign ID...");
                PromptDialog.Confirm(
                context,
                CampaignIdDialogRetry,
                "Do you want to try another campaign ID?",
                "I didn't get that... did you want to try another campaign ID?",
                promptStyle: PromptStyle.Auto
                );
            }
        }
        public async Task CampaignIdDialogRetry(IDialogContext context, IAwaitable<bool> choice)
        {
            var confirm = await choice;
            if(confirm)
            { 
                await context.PostAsync("Great, what's your campaign ID?");  
                context.Wait(CampaignIdDialog);
            }
            else
            {
                await context.PostAsync("OK, is there anything else I can help you with today?");  
                context.Done(true);
            }
        }                         
    }
}