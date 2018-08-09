namespace SmartSupportBotService.Dialogs
{
    [LuisModel("bdb4d7cd-1d61-4a7a-8a3a-b9a5a5b10f2e", "b7ae1940972346bcaf422b6448145c8c")]
    [Serializable]
    public class RootDialog : LuisDialog<object>
    {
        protected const string greetingStatement = "Hi, I'm Jane, the Iris support bot.";

        [LuisIntent("GeneralHowToInquiry")]
        public async Task GeneralHowToInquiryHandler(IDialogContext context, LuisResult result)
        {
            await context.PostAsync("It seems that you are looking for help on how to setup a campaign.");
            context.Call(new HowToInquiryDialog(), this.HowToInquiryDialogResumeAfter);
        }

        [LuisIntent("TroubleShootInquiry")]
        public async Task TroubleShootInquiryHandler(IDialogContext context, LuisResult result)
        {
            await context.PostAsync("I see you have questions about your campaign issue.");
            context.Call(new TroubleShootInquiryDialog(), this.TroubleShootInquiryDialogResumeAfter);
        }

        [LuisIntent("Greeting")]
        public async Task GreetingHandler(IDialogContext context, LuisResult result)
        {
            await context.PostAsync(greetingStatement);
            await context.PostAsync("How can I help you?");
            context.Wait(MessageReceived);
        }

        [LuisIntent("None")]
        public async Task NoneHandler(IDialogContext context, LuisResult result)
        {
            await context.PostAsync("I'm sorry, I don't understand");
            context.Wait(MessageReceived);
        }

        private async Task HowToInquiryDialogResumeAfter(IDialogContext context, IAwaitable<bool> result)
        {
            var isHelpful = await result;

            if (!isHelpful)
            {
                await context.PostAsync("Please try again.");
            }
        }

        private async Task TroubleShootInquiryDialogResumeAfter(IDialogContext context, IAwaitable<bool> result)
        {
            var isHelpful = await result;

            if (!isHelpful)
            {
                await context.PostAsync("Please try again.");
            }
        }
    }
}