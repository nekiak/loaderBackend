const { AllFlowsPrecondition, Result } = require('@sapphire/framework');
const { Message } = require('discord.js');

class UserPrecondition extends AllFlowsPrecondition {
	#message =
		"Sorry but your server is banned from using this bot's commands. Contact the bot developer for more information.";

	constructor(context, options) {
		super(context, {
			...options,
			position: 20
		});
	}

	chatInputRun(interaction) {
		return !interaction.inGuild()
			? this.ok()
			: this.error({ message: "The bot will only work in DMs" });
	}

	contextMenuRun(interaction) {
		return !interaction.inGuild()
			? this.ok()
			: this.error({ message: "The bot will only work in DMs" });
	}

	messageRun(message) {
		return !message.inGuild()
			? this.ok()
			: this.error({ message: "The bot will only work in DMs" });
	}


}

module.exports = {
	UserPrecondition
};