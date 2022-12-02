// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const URL = require("url").URL;
const { Dialog, DialogState } = require('botbuilder-dialogs');
const {
    Activity,
    ActivityHandler,
    ActivityTypes,
    BotState,
    ChannelAccount,
    ConversationState,
    Mention,
    MessageFactory,
    StatePropertyAccessor,
    TurnContext,
    UserState
  } =  require('botbuilder');

const stringIsAValidUrl = (s) => {
    try {
      new URL(s);
      return true;
    } catch (err) {
      return false;
    }
  };


class EchoBot extends ActivityHandler {
    constructor(conversationState,
        userState,
        dialog
        ) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState;
        this.dialogState = this.conversationState.createProperty('DialogState');

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            const text = context.activity.text;

            //await context.sendActivity(MessageFactory.text("Looks like you entered a URL. Do you want me to check it for you?"));
            await this.dialog.run(context, this.dialogState);
            

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    //await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                    await context.sendActivity(`Hi ${membersAdded[cnt].name}, I am Genie. This Bot is a work in progress. At this time we have some dialogs working. Type anything to get started.`);
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    /**
     * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
     */
     async run(context) {
        await super.run(context);

        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }
}



module.exports.EchoBot = EchoBot;
