namespace SmartSupportBotService.Dialogs
{
    using Microsoft.Bot.Builder.Dialogs;
    using System;
    using System.Threading.Tasks;
    using Microsoft.Bot.Connector;

    [Serializable]
    public class HowToInquiryDialog : IDialog<bool>
    {
        public async Task StartAsync(IDialogContext context)
        {
            await context.PostAsync("Here is the document related to your question: http://www.iriswiki.com ");

            PromptDialog.Confirm(
                context,
                ResumeAfterAsync,
                "Is this what you are looking for?",
                "Sorry, but I don't understand you. Let us try again.",
                promptStyle: PromptStyle.Auto
                );
        }

        private async Task ResumeAfterAsync(IDialogContext context, IAwaitable<bool> result)
        {
            var isConfirm = await result;
            if (isConfirm)
            {
                await context.PostAsync("Glad that I can help. I will let you continue your reading then. ");
                context.Done(true);
            }
            else
            {
                await context.PostAsync("Sorry to hear that.");
                context.Done(false);
            }
        }
    }
}