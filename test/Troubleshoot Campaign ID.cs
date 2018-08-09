namespace SmartSupportBotService.Dialogs
{
    using Microsoft.Bot.Builder.Dialogs;
    using System;
    using System.Threading.Tasks;
    using Microsoft.Bot.Connector;

    [Serializable]
    public class CampaignIdDialog : IDialog<int>
    {
        private int attempts = 3;

        public async Task StartAsync(IDialogContext context)
        {
            await context.PostAsync("What is your campaign Id?");
            context.Wait(this.MessageReceivedAsync);
            
        }

        private async Task MessageReceivedAsync(IDialogContext context, IAwaitable<IMessageActivity> result)
        {
            var message = await result;

            int campgaipnId = -1;

            if (Int32.TryParse(message.Text, out campgaipnId) && (campgaipnId > 0))
            {
                context.Done(campgaipnId);
            }
            else
            {
                --attempts;
                if (attempts > 0)
                {
                    await context.PostAsync("I'm sorry, I don't understand your reply. What is your campaign Id (e.g. '1234')?");

                    context.Wait(this.MessageReceivedAsync);
                }
                else
                {
                    context.Fail(new TooManyAttemptsException("Message was not a valid campaign Id."));
                }
            }
        }
    }
}